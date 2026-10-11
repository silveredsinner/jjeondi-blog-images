// 이번 실행에서 새로 찾은 장소(data/auto/last-run.json)로 지역별 블로그 글 초안을 만든다.
// 필요한 환경변수: ANTHROPIC_API_KEY
// 선택: BLOG_REGION=busan  → 새 장소와 상관없이 그 지역의 모든 장소로 글 쓰기
//       MIN_PLACES=2       → 새 장소가 이 수 이상인 지역만 글 쓰기 (기본 2)
import fs from "node:fs";
import { loadSiteData, readJson, askJson, savePost } from "./lib.mjs";

const site = loadSiteData();
const MIN = Number(process.env.MIN_PLACES || 2);
const today = new Date().toISOString().slice(0, 10);

// 확인 필요(needs_check) 장소는 글에 쓰지 않는다. PLACES_AUTO 에는 이미 빠져 있음
const allPlaces = [...site.PLACES, ...site.PLACES_AUTO];
let groups = {};
if (process.env.BLOG_REGION) {
  const r = process.env.BLOG_REGION;
  groups[r] = allPlaces.filter((x) => x.region === r);
} else {
  for (const x of readJson("data/auto/last-run.json", { added: [] }).added) if (!x.needs_check) (groups[x.region] ||= []).push(x);
  groups = Object.fromEntries(Object.entries(groups).filter(([, xs]) => xs.length >= MIN));
}
if (process.env.REVIEW_FILE) fs.appendFileSync(process.env.REVIEW_FILE, "\n## 블로그 초안\n");
if (!Object.keys(groups).length) {
  if (process.env.REVIEW_FILE) fs.appendFileSync(process.env.REVIEW_FILE, "이번에는 없음 (새 장소가 2곳 이상 모인 지역이 없음)\n");
  console.log("새 글을 쓸 만큼 장소가 모인 지역이 없어요.");
  process.exit(0);
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title_ko", "title_en", "summary_ko", "summary_en", "body_ko", "body_en"],
  properties: {
    title_ko: { type: "string" }, title_en: { type: "string" },
    summary_ko: { type: "string", description: "검색 결과에 보일 1~2문장 요약" },
    summary_en: { type: "string" },
    body_ko: { type: "string", description: "본문 HTML. <h2>,<h3>,<p>,<ul>,<li>,<strong> 만 사용" },
    body_en: { type: "string" },
  },
};

const SYSTEM = `너는 한국 지역 여행·음식 블로그 에디터야. 외국인 여행자와 한국인 독자 모두를 위해 쓴다.
- 주어진 자료(지역 소개, 가게 이름·메뉴, 영상 제목)에 있는 사실만 써. 가격·영업시간·주소·평점처럼 자료에 없는 정보는 지어내지 마.
- 가게마다 짧은 소개(무엇을 먹는 곳인지, 어떤 영상에 나왔는지)를 쓰고, 마지막에 동선 팁을 한 단락 덧붙여.
- 과장 광고 문구, 이모지 남발, "최고의", "무조건" 같은 단정은 피하고 담백하게.
- 한국어 본문과 영어 본문은 같은 내용을 각 언어 독자에게 자연스럽게 쓴다 (직역 아님).
- 본문은 HTML 이며 <h2>, <h3>, <p>, <ul>, <li>, <strong> 태그만 쓴다. 지도 링크와 영상 목록은 시스템이 따로 붙이니 본문에 넣지 마.`;

for (const [region, places] of Object.entries(groups)) {
  const r = site.REGIONS.find((x) => x.key === region);
  const info = site.REGION_INFO?.[region];
  const videoIds = [...new Set(places.flatMap((x) => x.videos))];
  const videos = videoIds.map((id) => site.VIDEOS.find((v) => v.id === id)).filter(Boolean)
    .map((v) => ({ id: v.id, title: v.title, show: v.show ? site.SHOWS[v.show].ko : null }));

  const prompt = `지역: ${r.ko} (${r.en})
지역 소개: ${info?.ko.intro ?? ""}
대표 음식: ${(info?.ko.foods ?? []).join(", ")}

[소개할 가게·장소]
${places.map((x) => `- ${x.ko} / ${x.en} (${x.type}) — ${x.menu_ko} / ${x.menu_en}`).join("\n")}

[이 장소들이 나온 영상]
${videos.map((v) => `- ${v.title}${v.show ? ` [${v.show}]` : ""}`).join("\n")}

이 자료로 "${r.ko} 영상 속 맛집·명소" 소개 글을 한국어와 영어로 써줘.`;

  console.log(`- ${r.ko}: 장소 ${places.length}곳으로 글 작성 중…`);
  const out = await askJson({ system: SYSTEM, prompt, schema: SCHEMA, effort: "medium" });
  if (!out) continue;
  const slug = `${today}-${region}`;
  savePost({
    slug, date: today, region,
    title: { ko: out.title_ko, en: out.title_en },
    summary: { ko: out.summary_ko, en: out.summary_en },
    body: { ko: out.body_ko, en: out.body_en },
    places: places.map(({ ko, en, q, menu_ko, menu_en }) => ({ ko, en, q, menu_ko, menu_en })),
    videos: videos.map(({ id, title }) => ({ id, title })),
  });
  console.log(`  → blog/posts/${slug}.html`);
  if (process.env.REVIEW_FILE) fs.appendFileSync(process.env.REVIEW_FILE, `\n- 📝 블로그 초안: \`korea-tube/blog/posts/${slug}.html\` — ${out.title_ko}`);
}
