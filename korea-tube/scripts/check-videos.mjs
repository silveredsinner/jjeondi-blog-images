// 사이트의 모든 영상이 아직 볼 수 있는지 확인한다 (삭제·비공개·퍼가기 금지).
// 결과: data/auto/availability.json, data/hidden-videos.js (사이트가 숨길 영상 목록), data/video-views.js (조회수)
// 필요한 환경변수: YOUTUBE_API_KEY.  선택: REVIEW_FILE (PR 본문에 결과 추가)
import fs from "node:fs";
import { loadSiteData, readJson, writeJson } from "./lib.mjs";
import { buildHiddenJs, buildSubsJs, buildViewsJs } from "./build-places.mjs";

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) throw new Error("YOUTUBE_API_KEY 가 없어요");

const site = loadSiteData();
const prev = readJson("data/auto/availability.json", {});
const today = new Date().toISOString().slice(0, 10);
const result = {};

const ids = site.VIDEOS.map((v) => v.id);
for (let i = 0; i < ids.length; i += 50) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.search = new URLSearchParams({ part: "status,statistics", id: ids.slice(i, i + 50).join(","), key: KEY });
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    // 하루 할당량을 다 썼으면 이번 점검은 건너뛰고 지난 결과를 그대로 둔다 (작업 전체를 실패시키지 않음)
    if (res.status === 403 && /quota/i.test(body)) {
      const msg = "유튜브 API 하루 할당량을 다 써서 영상 점검을 다음 실행으로 미뤘어요 (지난 점검 결과 유지).";
      console.log(msg);
      if (process.env.REVIEW_FILE) fs.appendFileSync(process.env.REVIEW_FILE, `\n## 🎬 영상 상태 점검\n${msg}\n`);
      process.exit(0);
    }
    throw new Error(`YouTube videos ${res.status}: ${body.slice(0, 200)}`);
  }
  const items = Object.fromEntries(((await res.json()).items || []).map((it) => [it.id, it]));
  for (const id of ids.slice(i, i + 50)) {
    const st = items[id]?.status;
    // 목록에 없으면 삭제 또는 비공개, private 이면 비공개, embeddable=false 면 사이트에서 재생 불가
    const status = !st ? "gone" : st.privacyStatus === "private" ? "private" : st.embeddable === false ? "no_embed" : "ok";
    const views = Number(items[id]?.statistics?.viewCount);
    result[id] = { status, checked: today, ...(Number.isFinite(views) ? { views } : {}) };
  }
}

writeJson("data/auto/availability.json", result);
const { hidden } = buildHiddenJs();
buildViewsJs();

// ---------- 영상별 자막 언어 (captions.list, 영상당 할당량 50) ----------
// 새 영상이나 30일 지난 기록만 확인. API 키로 허용되지 않으면(401/403) 한 번만 시도하고 건너뛴다.
const subs = readJson("data/auto/captions.json", {});
const stale = (x) => !x || (Date.now() - Date.parse(x.checked)) / 864e5 > 30;
const subsTodo = ids.filter((id) => result[id].status === "ok" && stale(subs[id])).slice(0, Number(process.env.MAX_CAPTION_CHECKS || 150));
let subsNote = "";
for (const id of subsTodo) {
  const url = new URL("https://www.googleapis.com/youtube/v3/captions");
  url.search = new URLSearchParams({ part: "snippet", videoId: id, key: KEY });
  const res = await fetch(url);
  if (res.status === 401 || res.status === 403) {
    const body = await res.text();
    if (/quota/i.test(body)) { subsNote = "할당량을 다 써서 자막 확인을 다음 실행으로 미뤘어요."; break; }
    subsNote = `자막 목록 API 를 API 키로 쓸 수 없어 건너뛰었어요 (${res.status}).`;
    console.log(subsNote, body.slice(0, 200));
    break;
  }
  if (!res.ok) { console.log(`captions ${id}: ${res.status}`); continue; }
  const items = (await res.json()).items || [];
  subs[id] = {
    langs: [...new Set(items.filter((c) => c.snippet.trackKind !== "asr" && c.snippet.trackKind !== "ASR").map((c) => c.snippet.language))].sort(),
    asr: [...new Set(items.filter((c) => /asr/i.test(c.snippet.trackKind)).map((c) => c.snippet.language))],
    checked: today,
  };
}
writeJson("data/auto/captions.json", subs);
buildSubsJs();
const nSubs = Object.keys(subs).length;
console.log(`자막 언어 기록: ${nSubs}개 영상${subsNote ? ` (${subsNote})` : ""}`);

const newlyHidden = site.VIDEOS.filter((v) => result[v.id].status !== "ok" && prev[v.id]?.status !== result[v.id].status);
const restored = site.VIDEOS.filter((v) => result[v.id].status === "ok" && prev[v.id] && prev[v.id].status !== "ok");
console.log(`영상 ${ids.length}개 확인: 숨김 ${hidden}개 (새로 숨김 ${newlyHidden.length}, 다시 공개 ${restored.length})`);

if (process.env.REVIEW_FILE) {
  const label = { gone: "삭제·비공개", private: "비공개", no_embed: "퍼가기 금지" };
  const lines = [
    `## 🎬 영상 상태 점검: ${ids.length}개 중 ${hidden}개 숨김`,
    ...(newlyHidden.length ? [`새로 숨긴 영상 ${newlyHidden.length}개 (사이트에서 자동으로 빠져요):`, ...newlyHidden.map((v) => `- ${v.title} — ${label[result[v.id].status]} ([링크](https://www.youtube.com/watch?v=${v.id}))`)] : ["새로 숨긴 영상 없음"]),
    ...(restored.length ? [`다시 볼 수 있게 된 영상 ${restored.length}개:`, ...restored.map((v) => `- ${v.title}`)] : []),
    `- 자막 언어 확인: ${nSubs}개 영상 기록${subsNote ? ` — ${subsNote}` : ""}`,
    "",
  ];
  fs.appendFileSync(process.env.REVIEW_FILE, lines.join("\n") + "\n");
}
