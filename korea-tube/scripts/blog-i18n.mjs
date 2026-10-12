// 블로그 글의 다른 언어판 (일본어·중국어·스페인어 …) 페이지.
// 한국어·영어는 기존 blog/posts/<slug>.html 한 페이지에 같이 있고,
// 나머지 언어는 검색엔진이 언어별로 따로 색인하도록 blog/<lang>/<slug>.html 로 따로 만든다.
// 번역 데이터: blog/src/<slug>.json 의 title/summary/body[lang], placesI18n[lang] = [{ name, menu }]
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const p = (...xs) => path.join(SITE, ...xs);
export const SITE_URL = (process.env.SITE_URL || "https://letsvisitkorea.com").replace(/\/$/, "");
export const MORE_LANGS = ["ja", "zh-Hans", "zh-Hant", "es", "fr", "de", "vi", "th", "id", "ru"];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ALLOWED = new Set(["h2", "h3", "p", "ul", "ol", "li", "strong", "em", "br"]);
const sanitize = (html) => String(html || "")
  .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, "")
  .replace(/<\/?([a-z0-9]+)[^>]*>/gi, (m, tag) => (ALLOWED.has(tag.toLowerCase()) ? (m.startsWith("</") ? `</${tag.toLowerCase()}>` : `<${tag.toLowerCase()}>`) : ""));
const mapUrl = (q) => `https://map.naver.com/p/search/${encodeURIComponent(q)}`;
const gmapUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const FAVICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23d9480f'/%3E%3Cpath d='M12 9l12 7-12 7z' fill='white'/%3E%3C/svg%3E">`;

// 사이트 UI 문구 (i18n.js) + 블로그에만 쓰는 문구
let UI;
function ui() {
  if (UI) return UI;
  const window = {};
  vm.runInContext(fs.readFileSync(p("i18n.js"), "utf8"), vm.createContext({ window }));
  UI = { LANGS: window.LANGS, I18N: window.I18N };
  return UI;
}
const EXTRA = {
  ko: { related: "관련 영상", more: "다른 글", mapCta: "지도에서 영상 보기 →", langs: "다른 언어" },
  en: { related: "Related videos", more: "More posts", mapCta: "Browse the videos on the map →", langs: "Other languages" },
  ja: { related: "関連動画", more: "ほかの記事", mapCta: "地図で動画を見る →", langs: "他の言語" },
  "zh-Hans": { related: "相关视频", more: "更多文章", mapCta: "在地图上看视频 →", langs: "其他语言" },
  "zh-Hant": { related: "相關影片", more: "更多文章", mapCta: "在地圖上看影片 →", langs: "其他語言" },
  es: { related: "Vídeos relacionados", more: "Más artículos", mapCta: "Ver los vídeos en el mapa →", langs: "Otros idiomas" },
  fr: { related: "Vidéos associées", more: "Autres articles", mapCta: "Voir les vidéos sur la carte →", langs: "Autres langues" },
  de: { related: "Passende Videos", more: "Weitere Artikel", mapCta: "Videos auf der Karte ansehen →", langs: "Andere Sprachen" },
  vi: { related: "Video liên quan", more: "Bài viết khác", mapCta: "Xem video trên bản đồ →", langs: "Ngôn ngữ khác" },
  th: { related: "วิดีโอที่เกี่ยวข้อง", more: "บทความอื่น", mapCta: "ดูวิดีโอบนแผนที่ →", langs: "ภาษาอื่น" },
  id: { related: "Video terkait", more: "Artikel lainnya", mapCta: "Lihat video di peta →", langs: "Bahasa lain" },
  ru: { related: "Похожие видео", more: "Другие статьи", mapCta: "Смотреть видео на карте →", langs: "Другие языки" },
};
export const T = (lang, key) => EXTRA[lang]?.[key] ?? ui().I18N[lang]?.[key] ?? ui().I18N.en[key] ?? EXTRA.en[key];

export const hasLang = (post, lang) => Boolean(post.title?.[lang] && post.summary?.[lang] && post.body?.[lang]);

// 이 글의 언어별 주소 (hreflang, 언어 선택용)
export function postUrls(post, abs = true) {
  const base = abs ? `${SITE_URL}/blog` : null;
  const out = { ko: `${base}/posts/${post.slug}.html`, en: `${base}/posts/${post.slug}.html?lang=en` };
  for (const l of MORE_LANGS) if (hasLang(post, l)) out[l] = `${base}/${l}/${post.slug}.html`;
  return out;
}
export function hreflangTags(post) {
  const urls = postUrls(post);
  return Object.entries(urls).map(([l, u]) => `<link rel="alternate" hreflang="${l}" href="${esc(u)}">`).join("\n  ") +
    `\n  <link rel="alternate" hreflang="x-default" href="${esc(urls.ko)}">`;
}

// 언어 선택: 한국어·영어는 글 페이지 안에서 바꾸고, 나머지는 언어별 페이지로 이동
export function langSelect(post, current, rel) {
  const opts = ui().LANGS.filter((x) => x.code === "ko" || x.code === "en" || hasLang(post, x.code)).map((x) => {
    const href = x.code === "ko" || x.code === "en" ? `${rel}posts/${post.slug}.html?lang=${x.code}` : `${rel}${x.code}/${post.slug}.html`;
    return `<option value="${esc(href)}"${x.code === current ? " selected" : ""}>${esc(x.label)}</option>`;
  }).join("");
  return `<select class="bp-langsel" aria-label="language" onchange="location.href=this.value">${opts}</select>`;
}

export function renderPostLang(post, lang, others = []) {
  const names = post.placesI18n?.[lang] || [];
  const places = post.places.map((pl, i) => `
        <li class="bp-place">
          <strong>${esc(names[i]?.name || pl.en)} (${esc(pl.ko)})</strong>
          <span>${esc(names[i]?.menu || pl.menu_en)}</span>
          <a href="${mapUrl(pl.q)}" target="_blank" rel="noopener">${esc(T(lang, "naverMap"))}</a>
          <a href="${gmapUrl(pl.q)}" target="_blank" rel="noopener">${esc(T(lang, "googleMap"))}</a>
        </li>`).join("");
  const videos = post.videos.map((v) => `
        <a class="bp-video" data-video="${esc(v.id)}" href="../../index.html?v=${esc(v.id)}&amp;lang=${lang}">
          <img loading="lazy" alt="" src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg">
          <span>${esc(v.title)}</span>
        </a>`).join("");
  const more = others.filter((x) => x.slug !== post.slug && hasLang(x, lang)).slice(0, 6)
    .map((x) => `<li><a href="${esc(x.slug)}.html">${esc(x.title[lang])}</a></li>`).join("");
  const url = `${SITE_URL}/blog/${lang}/${post.slug}.html`;
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(post.title[lang])} | Let's Visit Korea</title>
  <meta name="description" content="${esc(post.summary[lang])}">
  <link rel="canonical" href="${esc(url)}">
  ${hreflangTags(post)}
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Let's Visit Korea">
  <meta property="og:title" content="${esc(post.title[lang])}">
  <meta property="og:description" content="${esc(post.summary[lang])}">
  <meta property="og:url" content="${esc(url)}">
  ${post.videos[0] ? `<meta property="og:image" content="https://i.ytimg.com/vi/${esc(post.videos[0].id)}/hqdefault.jpg">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  ${FAVICON}
  <link rel="stylesheet" href="../../styles.css">
  <link rel="stylesheet" href="../blog.css">
</head>
<body>
  <header class="topbar">
    <a class="brand" href="../../index.html?lang=${lang}"><span class="logo" aria-hidden="true">▶</span><h1>Let's Visit Korea</h1></a>
    <nav class="bp-nav">
      <a href="index.html">${esc(T(lang, "blog"))}</a>
      ${langSelect(post, lang, "../")}
    </nav>
  </header>
  <main class="bp-main">
    <article lang="${lang}">
      <h1>${esc(post.title[lang])}</h1>
      <p class="bp-meta">${esc(post.date)}</p>
      <p class="bp-summary">${esc(post.summary[lang])}</p>
      <p><a class="bp-cta" href="../../index.html?region=${esc(post.region)}&amp;lang=${lang}">${esc(T(lang, "mapCta"))}</a></p>
      <div class="bp-body">${sanitize(post.body[lang])}</div>
      <h2>${esc(T(lang, "places"))}</h2>
      <ul class="bp-places">${places}</ul>
      <p class="bp-note">${esc(T(lang, "placeNote"))}</p>
      <section class="bp-videos-wrap">
        <h2>${esc(T(lang, "related"))}</h2>
        <div class="bp-videos">${videos}</div>
      </section>
      ${more ? `<h2>${esc(T(lang, "more"))}</h2><ul>${more}</ul>` : ""}
    </article>
  </main>
  <footer class="foot site-foot">
    <a href="../../about.html">About</a> · <a href="../../privacy.html">Privacy</a>
  </footer>
  <script src="../../data/hidden-videos.js"></script>
  <script>
    (function () {
      var hidden = window.HIDDEN_VIDEOS || [];
      document.querySelectorAll(".bp-video").forEach(function (a) { if (hidden.indexOf(a.dataset.video) !== -1) a.remove(); });
      document.querySelectorAll(".bp-videos-wrap").forEach(function (w) { if (!w.querySelector(".bp-video")) w.remove(); });
    })();
  </script>
</body>
</html>
`;
}

// 언어별 블로그 목록 (blog/<lang>/index.html) — 검색엔진이 읽을 수 있게 정적 HTML
export function renderLangIndex(posts, lang) {
  const list = posts.filter((x) => hasLang(x, lang)).map((x) => `
      <li class="bp-item"><a href="${esc(x.slug)}.html" data-videos="${esc(x.videos.map((v) => v.id).join(","))}">
        <img loading="lazy" alt="" src="${x.videos[0] ? `https://i.ytimg.com/vi/${esc(x.videos[0].id)}/hqdefault.jpg` : ""}">
        <div><h2>${esc(x.title[lang])}</h2><p>${esc(x.date)} · ${esc(x.summary[lang])}</p></div>
      </a></li>`).join("");
  const langLinks = ui().LANGS.map((x) => {
    const href = x.code === "ko" || x.code === "en" ? `../index.html?lang=${x.code}` : `../${x.code}/index.html`;
    return `<option value="${href}"${x.code === lang ? " selected" : ""}>${esc(x.label)}</option>`;
  }).join("");
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(T(lang, "blog"))} – Let's Visit Korea</title>
  <meta name="description" content="${esc(T(lang, "tagline"))}">
  <link rel="canonical" href="${SITE_URL}/blog/${lang}/index.html">
  ${FAVICON}
  <link rel="stylesheet" href="../../styles.css">
  <link rel="stylesheet" href="../blog.css">
</head>
<body>
  <header class="topbar">
    <a class="brand" href="../../index.html?lang=${lang}"><span class="logo" aria-hidden="true">▶</span><h1>Let's Visit Korea</h1></a>
    <nav class="bp-nav"><select class="bp-langsel" aria-label="language" onchange="location.href=this.value">${langLinks}</select></nav>
  </header>
  <main class="bp-main">
    <h1>${esc(T(lang, "blog"))}</h1>
    <ul class="bp-list">${list}
    </ul>
  </main>
  <footer class="foot site-foot">
    <a href="../../about.html">About</a> · <a href="../../privacy.html">Privacy</a>
  </footer>
  <script src="../../data/hidden-videos.js"></script>
  <script>
    (function () {
      // 표지: 삭제·비공개되지 않은 첫 영상
      var hidden = window.HIDDEN_VIDEOS || [];
      document.querySelectorAll(".bp-item a").forEach(function (a) {
        var ids = (a.dataset.videos || "").split(",").filter(function (id) { return id && hidden.indexOf(id) === -1; });
        var img = a.querySelector("img");
        if (ids[0]) img.src = "https://i.ytimg.com/vi/" + ids[0] + "/hqdefault.jpg"; else img.removeAttribute("src");
      });
    })();
  </script>
</body>
</html>
`;
}

// 모든 언어별 페이지·목록을 다시 만들고, 사이트가 읽는 data/blog-langs.js (번역 글이 있는 언어) 를 쓴다.
export function buildBlogLangs(posts) {
  const langs = [];
  for (const lang of MORE_LANGS) {
    const dir = p("blog", lang);
    fs.rmSync(dir, { recursive: true, force: true });
    const mine = posts.filter((x) => hasLang(x, lang));
    if (!mine.length) continue;
    fs.mkdirSync(dir, { recursive: true });
    for (const post of mine) fs.writeFileSync(path.join(dir, `${post.slug}.html`), renderPostLang(post, lang, mine));
    fs.writeFileSync(path.join(dir, "index.html"), renderLangIndex(mine, lang));
    langs.push(lang);
  }
  fs.writeFileSync(p("data/blog-langs.js"),
    `// 자동 생성 파일: scripts/build-blog.mjs 가 만듦. 번역된 블로그 글이 있는 언어 (blog/<lang>/index.html)\n` +
    `window.BLOG_LANGS = ${JSON.stringify(langs)};\n`);
  return langs;
}
