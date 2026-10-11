// 지역·카테고리 데이터와 영상 목록.
// 영상을 추가하려면 VIDEOS 배열에 { id, title, region, cats } 한 줄을 넣으면 됩니다.
//   id     : 유튜브 영상 ID (youtube.com/watch?v=XXXX 의 XXXX)
//   region : 아래 REGIONS 의 key. 여러 지역이 나오면 ["seoul", "gangwon"] 처럼 배열
//   show   : (선택) 방송 프로그램 key — 아래 SHOWS 참고
//   cats   : "food" | "travel" | "culture" 중 하나 이상

window.REGIONS = [
  { key: "seoul",     ko: "서울",       en: "Seoul",            lat: 37.5665, lng: 126.978 },
  { key: "gyeonggi",  ko: "경기·인천",  en: "Gyeonggi·Incheon", lat: 37.35,   lng: 126.75 },
  { key: "gangwon",   ko: "강원",       en: "Gangwon",          lat: 37.80,   lng: 128.55 },
  { key: "chungcheong", ko: "충청·대전", en: "Chungcheong·Daejeon", lat: 36.40, lng: 127.20 },
  { key: "jeonbuk",   ko: "전북",       en: "Jeonbuk",          lat: 35.82,   lng: 127.15 },
  { key: "jeonnam",   ko: "전남",       en: "Jeonnam",          lat: 34.85,   lng: 127.20 },
  { key: "gyeongbuk", ko: "경북",       en: "Gyeongbuk",        lat: 36.10,   lng: 129.00 },
  { key: "daegu",     ko: "대구",       en: "Daegu",            lat: 35.87,   lng: 128.60 },
  { key: "gyeongnam", ko: "경남",       en: "Gyeongnam",        lat: 35.05,   lng: 128.30 },
  { key: "busan",     ko: "부산",       en: "Busan",            lat: 35.18,   lng: 129.08 },
  { key: "jeju",      ko: "제주",       en: "Jeju",             lat: 33.40,   lng: 126.55 },
];

window.SHOWS = {
  hello1stkorea: { ko: "어서와 한국은 처음이지", en: "Welcome, First Time in Korea? (MBC every1)" },
  paikmarket: { ko: "백종원의 님아 그 시장을 가오", en: "Paik Jong-won's Market Tour" },
  baekban: { ko: "허영만의 백반기행", en: "Huh Young-man's Food Travel (TV CHOSUN)" },
};

window.VIDEOS = [
  // 서울
  { id: "2rz-TU7154k", region: "seoul", cats: ["food"], title: "Ultimate Seoul Street Food Tour (Gwangjang Market)" },
  { id: "kCxQIHYQQqs", region: "seoul", cats: ["food"], title: "Gwangjang Market at Night – Korean Street Food Experience" },
  { id: "lrLS7Z90Kbk", region: "seoul", cats: ["food", "travel"], title: "Seoul Street Food Tour in 2026 (all prices included)" },
  { id: "FouuCLjp8zs", region: "seoul", cats: ["food"], title: "Top 10 Korean Street Foods to Try – Gwangjang Market" },
  { id: "25Mc2ccrvdA", region: "seoul", cats: ["culture", "travel"], title: "Walking Tour of Gyeongbokgung Palace in Full Hanbok" },
  { id: "5EHAnSu08e4", region: "seoul", cats: ["culture"], title: "A Hanbok Day at Gyeongbokgung" },
  { id: "j03BAgvxQfE", region: "seoul", cats: ["travel", "culture"], title: "Hanbok, Hanok Village, Gwangjang Market & Namsan Tower Vlog" },

  // 경기·인천
  { id: "CIwOoy7lD0g", region: "gyeonggi", cats: ["culture", "food"], title: "Incheon Chinatown – Birthplace of Jajangmyeon" },
  { id: "x1O55IpAtnc", region: "gyeonggi", cats: ["food", "travel"], title: "Incheon Street Food, Chinatown & Wolmido Park" },
  { id: "8lCF6H8Ee5A", region: "gyeonggi", cats: ["travel", "food"], title: "Suwon Day Trip: Hwaseong Fortress & Korea's Best Fried Chicken" },
  { id: "QAQAGVBL51o", region: "gyeonggi", cats: ["culture", "travel"], title: "Suwon – Hwaseong Fortress & Haenggung Palace at Night" },

  // 강원
  { id: "JhhFYZWjybg", region: "gangwon", cats: ["food"], title: "Gangwon-do Signature Dishes at Sokcho Traditional Market" },
  { id: "90ANawUhkXw", region: "gangwon", cats: ["food", "travel"], title: "Real Korean Food Tour – Sokcho Beach Town Guide" },
  { id: "jMySDV7Kwko", region: "gangwon", cats: ["travel"], title: "Weekend in Gangneung" },
  { id: "O2Rpouqotkw", region: "gangwon", cats: ["travel"], title: "Spring in Gangwon-do: Sokcho & Gangneung" },

  // 충청·대전
  { id: "FQGLz3pzM2w", region: "chungcheong", cats: ["travel", "food"], title: "Daejeon Old Downtown Walk – Sungsimdang & Central Market" },
  { id: "qP4V8QnY_WE", region: "chungcheong", cats: ["food"], title: "Korea's Most Famous Bakery… Only in One City (Sungsimdang)" },
  { id: "UE9PrFXIMfs", region: "chungcheong", cats: ["travel"], title: "Daejeon Day Trip" },

  // 전북
  { id: "tswqv1FY_2s", region: "jeonbuk", cats: ["food"], title: "Ultimate Street Food Tour in Jeonju – Famous Bibimbap" },
  { id: "YGWFWpd0AjY", region: "jeonbuk", cats: ["travel", "culture", "food"], title: "24 Hours in Jeonju – Hanok Village & Best Bibimbap" },
  { id: "gUwiVRYbeZ0", region: "jeonbuk", cats: ["food", "culture"], title: "Original Bibimbap & Night Market in Jeonju" },
  { id: "lC8hEbHE6x0", region: "jeonbuk", cats: ["travel"], title: "Jeonju in 2 Days" },

  // 전남
  { id: "soKei3HoS6s", region: "jeonnam", cats: ["food", "travel"], title: "Yeosu Food Tour & Mural Village – Solo Travel Vlog" },
  { id: "7Dzg7N8Z73I", region: "jeonnam", cats: ["food"], title: "Yeosu Food Tour – Best Oyster Restaurant" },
  { id: "hPmCee2cdvc", region: "jeonnam", cats: ["travel"], title: "Why You Need to Visit Yeosu" },
  { id: "EVbJ-hm0-Q8", region: "jeonnam", cats: ["travel", "culture"], title: "Jeolla-do Countryside & Green Tea Farm" },

  // 경북
  { id: "v_dZT6AUjGk", region: "gyeongbuk", cats: ["travel", "food"], title: "3 Days in Gyeongju – Shopping, Cafes & Food" },
  { id: "_Bk9DkJcH3s", region: "gyeongbuk", cats: ["culture", "travel"], title: "Exploring the Secrets of Gyeongju" },
  { id: "teLRxsBnHqo", region: "gyeongbuk", cats: ["travel", "food", "culture"], title: "48 Hours in Gyeongju – Hanok Stay & Korean Food" },
  { id: "nsFk-bseRMw", region: "gyeongbuk", cats: ["culture"], title: "Step Into Korea's Past: A Gyeongju Journey" },

  // 대구
  { id: "UQMtonP8PHQ", region: "daegu", cats: ["food"], title: "A Foodie's Guide to Daegu" },
  { id: "ncRLdVWQ9lY", region: "daegu", cats: ["food", "travel"], title: "Seomun Market Daegu Travel Vlog" },
  { id: "dHDbaBcIVug", region: "daegu", cats: ["food"], title: "Korean Street Food – Daegu 5-Day Market" },

  // 경남
  { id: "3fNAfK57l8c", region: "gyeongnam", cats: ["travel"], title: "Korea Travel Vlog to Tongyeong" },
  { id: "w-6QY864btc", region: "gyeongnam", cats: ["travel"], title: "Tongyeong Korea Travel Vlog" },
  { id: "JUdc_ZznMQk", region: "gyeongnam", cats: ["travel"], title: "Geoje Island Travel Vlog" },
  { id: "LvSOxQa4B0k", region: "gyeongnam", cats: ["travel"], title: "Road Trip: Geoje – Tongyeong – Namhae – Yeosu" },

  // 부산
  { id: "7hh7kDo-M_Q", region: "busan", cats: ["food"], title: "Largest Seafood Market in Korea – Jagalchi Market" },
  { id: "Bl3O9xqKFwU", region: "busan", cats: ["food"], title: "Everything I Ate at Jagalchi Market" },
  { id: "XDfDtwXQ1f4", region: "busan", cats: ["food"], title: "Extreme Seafood at Jagalchi Market in Busan" },
  { id: "TzUZ9dNiq-I", region: "busan", cats: ["travel", "culture"], title: "Busan Traditional Market Tour (Jagalchi, Gukje Market)" },
  { id: "Zg8Ffhg_oJQ", region: "busan", cats: ["travel", "food"], title: "Jagalchi, Gamcheon Village & Seomyeon – Busan Vlog" },

  // 제주
  { id: "stUKYEYBXfU", region: "jeju", cats: ["food"], title: "What to Eat in Jeju – Neulbom Heukdwaeji Black Pork BBQ" },
  { id: "8Fc8TP05Wfs", region: "jeju", cats: ["food"], title: "Why Jeju's Black Pork Is a Must-Try" },
  { id: "tSZVmJKzH5k", region: "jeju", cats: ["food", "travel"], title: "Ultimate Jeju Island Food Tour" },
  { id: "w12hNrPkBxQ", region: "jeju", cats: ["food"], title: "Jeju Street Food – Black Pork Street & Dongmun Market" },
  { id: "to09DCFBC3w", region: "jeju", cats: ["food", "culture"], title: "Top 10 Must-Try Jeju Island Foods" },

  // ---- 추가 영상 ----
  // 서울
  { id: "GZ19bu0Uwmw", region: "seoul", cats: ["food"], title: "The Korean BBQ You Must-Eat in Seoul" },
  { id: "10PXs5uNizg", region: "seoul", cats: ["food", "travel"], title: "Walking Through the Food Alley in Mapo, Seoul (4K)" },
  { id: "-EpYVDdr28U", region: "seoul", cats: ["culture"], title: "Korean Templestay Program at Bongeunsa Temple" },
  { id: "ymanyBefqm4", region: "seoul", cats: ["culture"], title: "Inside a 600-Year-Old Korean Temple in Seoul – Templestay & Buddhism" },
  { id: "gfLENahnU-I", region: "seoul", cats: ["culture", "food"], title: "Kimchi Museum Cooking Class in Seoul" },
  { id: "nPdlof5VpEA", region: "seoul", cats: ["culture", "food"], title: "Korean Royal Court Cuisine" },

  // 경기·인천
  { id: "4urFCY-yQjg", region: "gyeonggi", cats: ["culture"], title: "Foreigners at Yongjoosa Temple Stay Learn Korean Buddhist Culture" },
  { id: "u28jZSGAXBE", region: "gyeonggi", cats: ["travel"], title: "Suwon Day Trip in Spring – Hwaseong Fortress & Hanok Cafe" },
  { id: "KAxu61ssQ1A", region: "gyeonggi", cats: ["travel", "food"], title: "Exploring Incheon Chinatown & Wolmi Island" },

  // 강원
  { id: "4XSsFNsQstA", region: "gangwon", cats: ["food"], title: "Chuncheon Dakgalbi & Nami Island" },
  { id: "QMHjjtCd7Zc", region: "gangwon", cats: ["travel"], title: "Seoul to Chuncheon Korea" },
  { id: "9es1UOwrJrU", region: "gangwon", cats: ["culture"], title: "Temple Stay Experience at Woljeongsa Temple" },
  { id: "pUFen3b4yYo", region: "gangwon", cats: ["travel", "food"], title: "Sokcho Trip – Beach, Cafes, Central Market & Makgeolli Bread" },

  // 충청·대전
  { id: "O6TiJrfHIr0", region: "chungcheong", cats: ["travel", "culture"], title: "Buyeo Trip – Baekje Cultural Land" },
  { id: "lvJ1P-Z-AGQ", region: "chungcheong", cats: ["culture", "travel"], title: "Not Seoul, But Korea ep.03 – Buyeo, Capital of Baekje" },
  { id: "6uIaRyhkHbY", region: "chungcheong", cats: ["culture"], title: "K-UNESCO Adventure Ep3 – Baekje Historic Areas" },
  { id: "pT0PfB24lVI", region: "chungcheong", cats: ["food"], title: "The Most Famous Bakery in Daejeon (Sungsimdang)" },

  // 전북
  { id: "hn-XKPVdMo0", region: "jeonbuk", cats: ["culture", "food"], title: "Jeonju Vlog – Gyeonggijeon Shrine & Tteokgalbi" },
  { id: "1JqvLe8gGS0", region: "jeonbuk", cats: ["food"], title: "Korean Street Food at Jeonju Hanok Village" },

  // 전남
  { id: "onPkqArVH4g", region: "jeonnam", cats: ["food"], title: "Damyang Tteokgalbi & Bamboo Rice (Zeit für Hansik #11)" },
  { id: "B7Zcf9oSjTk", region: "jeonnam", cats: ["travel"], title: "Bamboo Forest + Things to Do in Damyang" },
  { id: "aPLfay-XLvU", region: "jeonnam", cats: ["travel"], title: "Quick 1-Day Tour of Mokpo's Major Attractions" },
  { id: "hh2QPbsd_ig", region: "jeonnam", cats: ["food"], title: "What Real Southern Korean Food Looks Like (Jeonju & Mokpo)" },
  { id: "3PK-A1LmBJQ", region: "jeonnam", cats: ["travel"], title: "Exploring Jeollanam-do: A Scenic Journey" },

  // 경북
  { id: "bZ0CTEahxpY", region: "gyeongbuk", cats: ["travel", "culture"], title: "Andong & Hahoe Village – UNESCO, Hanok Stay & Market" },
  { id: "E6pfhgGh0jo", region: "gyeongbuk", cats: ["travel", "food"], title: "10 Things to Do in Andong" },
  { id: "gHJ1wy5nrwg", region: "gyeongbuk", cats: ["culture"], title: "Andong Hahoe Village – Where K-Dramas Get Their Soul" },
  { id: "3_lbDaSgKnk", region: "gyeongbuk", cats: ["culture"], title: "Temple Stay & Sunmudo Demonstration at Golgulsa Temple" },
  { id: "b-ap7OkYNgQ", region: "gyeongbuk", cats: ["food", "travel"], title: "A Perfect 2 Days in Gyeongju: Food and Travel Guide" },

  // 대구
  { id: "j1CT-I1HeRs", region: "daegu", cats: ["travel", "food"], title: "Day Trip to Daegu from Busan – Local Food & Public Transport" },
  { id: "NQqCTLHnNQ0", region: "daegu", cats: ["food", "travel"], title: "大邱 Day 1 – Beef Bone Soup, Spicy Tteokbokki & Hanok Starbucks" },

  // 경남
  { id: "zaCFhS2PO3M", region: "gyeongnam", cats: ["food"], title: "Jinju Naengmyeon, Jukjeon & Suyuk (Zeit für Hansik #10)" },
  { id: "VTksE8CVpW0", region: "gyeongnam", cats: ["food"], title: "Lunch at Parkgunja Jinju Naengmyeon" },
  { id: "y8wy6wMSfdE", region: "gyeongnam", cats: ["travel"], title: "Tongyeong, South Korea Tour" },
  { id: "P9qpZ_5m1dY", region: "gyeongnam", cats: ["culture"], title: "Is Korea's Templestay Right for You? (Haeinsa Temple)" },
  { id: "qSK6yJ5XM6U", region: "gyeongnam", cats: ["travel", "food", "culture"], title: "Jinhae Cherry Blossom Festival: Tips, Tricks & Food" },
  { id: "7Dz3rR8_CFY", region: "gyeongnam", cats: ["travel", "food"], title: "Jinhae Cherry Blossom Festival: A Feast for the Eyes and Taste Buds" },

  // 부산
  { id: "jP6rtQWgFs8", region: "busan", cats: ["travel"], title: "Gamcheon Culture Village & Haeundae Beach" },
  { id: "wiZEP4pxOts", region: "busan", cats: ["culture", "travel"], title: "Korea's Rainbow Town: Gamcheon Culture Village" },
  { id: "anedartZpOo", region: "busan", cats: ["food"], title: "Busan's Famous Dwaeji Gukbap" },
  { id: "AphJn-_tkFg", region: "busan", cats: ["food"], title: "Famous Korean Cold Noodles in Busan" },
  { id: "hUoEj-3GFMg", region: "busan", cats: ["travel"], title: "Busan Vlog – Haeundae, Gamcheon, BIFF Square, Jagalchi, Gwangalli" },

  // 제주
  { id: "fAXN4IIiny4", region: "jeju", cats: ["culture"], title: "Diving with Legends: Jeju's Sea Women (Haenyeo)" },
  { id: "t3XnwQ0xTKA", region: "jeju", cats: ["culture"], title: "Haenyeo, Wisdom of the Sea" },
  { id: "tKC4Ws9nF38", region: "jeju", cats: ["culture"], title: "World's Oldest Divers – Jeju Haenyeo" },
  { id: "P6H9y7tNfIE", region: "jeju", cats: ["food"], title: "Jeju Island Korean Seafood Tour (From $1 to $350)" },
  { id: "In8J_DwJ_GY", region: "jeju", cats: ["food"], title: "Massive Korean Seafood Hotpot – Seafood Tour of Jeju" },
  { id: "FSHRF_joORo", region: "jeju", cats: ["food"], title: "Korea's Best Seafood in Jeju" },
  { id: "5y0H7uNLS5c", region: "jeju", cats: ["food", "travel"], title: "Eating Through Korea's Food Island: Jeju" },

  // ---- 어서와 한국은 처음이지 (MBC every1) ----
  { show: "hello1stkorea", id: "TQ5Qvhl7hsY", region: "seoul", cats: ["travel"], title: "라망의 소원! 서울 시티투어 버스 타고 남산타워로 (EP.417)" },
  { show: "hello1stkorea", id: "YQns4VAN7r8", region: "seoul", cats: ["travel", "culture"], title: "27년 만에 한국 방문 – 난지도부터 여의도까지 (EP.433)" },
  { show: "hello1stkorea", id: "Bx09PpxOzMk", region: "seoul", cats: ["food"], title: "[하이라이트] 신촌 단골집에서 모듬 곱창에 살얼음 소맥, 한국 첫 한식!" },
  { show: "hello1stkorea", id: "XwCqH_8hGZ0", region: ["seoul", "gangwon"], cats: ["travel", "culture"], title: "[요약] 경복궁부터 KTX 타고 강릉으로 – 캐나다 다둥이 가족" },
  { show: "hello1stkorea", id: "8GBNRqTq9Ww", region: "gangwon", cats: ["travel"], title: "기대하던 강릉역에 도착한 캐나다 가족 (EP.427)" },
  { show: "hello1stkorea", id: "3v4YvmiZFzw", region: "gangwon", cats: ["travel"], title: "[하이라이트] 강릉 바다 보고 초흥분한 4남매" },
  { show: "hello1stkorea", id: "U5_MLHWltKw", region: "gyeonggi", cats: ["culture", "food"], title: "[요약] 제이미 로맥의 KBO 추억 여행 – 인천 문학경기장, 치맥 (EP.444)" },
  { show: "hello1stkorea", id: "2e02jJ6kBBI", region: "jeonbuk", cats: ["travel", "food", "culture"], title: "뉴질랜드 사 형제의 전주 여행 – 한정식, 경기전 (EP.266)" },
  { show: "hello1stkorea", id: "78d_mitSTVk", region: "jeonbuk", cats: ["food"], title: "(1시간) 파코, 전주에선 잘 먹었니? – 전주 한정식 하이라이트" },
  { show: "hello1stkorea", id: "mdpSZXJ6bUs", region: "jeonnam", cats: ["culture", "travel"], title: "외국인들의 전통 놀이 체험 – 낙안읍성 & 순천만 (EP.385)" },
  { show: "hello1stkorea", id: "ZJWdoRyWpRM", region: "busan", cats: ["travel"], title: "친구 찾아 부산행 – 해동용궁사 (EP.287)" },
  { show: "hello1stkorea", id: "f4nAamavqRI", region: "busan", cats: ["food", "culture"], title: "부전시장에서 발견한 K-기술 (EP.439)" },
  { show: "hello1stkorea", id: "-Lr84RSaIkY", region: "busan", cats: ["food"], title: "[하이라이트] 부전시장에서 그릇 72개 산 미슐랭 셰프들 + 김밥 첫 경험" },
  { show: "hello1stkorea", id: "XGrrzGKGqY0", region: "busan", cats: ["food"], title: "미슐랭 셰프들이 선택한 부산 저녁 – 족발 먹방 (EP.438)" },
  { show: "hello1stkorea", id: "5ThiIY-Kg60", region: "busan", cats: ["food"], title: "[하이라이트] 부산 족발거리 – 족발, 불족발, 냉채족발, 막국수" },
  { show: "hello1stkorea", id: "bPiNak40Pz8", region: "gyeongnam", cats: ["food", "culture"], title: "[하이라이트] 해녀를 위한 미슐랭 요리 – 갓 잡은 거제 해산물" },
  { show: "hello1stkorea", id: "uxGWG4hMsm4", region: "jeju", cats: ["travel", "food"], title: "제주 해산물 아침, 협재 오션뷰 카페, 흑돼지 (EP.303)" },
  { show: "hello1stkorea", id: "gwkq82E6M7k", region: "jeju", cats: ["travel"], title: "어서와 한국은 두 번째지? 제주에서 다시 만난 친구들 (EP.29-1)" },
  { show: "hello1stkorea", id: "mwblwy0tp7k", region: "jeju", cats: ["travel", "food"], title: "(4시간) 여름 분위기 낭낭한 제주도 여행 모음" },
  // 경북 (경주·영덕)
  { show: "hello1stkorea", id: "EvKxDH6sIpg", region: "gyeongbuk", cats: ["travel", "culture"], title: "[요약] 왔나~ 경주는 처음이제? 국립경주박물관 금관부터 신라의 달밤까지" },
  { show: "hello1stkorea", id: "DCmaXnAeqvo", region: "gyeongbuk", cats: ["travel"], title: "[연말특집] 외국인도 빠진 일출 맛집 영덕" },
  // 대구 (빌푸의 대구 10미)
  { show: "hello1stkorea", id: "8ul9Ntb1A-k", region: "daegu", cats: ["food"], title: "부디 대구 10미를 꼭 먹게 해주시길.. – 빌푸 (EP.173)" },
  { show: "hello1stkorea", id: "JwPTxmCxLyw", region: "daegu", cats: ["food"], title: "식감 최고! 대구 뭉티기에 빠진 빌푸 (EP.174-2)" },
  { show: "hello1stkorea", id: "d0FOaKHwetA", region: "daegu", cats: ["food"], title: "대구 10미 – 뭉티기와 찜갈비에 푹 빠진 빌푸 (EP.174-5)" },
  { show: "hello1stkorea", id: "tthpIMyA1n8", region: "daegu", cats: ["food", "travel"], title: "빌푸의 대구 서문시장 정복기 – 납작만두, 떡볶이, 누른국수" },
  { show: "hello1stkorea", id: "SWn6GyTHBOo", region: "daegu", cats: ["food"], title: "빌푸의 대구 맛집 투어 모음zip – 육개장, 무침회, 막창" },
  // 전남 (여수)
  { show: "hello1stkorea", id: "lOhVxViwHIY", region: "jeonnam", cats: ["travel", "food"], title: "독일 친구들의 여수 여행 – 집라인, 돌게장, 여수 밤바다 불꽃놀이 (EP.252)" },
  { show: "hello1stkorea", id: "_QKj8dcPqis", region: "jeonnam", cats: ["food", "travel"], title: "헝가리 셰프들의 여수 바다낚시와 두 번째 한국 여행 (EP.352)" },
  // 서울
  { show: "hello1stkorea", id: "Fi9S3woogeA", region: "seoul", cats: ["food"], title: "K-먹방의 성지 광장시장 – 멕시코 3인방의 산낙지 도전 (EP.2-3)" },
  { show: "hello1stkorea", id: "ou1ZkytFIUg", region: "seoul", cats: ["food"], title: "[하이라이트] 미슐랭 셰프들도 K-라면 홀릭 – 노량진 수산시장 새벽 해물라면" },
  { show: "hello1stkorea", id: "A7xvIScoliA", region: "seoul", cats: ["food"], title: "네덜란드 셰프들이 노량진에 떴다! 싱싱한 모듬회" },
  { show: "hello1stkorea", id: "qrXIsDyHuKg", region: "seoul", cats: ["food", "culture"], title: "노량진 수산시장에서 멘붕 온 외국인들 모음" },
  { show: "hello1stkorea", id: "HRmmssvPlsQ", region: "seoul", cats: ["travel"], title: "초고층 롯데타워에서 즐기는 액티비티 – 지상 541m (EP.186-3)" },
  { show: "hello1stkorea", id: "X7SP3-UYob8", region: "seoul", cats: ["travel"], title: "남산타워에 놀러 간 친구들 – 자물쇠 자판기에 멘붕 (EP.238-3)" },
  { show: "hello1stkorea", id: "wr-aNkV_KzQ", region: "seoul", cats: ["culture"], title: "캐나다 친구들, 전쟁기념관에서 마주한 분단의 현실 (EP.95-3)" },
  // 경기·인천
  { show: "hello1stkorea", id: "alWSFTtWpuk", region: "gyeonggi", cats: ["travel", "food"], title: "스웨덴 친구들의 강화도 루지 체험 – 적석사, 장어구이 (EP.276)" },
  { show: "hello1stkorea", id: "i4o2Bfp0nrM", region: "gyeonggi", cats: ["travel"], title: "네덜란드 친구들의 짜릿한 양평 패러글라이딩 (EP.93-3)" },
  // 경남
  { show: "hello1stkorea", id: "2B3dQAwuy7c", region: "gyeongnam", cats: ["travel"], title: "덴마크 친구들의 거제 바다 피크닉과 자전거 국토종주 마무리 (EP.405)" },
  { show: "hello1stkorea", id: "WiYtJv2v8Ro", region: "gyeongnam", cats: ["travel", "food"], title: "미슐랭 셰프들이 김해 도착하자마자 간 곳은? (EP.438)" },
  // 전남
  { show: "hello1stkorea", id: "0ksxWiHD-sM", region: "jeonnam", cats: ["travel"], title: "독일 세 친구들의 우당탕탕 여수 여행 시작 (EP.251)" },

  // ---- 백종원의 님아 그 시장을 가오 ----
  { show: "paikmarket", id: "2n2pcobA6DI", region: "jeonnam", cats: ["food"], title: "[EP.01 곡성] 백종원을 모르는 사장님의 찐한 콩국수집" },
  { show: "paikmarket", id: "oTJXvv6x7mQ", region: "gyeongbuk", cats: ["food"], title: "[EP.03 청도] 국밥 없는 국밥집" },
  { show: "paikmarket", id: "xZOgnxlWMSE", region: "chungcheong", cats: ["food"], title: "[EP.04 음성] 감곡시장 단돈 4000원 돼지국밥집" },
  { show: "paikmarket", id: "d8OciP6j7qc", region: "gyeongbuk", cats: ["food"], title: "[EP.05 경산] 국자는 사장님만 만질 수 있는 돼지찌개집" },
  { show: "paikmarket", id: "X-hXvN5MQRI", region: "gangwon", cats: ["food"], title: "[EP.07 동해] 음식 지적 좀 해주세요! 꽃게 요리집" },
  { show: "paikmarket", id: "dX8ys4uD9tY", region: "daegu", cats: ["food"], title: "[EP.10 대구] 테이블 하나 없이 56년 장사한 묵집" },
  { show: "paikmarket", id: "SVz1zNuyOyA", region: "jeonbuk", cats: ["food"], title: "[EP.14 진안] 하루 딱 3시간만 영업하는 순대국밥집" },
  { show: "paikmarket", id: "9qXUA5p7Ge0", region: "gangwon", cats: ["food"], title: "[EP.15 원주] 삼겹살은 역시 쌈! 쌈밥과 우리 술" },
  { show: "paikmarket", id: "zGsqGy5fZ8s", region: "gangwon", cats: ["food"], title: "[EP.18 속초] 회 밑에 국수가 깔린 회국수집" },
  { show: "paikmarket", id: "aK3ijuftswc", region: "chungcheong", cats: ["food"], title: "[EP.19 논산] 왼손에 술잔, 오른손에 고기" },
  { show: "paikmarket", id: "-LgE9gMN4Rs", region: "gangwon", cats: ["food"], title: "[EP.21 철원] 이게 물회예요? 철원 물회집" },
  { show: "paikmarket", id: "hvbh9EnL6Ww", region: "chungcheong", cats: ["food"], title: "[EP.22 천안] 이것보다 맛있으면 반칙! 묵은지 지짐이" },
  { show: "paikmarket", id: "iPLW-aOdq6I", region: "gangwon", cats: ["food"], title: "[EP.25 양구] 산더미처럼 퍼주는 육개장집" },
  { show: "paikmarket", id: "uX07TFcxKnY", region: "jeonnam", cats: ["food"], title: "[EP.27 고흥] 고흥 스페셜 한정판 문어코" },
  { show: "paikmarket", id: "rEhi5E11hT4", region: "gyeongbuk", cats: ["food"], title: "[EP.29 구미] 고기 반 마늘 반 돼지찌개" },
  { show: "paikmarket", id: "o8wHu_bjGnQ", region: "gyeongnam", cats: ["food"], title: "[EP.30 함양] 백종원도 당황한 비주얼의 대구뽈찜집" },
  { show: "paikmarket", id: "IBKaevIroGs", region: "chungcheong", cats: ["food"], title: "[EP.33 충주] 33년 막창구이집" },
  { show: "paikmarket", id: "A4xPw4IXb-g", region: "chungcheong", cats: ["food"], title: "[EP.38 청주] 하루에 4접시만 파는 수육집" },
  { show: "paikmarket", id: "S74RkwHeFUY", region: "chungcheong", cats: ["food"], title: "[EP.39 제천] 눈물 콧물 빼는 매운 오징어무침" },
  { show: "paikmarket", id: "MnEdGm6bp7A", region: "chungcheong", cats: ["food"], title: "[EP.41 대전] 행복분식집 쫄면과 만두" },
  { show: "paikmarket", id: "Kj3iNd_RmQ0", region: "gyeongbuk", cats: ["food"], title: "[EP.43 포항] 내 동생 진이가 알려준 바로 그것" },
  { show: "paikmarket", id: "or2TgTRjPq8", region: "gyeonggi", cats: ["food"], title: "[EP.45 인천] 못 먹으면 한 될까봐 다 시킨 중식집" },

  // ---- 허영만의 백반기행 (TV CHOSUN) ----
  { show: "baekban", id: "ZoCVb-0NxR8", region: "jeonnam", cats: ["food"], title: "목포 – 반찬 17가지 백반 한 상 (8회)" },
  { show: "baekban", id: "VKXiyaKPRMM", region: "jeonnam", cats: ["food"], title: "목포 중국집의 낯선 메뉴 '중깐'" },
  { show: "baekban", id: "u285VXiefgo", region: "jeonnam", cats: ["food"], title: "푸짐한 전라남도 인심 (143회)" },
  { show: "baekban", id: "zj_y6fI4P2g", region: "gyeonggi", cats: ["food"], title: "딱 5팀만! 봄을 옮겨놓은 양평 산나물 한 상" },
  { show: "baekban", id: "vARBHI7t4y0", region: "gyeongnam", cats: ["food"], title: "허영만의 진주 단골집 – 육회비빔밥" },
  { show: "baekban", id: "prxvrdsZbZw", region: "gyeongnam", cats: ["food"], title: "단돈 6천 원, 가성비 넘치는 통영 반찬" },
  { show: "baekban", id: "39J-3yy4dDg", region: "daegu", cats: ["food"], title: "전국적으로 이름 높은 대구 뭉티기 (142회)" },
  { show: "baekban", id: "WUBkecmzEs8", region: "busan", cats: ["food"], title: "4대째 100년 전통 부산 밀면 (145회)" },
  { show: "baekban", id: "YP-SCqkcut0", region: "busan", cats: ["food"], title: "맑게 우려낸 부산 돼지국밥" },
  { show: "baekban", id: "NOqk6VvuQno", region: "jeju", cats: ["food"], title: "제주 자리돔 코스와 제주식 물회 (113회)" },
  { show: "baekban", id: "DEFlTHLG5RU", region: "gangwon", cats: ["food", "travel"], title: "시장 가판대에서 대게 파는 속초 클래스 (159회)" },
  { show: "baekban", id: "q2LhzF2EV8c", region: "gangwon", cats: ["food"], title: "속초 60년 단일메뉴 숯불 생선구이 (75회)" },
  { show: "baekban", id: "Q_FPqZK7h70", region: "gangwon", cats: ["food"], title: "강원도 산간에서 즐기는 산나물 밥상 (141회)" },
];
