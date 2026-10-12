// 블로그 글(한국어·영어)을 다른 10개 언어로 옮겨 blog/<lang>/<slug>.html 을 만든다.
// 이미 번역된 언어는 건너뛴다 (새 글만 번역). 영어판을 원문으로, 한국어판·장소 한국어 이름을 참고로 준다.
// 필요한 환경변수: ANTHROPIC_API_KEY
// 선택: BLOG_LANGS=ja,es (이 언어만), MAX_TRANSLATIONS (한 번에 최대 번역 수, 기본 150), REVIEW_FILE
import fs from "node:fs";
import { readJson, writeJson, askJson, rebuildBlog, p } from "./lib.mjs";
import { MORE_LANGS, hasLang } from "./blog-i18n.mjs";

const LANGS = process.env.BLOG_LANGS ? process.env.BLOG_LANGS.split(",").map((s) => s.trim()).filter((l) => MORE_LANGS.includes(l)) : MORE_LANGS;
const MAX = Number(process.env.MAX_TRANSLATIONS || 150);
const NAMES = { ja: "Japanese", "zh-Hans": "Simplified Chinese", "zh-Hant": "Traditional Chinese (Taiwan)", es: "Spanish", fr: "French", de: "German", vi: "Vietnamese", th: "Thai", id: "Indonesian", ru: "Russian" };

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "body", "places"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    body: { type: "string", description: "HTML using only <h2>,<h3>,<p>,<ul>,<li>,<strong>" },
    places: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["name", "menu"],
        properties: { name: { type: "string" }, menu: { type: "string" } },
      },
    },
  },
};

const SYSTEM = `You localize a Korea travel & food blog post for travelers who read the target language.
- Translate faithfully from the English version; use the Korean version only to check meaning. Do not add facts, prices, hours, addresses or ratings.
- Write naturally for native readers (not word-for-word). Keep it plain and honest, no hype.
- Place names: use the form travelers in that language would search for (e.g. Japanese 광장시장 → 広蔵市場, Chinese → 广藏市场). If there is no common name, transliterate the Korean name.
- Program names (e.g. "Welcome, First Time in Korea?") may keep the official English title or the well-known local title.
- Keep the same HTML structure using only <h2>, <h3>, <p>, <ul>, <li>, <strong>.
- places: return one entry per input place, in the same order, with the localized name and the menu/description.`;

const dir = p("blog/src");
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")) : [];
let done = 0;
const log = [];
for (const f of files) {
  const post = readJson(`blog/src/${f}`);
  let changed = false;
  for (const lang of LANGS) {
    if (hasLang(post, lang) || done >= MAX) continue;
    const prompt = `Target language: ${NAMES[lang]} (${lang})

[English title] ${post.title.en}
[English summary] ${post.summary.en}
[English body]
${post.body.en}

[Places, in order]
${post.places.map((x, i) => `${i + 1}. ${x.en} (Korean: ${x.ko}) — ${x.menu_en}`).join("\n")}

[Korean title, for reference] ${post.title.ko}
[Korean summary, for reference] ${post.summary.ko}`;
    let out;
    try {
      out = await askJson({ system: SYSTEM, prompt, schema: SCHEMA, effort: "low", maxTokens: 12000 });
    } catch (e) {
      console.log(`- ${post.slug} ${lang}: 실패, 다음에 다시 (${e.message})`);
      continue;
    }
    if (!out || out.places.length !== post.places.length || !out.title.trim() || !out.body.trim()) {
      console.log(`- ${post.slug} ${lang}: 응답이 이상해서 건너뜀`);
      continue;
    }
    post.title[lang] = out.title.trim();
    post.summary[lang] = out.summary.trim();
    post.body[lang] = out.body;
    (post.placesI18n ||= {})[lang] = out.places;
    changed = true;
    done++;
    log.push(`${post.slug} ${lang}`);
    console.log(`- ${post.slug} ${lang}: ${out.title}`);
  }
  if (changed) writeJson(`blog/src/${f}`, post);
}
const n = rebuildBlog();
console.log(`번역 ${done}개, 블로그 글 ${n}편 다시 만듦`);

if (process.env.REVIEW_FILE) {
  fs.appendFileSync(process.env.REVIEW_FILE, `\n## 🌏 블로그 번역: ${done}개\n${done ? `글 ${new Set(log.map((x) => x.split(" ")[0])).size}편을 ${[...new Set(log.map((x) => x.split(" ")[1]))].join(", ")} 로 옮겼어요. \`korea-tube/blog/<언어>/\` 에서 확인하세요.\n` : "번역할 새 글이 없어요.\n"}`);
}
