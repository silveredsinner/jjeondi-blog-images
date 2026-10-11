// 사이트의 모든 영상이 아직 볼 수 있는지 확인한다 (삭제·비공개·퍼가기 금지).
// 결과: data/auto/availability.json, data/hidden-videos.js (사이트가 숨길 영상 목록)
// 필요한 환경변수: YOUTUBE_API_KEY.  선택: REVIEW_FILE (PR 본문에 결과 추가)
import fs from "node:fs";
import { loadSiteData, readJson, writeJson } from "./lib.mjs";
import { buildHiddenJs } from "./build-places.mjs";

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) throw new Error("YOUTUBE_API_KEY 가 없어요");

const site = loadSiteData();
const prev = readJson("data/auto/availability.json", {});
const today = new Date().toISOString().slice(0, 10);
const result = {};

const ids = site.VIDEOS.map((v) => v.id);
for (let i = 0; i < ids.length; i += 50) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.search = new URLSearchParams({ part: "status", id: ids.slice(i, i + 50).join(","), key: KEY });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube videos ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const found = Object.fromEntries(((await res.json()).items || []).map((it) => [it.id, it.status]));
  for (const id of ids.slice(i, i + 50)) {
    const st = found[id];
    // 목록에 없으면 삭제 또는 비공개, private 이면 비공개, embeddable=false 면 사이트에서 재생 불가
    const status = !st ? "gone" : st.privacyStatus === "private" ? "private" : st.embeddable === false ? "no_embed" : "ok";
    result[id] = { status, checked: today };
  }
}

writeJson("data/auto/availability.json", result);
const { hidden } = buildHiddenJs();

const newlyHidden = site.VIDEOS.filter((v) => result[v.id].status !== "ok" && prev[v.id]?.status !== result[v.id].status);
const restored = site.VIDEOS.filter((v) => result[v.id].status === "ok" && prev[v.id] && prev[v.id].status !== "ok");
console.log(`영상 ${ids.length}개 확인: 숨김 ${hidden}개 (새로 숨김 ${newlyHidden.length}, 다시 공개 ${restored.length})`);

if (process.env.REVIEW_FILE) {
  const label = { gone: "삭제·비공개", private: "비공개", no_embed: "퍼가기 금지" };
  const lines = [
    `## 🎬 영상 상태 점검: ${ids.length}개 중 ${hidden}개 숨김`,
    ...(newlyHidden.length ? [`새로 숨긴 영상 ${newlyHidden.length}개 (사이트에서 자동으로 빠져요):`, ...newlyHidden.map((v) => `- ${v.title} — ${label[result[v.id].status]} ([링크](https://www.youtube.com/watch?v=${v.id}))`)] : ["새로 숨긴 영상 없음"]),
    ...(restored.length ? [`다시 볼 수 있게 된 영상 ${restored.length}개:`, ...restored.map((v) => `- ${v.title}`)] : []),
    "",
  ];
  fs.appendFileSync(process.env.REVIEW_FILE, lines.join("\n") + "\n");
}
