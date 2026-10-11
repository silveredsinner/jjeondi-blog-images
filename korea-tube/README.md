# Korea Tube

한국 여행·음식·문화 유튜브 영상을 **지역별(지도)** · **카테고리별(음식/여행/문화)** 로 모아 보고,
사이트에서 고른 언어로 **유튜브 자막을 자동으로 켜 주는** 정적 웹사이트입니다.

## 기능
- **지도에서 지역 선택**: 서울, 경기·인천, 강원, 충청·대전, 전북, 전남, 경북, 대구, 경남, 부산, 제주
  (지도 마커 또는 아래 지역 칩 클릭, 다시 누르면 해제)
- **카테고리 탭**: 전체 / 음식 / 여행 / 문화 + 제목 검색
- **프로그램 선택**: 어서와 한국은 처음이지, 백종원의 님아 그 시장을 가오, 허영만의 백반기행, 유튜버 영상
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
