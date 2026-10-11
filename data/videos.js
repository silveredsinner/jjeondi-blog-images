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
];
