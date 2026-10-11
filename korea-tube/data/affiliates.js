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
  // KKday 제휴 사이트 번호(cid) 27380
  { key: "kkday", name: "KKday", kind: "k_exp",
    url: "https://www.kkday.com/en/product/productlist?keyword={q}&cid=27380", cityOnly: true, tracked: true },
  { key: "agoda", name: "Agoda", kind: "k_hotels",
    url: "https://www.agoda.com/search?textToSearch={q}", tracked: false },
  { key: "booking", name: "Booking.com", kind: "k_hotels",
    url: "https://www.booking.com/searchresults.html?ss={q}", tracked: false },
];

// KKday 상품 카드 위젯 (KKday 파트너 → Tools → Dynamic Product Ads 에서 만든 코드의 data-oid 값).
// 지역 key → oid. 지역마다 Product City 를 골라 코드를 만들고 여기에 oid 를 추가하세요. 없는 지역은 위젯이 안 나와요.
window.KKDAY_WIDGETS = {
  seoul: "14078",
  gyeonggi: "14079",
  chungcheong: "14081",
  busan: "14077",
};
window.KKDAY_WIDGET_JS = "https://kkpartners.kkday.com/iframe.init.1.0.js";
