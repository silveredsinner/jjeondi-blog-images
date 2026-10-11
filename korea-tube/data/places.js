// 지역별 여행 정보 + 영상에 나온 맛집·장소.
// 주소·영업시간은 바뀌기 쉬워 적지 않고, 지도 검색 링크(q)로 연결합니다.
// 다른 언어는 en 을 씁니다.

window.REGION_INFO = {
  seoul: {
    ko: { intro: "궁궐과 전통시장, 한강과 야경이 한 도시에 모인 한국의 수도.", foods: ["삼겹살", "빈대떡·육회(광장시장)", "곱창", "해물라면(노량진)"], spots: ["경복궁", "북촌한옥마을", "남산서울타워", "광장시장", "롯데월드타워"] },
    en: { intro: "Korea's capital, where royal palaces, traditional markets, the Han River and city lights meet.", foods: ["Samgyeopsal (pork belly)", "Bindaetteok & yukhoe at Gwangjang", "Gopchang", "Seafood ramyeon at Noryangjin"], spots: ["Gyeongbokgung Palace", "Bukchon Hanok Village", "N Seoul Tower", "Gwangjang Market", "Lotte World Tower"] },
  },
  gyeonggi: {
    ko: { intro: "서울 근교 당일치기 명소. 수원화성, 인천 차이나타운, 강화도까지.", foods: ["수원 왕갈비·통닭", "인천 짜장면", "강화도 장어구이"], spots: ["수원화성", "인천 차이나타운", "월미도", "강화도"] },
    en: { intro: "Easy day trips from Seoul: Suwon's fortress, Incheon Chinatown and Ganghwa Island.", foods: ["Suwon galbi & fried chicken", "Incheon jajangmyeon", "Ganghwa grilled eel"], spots: ["Hwaseong Fortress", "Incheon Chinatown", "Wolmido", "Ganghwa Island"] },
  },
  gangwon: {
    ko: { intro: "동해 바다와 설악산, 남이섬이 있는 자연 여행지.", foods: ["춘천 닭갈비", "속초 대게·회국수", "강릉 초당순두부", "막국수"], spots: ["남이섬", "속초 관광수산시장", "설악산", "강릉 경포·안목해변"] },
    en: { intro: "Nature escapes: the East Sea coast, Seoraksan and Nami Island.", foods: ["Chuncheon dakgalbi", "Sokcho snow crab & hoe-guksu", "Gangneung chodang tofu", "Makguksu"], spots: ["Nami Island", "Sokcho Seafood Market", "Seoraksan", "Gangneung beaches"] },
  },
  chungcheong: {
    ko: { intro: "백제의 옛 수도 공주·부여와 빵의 도시 대전.", foods: ["성심당 빵", "충주 막창", "청주 수육", "논산·천안 시장 음식"], spots: ["성심당(대전)", "부여 백제문화단지", "공주 공산성", "단양"] },
    en: { intro: "Baekje-era capitals Gongju and Buyeo, and Daejeon, the bread city.", foods: ["Sungsimdang bakery", "Chungju makchang", "Cheongju suyuk", "Local market food"], spots: ["Sungsimdang (Daejeon)", "Baekje Cultural Land", "Gongsanseong Fortress", "Danyang"] },
  },
  jeonbuk: {
    ko: { intro: "유네스코 음식창의도시 전주와 한옥마을.", foods: ["전주 비빔밥", "떡갈비", "한정식", "막걸리 골목 안주"], spots: ["전주 한옥마을", "경기전", "남부시장 야시장"] },
    en: { intro: "Jeonju, a UNESCO City of Gastronomy, and its hanok village.", foods: ["Jeonju bibimbap", "Tteokgalbi", "Hanjeongsik", "Makgeolli alley dishes"], spots: ["Jeonju Hanok Village", "Gyeonggijeon Shrine", "Nambu Night Market"] },
  },
  jeonnam: {
    ko: { intro: "여수 밤바다, 순천만, 담양 대나무숲, 남도 한상의 고장.", foods: ["여수 돌게장", "목포 중깐·홍어", "담양 떡갈비", "남도 한정식"], spots: ["여수 해상케이블카", "순천만습지", "낙안읍성", "담양 죽녹원"] },
    en: { intro: "Yeosu by night, Suncheon Bay, Damyang bamboo and generous Namdo tables.", foods: ["Yeosu crab in soy sauce", "Mokpo jung-kkan & hongeo", "Damyang tteokgalbi", "Namdo hanjeongsik"], spots: ["Yeosu Maritime Cable Car", "Suncheonman Bay", "Naganeupseong", "Damyang Juknokwon"] },
  },
  gyeongbuk: {
    ko: { intro: "천년 신라의 수도 경주와 안동 하회마을.", foods: ["안동 찜닭", "경주 황리단길 맛집", "포항 물회"], spots: ["불국사", "국립경주박물관", "황리단길", "안동 하회마을"] },
    en: { intro: "Gyeongju, Silla's thousand-year capital, and Andong's Hahoe Village.", foods: ["Andong jjimdak", "Hwangnidan-gil eats", "Pohang mulhoe"], spots: ["Bulguksa Temple", "Gyeongju National Museum", "Hwangnidan-gil", "Hahoe Village"] },
  },
  daegu: {
    ko: { intro: "'대구 10미'로 유명한 미식 도시.", foods: ["뭉티기", "막창", "납작만두", "찜갈비", "누른국수"], spots: ["서문시장", "김광석다시그리기길", "동성로"] },
    en: { intro: "A food city famous for its 'Daegu 10 Flavors'.", foods: ["Mungtigi (raw beef)", "Makchang", "Napjak mandu", "Jjimgalbi", "Nureun guksu"], spots: ["Seomun Market", "Kim Kwang-seok Street", "Dongseong-ro"] },
  },
  gyeongnam: {
    ko: { intro: "통영·거제의 남해 바다와 진주냉면, 진해 벚꽃.", foods: ["진주냉면", "통영 해산물·충무김밥", "거제 해산물"], spots: ["통영", "거제도", "진해 군항제", "해인사"] },
    en: { intro: "The southern sea of Tongyeong and Geoje, Jinju naengmyeon and Jinhae cherry blossoms.", foods: ["Jinju naengmyeon", "Tongyeong seafood & Chungmu gimbap", "Geoje seafood"], spots: ["Tongyeong", "Geoje Island", "Jinhae Cherry Blossom Festival", "Haeinsa Temple"] },
  },
  busan: {
    ko: { intro: "바다와 시장의 도시. 해운대부터 자갈치까지.", foods: ["돼지국밥", "밀면", "족발", "자갈치 회", "어묵"], spots: ["해운대", "감천문화마을", "자갈치시장", "해동용궁사", "부전시장"] },
    en: { intro: "A city of sea and markets, from Haeundae to Jagalchi.", foods: ["Dwaeji gukbap", "Milmyeon", "Jokbal", "Jagalchi sashimi", "Eomuk (fish cake)"], spots: ["Haeundae", "Gamcheon Culture Village", "Jagalchi Market", "Haedong Yonggungsa", "Bujeon Market"] },
  },
  jeju: {
    ko: { intro: "화산섬의 자연과 해녀 문화, 흑돼지의 섬.", foods: ["흑돼지", "자리물회", "갈치·고등어구이", "해산물"], spots: ["성산일출봉", "협재해변", "동문시장", "흑돼지거리", "해녀박물관"] },
    en: { intro: "A volcanic island of haenyeo divers, black pork and sea views.", foods: ["Black pork", "Jari mulhoe", "Grilled cutlassfish", "Seafood"], spots: ["Seongsan Ilchulbong", "Hyeopjae Beach", "Dongmun Market", "Black Pork Street", "Haenyeo Museum"] },
  },
};

// 영상에 나온 맛집·장소. type: "restaurant" | "market" | "spot"
// videos: 이 장소가 나오는 영상 ID (VIDEOS 에 있어야 버튼이 생김)
window.PLACES = [
  // 서울
  { region: "seoul", type: "market", ko: "광장시장", en: "Gwangjang Market", q: "광장시장", menu_ko: "빈대떡, 육회, 마약김밥", menu_en: "Bindaetteok, yukhoe, mayak gimbap", videos: ["2rz-TU7154k", "kCxQIHYQQqs", "Fi9S3woogeA"] },
  { region: "seoul", type: "market", ko: "노량진수산시장", en: "Noryangjin Fish Market", q: "노량진수산시장", menu_ko: "모듬회, 해물라면", menu_en: "Sashimi platter, seafood ramyeon", videos: ["ou1ZkytFIUg", "A7xvIScoliA", "qrXIsDyHuKg"] },
  { region: "seoul", type: "spot", ko: "경복궁", en: "Gyeongbokgung Palace", q: "경복궁", menu_ko: "한복 입고 궁궐 산책", menu_en: "Palace walk in hanbok", videos: ["25Mc2ccrvdA", "5EHAnSu08e4"] },
  { region: "seoul", type: "spot", ko: "남산서울타워", en: "N Seoul Tower", q: "남산서울타워", menu_ko: "야경, 사랑의 자물쇠", menu_en: "Night views, love locks", videos: ["TQ5Qvhl7hsY", "X7SP3-UYob8"] },
  { region: "seoul", type: "spot", ko: "봉은사 템플스테이", en: "Bongeunsa Templestay", q: "봉은사", menu_ko: "템플스테이 체험", menu_en: "Templestay program", videos: ["-EpYVDdr28U"] },
  // 경기·인천
  { region: "gyeonggi", type: "spot", ko: "인천 차이나타운", en: "Incheon Chinatown", q: "인천 차이나타운", menu_ko: "짜장면 발상지", menu_en: "Birthplace of jajangmyeon", videos: ["CIwOoy7lD0g", "x1O55IpAtnc", "KAxu61ssQ1A"] },
  { region: "gyeonggi", type: "spot", ko: "수원화성", en: "Hwaseong Fortress", q: "수원화성", menu_ko: "유네스코 세계유산 성곽", menu_en: "UNESCO-listed fortress", videos: ["8lCF6H8Ee5A", "QAQAGVBL51o", "u28jZSGAXBE"] },
  // 강원
  { region: "gangwon", type: "market", ko: "속초관광수산시장", en: "Sokcho Tourist & Fishery Market", q: "속초관광수산시장", menu_ko: "닭강정, 오징어순대, 대게", menu_en: "Dakgangjeong, squid sundae, snow crab", videos: ["JhhFYZWjybg", "pUFen3b4yYo", "DEFlTHLG5RU"] },
  { region: "gangwon", type: "restaurant", ko: "춘천명물닭갈비", en: "Chuncheon Myeongmul Dakgalbi", q: "춘천명물닭갈비", menu_ko: "닭갈비 (남이섬 가는 길)", menu_en: "Dakgalbi near Nami Island", videos: ["4XSsFNsQstA"] },
  { region: "gangwon", type: "spot", ko: "남이섬", en: "Nami Island", q: "남이섬", menu_ko: "메타세쿼이아 길", menu_en: "Tree-lined paths", videos: ["4XSsFNsQstA", "QMHjjtCd7Zc"] },
  // 충청·대전
  { region: "chungcheong", type: "restaurant", ko: "성심당", en: "Sungsimdang Bakery", q: "성심당 본점", menu_ko: "튀김소보로 등 빵", menu_en: "Fried soboro bread and more", videos: ["FQGLz3pzM2w", "qP4V8QnY_WE", "pT0PfB24lVI"] },
  { region: "chungcheong", type: "restaurant", ko: "행복분식 (대전)", en: "Haengbok Bunsik (Daejeon)", q: "대전 행복분식", menu_ko: "쫄면, 만두", menu_en: "Jjolmyeon, dumplings", videos: ["MnEdGm6bp7A"] },
  { region: "chungcheong", type: "restaurant", ko: "토종마을 (음성 감곡시장)", en: "Tojong Maeul (Eumseong)", q: "음성 감곡 토종마을", menu_ko: "4000원 돼지국밥", menu_en: "Pork soup with rice", videos: ["xZOgnxlWMSE"] },
  { region: "chungcheong", type: "spot", ko: "백제문화단지 (부여)", en: "Baekje Cultural Land (Buyeo)", q: "백제문화단지", menu_ko: "백제 왕궁 재현", menu_en: "Reconstructed Baekje palace", videos: ["O6TiJrfHIr0", "lvJ1P-Z-AGQ"] },
  // 전북
  { region: "jeonbuk", type: "spot", ko: "전주 한옥마을", en: "Jeonju Hanok Village", q: "전주한옥마을", menu_ko: "비빔밥, 길거리 음식, 한복 체험", menu_en: "Bibimbap, street food, hanbok", videos: ["YGWFWpd0AjY", "1JqvLe8gGS0", "2e02jJ6kBBI"] },
  // 전남
  { region: "jeonnam", type: "spot", ko: "순천만습지", en: "Suncheonman Bay Wetland", q: "순천만습지", menu_ko: "갈대밭 생태 여행", menu_en: "Reed fields & wetlands", videos: ["mdpSZXJ6bUs"] },
  { region: "jeonnam", type: "spot", ko: "낙안읍성", en: "Naganeupseong Folk Village", q: "낙안읍성", menu_ko: "조선시대 마을", menu_en: "Joseon-era village", videos: ["mdpSZXJ6bUs"] },
  { region: "jeonnam", type: "spot", ko: "담양 죽녹원", en: "Damyang Juknokwon", q: "죽녹원", menu_ko: "대나무숲", menu_en: "Bamboo forest", videos: ["B7Zcf9oSjTk"] },
  // 경북
  { region: "gyeongbuk", type: "spot", ko: "국립경주박물관", en: "Gyeongju National Museum", q: "국립경주박물관", menu_ko: "신라 금관", menu_en: "Silla gold crowns", videos: ["EvKxDH6sIpg"] },
  { region: "gyeongbuk", type: "spot", ko: "안동 하회마을", en: "Andong Hahoe Village", q: "안동하회마을", menu_ko: "유네스코 전통마을", menu_en: "UNESCO folk village", videos: ["bZ0CTEahxpY", "gHJ1wy5nrwg"] },
  { region: "gyeongbuk", type: "spot", ko: "골굴사", en: "Golgulsa Temple", q: "골굴사", menu_ko: "선무도, 템플스테이", menu_en: "Sunmudo & templestay", videos: ["3_lbDaSgKnk"] },
  // 대구
  { region: "daegu", type: "market", ko: "서문시장", en: "Seomun Market", q: "대구 서문시장", menu_ko: "납작만두, 누른국수, 야시장", menu_en: "Napjak mandu, noodles, night market", videos: ["tthpIMyA1n8", "ncRLdVWQ9lY"] },
  // 경남
  { region: "gyeongnam", type: "restaurant", ko: "박군자진주냉면", en: "Parkgunja Jinju Naengmyeon", q: "박군자진주냉면", menu_ko: "진주냉면", menu_en: "Jinju-style cold noodles", videos: ["VTksE8CVpW0"] },
  { region: "gyeongnam", type: "spot", ko: "해인사", en: "Haeinsa Temple", q: "해인사", menu_ko: "템플스테이", menu_en: "Templestay", videos: ["P9qpZ_5m1dY"] },
  { region: "gyeongnam", type: "spot", ko: "진해 군항제", en: "Jinhae Cherry Blossom Festival", q: "진해 여좌천", menu_ko: "벚꽃 명소 (봄)", menu_en: "Cherry blossoms (spring)", videos: ["qSK6yJ5XM6U", "7Dz3rR8_CFY"] },
  // 부산
  { region: "busan", type: "market", ko: "자갈치시장", en: "Jagalchi Market", q: "자갈치시장", menu_ko: "회, 해산물", menu_en: "Sashimi & seafood", videos: ["7hh7kDo-M_Q", "Bl3O9xqKFwU", "XDfDtwXQ1f4"] },
  { region: "busan", type: "market", ko: "부전시장", en: "Bujeon Market", q: "부전시장", menu_ko: "전통시장 먹거리, 주방용품", menu_en: "Market food & kitchenware", videos: ["f4nAamavqRI", "-Lr84RSaIkY"] },
  { region: "busan", type: "spot", ko: "부평동 족발골목", en: "Bupyeong-dong Jokbal Alley", q: "부산 족발골목", menu_ko: "족발, 냉채족발", menu_en: "Jokbal, cold jokbal salad", videos: ["5ThiIY-Kg60", "XGrrzGKGqY0"] },
  { region: "busan", type: "spot", ko: "감천문화마을", en: "Gamcheon Culture Village", q: "감천문화마을", menu_ko: "알록달록 언덕 마을", menu_en: "Colorful hillside village", videos: ["wiZEP4pxOts", "jP6rtQWgFs8"] },
  { region: "busan", type: "spot", ko: "해동용궁사", en: "Haedong Yonggungsa", q: "해동용궁사", menu_ko: "바닷가 사찰", menu_en: "Seaside temple", videos: ["ZJWdoRyWpRM"] },
  // 제주
  { region: "jeju", type: "restaurant", ko: "늘봄흑돼지", en: "Neulbom Heukdwaeji", q: "늘봄흑돼지", menu_ko: "흑돼지 구이", menu_en: "Grilled black pork", videos: ["stUKYEYBXfU"] },
  { region: "jeju", type: "market", ko: "동문시장 · 흑돼지거리", en: "Dongmun Market & Black Pork Street", q: "제주 동문시장", menu_ko: "흑돼지, 길거리 음식", menu_en: "Black pork, street food", videos: ["w12hNrPkBxQ"] },

  // ---- 백종원의 님아 그 시장을 가오: 웹 검색으로 가게 이름을 확인한 편 ----
  // 출처: 블로그·기사 정리글(편 번호·지역·가게명이 영상 제목과 일치하는 것만). 청도·동해·속초·논산·충주·인천 편은 확인 못 해 제외.
  { region: "jeonnam", type: "restaurant", ko: "청보석 (곡성)", en: "Cheongboseok (Gokseong)", q: "곡성 청보석", menu_ko: "직접 농사지은 콩으로 만든 콩국수", menu_en: "Kongguksu (cold soybean noodles)", videos: ["2n2pcobA6DI"] },
  { region: "gyeongbuk", type: "restaurant", ko: "진량돼지찌개 (경산)", en: "Jinryang Dwaeji Jjigae (Gyeongsan)", q: "경산 진량돼지찌개", menu_ko: "돼지찌개", menu_en: "Pork stew", videos: ["d8OciP6j7qc"] },
  { region: "daegu", type: "restaurant", ko: "할매묵집 (대구 달서구)", en: "Halmae Mukjip (Daegu)", q: "대구 달서구 할매묵집", menu_ko: "메밀묵채, 도토리묵채", menu_en: "Buckwheat & acorn jelly soup", videos: ["dX8ys4uD9tY"] },
  { region: "jeonbuk", type: "restaurant", ko: "시골순대 (진안)", en: "Sigol Sundae (Jinan)", q: "진안 시골순대", menu_ko: "순대국밥 (하루 3시간 영업)", menu_en: "Sundae gukbap (open ~3 hrs a day)", videos: ["SVz1zNuyOyA"] },
  { region: "gangwon", type: "restaurant", ko: "고향보리밥 (원주)", en: "Gohyang Boribap (Wonju)", q: "원주 고향보리밥", menu_ko: "쌈밥정식, 삼겹살", menu_en: "Ssambap set, pork belly", videos: ["9qXUA5p7Ge0"] },
  { region: "gangwon", type: "restaurant", ko: "성환식당 (철원)", en: "Seonghwan Sikdang (Cheorwon)", q: "철원 성환식당", menu_ko: "오징어 물회", menu_en: "Squid mulhoe", videos: ["-LgE9gMN4Rs"] },
  { region: "gangwon", type: "restaurant", ko: "파로호국밥 (양구)", en: "Paroho Gukbap (Yanggu)", q: "양구 파로호국밥", menu_ko: "육개장, 국밥", menu_en: "Yukgaejang, gukbap", videos: ["iPLW-aOdq6I"] },
  { region: "chungcheong", type: "restaurant", ko: "할매묵은지지짐이 (천안)", en: "Halmae Mugeunji Jijimi (Cheonan)", q: "천안 할매묵은지지짐이", menu_ko: "묵은지 지짐이", menu_en: "Braised aged kimchi", videos: ["hvbh9EnL6Ww"] },
  { region: "chungcheong", type: "restaurant", ko: "우암설렁탕 (청주)", en: "Uam Seolleongtang (Cheongju)", q: "청주 우암설렁탕", menu_ko: "수육 (하루 4접시 한정), 설렁탕", menu_en: "Suyuk (4 plates a day), seolleongtang", videos: ["A4xPw4IXb-g"] },
  { region: "chungcheong", type: "restaurant", ko: "월성집 (제천)", en: "Wolseongjip (Jecheon)", q: "제천 월성집", menu_ko: "매운 오징어무침", menu_en: "Spicy squid salad", videos: ["S74RkwHeFUY"] },
  { region: "jeonnam", type: "restaurant", ko: "신성식당 (고흥 녹동)", en: "Sinseong Sikdang (Goheung)", q: "고흥 녹동 신성식당", menu_ko: "문어 요리 (문어코는 계절 한정)", menu_en: "Octopus dishes (seasonal)", videos: ["uX07TFcxKnY"] },
  { region: "gyeongbuk", type: "restaurant", ko: "도산식육식당 (구미)", en: "Dosan Sigyuk Sikdang (Gumi)", q: "구미 도산식육식당", menu_ko: "마늘 듬뿍 돼지찌개", menu_en: "Garlicky pork stew", videos: ["rEhi5E11hT4"] },
  { region: "gyeongnam", type: "restaurant", ko: "달동네식당 (함양)", en: "Daldongne Sikdang (Hamyang)", q: "함양 달동네식당", menu_ko: "대구뽈찜", menu_en: "Braised cod cheeks", videos: ["o8wHu_bjGnQ"] },
  { region: "gyeongbuk", type: "restaurant", ko: "우현해물찜 (포항)", en: "Uhyeon Haemuljjim (Pohang)", q: "포항 우현해물찜", menu_ko: "아귀찜", menu_en: "Braised monkfish", videos: ["Kj3iNd_RmQ0"] },
];
