// 검색엔진용 정적 페이지 생성: 지역별 페이지(r/<지역>.html), sitemap.xml, robots.txt
// 의존성 없음. 배포 워크플로가 매번 실행해서 최신 데이터·숨김 영상을 반영한다.
// 선택 환경변수: SITE_URL (도메인을 바꾸면 여기만 바꾸면 됨)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.SITE_URL || "https://letsvisitkorea.com").replace(/\/$/, "");
const p = (...xs) => path.join(SITE, ...xs);

// 사이트 데이터 읽기 (브라우저용 data/*.js 를 그대로 실행)
const window = {};
const ctx = vm.createContext({ window });
for (const f of ["data/videos.js", "data/hidden-videos.js", "data/places.js", "data/places-auto.js", "data/i18n-content.js", "data/affiliates.js"]) {
  if (fs.existsSync(p(f))) vm.runInContext(fs.readFileSync(p(f), "utf8"), ctx);
}
const hidden = new Set(window.HIDDEN_VIDEOS || []);
const VIDEOS = window.VIDEOS.filter((v) => !hidden.has(v.id));
const PLACES = [...window.PLACES, ...(window.PLACES_AUTO || [])];
const posts = fs.existsSync(p("blog/posts.json")) ? JSON.parse(fs.readFileSync(p("blog/posts.json"), "utf8")) : [];
const regionsOf = (v) => (Array.isArray(v.region) ? v.region : [v.region]);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const showName = (v, lang) => (v.show ? window.SHOWS[v.show][lang] : "");
const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const FAVICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23d9480f'/%3E%3Cpath d='M12 9l12 7-12 7z' fill='white'/%3E%3C/svg%3E">`;

function page({ rel, title, desc, image, url, body }) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
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
  }));
  urls.push(url);
}
for (const x of posts) urls.push(`${SITE_URL}/blog/posts/${x.slug}.html`);

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
