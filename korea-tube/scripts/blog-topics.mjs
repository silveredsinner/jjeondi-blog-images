// 주제별 블로그 글 (예: 서울 길거리 음식, 명동·성수 K-뷰티, 부산 해산물 시장) 초안을 쓴다.
// 사이트에 있는 영상(제목·설명란)과 영상 속 장소, 지역 정보만 근거로 쓰고, 없는 사실은 쓰지 않는다.
// 이미 쓴 주제는 건너뛴다 (blog/src/*-<주제>.json). 번역은 translate-blog.mjs 가 이어서 한다.
// 필요한 환경변수: ANTHROPIC_API_KEY.  선택: YOUTUBE_API_KEY (영상 설명란을 근거로 더 줌), TOPICS=seoul-street-food,... , REVIEW_FILE
import fs from "node:fs";
import { loadSiteData, askJson, savePost, regionsOf, p } from "./lib.mjs";

const site = loadSiteData();
const hidden = new Set(readJsonJs("data/hidden-videos.js", "HIDDEN_VIDEOS") || []);
const views = readJsonJs("data/video-views.js", "VIDEO_VIEWS") || {};
const VIDEOS = site.VIDEOS.filter((v) => !hidden.has(v.id));
const PLACES = [...site.PLACES, ...site.PLACES_AUTO];
const today = new Date().toISOString().slice(0, 10);

function readJsonJs(file, name) {
  try { return new Function("window", `${fs.readFileSync(p(file), "utf8")}; return window.${name};`)({}); } catch { return null; }
}

// 주제: region(지역 key), pick(영상 고르기), placeTypes(소개할 장소 종류), angle(글의 방향, 영어로 모델에게)
const TOPICS = [
  { slug: "seoul-street-food", region: "seoul", pick: (v) => v.cats.includes("food") || v.cats.includes("mukbang"), placeTypes: ["market", "restaurant"],
    angle: "Seoul street food and traditional markets (Gwangjang Market and others) as seen in mukbang and food tour videos: what to eat and how to plan a food day." },
  { slug: "seoul-k-beauty", region: "seoul", pick: (v) => v.cats.includes("beauty"), placeTypes: [],
    angle: "K-beauty experiences in Seoul shown in the videos: cosmetics shopping (Myeongdong, Olive Young, Seongsu), skin clinics and beauty treatments. Practical tips only from the material." },
  { slug: "busan-seafood-markets", region: "busan", pick: (v) => v.cats.includes("food") || v.cats.includes("mukbang"), placeTypes: ["market", "restaurant"],
    angle: "Busan seafood and market food (Jagalchi, Nampo-dong, pork soup, milmyeon) from the videos." },
  { slug: "jeju-food-trip", region: "jeju", pick: (v) => v.cats.includes("food") || v.cats.includes("mukbang"), placeTypes: ["market", "restaurant", "spot"],
    angle: "A Jeju Island food trip: black pork, seafood, Dongmun Market and the sights in between, from the videos." },
  { slug: "jeonju-and-jeonbuk-food", region: "jeonbuk", pick: (v) => v.cats.includes("food") || v.cats.includes("mukbang"), placeTypes: ["market", "restaurant", "spot"],
    angle: "Jeonju and Jeollabuk-do food (bibimbap city, hanok village, Gunsan) from the videos." },
  { slug: "gangwon-coast-food", region: "gangwon", pick: (v) => v.cats.includes("food") || v.cats.includes("mukbang"), placeTypes: ["market", "restaurant", "spot"],
    angle: "Gangwon-do food along the East Sea coast and in Chuncheon (Sokcho, Gangneung, dakgalbi) from the videos." },
  { slug: "gyeongju-history-and-food", region: "gyeongbuk", pick: () => true, placeTypes: ["market", "restaurant", "spot"],
    angle: "Gyeongju and Gyeongsangbuk-do: Silla history sights and local food from the videos." },
  { slug: "daegu-food-guide", region: "daegu", pick: (v) => v.cats.includes("food") || v.cats.includes("mukbang"), placeTypes: ["market", "restaurant", "spot"],
    angle: "Daegu food (makchang, Seomun Market and local favorites) from the videos." },
  { slug: "yeosu-mokpo-seafood", region: "jeonnam", pick: (v) => v.cats.includes("food") || v.cats.includes("mukbang"), placeTypes: ["market", "restaurant", "spot"],
    angle: "Jeollanam-do seafood towns (Yeosu, Mokpo, Gwangju) and the region's famous side dishes, from the videos." },
  { slug: "korea-mukbang-map", region: null, pick: (v) => v.cats.includes("mukbang"), placeTypes: [],
    angle: "A region-by-region guide to Korea through popular mukbang and food YouTube videos: which city is famous for what, so viewers can plan where to eat. Group by region." },
];

const ONLY = (process.env.TOPICS || "").split(",").map((s) => s.trim()).filter(Boolean);
const written = new Set(fs.readdirSync(p("blog/src")).map((f) => f.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.json$/, "")));

async function descriptions(ids) {
  if (!process.env.YOUTUBE_API_KEY || !ids.length) return {};
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.search = new URLSearchParams({ part: "snippet", id: ids.join(","), key: process.env.YOUTUBE_API_KEY });
  try {
    const res = await fetch(url);
    if (!res.ok) return {};
    return Object.fromEntries(((await res.json()).items || []).map((it) => [it.id, (it.snippet.description || "").slice(0, 700)]));
  } catch { return {}; }
}

const SCHEMA = {
  type: "object", additionalProperties: false,
  required: ["title_ko", "title_en", "summary_ko", "summary_en", "body_ko", "body_en", "videos"],
  properties: {
    title_ko: { type: "string" }, title_en: { type: "string", description: "Search-friendly English title travelers would type, e.g. 'Seoul Street Food Guide: ...'" },
    summary_ko: { type: "string" }, summary_en: { type: "string" },
    body_ko: { type: "string", description: "HTML: <h2>,<h3>,<p>,<ul>,<li>,<strong> only" },
    body_en: { type: "string" },
    videos: { type: "array", items: { type: "string" }, description: "ids of the videos actually used in the post, best first (max 8)" },
  },
};
const SYSTEM = `You are an editor for a Korea travel & food site for international travelers (Korean readers too).
- Use ONLY facts in the material: region info, places (names/menus), video titles and video descriptions. Never invent prices, hours, addresses, ratings, distances or names.
- When something comes from a video, say so naturally (e.g. "in Mark Wiens' video…", "the show visits…"). Creators' names appear in titles/descriptions.
- Useful, specific and honest; no hype words ("best ever", "must"), no emoji spam.
- Structure: short intro, sections with <h2>/<h3>, practical planning tips at the end that only rely on the material (e.g. combine nearby places mentioned).
- The English version targets travelers searching Google; the Korean version is natural Korean, not a literal translation.
- HTML only with <h2>, <h3>, <p>, <ul>, <li>, <strong>. Do not add links or video lists (the system adds map links and videos).`;

const report = [];
for (const t of TOPICS) {
  if (ONLY.length && !ONLY.includes(t.slug)) continue;
  if (written.has(t.slug)) { console.log(`- ${t.slug}: 이미 있음`); continue; }
  const vids = VIDEOS.filter((v) => (!t.region || regionsOf(v).includes(t.region)) && t.pick(v))
    .sort((a, b) => (views[b.id] ?? -1) - (views[a.id] ?? -1)).slice(0, 14);
  if (vids.length < 3) { console.log(`- ${t.slug}: 영상이 부족해 건너뜀`); continue; }
  // placeTypes 가 비어 있으면 장소 목록 없음 (예: K-뷰티)
  const places = t.region && t.placeTypes.length ? PLACES.filter((x) => x.region === t.region && t.placeTypes.includes(x.type)) : [];
  const desc = await descriptions(vids.map((v) => v.id));
  const regionText = (key) => {
    const r = site.REGIONS.find((x) => x.key === key), i = site.REGION_INFO[key];
    return `${r.en} (${r.ko}): ${i.en.intro} Foods: ${i.en.foods.join(", ")}. Sights: ${i.en.spots.join(", ")}.`;
  };
  const regions = t.region ? [t.region] : [...new Set(vids.flatMap(regionsOf))];
  const prompt = `Topic: ${t.angle}

[Region info]
${regions.map(regionText).join("\n")}

[Places from the videos]
${places.length ? places.map((x) => `- ${x.en} (${x.ko}), ${x.type}: ${x.menu_en}`).join("\n") : "(none for this topic)"}

[Videos] (id | region | title | channel/program | description excerpt)
${vids.map((v) => `- ${v.id} | ${regionsOf(v).join(",")} | ${v.title} | ${v.show ? site.SHOWS[v.show].en : ""} | ${(desc[v.id] || "").replace(/\s+/g, " ")}`).join("\n")}

Write the post in English and Korean.`;
  console.log(`- ${t.slug}: 영상 ${vids.length}개, 장소 ${places.length}곳으로 작성 중…`);
  let out;
  try { out = await askJson({ system: SYSTEM, prompt, schema: SCHEMA, effort: "medium", maxTokens: 16000 }); }
  catch (e) { console.log(`  실패: ${e.message}`); continue; }
  if (!out) continue;
  const used = out.videos.filter((id) => vids.some((v) => v.id === id)).slice(0, 8);
  const slug = `${today}-${t.slug}`;
  savePost({
    slug, date: today, region: t.region || regions[0], topic: t.slug,
    title: { ko: out.title_ko, en: out.title_en },
    summary: { ko: out.summary_ko, en: out.summary_en },
    body: { ko: out.body_ko, en: out.body_en },
    places: places.map(({ ko, en, q, menu_ko, menu_en }) => ({ ko, en, q, menu_ko, menu_en })),
    videos: (used.length ? used : vids.slice(0, 6).map((v) => v.id)).map((id) => ({ id, title: vids.find((v) => v.id === id).title })),
  });
  report.push(`- 📝 \`korea-tube/blog/posts/${slug}.html\` — ${out.title_ko} / ${out.title_en}`);
  console.log(`  → ${out.title_en}`);
}
if (process.env.REVIEW_FILE) fs.appendFileSync(process.env.REVIEW_FILE, `\n## 📝 주제별 블로그 글: ${report.length}편\n${report.join("\n")}\n`);
