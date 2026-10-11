// 지역·카테고리 데이터와 영상 목록.
// 영상을 추가하려면 VIDEOS 배열에 { id, title, region, cats } 한 줄을 넣으면 됩니다.
//   id     : 유튜브 영상 ID (youtube.com/watch?v=XXXX 의 XXXX)
//   region : 아래 REGIONS 의 key
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
];
