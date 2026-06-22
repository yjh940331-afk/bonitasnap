# BONITA SNAP 🤍

결혼식 아이폰 스냅 업체 **보니타스냅** 홈페이지입니다.
HTML/CSS/JavaScript로만 만든 가벼운 정적 사이트라, 서버 없이 바로 동작합니다.

## 📁 폴더 구조

```
bonitasnap/
├─ index.html            ← 페이지 본문
├─ css/style.css         ← 디자인 (색상·폰트는 맨 위 변수만 수정)
├─ js/
│  ├─ site-config.js     ← ★ 사진·텍스트·가격 수정하는 곳
│  └─ main.js            ← 동작 코드 (수정 불필요)
└─ images/               ← 사진 보관 폴더
   ├─ hero/              ← 메인 배경 사진
   ├─ about/            ← 소개 사진
   └─ portfolio/        ← 포트폴리오 사진
```

## ⭐ 사장님용 관리자 (Decap CMS · 코딩/토큰 필요 없음)

사장님은 **이메일·비밀번호로 로그인 → 사진 드래그 업로드 → Publish(게시)** 만 하면 됩니다.

### 여는 법
- 주소: **`https://bonitasnap.com/admin/`** (배포 후)
- Netlify에서 받은 **초대 메일**로 비밀번호를 한 번 설정하면, 이후엔 이메일/비번으로 로그인.
- 토큰·기기 설정 전혀 없음. 어느 폰/PC에서나 동일하게 사용.

### 할 수 있는 것 (모두 한 화면에서)
- 📷 포트폴리오 앨범 추가/삭제/순서, 앨범 안 사진 업로드, 🎬 유튜브 영상 ID로 영상 추가
- 🏠 기본 정보(인스타·카카오·블로그·유튜브), 메인/소개 문구·사진
- 💰 가격, 💬 후기, 🧭 예약 절차, ❓ Q&A, 📩 예약 폼 설정
- 수정 후 우측 상단 **Publish** → 1~2분 뒤 사이트 자동 반영

### 작동 구조
- 모든 내용은 `content/settings.json` 에 저장되고, 사이트가 이 파일을 읽어 화면을 그립니다.
- CMS 설정/스키마: `admin/config.yml`, 편집 UI: `admin/index.html`
- `js/site-config.js` 는 `settings.json` 이 없을 때를 대비한 기본값(폴백)입니다.

> 🔧 **개발자 1회 설정(Netlify)**: 저장소를 Netlify에 연결 → **Identity** 켜고 **invite only**로 설정 →
> **Git Gateway** 켜기 → 사장님 이메일 **Invite** → 도메인(bonitasnap.com)을 Netlify로 연결.
> (자세한 단계는 PR/대화 기록 참고)

---

## 🖼️ (개발자용) 사진을 코드로 직접 관리하기

관리자 페이지 대신 코드로 직접 바꾸고 싶다면, 모든 사진은 `js/site-config.js` 파일에서 관리합니다.

### 1. 사진 추가/교체
1. `images/portfolio/` 폴더에 원하는 사진을 넣습니다. (예: `my-photo.jpg`)
2. `js/site-config.js` 의 `portfolio` 목록에서 한 줄을 수정/추가합니다.

```js
portfolio: [
  { src: "images/portfolio/my-photo.jpg", category: "wedding", caption: "본식 스냅" },
  // ↑ 이런 줄을 복사해서 추가하면 사진이 늘어납니다.
],
```

- `src` : 사진 파일 경로
- `category` : `wedding`(본식) / `family`(돌·가족) / `event`(행사) 중 하나 → 필터 버튼과 연동
- `caption` : 사진 위에 마우스 올렸을 때 나오는 글자

### 2. 사진 빼기
빼고 싶은 `{ ... }` 줄을 통째로 지우면 됩니다.

### 3. 메인 배경 / 소개 사진 교체
`js/site-config.js` 의 `hero.image`, `about.image` 경로를 바꾸면 됩니다.

> 💡 현재 들어있는 `.svg` 파일들은 임시 샘플입니다.
> 보니타스냅의 실제 사진(jpg/png)으로 교체해 주세요.

### 4. 영상(필름) 넣기 🎬
포트폴리오에는 사진뿐 아니라 영상도 넣을 수 있습니다. 클릭하면 확대 재생됩니다.

- **내 영상 파일(mp4)을 올릴 때**: `videos/` 폴더에 mp4를 넣고
  ```js
  { type: "video", src: "videos/내영상.mp4", poster: "images/portfolio/포스터.jpg", category: "film", caption: "웨딩 필름" },
  ```
- **유튜브 영상을 연결할 때**: 주소 `youtu.be/ABCD1234` 에서 `ABCD1234` 부분만 넣으면 됩니다.
  ```js
  { type: "youtube", id: "ABCD1234", category: "film", caption: "웨딩 필름" },
  ```
- `poster` 는 영상 썸네일 이미지입니다. (유튜브는 생략하면 자동으로 가져옵니다)

### 5. 자주 묻는 질문(Q&A) 수정
`js/site-config.js` 의 `faq` 목록에서 `{ q: "질문", a: "답변" }` 을
추가/수정/삭제하면 됩니다. 답변 줄바꿈은 `\n` 으로 넣습니다.

## ✏️ 텍스트·가격·연락처 수정
`js/site-config.js` 안에서 브랜드명, 문구, 가격, 인스타그램/카카오 주소 등을
모두 수정할 수 있습니다.

## 🎨 색상·폰트 변경
`css/style.css` 맨 위의 `:root { ... }` 변수 값만 바꾸면 전체 톤이 바뀝니다.

## 🌐 무료로 배포하기 (GitHub Pages)
1. 이 폴더를 GitHub 저장소에 push 합니다.
2. GitHub 저장소 → **Settings → Pages** 이동
3. Branch를 `main` / `/(root)` 로 설정 후 저장
4. 잠시 뒤 `https://<아이디>.github.io/bonitasnap/` 주소로 접속됩니다.

## 💻 로컬에서 미리보기
`index.html` 파일을 더블클릭해서 브라우저로 열면 바로 확인할 수 있습니다.
