# Let's Visit Korea

한국 여행·음식·문화 유튜브 영상을 **지역별(지도)** · **카테고리별(음식/여행/문화)** 로 모아 보고,
사이트에서 고른 언어로 **유튜브 자막을 자동으로 켜 주는** 정적 웹사이트입니다.

## 기능
- **지도에서 지역 선택**: 서울, 경기·인천, 강원, 충청·대전, 전북, 전남, 경북, 대구, 경남, 부산, 제주
  (지도 마커 또는 아래 지역 칩 클릭, 다시 누르면 해제)
- **카테고리 탭**: 전체 / 음식 / 여행 / 문화 + 제목 검색
- **프로그램 카테고리**: 📺 어서와 한국은 처음이지 / 백종원의 님아 그 시장을 가오 / 허영만의 백반기행 / 유튜버 영상 (`SHOWS` 에 프로그램을 추가하면 버튼이 자동으로 생김)
- **자막 언어 선택**: 한국어, English, 日本語, 简体/繁體中文, Español, Français, Deutsch, Tiếng Việt, ไทย, Bahasa Indonesia, Русский
  - 영상에 그 언어 자막이 있으면 그대로 켜고, 없으면 원본 자막(자동 생성 포함)을 **유튜브 자동번역**으로 선택 언어로 켭니다.
  - 재생 중에 언어를 바꿔도 즉시 반영됩니다. 사이트 UI 문구도 함께 바뀝니다.
- 선택 상태가 URL에 남아 공유 가능: `?lang=ja&region=busan&cat=food&show=paikmarket`

## 자막 동작 방식과 한계
- YouTube IFrame Player API를 사용합니다. `cc_load_policy=1`, `cc_lang_pref`, `hl` 파라미터로 시작하고,
  재생이 시작되면 `player.setOption('captions', 'track', {..., translationLanguage})` 로 자동번역 트랙을 지정합니다.
- 이 자동번역 지정 방식은 유튜브 공식 문서에 없는 옵션이라, 유튜브가 동작을 바꾸면 영향받을 수 있습니다.
- **자막 트랙이 하나도 없는 영상**(자동 생성 자막도 꺼진 영상)은 번역할 원본이 없어 자막이 나오지 않습니다.
  이 경우 플레이어 아래에 안내 문구가 표시됩니다.

## 영상 추가/수정
`data/videos.js` 의 `VIDEOS` 배열에 한 줄 추가하면 됩니다.

```js
{ id: "유튜브영상ID", region: "busan", cats: ["food", "travel"], title: "영상 제목" },
```

- `region` 키: `seoul, gyeonggi, gangwon, chungcheong, jeonbuk, jeonnam, gyeongbuk, daegu, gyeongnam, busan, jeju`
- 여러 지역이 나오는 영상은 `region: ["seoul", "gangwon"]` 처럼 배열로 쓰면 양쪽 지역에 모두 표시됩니다.
- 방송 프로그램 클립은 `show: "hello1stkorea"` 를 붙이면 카드에 프로그램 이름이 표시되고, 프로그램 이름으로 검색할 수 있습니다.
  프로그램은 `SHOWS` 에 추가합니다. 저작권 문제를 피하려면 **방송사 공식 채널에 올라온 영상만** 넣으세요.
- 지역을 늘리려면 `REGIONS` 에 `{ key, ko, en, lat, lng }` 를 추가하세요.

## 로컬 실행 / 배포
빌드 과정 없는 정적 파일입니다.

```bash
cd korea-tube && python3 -m http.server 8000   # http://localhost:8000
```

GitHub Pages, Netlify, Vercel 등에 이 폴더를 그대로 올리면 됩니다.
(`file://` 로 직접 열면 유튜브 플레이어가 동작하지 않으니 꼭 웹서버로 열어 주세요.)

## 지역 여행 정보 · 맛집 · 제휴 링크
지역을 선택하면 영상 목록 위에 **여행 정보 칸**이 나옵니다.

- `data/places.js`
  - `REGION_INFO`: 지역 소개, 대표 음식, 가볼 곳 (ko/en, 다른 언어는 en 사용)
  - `PLACES`: 영상에 나온 맛집·시장·명소. `videos` 에 영상 ID를 넣으면 "영상 보기" 버튼이 생깁니다.
    주소·영업시간은 적지 않고 네이버/구글 지도 검색 링크(`q`)로 연결합니다.
- `data/affiliates.js`: 여행 예약 버튼(Klook, KKday, Agoda, Booking.com)
  - 지금은 일반 검색 링크입니다. 제휴 승인 후 받은 **추적 링크**로 `url` 을 바꾸고 `tracked: true` 로 하세요.
  - `{q}` 자리에 "Busan, Korea" 같은 지역 이름이 들어갑니다.
  - `tracked: true` 가 하나라도 있으면 "제휴 링크 포함" 안내가 자동 표시됩니다.

## 다국어
- 화면 문구: `i18n.js` (12개 언어)
- 지역 이름·프로그램 이름·지역 소개·맛집 이름: `data/i18n-content.js`
  - 지역 소개 문장은 12개 언어, 대표 음식·가볼 곳·맛집 이름은 한국어·영어·일본어·중국어(간체/번체)
  - 번역이 없는 항목은 영어로 표시되고, 외국어 화면에서는 맛집 한국어 이름도 함께 보입니다.
- 영상 제목은 유튜브 원래 제목 그대로 표시합니다.

## 자동화: 영상 속 맛집 찾기 + 블로그 초안 (GitHub Actions)
`.github/workflows/korea-tube-content.yml` 이 매주 월요일(또는 Actions 탭에서 수동 실행) 아래를 실행합니다.

1. `scripts/enrich.mjs` — 아직 처리하지 않은 영상의 **설명란과 인기 댓글**을 YouTube Data API로 가져와,
   Claude가 가게·장소를 뽑습니다. **근거 문장이 실제 설명란/댓글에 있는 것만** 남기고(지어낸 가게 차단),
   이미 있는 가게는 영상만 연결합니다. 결과: `data/auto/places-auto.json`, `data/places-auto.js`
2. `scripts/blog.mjs` — 새 장소가 2곳 이상 모인 지역마다 한국어·영어 블로그 글 초안을 씁니다. 결과: `blog/posts/*.html`
3. 결과를 **PR로 올립니다.** 확인 후 병합하면 `korea-tube-deploy.yml` 이 사이트에 자동 배포합니다.

### 근거 출처와 "확인 필요"
스크립트가 근거 문장이 **어디에 있는지**를 직접 확인해서 `source` 를 붙입니다.
- `description`(설명란), `owner_comment`(채널 주인 댓글) → 병합하면 바로 공개
- `viewer_comment`(시청자 댓글만) → `"needs_check": true` 가 붙고 **사이트·블로그에 공개되지 않음**.
  PR 본문 맨 위에 검색 링크와 함께 정리됩니다. 맞으면 `data/auto/places-auto.json` 에서
  그 항목의 `"needs_check": true,` 한 줄을 지우고, 틀리면 항목을 지운 뒤 병합하세요.
- 사이트가 읽는 `data/places-auto.js` 는 배포 때 `scripts/build-places.mjs` 가 json 에서 다시 만들므로 json 만 고치면 됩니다.

### 처음 한 번 설정
- 저장소 **Settings → Secrets and variables → Actions** 에 추가
  - `YOUTUBE_API_KEY`: Google Cloud Console → YouTube Data API v3 사용 설정 → API 키 (무료 할당량)
  - `ANTHROPIC_API_KEY`: console.anthropic.com 에서 발급
- **Settings → Actions → General → Workflow permissions** 에서 "Read and write" 와
  "Allow GitHub Actions to create and approve pull requests" 체크
- 워크플로 파일이 **기본 브랜치(main)에 있어야** 예약 실행됩니다.

### 수동 실행 옵션 (Actions → Let's Visit Korea content → Run workflow)
- `max_videos`: 한 번에 처리할 영상 수 (기본 15)
- `only_shows`: `1` 이면 방송 프로그램 영상만
- `blog_region`: 지역 key 를 넣으면 그 지역 글을 새로 씀 (예: `busan`)

### 삭제·비공개 영상 자동 숨김
자동 실행 때마다 `scripts/check-videos.mjs` 가 **모든 영상**의 상태를 YouTube API로 확인합니다.
삭제·비공개·퍼가기 금지된 영상은 `data/auto/availability.json` 에 기록되고, `data/hidden-videos.js` 를 통해
사이트에서 자동으로 숨겨집니다. 맛집 정보는 그대로 두고 "영상 보기" 버튼만 빠집니다.
채널 주인이 영상을 다시 공개하면 다음 점검 때 자동으로 다시 나타납니다.
