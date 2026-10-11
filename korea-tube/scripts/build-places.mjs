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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = buildPlacesJs();
  console.log(`places-auto.js: ${r.published}/${r.total}곳 공개`);
}
