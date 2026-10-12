// 지역 페이지(r/<lang>/<key>.html)에 쓸 대표 음식·가볼 곳·영상 속 장소 이름을 10개 언어로 옮긴다.
// 결과: data/auto/region-i18n.json  { lang: { region: { foods:[], spots:[], places:{ 한국어이름: [이름, 설명] }, src } } }
// 원문(영어)이 바뀐 지역만 다시 번역한다 (src 해시 비교).
// 필요한 환경변수: ANTHROPIC_API_KEY.  선택: REVIEW_FILE
import fs from "node:fs";
import crypto from "node:crypto";
import { loadSiteData, readJson, writeJson, askJson } from "./lib.mjs";
import { MORE_LANGS } from "./blog-i18n.mjs";

const NAMES = { ja: "Japanese", "zh-Hans": "Simplified Chinese", "zh-Hant": "Traditional Chinese (Taiwan)", es: "Spanish", fr: "French", de: "German", vi: "Vietnamese", th: "Thai", id: "Indonesian", ru: "Russian" };
const site = loadSiteData();
const allPlaces = [...site.PLACES, ...site.PLACES_AUTO];
const store = readJson("data/auto/region-i18n.json", {});

// 지역별 원문
const source = Object.fromEntries(site.REGIONS.map((r) => {
  const en = site.REGION_INFO[r.key].en;
  const places = allPlaces.filter((x) => x.region === r.key).map((x) => ({ ko: x.ko, en: x.en, menu: x.menu_en }));
  const src = { foods: en.foods, spots: en.spots, places };
  return [r.key, { ...src, hash: crypto.createHash("sha1").update(JSON.stringify(src)).digest("hex").slice(0, 10) }];
}));

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["regions"],
  properties: {
    regions: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["key", "foods", "spots", "places"],
        properties: {
          key: { type: "string" },
          foods: { type: "array", items: { type: "string" } },
          spots: { type: "array", items: { type: "string" } },
          places: { type: "array", items: { type: "object", additionalProperties: false, required: ["ko", "name", "menu"], properties: { ko: { type: "string" }, name: { type: "string" }, menu: { type: "string" } } } },
        },
      },
    },
  },
};
const SYSTEM = `You localize short travel labels about Korean regions for travelers.
- Translate each food, sight, place name and description into the target language, keeping the same order and count.
- Use the names travelers in that language actually search for (e.g. Japanese: 광장시장 → 広蔵市場, Thai: 해운대 → แฮอุนแด). If there is no common name, transliterate the Korean.
- Keep it short; do not add facts. For each place, return its Korean name unchanged in "ko".`;

let done = 0;
const log = [];
for (const lang of MORE_LANGS) {
  store[lang] ||= {};
  const todo = Object.entries(source).filter(([key, s]) => store[lang][key]?.src !== s.hash).map(([key]) => key);
  if (!todo.length) continue;
  const prompt = `Target language: ${NAMES[lang]} (${lang})\n\n` + todo.map((key) => {
    const s = source[key];
    return `## region: ${key}\nfoods: ${JSON.stringify(s.foods)}\nspots: ${JSON.stringify(s.spots)}\nplaces:\n${s.places.map((x) => `- ko: ${x.ko} | en: ${x.en} | ${x.menu}`).join("\n")}`;
  }).join("\n\n");
  let out;
  try {
    out = await askJson({ system: SYSTEM, prompt, schema: SCHEMA, effort: "low", maxTokens: 16000 });
  } catch (e) {
    console.log(`- ${lang}: 실패, 다음에 다시 (${e.message})`);
    continue;
  }
  for (const reg of out?.regions || []) {
    const s = source[reg.key];
    if (!s || reg.foods.length !== s.foods.length || reg.spots.length !== s.spots.length) continue;
    const places = Object.fromEntries(reg.places.filter((x) => s.places.some((y) => y.ko === x.ko)).map((x) => [x.ko, [x.name, x.menu]]));
    store[lang][reg.key] = { foods: reg.foods, spots: reg.spots, places, src: s.hash };
    done++;
  }
  log.push(lang);
  console.log(`- ${lang}: 지역 ${todo.length}곳 번역`);
}
writeJson("data/auto/region-i18n.json", store);
console.log(`지역 정보 번역 ${done}건`);
if (process.env.REVIEW_FILE && done) {
  fs.appendFileSync(process.env.REVIEW_FILE, `\n## 🗺️ 지역 페이지 번역: ${done}건 (${log.join(", ")})\n`);
}
