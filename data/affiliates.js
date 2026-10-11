// 여행 예약 링크 설정.
// 제휴 프로그램에 가입하면 각 사이트가 주는 "추적 링크(제휴 ID 포함)"로 url 을 바꾸고 tracked 를 true 로 하세요.
// {q} 자리에 지역 이름(예: "Busan, Korea")이 들어갑니다.
// tracked 가 하나라도 true 면 "제휴 링크 포함" 안내 문구가 자동으로 표시됩니다.
window.AFFILIATES = [
  { key: "klook", name: "Klook", kind_ko: "투어·입장권", kind_en: "Tours & tickets",
    url: "https://www.klook.com/search/result/?query={q}", tracked: false },
  { key: "kkday", name: "KKday", kind_ko: "투어·체험", kind_en: "Tours & experiences",
    url: "https://www.kkday.com/en/product/productlist?keyword={q}", tracked: false },
  { key: "agoda", name: "Agoda", kind_ko: "숙소", kind_en: "Hotels",
    url: "https://www.agoda.com/search?textToSearch={q}", tracked: false },
  { key: "booking", name: "Booking.com", kind_ko: "숙소", kind_en: "Hotels",
    url: "https://www.booking.com/searchresults.html?ss={q}", tracked: false },
];
