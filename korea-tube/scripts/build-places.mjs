// data/auto/places-auto.json → data/places-auto.js (사이트가 읽는 파일)
// "needs_check": true 인 장소(시청자 댓글만 근거)는 사이트에 내보내지 않는다.
// 의존성 없이 실행 가능: 배포 워크플로가 매번 실행해서, json 만 고쳐도 사이트에 반영되게 한다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function buildPlacesJs() {
  const file = path.join(SITE, "data/auto/places-auto.json");
  let store;
  try {
    store = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`data/auto/places-auto.json 형식이 깨졌어요 (쉼표·따옴표를 확인하세요): ${e.message}`);
  }
  const pub = store.filter((x) => !x.needs_check).map(({ evidence, added, source, needs_check, ...rest }) => rest);
  fs.writeFileSync(
    path.join(SITE, "data/places-auto.js"),
    `// 자동 생성 파일: data/auto/places-auto.json 에서 scripts/build-places.mjs 가 만듦. 직접 고치지 마세요.\n` +
    `// 장소를 고치거나 지우려면 data/auto/places-auto.json 을 고치세요. "needs_check": true 인 항목은 공개되지 않습니다.\n` +
    `window.PLACES_AUTO = ${JSON.stringify(pub, null, 2)};\n`,
  );
  return { total: store.length, published: pub.length };
}

// data/auto/availability.json → data/hidden-videos.js (삭제·비공개·퍼가기 금지 영상 목록)
export function buildHiddenJs() {
  let avail = {};
  try { avail = JSON.parse(fs.readFileSync(path.join(SITE, "data/auto/availability.json"), "utf8")); } catch {}
  const hidden = Object.entries(avail).filter(([, v]) => v.status !== "ok").map(([id]) => id).sort();
  fs.writeFileSync(
    path.join(SITE, "data/hidden-videos.js"),
    `// 자동 생성 파일: data/auto/availability.json 에서 scripts/build-places.mjs 가 만듦. 직접 고치지 마세요.\n` +
    `// 유튜브에서 삭제·비공개되었거나 퍼가기가 막힌 영상. 사이트에서 숨긴다.\n` +
    `window.HIDDEN_VIDEOS = ${JSON.stringify(hidden)};\n`,
  );
  return { hidden: hidden.length };
}

// data/auto/videos-auto.json → data/videos-auto.js (discover.mjs 가 찾은 영상을 사이트 영상 목록에 더함)
export function buildVideosJs() {
  let store = [];
  try { store = JSON.parse(fs.readFileSync(path.join(SITE, "data/auto/videos-auto.json"), "utf8")); } catch (e) {
    if (fs.existsSync(path.join(SITE, "data/auto/videos-auto.json"))) throw new Error(`data/auto/videos-auto.json 형식이 깨졌어요 (쉼표·따옴표를 확인하세요): ${e.message}`);
  }
  const pub = store.map(({ id, region, cats, title }) => ({ id, region, cats, title }));
  fs.writeFileSync(
    path.join(SITE, "data/videos-auto.js"),
    `// 자동 생성 파일: data/auto/videos-auto.json 에서 scripts/build-places.mjs 가 만듦. 직접 고치지 마세요.\n` +
    `// 영상을 빼려면 data/auto/videos-auto.json 에서 그 항목을 지우세요.\n` +
    `window.VIDEOS.push(...${JSON.stringify(pub, null, 2)});\n`,
  );
  return { videos: pub.length };
}

// data/auto/availability.json → data/video-views.js (영상별 조회수, 목록을 조회수 순으로 정렬할 때 씀)
export function buildViewsJs() {
  let avail = {};
  try { avail = JSON.parse(fs.readFileSync(path.join(SITE, "data/auto/availability.json"), "utf8")); } catch {}
  const views = Object.fromEntries(Object.entries(avail).filter(([, v]) => Number.isFinite(v.views)).map(([id, v]) => [id, v.views]));
  fs.writeFileSync(
    path.join(SITE, "data/video-views.js"),
    `// 자동 생성 파일: data/auto/availability.json 에서 scripts/build-places.mjs 가 만듦. 직접 고치지 마세요.\n` +
    `// 영상별 유튜브 조회수 (매주 영상 점검 때 갱신). 없는 영상은 목록 뒤쪽에 나온다.\n` +
    `window.VIDEO_VIEWS = ${JSON.stringify(views)};\n`,
  );
  return { videos: Object.keys(views).length };
}

// data/auto/captions.json → data/video-subs.js (영상별로 사람이 만든 자막 언어 목록)
export function buildSubsJs() {
  let subs = {};
  try { subs = JSON.parse(fs.readFileSync(path.join(SITE, "data/auto/captions.json"), "utf8")); } catch {}
  const out = Object.fromEntries(Object.entries(subs).map(([id, x]) => [id, x.langs || []]));
  fs.writeFileSync(
    path.join(SITE, "data/video-subs.js"),
    `// 자동 생성 파일: data/auto/captions.json 에서 scripts/build-places.mjs 가 만듦. 직접 고치지 마세요.\n` +
    `// 영상별 자막 언어 (자동 생성 자막 제외). 비어 있으면 아직 확인 전.\n` +
    `window.VIDEO_SUBS = ${JSON.stringify(out)};\n`,
  );
  return { videos: Object.keys(out).length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = buildPlacesJs();
  const h = buildHiddenJs();
  const sb = buildSubsJs();
  const vw = buildViewsJs();
  const va = buildVideosJs();
  console.log(`places-auto.js: ${r.published}/${r.total}곳 공개, hidden-videos.js: ${h.hidden}개 숨김, video-subs.js: ${sb.videos}개 영상, video-views.js: ${vw.videos}개 영상, videos-auto.js: ${va.videos}개 영상`);
}
