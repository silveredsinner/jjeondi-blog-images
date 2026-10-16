// 영상 제목을 12개 언어로 옮긴다 → data/auto/video-titles.json, 화면용 data/video-titles/<lang>.js + data/video-titles.js (버전)
// 원래 제목이 바뀐 영상만 다시 번역한다. 한국어 제목은 한국어판에서, 영어 제목은 영어판에서 그대로 쓴다. 모델: Haiku (저렴)
// 필요한 환경변수: ANTHROPIC_API_KEY.  선택: REVIEW_FILE
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import { readJson, writeJson, askJson, MODEL_BULK, p } from "./lib.mjs";
import { MORE_LANGS } from "./blog-i18n.mjs";

const NAMES = { ko: "Korean", en: "English", ja: "Japanese", "zh-Hans": "Simplified Chinese", "zh-Hant": "Traditional Chinese (Taiwan)", es: "Spanish", fr: "French", de: "German", vi: "Vietnamese", th: "Thai", id: "Indonesian", ru: "Russian" };
const LANGS = ["ko", "en", ...MORE_LANGS];
const BATCH = 50;

const window = {};
const ctx = vm.createContext({ window });
for (const f of ["data/videos.js", "data/videos-auto.js", "data/hidden-videos.js"]) {
  if (fs.existsSync(p(f))) vm.runInContext(fs.readFileSync(p(f), "utf8"), ctx);
}
const hidden = new Set(window.HIDDEN_VIDEOS || []);
const videos = window.VIDEOS.filter((v) => !hidden.has(v.id));
const isKo = (s) => /[가-힣]/.test(s);
const isEn = (s) => !isKo(s) && !/[぀-ヿ一-鿿฀-๿Ѐ-ӿ]/.test(s);
// 원래 제목을 그대로 쓰는 언어
const keepOriginal = (title, lang) => (lang === "ko" && isKo(title)) || (lang === "en" && isEn(title));

const store = readJson("data/auto/video-titles.json", {});
for (const v of videos) if (store[v.id]?.src !== v.title) store[v.id] = { src: v.title };

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["items"],
  properties: { items: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "title"], properties: { id: { type: "string" }, title: { type: "string" } } } } },
};
const SYSTEM = `You translate YouTube video titles about Korean food and travel for a video map site.
- Translate each title into the target language naturally and concisely, as a native viewer would expect to read it.
- Keep creator names, TV program names, brand names and episode markers like (EP.417) or #11 as they are. Korean place and food names: use the form travelers in that language search for; transliterate if there is none.
- Drop clickbait capitals and excessive emoji, but keep the meaning. Do not add information.
- Return every id exactly once.`;

let done = 0;
const log = [];
for (const lang of LANGS) {
  const todo = videos.filter((v) => !keepOriginal(v.title, lang) && !store[v.id][lang]);
  for (let i = 0; i < todo.length; i += BATCH) {
    const chunk = todo.slice(i, i + BATCH);
    let out;
    try {
      out = await askJson({
        system: SYSTEM, model: MODEL_BULK, effort: "low", maxTokens: 12000, schema: SCHEMA,
        prompt: `Target language: ${NAMES[lang]} (${lang})\n\n${chunk.map((v) => `${v.id}\t${v.title}`).join("\n")}`,
      });
    } catch (e) {
      console.log(`- ${lang}: 실패, 다음에 다시 (${e.message})`);
      continue;
    }
    for (const it of out?.items || []) {
      if (!chunk.some((v) => v.id === it.id) || !it.title.trim()) continue;
      store[it.id][lang] = it.title.trim();
      done++;
    }
  }
  if (todo.length) log.push(`${lang} ${todo.length}`);
  console.log(`- ${lang}: 번역할 제목 ${todo.length}개`);
}
writeJson("data/auto/video-titles.json", store);

// 화면용 파일: 언어별로 나눠서 지금 보는 언어만 불러오게 한다
fs.rmSync(p("data/video-titles"), { recursive: true, force: true });
fs.mkdirSync(p("data/video-titles"), { recursive: true });
const ver = {};
for (const lang of LANGS) {
  const map = Object.fromEntries(videos.filter((v) => store[v.id]?.[lang]).map((v) => [v.id, store[v.id][lang]]));
  if (!Object.keys(map).length) continue;
  const js = `// 자동 생성 파일: scripts/translate-titles.mjs 가 만듦\n(window.VIDEO_TITLES = window.VIDEO_TITLES || {})[${JSON.stringify(lang)}] = ${JSON.stringify(map)};\n`;
  fs.writeFileSync(p(`data/video-titles/${lang}.js`), js);
  ver[lang] = crypto.createHash("sha1").update(js).digest("hex").slice(0, 8);
}
fs.writeFileSync(p("data/video-titles.js"),
  `// 자동 생성 파일: scripts/translate-titles.mjs 가 만듦. 언어별 영상 제목 번역 파일(data/video-titles/<lang>.js)의 버전\nwindow.VIDEO_TITLES_VER = ${JSON.stringify(ver)};\n`);
console.log(`영상 제목 번역 ${done}개`);
if (process.env.REVIEW_FILE && done) fs.appendFileSync(process.env.REVIEW_FILE, `\n## 🎬 영상 제목 번역: ${done}개 (${log.join(", ")})\n`);
