// K-뷰티 쇼핑 가이드 문구를 10개 언어로 옮긴다 → data/auto/kbeauty-i18n.json
// 영어 원문(data/kbeauty.js)이 바뀐 언어만 다시 번역한다 (src 해시 비교). 모델: Haiku (저렴)
// 필요한 환경변수: ANTHROPIC_API_KEY.  선택: REVIEW_FILE
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import { readJson, writeJson, askJson, MODEL_BULK, p } from "./lib.mjs";
import { MORE_LANGS } from "./blog-i18n.mjs";

const NAMES = { ja: "Japanese", "zh-Hans": "Simplified Chinese", "zh-Hant": "Traditional Chinese (Taiwan)", es: "Spanish", fr: "French", de: "German", vi: "Vietnamese", th: "Thai", id: "Indonesian", ru: "Russian" };
const window = {};
vm.runInContext(fs.readFileSync(p("data/kbeauty.js"), "utf8"), vm.createContext({ window }));
const en = window.KBEAUTY_TEXT.en;
const source = {
  text: { title: en.title, intro: en.intro, tipsTitle: en.tipsTitle, tips: en.tips, compare: en.compare, inKorea: en.inKorea, source: en.source, watch: en.watch, note: en.note, code: en.code },
  sections: Object.fromEntries(window.KBEAUTY_SECTIONS.map((s) => [s.key, s.en])),
  products: Object.fromEntries(window.KBEAUTY.map((x) => [x.id, x.en])),
};
const hash = crypto.createHash("sha1").update(JSON.stringify(source)).digest("hex").slice(0, 10);
const store = readJson("data/auto/kbeauty-i18n.json", {});

const kv = (props) => ({ type: "object", additionalProperties: false, required: Object.keys(props), properties: props });
const strMap = (keys) => kv(Object.fromEntries(keys.map((k) => [k, { type: "string" }])));
const SCHEMA = kv({
  text: kv({ ...Object.fromEntries(Object.keys(source.text).filter((k) => k !== "tips").map((k) => [k, { type: "string" }])), tips: { type: "array", items: { type: "string" } } }),
  sections: strMap(Object.keys(source.sections)),
  products: strMap(Object.keys(source.products)),
});
const SYSTEM = `Translate this K-beauty shopping guide for travelers into the target language. Keep brand and product names in their usual form for that market (official local names if common), keep facts exactly as given, natural tone, same number of tips.`;

let done = 0;
for (const lang of MORE_LANGS) {
  if (store[lang]?.src === hash) continue;
  let out;
  try {
    out = await askJson({ system: SYSTEM, prompt: `Target language: ${NAMES[lang]} (${lang})\n\n${JSON.stringify(source, null, 1)}`, schema: SCHEMA, model: MODEL_BULK, effort: "low", maxTokens: 8000 });
  } catch (e) { console.log(`- ${lang}: 실패 (${e.message})`); continue; }
  if (!out || out.text.tips.length !== source.text.tips.length) { console.log(`- ${lang}: 응답이 이상해서 건너뜀`); continue; }
  store[lang] = { ...out.text, sections: out.sections, products: out.products, src: hash };
  done++;
  console.log(`- ${lang}: ${out.text.title}`);
}
writeJson("data/auto/kbeauty-i18n.json", store);
console.log(`K-뷰티 가이드 번역 ${done}개 언어`);
if (process.env.REVIEW_FILE && done) fs.appendFileSync(process.env.REVIEW_FILE, `\n## 💄 K-뷰티 가이드 번역: ${done}개 언어\n`);
