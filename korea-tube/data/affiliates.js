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
  // Klook 호텔: 지역마다 클룩 호텔 검색 결과(도시 번호 city_id) 또는 관광지 주변 호텔 페이지 (sites). 지역 key 가 없으면 버튼이 안 나와요.
  { key: "klookhotel", name: "Klook", kind: "k_hotels",
    url: "https://affiliate.klook.com/redirect?aid=138702&k_site={site}",
    sites: {
      seoul: "https://www.klook.com/hotels/searchresult/?room_num=1&adult_num=2&child_num=0&stype=city&svalue=13&city_id=13&title=Seoul&aid=138702",
      gyeonggi: "https://www.klook.com/hotels/searchresult/?room_num=1&adult_num=2&child_num=0&stype=city&svalue=158&city_id=158&title=Incheon&aid=138702",
      gangwon: "https://www.klook.com/hotels/searchresult/?room_num=1&adult_num=2&child_num=0&stype=city&svalue=156&city_id=156&title=Gangwon&aid=138702",
      chungcheong: "https://www.klook.com/hotels/searchresult/?room_num=1&adult_num=2&child_num=0&stype=city&svalue=6268&city_id=6268&title=Daejeon&aid=138702",
      jeonbuk: "https://www.klook.com/destination/p50001575-jeonju-hanok-village/3-hotel/?aid=138702",
      jeonnam: "https://www.klook.com/hotels/searchresult/?room_num=1&adult_num=2&child_num=0&stype=city&svalue=703649&city_id=703649&title=Yeosu&aid=138702",
      gyeongbuk: "https://www.klook.com/hotels/searchresult/?room_num=1&adult_num=2&child_num=0&stype=city&svalue=8928&city_id=8928&title=Gyeongju&aid=138702",
      daegu: "https://www.klook.com/hotels/searchresult/?room_num=1&adult_num=2&child_num=0&stype=city&svalue=545&city_id=545&title=Daegu&aid=138702",
      gyeongnam: "https://www.klook.com/destination/p60018709-tongyeong-chungryeolsa-temple/3-hotel/?aid=138702",
      busan: "https://www.klook.com/hotels/searchresult/?room_num=1&adult_num=2&child_num=0&stype=city&svalue=46&city_id=46&title=Busan&aid=138702",
      jeju: "https://www.klook.com/hotels/searchresult/?room_num=1&adult_num=2&child_num=0&stype=city&svalue=20544&city_id=20544&title=Jeju&aid=138702",
    },
    tracked: true },
];

// KKday 상품 카드 위젯 (KKday 파트너 → Tools → Dynamic Product Ads 에서 만든 코드의 data-oid 값).
// 지역 key → oid. 지역마다 Product City 를 골라 코드를 만들고 여기에 oid 를 추가하세요. 없는 지역은 위젯이 안 나와요.
window.KKDAY_WIDGETS = {
  seoul: "14078",
  gyeonggi: "14079",
  gangwon: "14082",
  chungcheong: "14081",
  jeonbuk: "14083",
  jeonnam: "14084",
  gyeongbuk: "14085",
  daegu: "14086",
  gyeongnam: "14087",
  busan: "14077",
  jeju: "14088",
};
window.KKDAY_WIDGET_JS = "https://kkpartners.kkday.com/iframe.init.1.0.js";
