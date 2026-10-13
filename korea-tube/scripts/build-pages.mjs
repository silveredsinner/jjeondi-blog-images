// 검색엔진용 정적 페이지 생성: 지역별 페이지(r/<지역>.html), sitemap.xml, robots.txt
// 의존성 없음. 배포 워크플로가 매번 실행해서 최신 데이터·숨김 영상을 반영한다.
// 선택 환경변수: SITE_URL (도메인을 바꾸면 여기만 바꾸면 됨)
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { MORE_LANGS, T as uiText } from "./blog-i18n.mjs";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.SITE_URL || "https://letsvisitkorea.com").replace(/\/$/, "");
const p = (...xs) => path.join(SITE, ...xs);

// 사이트 데이터 읽기 (브라우저용 data/*.js 를 그대로 실행)
const window = {};
const ctx = vm.createContext({ window });
for (const f of ["data/videos.js", "data/videos-auto.js", "data/hidden-videos.js", "data/video-views.js", "data/places.js", "data/places-auto.js", "data/i18n-content.js", "data/affiliates.js", "data/kbeauty.js", "i18n.js"]) {
  if (fs.existsSync(p(f))) vm.runInContext(fs.readFileSync(p(f), "utf8"), ctx);
}
const hidden = new Set(window.HIDDEN_VIDEOS || []);
const VIEWS = window.VIDEO_VIEWS || {};
const views = (v) => (v.id in VIEWS ? VIEWS[v.id] : -1);
// 조회수 많은 순 (메인 화면과 같게)
const VIDEOS = window.VIDEOS.filter((v) => !hidden.has(v.id)).sort((a, b) => views(b) - views(a));
const PLACES = [...window.PLACES, ...(window.PLACES_AUTO || [])];
const posts = fs.existsSync(p("blog/posts.json")) ? JSON.parse(fs.readFileSync(p("blog/posts.json"), "utf8")) : [];
const regionsOf = (v) => (Array.isArray(v.region) ? v.region : [v.region]);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function readJsonSafe(f) { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } }
// 지역 페이지의 언어별 주소: 한국어·영어는 r/<key>.html, 나머지는 r/<lang>/<key>.html
const regionUrl = (key, lang) => (lang === "ko" ? `${SITE_URL}/r/${key}.html` : lang === "en" ? `${SITE_URL}/r/${key}.html?lang=en` : `${SITE_URL}/r/${lang}/${key}.html`);
function regionHreflang(key) {
  return ["ko", "en", ...MORE_LANGS].map((l) => `<link rel="alternate" hreflang="${l}" href="${esc(regionUrl(key, l))}">`).join("\n  ") +
    `\n  <link rel="alternate" hreflang="x-default" href="${esc(regionUrl(key, "ko"))}">`;
}
function regionLangSelect(key, current, rel) {
  const opts = window.LANGS.map((x) => {
    const href = x.code === "ko" || x.code === "en" ? `${rel}r/${key}.html?lang=${x.code}` : `${rel}r/${x.code}/${key}.html`;
    return `<option value="${href}"${x.code === current ? " selected" : ""}>${esc(x.label)}</option>`;
  }).join("");
  return `<select class="bp-langsel" aria-label="language" onchange="location.href=this.value">${current ? "" : '<option value="" selected>🌏</option>'}${opts}</select>`;
}
const showName = (v, lang) => (v.show ? window.SHOWS[v.show][lang] : "");
const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const FAVICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23d9480f'/%3E%3Cpath d='M12 9l12 7-12 7z' fill='white'/%3E%3C/svg%3E">`;

function page({ rel, title, desc, image, url, body, head = "", langNav = "" }) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  ${head}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Let's Visit Korea">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  ${image ? `<meta property="og:image" content="${image}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  ${FAVICON}
  <link rel="stylesheet" href="${rel}styles.css">
  <link rel="stylesheet" href="${rel}blog/blog.css">
</head>
<body>
  <header class="topbar">
    <a class="brand" href="${rel}index.html"><span class="logo" aria-hidden="true">▶</span><h1>Let's Visit Korea</h1></a>
    <nav class="bp-nav">
      <a href="${rel}blog/index.html">Blog</a>
      <button class="bp-switch" data-to="ko">한국어</button>
      <button class="bp-switch" data-to="en">English</button>
      ${langNav}
    </nav>
  </header>
  <main class="bp-main">${body}
  </main>
  <footer class="foot site-foot">
    <a href="${rel}about.html">소개 · About</a> · <a href="${rel}privacy.html">개인정보처리방침 · Privacy</a>
  </footer>
  <script>
    (function () {
      var saved; try { saved = localStorage.getItem("kt.lang"); } catch (e) {}
      var q = new URLSearchParams(location.search).get("lang");
      function show(l) {
        document.querySelectorAll(".bp-lang").forEach(function (a) { a.hidden = a.dataset.lang !== l; });
        document.documentElement.lang = l;
      }
      var l = q || saved;
      show(!l || l === "ko" ? "ko" : "en");
      document.querySelectorAll(".bp-switch").forEach(function (b) {
        b.onclick = function () { show(b.dataset.to); try { localStorage.setItem("kt.lang", b.dataset.to); } catch (e) {} };
      });
    })();
  </script>
</body>
</html>
`;
}

// ---------- 지역 페이지 ----------
fs.mkdirSync(p("r"), { recursive: true });
const urls = [`${SITE_URL}/`, `${SITE_URL}/blog/index.html`, `${SITE_URL}/about.html`, `${SITE_URL}/privacy.html`];
// KKday 상품 카드 위젯 (data/affiliates.js 의 KKDAY_WIDGETS 에 oid 가 있는 지역만). 한/영 글 아래에 하나만 둔다.
function kkWidget(r) {
  const oid = (window.KKDAY_WIDGETS || {})[r.key];
  if (!oid) return "";
  return `
    <section class="bp-kk">
      <h2><span class="bp-lang" data-lang="ko">${esc(r.ko)} 투어·체험 추천</span><span class="bp-lang" data-lang="en" hidden>Recommended tours &amp; activities in ${esc(r.en)}</span></h2>
      <ins class="kkday-product-media" data-oid="${oid}" data-amount="4" data-origin="https://kkpartners.kkday.com"></ins>
      <script src="${window.KKDAY_WIDGET_JS}" async></script>
      <p class="bp-note"><span class="bp-lang" data-lang="ko">제휴 링크예요. 예약하시면 사이트 운영에 도움이 되는 수수료가 지급될 수 있어요(가격은 같아요).</span><span class="bp-lang" data-lang="en" hidden>Affiliate links: if you book, this site may earn a commission at no extra cost to you.</span></p>
    </section>`;
}

for (const r of window.REGIONS) {
  const info = window.REGION_INFO[r.key];
  const vids = VIDEOS.filter((v) => regionsOf(v).includes(r.key));
  const places = PLACES.filter((x) => x.region === r.key);
  const rposts = posts.filter((x) => x.region === r.key);
  const name = { ko: r.ko, en: r.en };
  const section = (lang) => {
    const L = info[lang];
    const ko = lang === "ko";
    return `
    <article class="bp-lang" lang="${lang}" data-lang="${lang}">
      <h1>${esc(ko ? `${r.ko} 여행·음식 영상과 맛집` : `${r.en}: travel & food videos and places`)}</h1>
      <p class="bp-summary">${esc(L.intro)}</p>
      <p><a class="bp-cta" href="../index.html?region=${r.key}&amp;lang=${lang}">${ko ? `지도에서 ${r.ko} 영상 보기 →` : `Browse ${r.en} videos on the map →`}</a></p>
      <h2>${ko ? "대표 음식" : "Must-eat"}</h2>
      <p>${L.foods.map(esc).join(" · ")}</p>
      <h2>${ko ? "가볼 곳" : "Must-see"}</h2>
      <p>${L.spots.map(esc).join(" · ")}</p>
      ${places.length ? `<h2>${ko ? "영상에 나온 맛집·장소" : "Places from the videos"}</h2>
      <ul class="bp-places">${places.map((x) => `
        <li class="bp-place"><strong>${esc(ko ? x.ko : `${x.en} (${x.ko})`)}</strong><span>${esc(ko ? x.menu_ko : x.menu_en)}</span>
          <a href="https://map.naver.com/p/search/${encodeURIComponent(x.q)}" target="_blank" rel="noopener">${ko ? "네이버 지도" : "Naver Map"}</a>
          <a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(x.q)}" target="_blank" rel="noopener">${ko ? "구글 지도" : "Google Maps"}</a></li>`).join("")}
      </ul>` : ""}
      ${rposts.length ? `<h2>${ko ? "블로그 글" : "Blog posts"}</h2>
      <ul>${rposts.map((x) => `<li><a href="../blog/posts/${x.slug}.html?lang=${lang}">${esc(x.title[lang])}</a></li>`).join("")}</ul>` : ""}
      <h2>${ko ? `${r.ko} 영상 ${vids.length}개` : `${vids.length} videos in ${r.en}`}</h2>
      <div class="bp-videos">${vids.map((v) => `
        <a class="bp-video" href="../index.html?region=${r.key}&amp;v=${v.id}&amp;lang=${lang}">
          <img loading="lazy" alt="" src="${thumb(v.id)}">
          <span>${esc(v.title)}${v.show ? `<em>${esc(showName(v, lang))}</em>` : ""}</span>
        </a>`).join("")}
      </div>
    </article>`;
  };
  const url = `${SITE_URL}/r/${r.key}.html`;
  fs.writeFileSync(p(`r/${r.key}.html`), page({
    rel: "../",
    title: `${r.ko} 여행·맛집 영상 모음 – ${r.en} travel & food videos | Let's Visit Korea`,
    desc: `${info.ko.intro} ${r.ko} 영상 ${vids.length}개와 영상에 나온 맛집 ${places.length}곳. ${info.en.intro}`,
    image: vids[0] ? thumb(vids[0].id) : null,
    url,
    body: section("ko") + section("en") + kkWidget(r),
    head: regionHreflang(r.key),
    langNav: regionLangSelect(r.key, null, "../"),
  }));
  urls.push(url);
}

// ---------- 지역 페이지: 다른 10개 언어 (r/<lang>/<key>.html) ----------
// 지역 이름·소개: data/i18n-content.js, 음식·명소·장소 번역: data/auto/region-i18n.json (scripts/translate-regions.mjs)
// 번역이 없으면 일본어·중국어는 i18n-content 의 값, 나머지는 영어로 대신한다.
const REGION_TR = fs.existsSync(p("data/auto/region-i18n.json")) ? JSON.parse(fs.readFileSync(p("data/auto/region-i18n.json"), "utf8")) : {};
const blogI18n = (slug, lang) => fs.existsSync(p("blog", lang, `${slug}.html`));
for (const lang of MORE_LANGS) {
  fs.rmSync(p("r", lang), { recursive: true, force: true });
  fs.mkdirSync(p("r", lang), { recursive: true });
  const T = (k, vars = {}) => Object.entries(vars).reduce((s, [a, b]) => s.replace(`{${a}}`, b), window.I18N[lang]?.[k] ?? window.I18N.en[k] ?? k);
  for (const r of window.REGIONS) {
    const info = window.REGION_INFO[r.key];
    const extra = window.REGION_INFO_I18N?.[r.key]?.[lang] || {};
    const tr = REGION_TR[lang]?.[r.key] || {};
    const rname = window.REGION_NAMES?.[r.key]?.[lang] || r.en;
    const intro = extra.intro || info.en.intro;
    const foods = tr.foods?.length ? tr.foods : extra.foods || info.en.foods;
    const spots = tr.spots?.length ? tr.spots : extra.spots || info.en.spots;
    const vids = VIDEOS.filter((v) => regionsOf(v).includes(r.key));
    const places = PLACES.filter((x) => x.region === r.key);
    const placeName = (x) => tr.places?.[x.ko]?.[0] || window.PLACE_I18N?.[x.ko]?.[lang]?.[0] || x.en;
    const placeMenu = (x) => tr.places?.[x.ko]?.[1] || window.PLACE_I18N?.[x.ko]?.[lang]?.[1] || x.menu_en;
    const rposts = posts.filter((x) => x.region === r.key && blogI18n(x.slug, lang));
    const postTitle = (x) => readJsonSafe(p("blog", "src", `${x.slug}.json`))?.title?.[lang] || x.title.en;
    const oid = (window.KKDAY_WIDGETS || {})[r.key];
    const body = `
    <article lang="${lang}">
      <h1>${esc(T("travelInfo", { r: rname }))}</h1>
      <p class="bp-summary">${esc(intro)}</p>
      <p><a class="bp-cta" href="../../index.html?region=${r.key}&amp;lang=${lang}">${esc(uiText(lang, "mapCta"))}</a></p>
      <h2>${esc(T("foods"))}</h2>
      <p>${foods.map(esc).join(" · ")}</p>
      <h2>${esc(T("spots"))}</h2>
      <p>${spots.map(esc).join(" · ")}</p>
      ${places.length ? `<h2>${esc(T("places"))}</h2>
      <ul class="bp-places">${places.map((x) => `
        <li class="bp-place"><strong>${esc(placeName(x))} (${esc(x.ko)})</strong><span>${esc(placeMenu(x))}</span>
          <a href="https://map.naver.com/p/search/${encodeURIComponent(x.q)}" target="_blank" rel="noopener">${esc(T("naverMap"))}</a>
          <a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(x.q)}" target="_blank" rel="noopener">${esc(T("googleMap"))}</a></li>`).join("")}
      </ul>
      <p class="bp-note">${esc(T("placeNote"))}</p>` : ""}
      ${rposts.length ? `<h2>${esc(T("blog"))}</h2>
      <ul>${rposts.map((x) => `<li><a href="../../blog/${lang}/${x.slug}.html">${esc(postTitle(x))}</a></li>`).join("")}</ul>` : ""}
      <h2>${esc(T("results", { n: vids.length }))}</h2>
      <div class="bp-videos">${vids.map((v) => `
        <a class="bp-video" href="../../index.html?region=${r.key}&amp;v=${v.id}&amp;lang=${lang}">
          <img loading="lazy" alt="" src="${thumb(v.id)}">
          <span>${esc(v.title)}${v.show ? `<em>${esc(window.SHOW_NAMES?.[v.show]?.[lang] || showName(v, "en"))}</em>` : ""}</span>
        </a>`).join("")}
      </div>
    </article>${oid ? `
    <section class="bp-kk">
      <h2>${esc(T("kkTours", { r: rname }))}</h2>
      <ins class="kkday-product-media" data-oid="${oid}" data-amount="4" data-origin="https://kkpartners.kkday.com"></ins>
      <script src="${window.KKDAY_WIDGET_JS}" async></script>
      <p class="bp-note">${esc(T("affNote"))}</p>
    </section>` : ""}`;
    const url = `${SITE_URL}/r/${lang}/${r.key}.html`;
    const html = page({
      rel: "../../",
      title: `${T("travelInfo", { r: rname })} – ${T("results", { n: vids.length })} | Let's Visit Korea`,
      desc: `${intro} ${foods.slice(0, 4).join(", ")}.`,
      image: vids[0] ? thumb(vids[0].id) : null,
      url,
      body,
      head: regionHreflang(r.key),
      langNav: regionLangSelect(r.key, lang, "../../"),
    })
      // 이 언어 페이지는 한 언어뿐: html lang, 블로그 링크, 한/영 전환 버튼 정리
      .replace('<html lang="ko">', `<html lang="${lang}">`)
      .replace(`<a href="../../blog/index.html">Blog</a>`, `<a href="../../blog/${lang}/index.html">${esc(T("blog"))}</a>`)
      .replace(/\s*<button class="bp-switch"[^>]*>[^<]*<\/button>/g, "")
      .replace(/<script>\s*\(function \(\) \{\s*var saved;[\s\S]*?<\/script>/, "")
      .replace("소개 · About", "About").replace("개인정보처리방침 · Privacy", "Privacy");
    fs.writeFileSync(p("r", lang, `${r.key}.html`), html);
    urls.push(url);
  }
}
for (const x of posts) urls.push(`${SITE_URL}/blog/posts/${x.slug}.html`);
// 다른 언어 블로그 (blog/<lang>/*.html)
for (const l of ["ja", "zh-Hans", "zh-Hant", "es", "fr", "de", "vi", "th", "id", "ru"]) {
  const d = p("blog", l);
  if (fs.existsSync(d)) for (const f of fs.readdirSync(d).filter((f) => f.endsWith(".html")).sort()) urls.push(`${SITE_URL}/blog/${l}/${f}`);
}

// ---------- K-뷰티 쇼핑 가이드 (kbeauty/<lang>.html, 12개 언어) ----------
{
  const TR = readJsonSafe(p("data/auto/kbeauty-i18n.json")) || {};
  const ALL = ["ko", "en", ...MORE_LANGS];
  const kbUrl = (lang) => `${SITE_URL}/kbeauty/${lang}.html`;
  const hreflang = ALL.map((l) => `<link rel="alternate" hreflang="${l}" href="${kbUrl(l)}">`).join("\n  ") + `\n  <link rel="alternate" hreflang="x-default" href="${kbUrl("en")}">`;
  fs.rmSync(p("kbeauty"), { recursive: true, force: true });
  fs.mkdirSync(p("kbeauty"), { recursive: true });
  // 올리브영 글로벌 코드: 링크로 넣은 코드는 로그인하면 지워져서, 복사 버튼과 "로그인 후 결제할 때 붙여넣기" 안내를 단다.
  // 올리브영 버튼을 누를 때도 코드를 클립보드에 복사한다.
  const OY_HELP = {
    ko: ["복사", "복사됨", "올리브영 글로벌 버튼을 누르면 코드가 복사돼요. 로그인한 뒤 결제 화면의 프로모션 코드 칸에 붙여 넣으세요."],
    en: ["Copy", "Copied", "Tapping an Olive Young Global button copies the code. Log in first, then paste it in the promo code box at checkout."],
    ja: ["コピー", "コピーしました", "オリーブヤング・グローバルのボタンを押すとコードがコピーされます。ログインしてから、決済画面のプロモーションコード欄に貼り付けてください。"],
    "zh-Hans": ["复制", "已复制", "点击 Olive Young Global 按钮会自动复制代码。请先登录，再在结账页面的优惠码栏粘贴。"],
    "zh-Hant": ["複製", "已複製", "點選 Olive Young Global 按鈕會自動複製代碼。請先登入，再於結帳頁面的優惠碼欄位貼上。"],
    es: ["Copiar", "Copiado", "Al tocar un botón de Olive Young Global se copia el código. Inicia sesión primero y pégalo en la casilla de código promocional al pagar."],
    fr: ["Copier", "Copié", "Un appui sur un bouton Olive Young Global copie le code. Connectez-vous d'abord, puis collez-le dans le champ code promo au paiement."],
    de: ["Kopieren", "Kopiert", "Beim Tippen auf einen Olive-Young-Global-Button wird der Code kopiert. Erst einloggen, dann an der Kasse ins Gutscheincode-Feld einfügen."],
    vi: ["Sao chép", "Đã sao chép", "Bấm nút Olive Young Global sẽ sao chép mã. Hãy đăng nhập trước, rồi dán mã vào ô mã khuyến mãi khi thanh toán."],
    th: ["คัดลอก", "คัดลอกแล้ว", "กดปุ่ม Olive Young Global แล้วโค้ดจะถูกคัดลอก เข้าสู่ระบบก่อน แล้ววางโค้ดในช่องโค้ดโปรโมชันตอนชำระเงิน"],
    id: ["Salin", "Tersalin", "Menekan tombol Olive Young Global akan menyalin kodenya. Masuk dulu, lalu tempel di kolom kode promo saat checkout."],
    ru: ["Копировать", "Скопировано", "При нажатии кнопки Olive Young Global код копируется. Сначала войдите в аккаунт, затем вставьте его в поле промокода при оформлении заказа."],
  };
  for (const lang of ALL) {
    const base = window.KBEAUTY_TEXT[lang] || { ...window.KBEAUTY_TEXT.en, ...(TR[lang] || {}) };
    const tr = TR[lang] || {};
    const why = (x) => (lang === "ko" ? x.ko : lang === "en" ? x.en : tr.products?.[x.id] || x.en);
    const secTitle = (s) => (lang === "ko" ? s.ko : lang === "en" ? s.en : tr.sections?.[s.key] || s.en);
    const oyCode = window.KBEAUTY_STORES.oyGlobal.code, help = OY_HELP[lang] || OY_HELP.en;
    const anyTracked = Object.values(window.KBEAUTY_STORES).some((s) => s.tracked);
    const btn = (key, x) => {
      const s = window.KBEAUTY_STORES[key];
      if (!s.url) return "";
      const href = key === "oyGlobal" && x.oy ? s.productUrl.replace("{id}", encodeURIComponent(x.oy)) : s.url.replace("{q}", encodeURIComponent(x.q));
      const label = s.kind === "compare" ? base.compare : s.name;
      return `<a class="kb-btn${s.kind === "compare" ? " kb-compare" : ""}${s.code ? " kb-oy" : ""}" href="${esc(href)}" target="_blank" rel="noopener${s.tracked ? " sponsored" : ""}">${esc(label)}</a>`;
    };
    const src = (x) => !x.source ? "" : x.source.video
      ? `<a href="../index.html?v=${esc(x.source.video)}&amp;lang=${lang}">${esc(base.watch)}</a>`
      : `<a href="${esc(x.source.url)}" target="_blank" rel="noopener">${esc(base.source)}: ${esc(x.source.label)}</a>`;
    const sections = window.KBEAUTY_SECTIONS.map((s) => {
      const items = window.KBEAUTY.filter((x) => x.sec === s.key);
      if (!items.length) return "";
      return `
      <h2>${esc(secTitle(s))}</h2>
      <div class="kb-list">${items.map((x) => `
        <div class="kb-item">
          <div class="kb-head"><span class="kb-brand">${esc(x.brand)}</span><strong>${esc(x.name)}</strong></div>
          <p>${esc(why(x))}</p>
          <div class="kb-btns">${s.key !== "luxury" && s.key !== "devices" ? `<span class="kb-store">${esc(base.inKorea)}: Olive Young</span>` : ""}${s.stores.map((k) => btn(k, x)).join("")}</div>
          <p class="kb-src">${src(x)}</p>
        </div>`).join("")}
      </div>`;
    }).join("");
    const opts = window.LANGS.map((x) => `<option value="${x.code}.html"${x.code === lang ? " selected" : ""}>${esc(x.label)}</option>`).join("");
    const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(base.title)} | Let's Visit Korea</title>
  <meta name="description" content="${esc(base.intro)}">
  <link rel="canonical" href="${kbUrl(lang)}">
  ${hreflang}
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Let's Visit Korea">
  <meta property="og:title" content="${esc(base.title)}">
  <meta property="og:description" content="${esc(base.intro)}">
  <meta property="og:url" content="${kbUrl(lang)}">
  ${FAVICON}
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../blog/blog.css">
</head>
<body>
  <header class="topbar">
    <a class="brand" href="../index.html?lang=${lang}"><span class="logo" aria-hidden="true">▶</span><h1>Let's Visit Korea</h1></a>
    <nav class="bp-nav">
      <select class="bp-langsel" aria-label="language" onchange="location.href=this.value">${opts}</select>
    </nav>
  </header>
  <main class="bp-main">
    <article lang="${lang}">
      <h1>${esc(base.title)}</h1>
      <p class="bp-summary">${esc(base.intro)}</p>
      <h2>${esc(base.tipsTitle)}</h2>
      <ul>${(base.tips || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      ${oyCode ? `<div class="kb-codebox"><p class="kb-code">${esc(base.code || window.KBEAUTY_TEXT.en.code)}: <strong>${esc(oyCode)}</strong> <button type="button" class="kb-copy" id="kbCopy">${esc(help[0])}</button></p>
      <p class="kb-code-hint">${esc(help[2])}</p></div>
      <script>
      (function () {
        var code = ${JSON.stringify(oyCode)}, btn = document.getElementById("kbCopy");
        function copy() { try { navigator.clipboard.writeText(code); } catch (e) {} }
        btn.addEventListener("click", function () { copy(); btn.textContent = ${JSON.stringify(help[1])}; });
        document.querySelectorAll(".kb-oy").forEach(function (a) { a.addEventListener("click", copy); });
      })();
      </script>` : ""}${sections}
      <p class="bp-note">${esc(base.note)}</p>
      <p><a class="bp-cta" href="../index.html?cat=beauty&amp;lang=${lang}">${esc(uiText(lang, "mapCta"))}</a></p>
    </article>
  </main>
  <footer class="foot site-foot">
    <a href="../about.html">About</a> · <a href="../privacy.html">Privacy</a> · <a href="mailto:contact@letsvisitkorea.com">contact@letsvisitkorea.com</a>
  </footer>
</body>
</html>
`;
    fs.writeFileSync(p("kbeauty", `${lang}.html`), html);
    urls.push(kbUrl(lang));
  }
}

// ---------- index.html: 공유 미리보기 태그, 지역 페이지 링크 ----------
{
  let html = fs.readFileSync(p("index.html"), "utf8");
  const firstVideo = VIDEOS[0];
  const seo = `<!--seo:start-->
  <link rel="canonical" href="${SITE_URL}/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Let's Visit Korea">
  <meta property="og:title" content="Let's Visit Korea – 한국 여행·음식 유튜브 지도 / Korea travel & food videos by region">
  <meta property="og:description" content="지역별 한국 여행·음식·문화 유튜브와 영상 속 맛집. Korean travel & food videos by region, with subtitles in 12 languages.">
  <meta property="og:url" content="${SITE_URL}/">
  ${firstVideo ? `<meta property="og:image" content="${thumb(firstVideo.id)}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  ${FAVICON}
  <!--seo:end-->`;
  const links = `<!--regions:start-->
    <nav class="region-links">${window.REGIONS.map((r) => `<a href="r/${r.key}.html">${esc(r.ko)} · ${esc(r.en)}</a>`).join(" · ")}</nav>
    <!--regions:end-->`;
  html = html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, seo).replace(/<!--regions:start-->[\s\S]*?<!--regions:end-->/, links);
  // 캐시 무효화: 사이트 파일(app.js, styles.css, data/*.js …) 주소에 내용 해시(?v=)를 붙여서
  // 배포 후 브라우저가 옛 파일과 새 파일을 섞어 쓰지 않게 한다.
  html = html.replace(/(src|href)="((?:data\/)?[\w.-]+\.(?:js|css))(?:\?v=\w+)?"/g, (m, attr, f) => {
    if (!fs.existsSync(p(f))) return m;
    const v = crypto.createHash("sha1").update(fs.readFileSync(p(f))).digest("hex").slice(0, 8);
    return `${attr}="${f}?v=${v}"`;
  });
  fs.writeFileSync(p("index.html"), html);
}

// ---------- sitemap / robots ----------
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(p("sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(p("robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`지역 페이지 ${window.REGIONS.length}개, sitemap URL ${urls.length}개 (${SITE_URL})`);

// ---------- 방문자 통계 (Cloudflare Web Analytics, 쿠키 없음) ----------
// 사이트의 모든 HTML 페이지(메인·지역·블로그 12개 언어·소개 등)의 </body> 앞에 한 번만 넣는다.
const ANALYTICS = `<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "f1ff71bafbf847e3889b206b4c4268f1"}'></script><!-- End Cloudflare Web Analytics -->`;
let tagged = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { if (!["scripts", "node_modules", "data", ".git"].includes(e.name)) walk(f); continue; }
    if (!e.name.endsWith(".html")) continue;
    const html = fs.readFileSync(f, "utf8");
    if (html.includes("cloudflareinsights.com/beacon") || !html.includes("</body>")) continue;
    fs.writeFileSync(f, html.replace("</body>", `  ${ANALYTICS}\n</body>`));
    tagged++;
  }
})(SITE);
console.log(`방문자 통계 코드 추가: ${tagged}개 페이지`);
