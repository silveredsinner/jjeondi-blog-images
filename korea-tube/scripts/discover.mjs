// 유튜브에서 새 영상(먹방·K-뷰티 등)을 찾아 data/auto/videos-auto.json 에 후보로 넣는다.
// 퍼가기(임베드) 허용 + 공개 + 쇼츠 아님 + 조회수 기준을 넘는 영상만 고르고,
// Claude 가 제목·설명란을 읽어 지역과 주제가 분명한 영상만 남긴다 (근거 문구가 원문에 있어야 통과).
// 필요한 환경변수: YOUTUBE_API_KEY, ANTHROPIC_API_KEY
// 선택: DISCOVER=mukbang,beauty (찾을 주제), MAX_NEW (주제별 최대 추가 수, 기본 20),
//       MIN_VIEWS (최소 조회수, 기본 30000), REVIEW_FILE (PR 본문에 결과 추가)
// 유튜브 할당량: 검색 1번에 100. 주제별 검색어 수만큼 쓴다 (먹방 11번, K-뷰티 6번).
import fs from "node:fs";
import { loadSiteData, readJson, writeJson, askJson } from "./lib.mjs";
import { buildVideosJs } from "./build-places.mjs";

const YT_KEY = process.env.YOUTUBE_API_KEY;
if (!YT_KEY) throw new Error("YOUTUBE_API_KEY 가 없어요");
const WANT = (process.env.DISCOVER || "mukbang,beauty").split(",").map((s) => s.trim()).filter(Boolean);
const MAX_NEW = Number(process.env.MAX_NEW || 20);
const MIN_VIEWS = Number(process.env.MIN_VIEWS || 30000);
const MIN_SECONDS = 240; // 4분 미만(쇼츠·짧은 클립) 제외

const site = loadSiteData();
const REGION_KEYS = site.REGIONS.map((r) => r.key);
const regionList = site.REGIONS.map((r) => `${r.key} = ${r.ko} (${r.en})`).join("\n");

// 주제별 검색어. region 은 검색 힌트일 뿐이고, 실제 지역은 Claude 가 원문에서 확인한다.
const TOPICS = {
  mukbang: {
    label: "먹방",
    cats: ["food", "mukbang"],
    queries: site.REGIONS.map((r) => `${r.en.split("·")[0]} Korea mukbang`),
    rule: "A mukbang or eating video: the creator eats Korean food on camera at a restaurant, market or street stall in Korea.",
  },
  beauty: {
    label: "K-뷰티",
    cats: ["culture", "beauty"],
    queries: [
      "Seoul K-beauty shopping Olive Young haul",
      "Myeongdong skincare shopping Korea vlog",
      "Seongsu K-beauty pop up store Seoul",
      "Gangnam skin clinic Korea vlog",
      "Busan K-beauty shopping",
      "Jeju skincare Korea vlog",
    ],
    rule: "K-beauty content filmed in Korea: skincare or cosmetics shopping (e.g. Olive Young, Myeongdong, Seongsu), Korean skin clinics, hair salons or beauty experiences.",
  },
};

const store = readJson("data/auto/videos-auto.json", []);
const seen = readJson("data/auto/discover-seen.json", {}); // 이미 검토해서 뺀 영상 (다시 묻지 않음)
const have = new Set([...site.VIDEOS.map((v) => v.id), ...store.map((v) => v.id)]);
const today = new Date().toISOString().slice(0, 10);

async function yt(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries({ ...params, key: YT_KEY })) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube ${endpoint} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// ISO 8601 (PT1H2M3S) → 초
const seconds = (d) => {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(d || "") || [];
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
};
const squash = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();

const SYSTEM = `You curate YouTube videos for a site that maps Korean travel, food and culture videos by region.
For each candidate decide whether it fits the topic AND clearly shows one Korean region.
Regions (use the key):
${regionList}
Rules:
- keep=true only if the topic rule is met and the title or description names a place in Korea that puts it in one region.
- evidence: copy the exact words from the title or description that name the place (e.g. "Gwangjang Market", "명동", "Haeundae"). Must be copied verbatim.
- If the video is mainly outside Korea, an ad, a reaction/compilation of other people's clips, or the place is unclear, keep=false.
- Do not guess. When unsure, keep=false.`;

const SCHEMA = {
  type: "object",
  properties: {
    videos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          keep: { type: "boolean" },
          region: { type: "string", enum: REGION_KEYS },
          evidence: { type: "string" },
          reason: { type: "string" },
        },
        required: ["id", "keep", "region", "evidence", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["videos"],
  additionalProperties: false,
};

const report = [];
for (const key of WANT) {
  const topic = TOPICS[key];
  if (!topic) { console.log(`모르는 주제: ${key} (가능: ${Object.keys(TOPICS).join(", ")})`); continue; }

  // 1) 검색: 퍼가기 허용·공개 배포 가능한 영상만
  const ids = new Set();
  for (const q of topic.queries) {
    const r = await yt("search", {
      part: "id", q, type: "video", maxResults: "25", order: "relevance",
      videoEmbeddable: "true", videoSyndicated: "true", safeSearch: "moderate",
    });
    for (const it of r.items || []) if (it.id?.videoId && !have.has(it.id.videoId) && !seen[it.id.videoId]) ids.add(it.id.videoId);
  }

  // 2) 상세 확인: 공개·임베드 가능·아동용 아님·4분 이상·조회수 기준
  const cands = [];
  const list = [...ids];
  for (let i = 0; i < list.length; i += 50) {
    const r = await yt("videos", { part: "snippet,status,statistics,contentDetails", id: list.slice(i, i + 50).join(",") });
    for (const it of r.items || []) {
      const views = Number(it.statistics?.viewCount || 0);
      const ok = it.status?.privacyStatus === "public" && it.status?.embeddable === true && !it.status?.madeForKids &&
        seconds(it.contentDetails?.duration) >= MIN_SECONDS && views >= MIN_VIEWS;
      if (ok) cands.push({ id: it.id, title: it.snippet.title, channel: it.snippet.channelTitle, description: it.snippet.description || "", views });
    }
  }
  cands.sort((a, b) => b.views - a.views);
  console.log(`[${topic.label}] 검색 ${ids.size}개 → 조건 통과 ${cands.length}개`);

  // 3) Claude 검토 (조회수 많은 순으로 15개씩)
  const added = [];
  for (let i = 0; i < cands.length && added.length < MAX_NEW; i += 15) {
    const batch = cands.slice(i, i + 15);
    const prompt = `Topic rule: ${topic.rule}\n\nCandidates:\n` + batch.map((c) =>
      `--- id: ${c.id}\ntitle: ${c.title}\nchannel: ${c.channel}\ndescription: ${c.description.slice(0, 1200)}`).join("\n");
    let out;
    try {
      out = await askJson({ system: SYSTEM, prompt, schema: SCHEMA, effort: "low", maxTokens: 8000 });
    } catch (e) {
      console.log(`  Claude 호출 실패, 이번 묶음 건너뜀: ${e.message}`);
      continue;
    }
    const verdict = Object.fromEntries((out?.videos || []).map((x) => [x.id, x]));
    for (const c of batch) {
      const x = verdict[c.id];
      const source = squash(`${c.title}\n${c.description}`);
      // 근거 문구가 실제 제목·설명란에 있어야 인정 (모델이 지어낸 지역 차단)
      const pass = x?.keep && REGION_KEYS.includes(x.region) && x.evidence.trim().length >= 2 && source.includes(squash(x.evidence));
      if (!pass) { seen[c.id] = { topic: key, checked: today, reason: x?.reason || "no verdict" }; continue; }
      if (added.length >= MAX_NEW) break;
      const v = { id: c.id, region: x.region, cats: topic.cats, title: c.title.slice(0, 120), channel: c.channel, views: c.views, evidence: x.evidence, added: today };
      store.push(v); have.add(c.id); added.push(v);
    }
  }
  report.push({ topic, added });
  console.log(`[${topic.label}] 추가 ${added.length}개`);
}

writeJson("data/auto/videos-auto.json", store);
writeJson("data/auto/discover-seen.json", seen);
const { videos } = buildVideosJs();
console.log(`videos-auto.js: 자동 추가 영상 ${videos}개`);

if (process.env.REVIEW_FILE) {
  const name = Object.fromEntries(site.REGIONS.map((r) => [r.key, r.ko]));
  const lines = ["## 🔎 새 영상 찾기"];
  for (const { topic, added } of report) {
    lines.push(`### ${topic.label}: ${added.length}개 추가`);
    for (const v of added) lines.push(`- [${v.title}](https://www.youtube.com/watch?v=${v.id}) — ${v.channel}, ${name[v.region]}, 조회수 ${v.views.toLocaleString("en-US")} (근거: "${v.evidence}")`);
  }
  lines.push("", "빼고 싶은 영상은 `korea-tube/data/auto/videos-auto.json` 에서 그 항목을 지우면 돼요.", "");
  fs.appendFileSync(process.env.REVIEW_FILE, lines.join("\n") + "\n");
}
