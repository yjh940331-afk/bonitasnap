/* =============================================================
   BONITA SNAP · 사이트 설정 파일
   -------------------------------------------------------------
   ★ 사진과 텍스트는 대부분 여기서 수정합니다. (코딩 지식 X)
   ★ 사진 교체 방법
     1) images/ 폴더 안에 원하는 사진을 넣습니다. (.jpg .png 등)
     2) 아래 목록의 "src" 경로를 새 파일 이름으로 바꿉니다.
     3) 사진을 추가하려면 { } 항목을 복사해서 붙여넣고,
        빼려면 해당 { } 줄을 지웁니다.
   ============================================================= */

window.SITE_CONFIG = {

  /* --- 기본 정보 --- */
  brand: "BONITA SNAP",
  tagline: "아이폰으로 담는 가장 자연스러운 순간",
  phone: "010-0000-0000",
  email: "bonitasnap@email.com",
  instagram: "https://instagram.com/",   // 인스타그램 주소
  kakao: "https://pf.kakao.com/",          // 카카오톡 채널 주소

  /* --- 메인(히어로) 배경 사진 --- */
  hero: {
    image: "images/hero/hero-1.svg",
    title: "BONITA SNAP",
    subtitle: "결혼식, 그 하루를 가장 당신답게",
  },

  /* --- 포트폴리오 (사진 + 영상) ---
     category 값으로 필터 버튼이 동작합니다.
     사용 가능: "wedding"(본식) "family"(돌·가족) "event"(행사) "film"(영상)

     ▷ 사진 항목:  { src: "이미지경로", category: "...", caption: "..." }
     ▷ 영상 항목(mp4):  { type:"video", src:"videos/내영상.mp4", poster:"포스터이미지", category:"film", caption:"..." }
     ▷ 영상 항목(유튜브):  { type:"youtube", id:"유튜브영상ID", category:"film", caption:"..." }
        (유튜브 주소 youtu.be/XXXX 에서 XXXX 부분이 ID 입니다) */
  portfolio: [
    { type: "video", src: "videos/sample-film.mp4", poster: "images/portfolio/film-poster.jpg", category: "film", caption: "웨딩 필름" },
    { src: "images/portfolio/wedding-1.svg", category: "wedding", caption: "본식 스냅" },
    { src: "images/portfolio/wedding-2.svg", category: "wedding", caption: "본식 스냅" },
    { src: "images/portfolio/wedding-3.svg", category: "wedding", caption: "본식 스냅" },
    { src: "images/portfolio/family-1.svg",  category: "family",  caption: "돌·가족 스냅" },
    { src: "images/portfolio/family-2.svg",  category: "family",  caption: "돌·가족 스냅" },
    { src: "images/portfolio/family-3.svg",  category: "family",  caption: "돌·가족 스냅" },
    { src: "images/portfolio/event-1.svg",   category: "event",   caption: "행사 스냅" },
    { src: "images/portfolio/event-2.svg",   category: "event",   caption: "행사 스냅" },
    { src: "images/portfolio/event-3.svg",   category: "event",   caption: "행사 스냅" },
  ],

  /* --- 가격/상품 --- */
  products: [
    {
      name: "BONITA MOMENT",
      desc: "결혼식 본식 스냅",
      price: "350,000원~",
      features: ["원본 전체 제공", "보정본 30장", "촬영 3시간"],
    },
    {
      name: "BONITA DAY",
      desc: "돌잔치 · 가족 스냅",
      price: "300,000원~",
      features: ["원본 전체 제공", "보정본 25장", "촬영 2시간"],
    },
    {
      name: "BONITA EVENT",
      desc: "각종 행사 · 파티 스냅",
      price: "250,000원~",
      features: ["원본 전체 제공", "보정본 20장", "촬영 2시간"],
    },
  ],

  /* --- 자주 묻는 질문(Q&A) ---
     { q: "질문", a: "답변" } 형태. 추가/삭제 자유롭게 하세요.
     답변에 줄바꿈이 필요하면 \n 을 넣으면 됩니다. */
  faq: [
    { q: "정식으로 등록된 업체인가요?", a: "네, 사업자 등록을 마친 정식 업체입니다. 안심하고 예약하셔도 좋습니다." },
    { q: "촬영은 정말 아이폰으로만 진행되나요?", a: "맞습니다. 보니타스냅의 모든 결과물은 아이폰으로 촬영합니다. 무거운 장비 없이 가볍게 다가가 가장 자연스러운 순간을 담아냅니다." },
    { q: "원본 사진도 전부 받을 수 있나요?", a: "네, 촬영한 원본 전체를 제공해 드리며, 상품에 포함된 수량만큼 색감 보정본을 추가로 전달해 드립니다." },
    { q: "사진은 언제쯤 받아볼 수 있나요?", a: "원본은 촬영 후 2~3일 내 전달드리며, 보정본은 약 2주 내외로 작업해 보내드립니다. (성수기에는 다소 지연될 수 있습니다)" },
    { q: "예약은 어떻게 하나요? 예약금이 있나요?", a: "인스타그램 DM 또는 카카오톡 채널로 날짜와 장소를 알려주시면 안내해 드립니다. 예약금은 예약 확정 시 결제되며, 잔금은 촬영일에 정산합니다." },
    { q: "예약 취소·환불 규정이 궁금해요.", a: "촬영 30일 전 취소 시 예약금 전액 환불, 14일 전 50% 환불, 7일 이내 취소 시 환불이 어렵습니다. 자세한 일정은 문의 시 안내드립니다." },
    { q: "촬영 시간은 어떻게 되나요?", a: "상품별로 다릅니다. 본식 스냅은 약 3시간, 돌·가족/행사 스냅은 약 2시간 기준이며, 추가 시간은 30분당 별도 비용으로 연장 가능합니다." },
    { q: "신부 대기실·준비 과정부터 촬영되나요?", a: "메이크업 및 식장 도착 시간에 따라 가능합니다. 예약 시 원하시는 촬영 시작 시점을 말씀해 주세요." },
    { q: "영상 촬영도 함께 가능한가요?", a: "네, 아이폰 기반의 웨딩 필름 촬영도 함께 진행합니다. 스냅과 묶음 예약 시 더 합리적으로 안내해 드립니다." },
    { q: "촬영 가능 지역이 정해져 있나요?", a: "수도권을 기본으로 하며, 그 외 지역도 교통비 협의 후 촬영 가능합니다. 편하게 문의해 주세요." },
  ],

  /* --- 실제 후기 (Reviews) ---
     image 는 선택사항(후기와 함께 보여줄 사진). 없으면 비워두세요(""). */
  reviews: [
    { name: "김O은 신부님", date: "2026.04", venue: "그랜드 웨딩홀", image: "",
      text: "정말 자연스럽게 찍어주셔서 사진 받고 둘 다 울었어요. 부담스럽지 않게 다가와 주셔서 표정이 편하게 나왔어요!" },
    { name: "이O지 신부님", date: "2026.03", venue: "더채플 청담", image: "",
      text: "원본도 빨리 주시고 보정 톤이 너무 예뻐요. 하객분들도 어디서 찍었냐고 많이 물어봤어요." },
    { name: "박O수 신랑님", date: "2026.02", venue: "롯데호텔", image: "",
      text: "아이폰 스냅이라 걱정했는데 결과물 보고 깜짝 놀랐습니다. 감성적인 컷이 정말 많아요. 강력 추천!" },
  ],

  /* --- 예약 절차 (Process) --- */
  process: [
    { title: "문의 & 상담", desc: "인스타그램 DM 또는 카카오톡으로 예식일·예식장을 알려주세요." },
    { title: "예약 확정", desc: "예약금 결제로 일정을 확정합니다." },
    { title: "촬영 당일", desc: "가볍게 다가가 가장 자연스러운 순간을 담아냅니다." },
    { title: "원본 전달", desc: "촬영 후 2~3일 내 원본 전체를 전달해 드립니다." },
    { title: "보정본 완성", desc: "약 2주 내 색감 보정본을 보내드립니다." },
  ],

  /* --- 예약 문의 폼 ---
     endpoint: 폼 제출을 받을 Formspree 주소(https://formspree.io/f/xxxx).
       비워두면(""), 제출 시 메일 앱이 열려 위 email 주소로 보내집니다.
       Formspree(무료)에 가입해 주소를 넣으면 사장님 이메일로 자동 접수됩니다. */
  booking: {
    endpoint: "",
    note: "예식일과 예식장을 함께 남겨주시면 더 빠르게 안내해 드릴 수 있어요.",
  },

  /* --- 소개(About) --- */
  about: {
    image: "images/about/about-1.svg",
    title: "Natural & Timeless",
    body: [
      "보니타스냅은 아이폰으로 담아내는 결혼식 스냅 전문 팀입니다.",
      "무겁고 부담스러운 장비 대신, 가볍게 다가가 가장 편안한 표정과",
      "꾸밈없는 순간을 자연스럽게 기록합니다.",
      "당신의 하루가 가장 당신다운 모습으로 남도록 함께하겠습니다.",
    ],
  },
};
