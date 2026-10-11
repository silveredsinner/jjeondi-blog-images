// 자동화 스크립트 공통 기능: 사이트 데이터 읽기/쓰기, Claude 호출, 블로그 HTML 렌더링.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = path.dirname(fileURLToPath(import.meta.url));
export const SITE = path.resolve(here, "..");
export const p = (...xs) => path.join(SITE, ...xs);

export const MODEL = "claude-opus-5-5";
const FAVICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23d9480f'/%3E%3Cpath d='M12 9l12 7-12 7z' fill='white'/%3E%3C/svg%3E">`;

// 브라우저용 data/*.js 파일들을 window 객체에 실행해서 그대로 읽는다.
export function loadSiteData() {
  const window = {};
  const ctx = vm.createContext({ window });
  for (const f of ["data/videos.js", "data/places.js", "data/places-auto.js", "data/i18n-content.js"]) {
    if (fs.existsSync(p(f))) vm.runInContext(fs.readFileSync(p(f), "utf8"), ctx, { filename: f });
  }
  window.PLACES_AUTO ||= [];
  return window;
}

export function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(p(file), "utf8")); } catch { return fallback; }
}
export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(p(file)), { recursive: true });
  fs.writeFileSync(p(file), JSON.stringify(data, null, 2) + "\n");
}

export const regionsOf = (v) => (Array.isArray(v.region) ? v.region : [v.region]);

// 가게 이름 비교용: 괄호 속 지역 표기·공백·기호 제거
export const normName = (s) => String(s || "").replace(/\(.*?\)/g, "").replace(/[\s·.,'"-]/g, "").toLowerCase();

let client;
function anthropic() {
  client ||= new Anthropic(); // ANTHROPIC_API_KEY 환경변수 사용
  return client;
}

// 구조화된 JSON 응답 한 번 받기. 거절(refusal)이면 null.
export async function askJson({ system, prompt, schema, effort = "medium", maxTokens = 16000 }) {
  const res = await anthropic().beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: [{ role: "user", content: prompt }],
    output_config: { effort, format: { type: "json_schema", schema } },
  });
  if (res.stop_reason === "refusal") {
    console.warn("  ! 모델이 요청을 거절했어요:", res.stop_details?.category ?? "unknown");
    return null;
  }
  if (res.stop_reason === "max_tokens") {
    console.warn("  ! 응답이 max_tokens 에서 잘렸어요");
    return null;
  }
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return JSON.parse(text);
}

// ---------- 블로그 ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// 모델이 쓴 본문 HTML 에서 허용 태그만 남긴다 (속성은 전부 제거).
const ALLOWED = new Set(["h2", "h3", "p", "ul", "ol", "li", "strong", "em", "br"]);
export function sanitize(html) {
  return String(html || "")
    .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-z0-9]+)[^>]*>/gi, (m, tag) => {
      const t = tag.toLowerCase();
      if (!ALLOWED.has(t)) return "";
      return m.startsWith("</") ? `</${t}>` : `<${t}>`;
    });
}

const mapUrl = (q) => `https://map.naver.com/p/search/${encodeURIComponent(q)}`;
const gmapUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

// post: { slug, date, region, title:{ko,en}, summary:{ko,en}, body:{ko,en}, places:[...], videos:[{id,title}] }
export function renderPost(post) {
  const placeList = (lang) => post.places.map((pl) => `
        <li class="bp-place">
          <strong>${esc(lang === "ko" ? pl.ko : `${pl.en} (${pl.ko})`)}</strong>
          <span>${esc(lang === "ko" ? pl.menu_ko : pl.menu_en)}</span>
          <a href="${mapUrl(pl.q)}" target="_blank" rel="noopener">${lang === "ko" ? "네이버 지도" : "Naver Map"}</a>
          <a href="${gmapUrl(pl.q)}" target="_blank" rel="noopener">${lang === "ko" ? "구글 지도" : "Google Maps"}</a>
        </li>`).join("");
  const videos = post.videos.map((v) => `
        <a class="bp-video" data-video="${esc(v.id)}" href="../../index.html?v=${esc(v.id)}">
          <img loading="lazy" alt="" src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg">
          <span>${esc(v.title)}</span>
        </a>`).join("");
  const section = (lang) => `
    <article class="bp-lang" lang="${lang}" data-lang="${lang}">
      <h1>${esc(post.title[lang])}</h1>
      <p class="bp-meta">${esc(post.date)}</p>
      <p class="bp-summary">${esc(post.summary[lang])}</p>
      <div class="bp-body">${sanitize(post.body[lang])}</div>
      <h2>${lang === "ko" ? "소개한 가게·장소" : "Places in this post"}</h2>
      <ul class="bp-places">${placeList(lang)}</ul>
      <p class="bp-note">${lang === "ko" ? "영업시간·위치는 바뀔 수 있으니 방문 전 지도에서 확인하세요." : "Hours and locations change — check the map before you go."}</p>
      <section class="bp-videos-wrap">
        <h2>${lang === "ko" ? "관련 영상" : "Related videos"}</h2>
        <div class="bp-videos">${videos}</div>
      </section>
    </article>`;
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(post.title.ko)} | Korea Tube</title>
  <meta name="description" content="${esc(post.summary.ko)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Korea Tube">
  <meta property="og:title" content="${esc(post.title.ko)}">
  <meta property="og:description" content="${esc(post.summary.ko)}">
  ${post.videos[0] ? `<meta property="og:image" content="https://i.ytimg.com/vi/${esc(post.videos[0].id)}/hqdefault.jpg">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  ${FAVICON}
  <link rel="stylesheet" href="../../styles.css">
  <link rel="stylesheet" href="../blog.css">
</head>
<body>
  <header class="topbar">
    <a class="brand" href="../../index.html"><span class="logo" aria-hidden="true">▶</span><h1>Korea Tube</h1></a>
    <nav class="bp-nav">
      <a href="../index.html">Blog</a>
      <button class="bp-switch" data-to="ko">한국어</button>
      <button class="bp-switch" data-to="en">English</button>
    </nav>
  </header>
  <main class="bp-main">${section("ko")}${section("en")}
  </main>
  <footer class="foot site-foot">
    <a href="../../about.html">소개 · About</a> · <a href="../../privacy.html">개인정보처리방침 · Privacy</a>
  </footer>
  <script src="../../data/hidden-videos.js"></script>
  <script>
    (function () {
      // 유튜브에서 삭제·비공개된 영상은 관련 영상에서 빼고, 하나도 안 남으면 칸째 숨김
      var hidden = window.HIDDEN_VIDEOS || [];
      document.querySelectorAll(".bp-video").forEach(function (a) {
        if (hidden.indexOf(a.dataset.video) !== -1) a.remove();
      });
      document.querySelectorAll(".bp-videos-wrap").forEach(function (w) {
        if (!w.querySelector(".bp-video")) w.remove();
      });
      var saved; try { saved = localStorage.getItem("kt.lang"); } catch (e) {}
      var q = new URLSearchParams(location.search).get("lang");
      function show(l) {
        document.querySelectorAll(".bp-lang").forEach(function (a) { a.hidden = a.dataset.lang !== l; });
        document.documentElement.lang = l;
      }
      show((q || saved) === "ko" ? "ko" : (q || saved) ? "en" : "ko");
      document.querySelectorAll(".bp-switch").forEach(function (b) { b.onclick = function () { show(b.dataset.to); }; });
    })();
  </script>
</body>
</html>
`;
}

// blog/posts.json 에 글 목록을 갱신하고 글 파일을 쓴다.
export function savePost(post) {
  fs.mkdirSync(p("blog/posts"), { recursive: true });
  fs.writeFileSync(p(`blog/posts/${post.slug}.html`), renderPost(post));
  const index = readJson("blog/posts.json", []).filter((x) => x.slug !== post.slug);
  index.unshift(indexEntry(post));
  index.sort((a, b) => (a.date < b.date ? 1 : -1));
  writeJson("blog/posts.json", index);
  writeJson(`blog/src/${post.slug}.json`, post); // 원본 데이터 (다시 렌더링할 때 사용)
}

// 목록용 요약. videos 는 블로그 목록이 숨김 영상이 아닌 표지를 고를 때 쓴다.
function indexEntry(post) {
  const videos = post.videos.map((v) => v.id);
  return { slug: post.slug, date: post.date, region: post.region, title: post.title, summary: post.summary, cover: videos[0] || null, videos };
}

// blog/src/*.json 으로 모든 글과 목록을 다시 만든다 (글 템플릿을 바꿨을 때)
export function rebuildBlog() {
  const dir = p("blog/src");
  const posts = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => readJson(`blog/src/${f}`)) : [];
  for (const post of posts) fs.writeFileSync(p(`blog/posts/${post.slug}.html`), renderPost(post));
  writeJson("blog/posts.json", posts.map(indexEntry).sort((a, b) => (a.date < b.date ? 1 : -1)));
  return posts.length;
}
