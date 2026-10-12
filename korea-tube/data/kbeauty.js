// K-뷰티 쇼핑 가이드 (kbeauty/<언어>.html) 데이터.
// 가격은 쇼핑몰마다 매일 바뀌어서 적지 않는다. 버튼을 누르면 각 쇼핑몰·가격 비교에서 확인.
// why 의 근거는 source 에 적는다 (기사·사이트 영상 설명란). 근거 없는 효능·순위는 쓰지 않는다.
// 다른 언어 번역: data/auto/kbeauty-i18n.json (scripts/translate-kbeauty.mjs). 없으면 영어로 표시.
// 제휴에 가입하면 STORES 의 url 을 제휴 링크로 바꾸고 tracked: true 로.
window.KBEAUTY_STORES = {
  oyStore: { name: "Olive Young", kind: "store", url: null, tracked: false },
  oyGlobal: { name: "Olive Young Global", kind: "online", url: "https://global.oliveyoung.com/", tracked: false },
  amazon: { name: "Amazon", kind: "online", url: "https://www.amazon.com/s?k={q}", tracked: false },
  yesstyle: { name: "YesStyle", kind: "online", url: "https://www.yesstyle.com/", tracked: false },
  lotteDfs: { name: "Lotte Duty Free", kind: "dutyfree", url: "https://eng.lottedfs.com/kr/shopmain/home", tracked: false },
  compare: { name: "Google Shopping", kind: "compare", url: "https://www.google.com/search?tbm=shop&q={q}", tracked: false },
};

window.KBEAUTY_SECTIONS = [
  { key: "bestsellers", stores: ["oyGlobal", "amazon", "yesstyle", "compare"],
    ko: "해외에서도 많이 팔리는 스킨케어", en: "Skincare best sellers abroad" },
  { key: "koreans", stores: ["oyGlobal", "amazon", "compare"],
    ko: "한국 사람들이 올리브영에서 사는 것", en: "What Koreans buy at Olive Young" },
  { key: "luxury", stores: ["lotteDfs", "amazon", "compare"],
    ko: "럭셔리: 면세점·백화점에서", en: "Luxury: at duty free & department stores" },
  { key: "devices", stores: ["amazon", "oyGlobal", "compare"],
    ko: "피부 관리 기기", en: "Skincare devices" },
];

const HERALD = { label: "The Korea Herald (Herald Business), 2026", url: "https://biz.heraldcorp.com/article/10784897" };
const OY_VIDEO = { label: "Video: What Koreans ACTUALLY Buy at Olive Young (Myeongdong)", video: "JIzs5z_bOxw" };

window.KBEAUTY = [
  { id: "medicube-pad", sec: "bestsellers", brand: "medicube", name: "Zero Pore Pad", q: "medicube Zero Pore Pad",
    ko: "메디큐브 제로 모공 패드. 2026년 아마존 미국 스킨케어 베스트셀러 1위에 오른 제품으로, 메디큐브는 상위권에 제품 8개를 올렸어요.",
    en: "The No. 1 product in Amazon US's skincare best sellers in 2026; medicube placed eight products in the top ranks.", source: HERALD },
  { id: "anua-toner", sec: "bestsellers", brand: "Anua", name: "Heartleaf 77% Soothing Toner", q: "Anua Heartleaf 77 Soothing Toner",
    ko: "아누아 어성초 77 수딩 토너. 아누아는 2026년 아마존 미국 스킨케어 상위권에 제품 4개를 올렸어요.",
    en: "Anua placed four products in Amazon US's top skincare ranks in 2026; the heartleaf toner is its signature line.", source: HERALD },
  { id: "cosrx-snail", sec: "bestsellers", brand: "COSRX", name: "Advanced Snail 96 Mucin Power Essence", q: "COSRX Advanced Snail 96 Mucin Power Essence",
    ko: "코스알엑스 스네일 96 에센스. 코스알엑스(현재 아모레퍼시픽 소속)는 영국 아마존 상위권에도 올랐어요.",
    en: "COSRX (now part of Amorepacific) also ranks near the top of Amazon UK's skincare lists.", source: HERALD },
  { id: "boj-sun", sec: "bestsellers", brand: "Beauty of Joseon", name: "Relief Sun: Rice + Probiotics", q: "Beauty of Joseon Relief Sun Rice Probiotics",
    ko: "조선미녀 맑은쌀 선크림. 영국·독일 아마존 상위권에 오른 선크림이에요.",
    en: "Beauty of Joseon's sunscreen made Amazon's top skincare rankings in the UK and Germany.", source: HERALD },
  { id: "biodance-mask", sec: "bestsellers", brand: "BIODANCE", name: "Bio-Collagen Real Deep Mask", q: "BIODANCE Bio-Collagen Real Deep Mask",
    ko: "바이오던스 콜라겐 마스크. 아마존 판매 순위 상위권 제품이고, 명동 올리브영 영상에서도 한국 사람들이 많이 사는 제품으로 소개돼요.",
    en: "A top-ranked mask on Amazon, and also featured in our Olive Young Myeongdong video as something Koreans actually buy.", source: OY_VIDEO },
  { id: "dalba-mist", sec: "bestsellers", brand: "d'Alba", name: "White Truffle First Spray Serum", q: "dAlba White Truffle First Spray Serum",
    ko: "달바 미스트 세럼. 달바 미스트는 독일 아마존 스킨케어 상위권에 올랐어요.",
    en: "d'Alba's mist made Amazon Germany's top skincare best sellers.", source: HERALD },
  { id: "hera-uv", sec: "koreans", brand: "HERA", name: "UV Protector Tone-Up", q: "HERA UV Protector Tone-Up",
    ko: "헤라 UV 프로텍터 톤업. 명동 올리브영 영상에서 한국 사람들이 실제로 많이 사는 제품으로 꼽혀요.",
    en: "Listed in our Olive Young Myeongdong video as one of the things Korean shoppers actually pick up.", source: OY_VIDEO },
  { id: "drg-cream", sec: "koreans", brand: "Dr.G", name: "R.E.D Blemish Clear Soothing Cream", q: "Dr.G Red Blemish Clear Soothing Cream",
    ko: "닥터지 레드 블레미쉬 수딩 크림. 같은 명동 올리브영 영상에 나온 제품이에요.",
    en: "Also listed in the same Olive Young Myeongdong video.", source: OY_VIDEO },
  { id: "sulwhasoo", sec: "luxury", brand: "Sulwhasoo", name: "First Care Activating Serum", q: "Sulwhasoo First Care Activating Serum",
    ko: "설화수 윤조에센스. 아모레퍼시픽의 대표 럭셔리 브랜드로, 여행자는 주로 면세점과 백화점에서 사요. 올리브영 온라인몰 프리미엄관에도 입점했어요.",
    en: "Amorepacific's flagship luxury brand. Travelers usually buy it at duty free shops and department stores; it is also on Olive Young's online premium section.",
    source: { label: "Bizwatch: Sulwhasoo joins Olive Young Luxe Edit", url: "https://news.bizwatch.co.kr/article/consumer/2024/05/13/0028" } },
  { id: "whoo", sec: "luxury", brand: "The History of Whoo", name: "Bichup essence", q: "The History of Whoo Bichup essence",
    ko: "더후 비첩 에센스. LG생활건강의 럭셔리 브랜드로 면세점과 백화점이 대표 구매처예요.",
    en: "LG H&H's luxury line, mainly sold at duty free shops and department stores.", source: null },
  { id: "age-r", sec: "devices", brand: "medicube", name: "AGE-R Booster Pro", q: "medicube AGE-R Booster Pro",
    ko: "메디큐브 에이지알 부스터 프로. 브랜드 발표로 에이지알 라인은 전 세계 600만 대 이상 팔렸어요. 나라마다 가격 차이가 커서 사기 전에 비교해 보세요.",
    en: "The brand says its AGE-R line has sold over 6 million units worldwide. Prices vary a lot by country, so compare before you buy.",
    source: { label: "50-ML: medicube best sellers", url: "https://50-ml.com/brands/medicube" } },
];

// 페이지 문구 (ko/en). 다른 언어는 kbeauty-i18n.json
window.KBEAUTY_TEXT = {
  ko: {
    title: "K-뷰티 쇼핑 가이드: 무엇을, 어디서 살까",
    intro: "한국 여행 중 매장에서 살지, 집에 가서 온라인으로 살지 고민될 때 보는 정리예요. 가격은 매일 바뀌어서 적지 않았어요. 버튼을 눌러 각 쇼핑몰이나 가격 비교에서 확인하세요.",
    tipsTitle: "사기 전에",
    tips: [
      "올리브영 매장은 여권을 보여 주면 외국인 즉시 세금 환급(택스 리펀드)을 받을 수 있는 곳이 많아요. 계산 전에 물어보세요.",
      "시내 면세점은 여권과 출국 항공권 정보가 필요하고, 산 물건은 출국할 때 공항 인도장에서 받아요.",
      "같은 제품도 나라·쇼핑몰마다 가격 차이가 커요. 특히 기기는 꼭 비교해 보세요.",
    ],
    compare: "가격 비교", inKorea: "한국 매장에서", source: "출처", watch: "영상 보기",
    note: "일부 링크는 제휴 링크일 수 있어요. 구매하시면 사이트 운영에 도움이 되는 수수료가 지급될 수 있지만 가격은 같아요.",
  },
  en: {
    title: "K-Beauty Shopping Guide: What to Buy and Where",
    intro: "For when you can't decide whether to buy in a store in Korea or online back home. We don't list prices because they change every day; tap a button to check each store or compare prices.",
    tipsTitle: "Before you buy",
    tips: [
      "Many Olive Young stores give foreigners an instant tax refund if you show your passport. Ask before paying.",
      "Downtown duty free shops need your passport and departure flight details; you pick up your purchases at the airport when you leave.",
      "The same product can cost very different amounts by country and store. Always compare, especially for devices.",
    ],
    compare: "Compare prices", inKorea: "In stores in Korea", source: "Source", watch: "Watch the video",
    note: "Some links may be affiliate links. If you buy through them, this site may earn a commission at no extra cost to you.",
  },
};
