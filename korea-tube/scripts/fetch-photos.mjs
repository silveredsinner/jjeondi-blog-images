// 블로그 글에 소개한 가게·장소의 사진을 찾아 photos/ 에 저장하고 data/auto/place-photos.json 에 출처를 적는다.
// 출처: 1) 한국관광공사 TourAPI (공공누리 제1·3유형, TOUR_API_KEY 가 있을 때)  2) 위키미디어 공용 (CC BY·CC BY-SA·CC0·퍼블릭 도메인)
// 후보 사진을 Haiku 가 직접 보고 고른다: 그 가게·장소 사진이면 place, 대표 음식만 맞으면 dish(예시 사진), 둘 다 아니면 사진 없음.
// 네이버·구글 리뷰·인스타·영상 캡처처럼 이용 허락이 없는 사진은 쓰지 않는다.
// 필요한 환경변수: ANTHROPIC_API_KEY.  선택: TOUR_API_KEY (공공데이터포털 Decoding 키), MAX_PHOTOS (기본 120), REVIEW_FILE
import fs from "node:fs";
import crypto from "node:crypto";
import { readJson, writeJson, askJson, MODEL_BULK, rebuildBlog, p } from "./lib.mjs";

const MAX = Number(process.env.MAX_PHOTOS || 120);
const RETRY_DAYS = 60;
const TOUR_KEY = (() => { const k = process.env.TOUR_API_KEY || ""; try { return k.includes("%") ? decodeURIComponent(k) : k; } catch { return k; } })();
const UA = "LetsVisitKoreaBot/1.0 (https://letsvisitkorea.com; contact@letsvisitkorea.com)";
const today = new Date().toISOString().slice(0, 10);
const store = readJson("data/auto/place-photos.json", {});

// 블로그 글에 나온 장소 (한국어 이름 기준으로 한 번만)
const places = new Map();
for (const f of fs.readdirSync(p("blog/src")).filter((f) => f.endsWith(".json"))) {
  for (const pl of readJson(`blog/src/${f}`).places || []) if (!places.has(pl.ko)) places.set(pl.ko, pl);
}

const due = (x) => !x || (!x.file && !x.blocked && ((TOUR_KEY && !x.kto) || (Date.now() - Date.parse(x.checked)) / 864e5 > RETRY_DAYS));
const strip = (h) => String(h || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// 한국관광공사 TourAPI: 제목이 장소 이름과 겹치는 결과의 대표 사진
async function tourCandidates(pl) {
  if (!TOUR_KEY) return [];
  const url = new URL("https://apis.data.go.kr/B551011/KorService2/searchKeyword2");
  url.search = new URLSearchParams({ serviceKey: TOUR_KEY, MobileOS: "ETC", MobileApp: "LetsVisitKorea", _type: "json", keyword: pl.ko.replace(/\(.*?\)/g, "").trim(), numOfRows: "8", pageNo: "1", arrange: "A" });
  let items;
  try { items = (await getJson(url)).response?.body?.items?.item || []; } catch (e) { console.log(`  TourAPI 실패: ${e.message}`); return []; }
  return (Array.isArray(items) ? items : [items])
    .filter((it) => it.firstimage && ["Type1", "Type3"].includes(it.cpyrhtDivCd))
    .slice(0, 3)
    .map((it) => ({
      source: "kto", url: it.firstimage.replace(/^http:/, "https:"),
      info: `Korea Tourism Organization listing: "${it.title}", address: ${it.addr1 || "-"}`,
      credit: "Photo: Korea Tourism Organization (KOGL Type " + (it.cpyrhtDivCd === "Type1" ? "1" : "3") + ")",
      credit_ko: "사진: 한국관광공사 (공공누리 제" + (it.cpyrhtDivCd === "Type1" ? "1" : "3") + "유형)",
      page: it.cpyrhtDivCd === "Type1" ? "https://www.kogl.or.kr/info/licenseType1.do" : "https://www.kogl.or.kr/info/licenseType3.do",
    }));
}

// 위키미디어 공용: 자유 이용 라이선스만
const FREE = /^(CC0|CC BY(-SA)? [\d.]+|Public domain|PD\b)/i;
async function commonsCandidates(query, n) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({ action: "query", format: "json", generator: "search", gsrsearch: `${query} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "8", prop: "imageinfo", iiprop: "url|mime|extmetadata", iiurlwidth: "800" });
  let pages;
  try { pages = Object.values((await getJson(url)).query?.pages || {}); } catch (e) { console.log(`  Commons 실패: ${e.message}`); return []; }
  return pages.sort((a, b) => a.index - b.index).map((pg) => ({ pg, ii: pg.imageinfo?.[0] }))
    .filter(({ ii }) => ii?.thumburl && /image\/(jpeg|png|webp)/.test(ii.mime) && FREE.test(strip(ii.extmetadata?.LicenseShortName?.value)) && !/NC|ND/.test(strip(ii.extmetadata?.LicenseShortName?.value)))
    .slice(0, n)
    .map(({ pg, ii }) => {
      const m = ii.extmetadata, lic = strip(m.LicenseShortName.value), artist = strip(m.Artist?.value).slice(0, 60);
      return {
        source: "commons", url: ii.thumburl,
        info: `Wikimedia Commons file "${pg.title}". Description: ${strip(m.ImageDescription?.value).slice(0, 200)}. Categories: ${strip(m.Categories?.value).slice(0, 200)}`,
        credit: `Photo: ${artist ? `${artist}, ` : ""}${lic}, Wikimedia Commons`,
        page: ii.descriptionurl,
      };
    });
}

async function download(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get("content-type") || "").split(";")[0];
  if (!/^image\/(jpeg|png|webp)$/.test(type)) throw new Error(`not an image (${type})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 1_500_000) throw new Error("too large");
  return { buf, type };
}

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["pick", "kind"],
  properties: { pick: { type: "integer", description: "candidate number, or 0 for none" }, kind: { type: "string", enum: ["place", "dish", "none"] } },
};
const SYSTEM = `You choose a photo for a travel blog entry about a Korean restaurant, market or sight. Look at each candidate image and its metadata.
- kind "place": the metadata clearly refers to this exact place (same name, and same area if an address is given) AND the image plausibly shows it (exterior, interior, stalls, or its food).
- kind "dish": no candidate is this place, but one image clearly shows the place's signature dish as described in the menu (a generic example photo of that dish). The image must actually show that dish.
- Otherwise kind "none" with pick 0. Never pick images of unrelated places, people posing, maps, logos, documents or low-quality/blurry photos. When unsure, choose none.`;

let done = 0, tried = 0;
const report = [];
for (const [ko, pl] of places) {
  if (tried >= MAX) break;
  if (!due(store[ko])) continue;
  tried++;
  const dish = String(pl.menu_en || "").split(/[,(;/]/)[0].trim();
  const cands = [
    ...(await tourCandidates(pl)),
    ...(await commonsCandidates(`${pl.en.replace(/\(.*?\)/g, "").trim()} Korea`, 3)),
    ...(dish ? await commonsCandidates(`${dish} Korean food`, 2) : []),
  ].filter((c, i, a) => a.findIndex((x) => x.url === c.url) === i).slice(0, 6);
  const imgs = [];
  for (const c of cands) {
    try { imgs.push({ ...c, ...(await download(c.url)) }); } catch (e) { console.log(`  - 다운로드 실패 ${c.url}: ${e.message}`); }
  }
  let out = null;
  if (imgs.length) {
    const content = [{ type: "text", text: `Place: ${pl.en} (Korean: ${ko})\nMenu / description: ${pl.menu_en || "-"}\n\nCandidates:` }];
    imgs.forEach((c, i) => {
      content.push({ type: "text", text: `Candidate ${i + 1}: ${c.info}` });
      content.push({ type: "image", source: { type: "base64", media_type: c.type, data: c.buf.toString("base64") } });
    });
    try { out = await askJson({ system: SYSTEM, prompt: content, schema: SCHEMA, model: MODEL_BULK, effort: "low", maxTokens: 300 }); }
    catch (e) { console.log(`- ${ko}: 판단 실패 (${e.message})`); continue; }
  }
  const c = out && out.kind !== "none" ? imgs[out.pick - 1] : null;
  if (!c) {
    store[ko] = { checked: today, kto: !!TOUR_KEY };
    console.log(`- ${ko}: 맞는 사진 없음 (후보 ${imgs.length}장)`);
    continue;
  }
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[c.type];
  const file = `photos/${crypto.createHash("sha1").update(ko).digest("hex").slice(0, 12)}.${ext}`;
  fs.mkdirSync(p("photos"), { recursive: true });
  fs.writeFileSync(p(file), c.buf);
  store[ko] = { file, kind: out.kind, source: c.source, credit: c.credit, ...(c.credit_ko ? { credit_ko: c.credit_ko } : {}), page: c.page, checked: today, kto: !!TOUR_KEY };
  done++;
  report.push(`- ${ko}: ${out.kind === "place" ? "가게·장소 사진" : "음식 예시 사진"} (${c.source === "kto" ? "한국관광공사" : "위키미디어"})`);
  console.log(`- ${ko}: ${out.kind} · ${c.credit}`);
}
writeJson("data/auto/place-photos.json", store);
if (done) rebuildBlog();
console.log(`사진 ${done}장 (확인한 장소 ${tried}곳, TourAPI ${TOUR_KEY ? "사용" : "키 없음"})`);
if (process.env.REVIEW_FILE && tried) {
  fs.appendFileSync(process.env.REVIEW_FILE, `\n## 📷 장소 사진: ${done}장 (확인 ${tried}곳${TOUR_KEY ? "" : ", 한국관광공사 키 없음"})\n${report.join("\n")}\n사진은 \`korea-tube/photos/\`, 출처는 \`data/auto/place-photos.json\`. 엉뚱한 사진은 그 장소 값을 { "blocked": true } 로 바꾸면 다시 안 붙어요.\n`);
}
