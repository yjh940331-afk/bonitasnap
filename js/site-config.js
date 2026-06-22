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

  /* --- 포트폴리오 사진들 ---
     category 값으로 필터 버튼이 동작합니다.
     사용 가능: "wedding"(본식) "family"(돌·가족) "event"(행사·스냅) */
  portfolio: [
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
