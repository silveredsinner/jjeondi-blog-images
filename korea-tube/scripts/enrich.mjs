// 영상 설명란·댓글에서 맛집/장소를 뽑아 data/places-auto.js 초안을 만든다.
// 필요한 환경변수: YOUTUBE_API_KEY, ANTHROPIC_API_KEY
// 선택: MAX_VIDEOS (한 번에 처리할 영상 수, 기본 15), ONLY_SHOWS=1 (방송 프로그램 영상만)
//       VIDEO_IDS=id1,id2 (이 영상만 처리, 이미 처리한 영상도 다시)
import fs from "node:fs";
import { loadSiteData, readJson, writeJson, regionsOf, normName, askJson, p } from "./lib.mjs";

const YT_KEY = process.env.YOUTUBE_API_KEY;
const MAX = Number(process.env.MAX_VIDEOS || 15);
const ONLY_SHOWS = process.env.ONLY_SHOWS === "1";
const ONLY_IDS = (process.env.VIDEO_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);

if (!YT_KEY) throw new Error("YOUTUBE_API_KEY 가 없어요");

const site = loadSiteData();
const processed = readJson("data/auto/processed.json", {});
const store = readJson("data/auto/places-auto.json", []);

// 가게 정보가 설명란에 잘 적혀 있는 맛집 프로그램부터 처리
const PRIORITY = { baekban: 0, paikmarket: 1 };
const rank = (v) => (v.show ? PRIORITY[v.show] ?? 2 : 3);
const todo = ONLY_IDS.length
  ? site.VIDEOS.filter((v) => ONLY_IDS.includes(v.id))
  : site.VIDEOS.filter((v) => !processed[v.id] && (!ONLY_SHOWS || v.show))
      .map((v, i) => [v, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([v]) => v)
      .slice(0, MAX);
console.log(`처리할 영상 ${todo.length}개 (남은 영상 ${site.VIDEOS.filter((v) => !processed[v.id]).length}개)`);

async function yt(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries({ ...params, key: YT_KEY })) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    // 댓글이 막힌 영상은 403 이 정상이라 빈 결과로 처리
    if (endpoint === "commentThreads" && res.status === 403) return { items: [] };
    throw new Error(`YouTube ${endpoint} ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

// 영상 정보는 50개씩 한 번에
const details = {};
for (let i = 0; i < todo.length; i += 50) {
  const ids = todo.slice(i, i + 50).map((v) => v.id).join(",");
  const data = await yt("videos", { part: "snippet", id: ids });
  for (const it of data.items || []) details[it.id] = it.snippet;
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["places"],
  properties: {
    places: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name_ko", "name_en", "type", "region", "menu_ko", "menu_en", "map_query", "evidence"],
        properties: {
          name_ko: { type: "string", description: "가게/장소의 한국어 이름. 지점이 있으면 지점까지" },
          name_en: { type: "string", description: "영어 표기 (로마자 표기 + 필요하면 설명)" },
          type: { type: "string", enum: ["restaurant", "market", "spot"] },
          region: { type: "string", description: "주어진 지역 key 중 하나" },
          menu_ko: { type: "string", description: "영상/설명에 나온 대표 메뉴나 특징 (짧게)" },
          menu_en: { type: "string" },
          map_query: { type: "string", description: "지도 검색어. 예: '청주 우암설렁탕'. 주소가 있으면 주소" },
          evidence: { type: "string", description: "이 가게가 나온다는 근거가 되는 원문 문장 그대로" },
        },
      },
    },
  },
};

const SYSTEM = `너는 한국 여행·음식 영상의 설명란과 댓글에서 영상에 나온 가게와 장소를 정리하는 편집자야.
- 설명란이나 댓글에 이름이 분명히 적힌 곳만 뽑아. 추측하거나 네가 아는 지식으로 채우지 마.
- 근거(evidence)에는 원문 문장을 그대로 옮겨.
- 협찬·광고 링크, 채널 홍보, 다른 영상 소개는 제외해.
- 영상과 관계없는 댓글 속 추천 가게는 제외하고, 영상에 나온 곳이라고 판단되는 것만 넣어.
- 출연자가 실제로 가거나 먹거나 체험한 곳만 넣어. 역사·주제로 이름만 언급된 동네·행정구역(예: "여의도의 역사")은 제외해.
- [이미 등록된 장소] 목록에 있는 곳과 같은 장소라면 name_ko 에 그 목록의 이름을 글자 그대로 써. (예: "남산타워" → 목록의 "남산서울타워")
- 하나도 없으면 빈 배열을 돌려줘.`;

const added = [];
for (const v of todo) {
  const sn = details[v.id];
  if (!sn) {
    console.log(`- ${v.id}: 영상을 찾을 수 없음 (삭제/비공개?)`);
    processed[v.id] = { date: today(), status: "unavailable" };
    continue;
  }
  const comments = await yt("commentThreads", { part: "snippet", videoId: v.id, order: "relevance", maxResults: "15", textFormat: "plainText" });
  const commentText = (comments.items || [])
    .map((c) => c.snippet.topLevelComment.snippet)
    .map((c) => `- ${c.authorDisplayName}${c.authorChannelId?.value === sn.channelId ? " (채널 주인)" : ""}: ${c.textDisplay}`)
    .join("\n");
  const regions = regionsOf(v).map((r) => `${r} (${site.REGIONS.find((x) => x.key === r)?.ko})`).join(", ");

  const registered = [...site.PLACES, ...store].filter((x) => regionsOf(v).includes(x.region)).map((x) => `- ${x.ko}`).join("\n");
  const prompt = `영상 제목: ${sn.title}
채널: ${sn.channelTitle}
이 영상의 지역 key: ${regions}

[이미 등록된 장소]
${registered || "(없음)"}

[설명란]
${sn.description || "(없음)"}

[인기 댓글]
${commentText || "(없음)"}`;

  let out;
  try {
    out = await askJson({ system: SYSTEM, prompt, schema: SCHEMA });
  } catch (e) {
    console.log(`- ${v.id}: Claude 호출 실패 → 다음 실행 때 다시 시도 (${e.message})`);
    continue;
  }
  // 근거 문장이 실제 설명란·댓글에 있는 것만 인정 (모델이 지어낸 가게 차단)
  const source = squash(`${sn.description}\n${commentText}`);
  const found = (out?.places || []).filter((x) =>
    x.name_ko.trim() && regionsOf(v).includes(x.region) &&
    x.evidence.trim().length >= 4 && source.includes(squash(x.evidence)));
  const dropped = (out?.places || []).length - found.length;
  if (dropped) console.log(`  (근거를 원문에서 찾지 못해 ${dropped}곳 제외)`);
  let n = 0;
  for (const x of found) {
    const key = normName(x.name_ko);
    const existing = [...site.PLACES, ...store].find((y) => sameName(y.ko, key));
    if (existing) {
      // 이미 있는 가게면 영상만 연결
      if (!existing.videos.includes(v.id) && store.includes(existing)) existing.videos.push(v.id);
      continue;
    }
    const place = {
      region: x.region, type: x.type, ko: x.name_ko, en: x.name_en, q: x.map_query.trim() || x.name_ko,
      menu_ko: x.menu_ko, menu_en: x.menu_en, videos: [v.id],
      auto: true, evidence: x.evidence, added: today(),
    };
    store.push(place);
    added.push(place);
    n++;
  }
  processed[v.id] = { date: today(), status: "done", found: n };
  console.log(`- ${v.id} ${sn.title.slice(0, 40)} → 새 장소 ${n}곳`);
}

writeJson("data/auto/places-auto.json", store);
writeJson("data/auto/processed.json", processed);
writeJson("data/auto/last-run.json", { date: today(), added });
fs.writeFileSync(
  p("data/places-auto.js"),
  `// 자동 생성 파일: scripts/enrich.mjs 가 영상 설명란·댓글에서 뽑은 장소 (data/auto/places-auto.json 에서 만들어짐)\n` +
  `// 직접 고치려면 data/auto/places-auto.json 을 고친 뒤 다시 생성하거나, 확정된 항목은 data/places.js 로 옮기세요.\n` +
  `window.PLACES_AUTO = ${JSON.stringify(store.map(({ evidence, added, ...rest }) => rest), null, 2)};\n`,
);
console.log(`\n새로 찾은 장소 ${added.length}곳`);

// 같은 장소 판정: 정규화한 이름이 같거나, 3글자 이상에서 한쪽이 다른 쪽을 포함
function sameName(existingKo, key) {
  const a = normName(existingKo);
  return a === key || (a.length >= 3 && key.length >= 3 && (a.includes(key) || key.includes(a)));
}
function squash(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
function today() { return new Date().toISOString().slice(0, 10); }
