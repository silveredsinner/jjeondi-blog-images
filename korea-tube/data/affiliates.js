// 여행 예약 링크 설정.
// 제휴 프로그램에 가입하면 각 사이트가 주는 "추적 링크(제휴 ID 포함)"로 url 을 바꾸고 tracked 를 true 로 하세요.
// kind 는 i18n.js 의 문구 키(k_tours / k_exp / k_hotels)입니다.
// {q} 자리에 지역 이름(예: "Busan, Korea")이 들어갑니다.
// tracked 가 하나라도 true 면 "제휴 링크 포함" 안내 문구가 자동으로 표시됩니다.
// 제휴 사이트가 "리다이렉트 주소?...&목적지=" 형식이면 url 에 {site}, site 에 목적지 주소({q} 포함)를 적으세요.
window.AFFILIATES = [
  // Klook 제휴 ID(aid) 138702
  { key: "klook", name: "Klook", kind: "k_tours",
    url: "https://affiliate.klook.com/redirect?aid=138702&aff_adid=1494114&k_site={site}",
    site: "https://www.klook.com/search/result/?query={q}", tracked: true },
  { key: "kkday", name: "KKday", kind: "k_exp",
    url: "https://www.kkday.com/en/product/productlist?keyword={q}", tracked: false },
  { key: "agoda", name: "Agoda", kind: "k_hotels",
    url: "https://www.agoda.com/search?textToSearch={q}", tracked: false },
  { key: "booking", name: "Booking.com", kind: "k_hotels",
    url: "https://www.booking.com/searchresults.html?ss={q}", tracked: false },
];
