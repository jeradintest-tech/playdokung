# 📰 플레이도경 - 13세를 위한 경제 신문

매일 아침 9시, AI가 선별하고 재작성한 13세 눈높이의 경제·과학·기술 뉴스를 제공합니다.

## ✨ 주요 기능

- 🤖 **AI 자동 뉴스 수집**: Google Gemini API를 활용한 13세 맞춤 뉴스 재작성
- 📅 **매일 자동 업데이트**: GitHub Actions로 매일 오전 9시 자동 배포
- 🎨 **Windows 11 스타일 UI**: 깔끔하고 현대적인 디자인
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 최적화
- 🔍 **카테고리 필터**: 관심 있는 분야만 골라서 읽기
- ⚡ **정적 사이트**: 빠른 로딩 속도와 무료 호스팅

## 📚 뉴스 카테고리

- 💰 용돈
- 🏦 저축 팁
- 🎨 취미
- 📱 새로운 제품/기술
- 🔬 과학
- 🌤️ 날씨
- 📊 경제
- 🌍 세계 경제
- 🏠 부동산
- ⚽ 스포츠
- 🎮 게임
- 💻 테크
- 📚 지식
- 🌐 글로벌 이슈

## 🚀 시작하기

### 1. 저장소 클론

\`\`\`bash
git clone https://github.com/your-username/playdokyung.git
cd playdokyung
\`\`\`

### 2. 의존성 설치

Node.js 20 이상이 필요합니다.

\`\`\`bash
npm install
\`\`\`

### 3. 환경 변수 설정

\`.env\` 파일을 생성하고 API 키를 설정하세요:

\`\`\`bash
cp .env.example .env
\`\`\`

\`.env\` 파일 내용:
\`\`\`
GEMINI_API_KEY=your_gemini_api_key_here
NAVER_CLIENT_ID=your_naver_client_id (선택사항)
NAVER_CLIENT_SECRET=your_naver_client_secret (선택사항)
\`\`\`

**Google Gemini API 키 발급 방법:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. "Get API Key" 클릭
3. 새 프로젝트 생성 또는 기존 프로젝트 선택
4. API 키 복사하여 \`.env\`에 붙여넣기

### 4. 뉴스 수집 및 사이트 생성

\`\`\`bash
npm run build
\`\`\`

### 5. 로컬에서 확인

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 `http://localhost:3000` 열기

## 🔄 GitHub Pages 배포

### 1. GitHub 저장소 생성

1. GitHub에서 새 저장소 생성
2. 로컬 프로젝트와 연결:

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/playdokyung.git
git push -u origin main
\`\`\`

### 2. GitHub Secrets 설정

저장소 Settings → Secrets and variables → Actions에서:

- \`GEMINI_API_KEY\`: Google Gemini API 키
- \`NAVER_CLIENT_ID\` (선택사항): 네이버 API 클라이언트 ID
- \`NAVER_CLIENT_SECRET\` (선택사항): 네이버 API 시크릿

### 3. GitHub Pages 활성화

1. 저장소 Settings → Pages
2. Source: "GitHub Actions" 선택
3. 저장

### 4. 자동 배포 확인

- 매일 오전 9시(KST)에 자동 실행
- Actions 탭에서 실행 상태 확인
- 배포 완료 후 `https://your-username.github.io/playdokyung/`에서 확인

### 5. 수동 실행

Actions 탭 → Daily News Update → Run workflow

## 📁 프로젝트 구조

\`\`\`
playdokyung/
├── .github/
│   └── workflows/
│       └── daily-update.yml    # GitHub Actions 워크플로우
├── scripts/
│   ├── fetchNews.js           # 뉴스 수집 스크립트
│   ├── generateSite.js        # HTML 생성 스크립트
│   └── devServer.js           # 개발 서버
├── src/
│   └── news-data.json         # 수집된 뉴스 데이터
├── public/
│   └── index.html             # 생성된 웹사이트
├── package.json
├── .env.example
└── README.md
\`\`\`

## 🛠️ 사용된 기술

- **Node.js 20+**: 최신 JavaScript 런타임
- **Google Gemini API**: AI 뉴스 재작성
- **RSS Parser**: 뉴스 피드 수집
- **GitHub Actions**: CI/CD 자동화
- **GitHub Pages**: 무료 호스팅
- **Vanilla JavaScript**: 프론트엔드 인터랙션

## 📝 스크립트 명령어

\`\`\`bash
npm run fetch-news    # 뉴스 수집만 실행
npm run generate       # HTML 생성만 실행
npm run build          # 뉴스 수집 + HTML 생성
npm run dev            # 개발 서버 실행
\`\`\`

## 🎯 커스터마이징

### 뉴스 수집 시간 변경

\`.github/workflows/daily-update.yml\` 파일에서 cron 표현식 수정:

\`\`\`yaml
schedule:
  - cron: '0 0 * * *'  # 매일 오전 9시 (KST)
\`\`\`

### 뉴스 카테고리 추가

\`scripts/fetchNews.js\`에서 \`RSS_FEEDS\` 객체에 새 카테고리 추가:

\`\`\`javascript
const RSS_FEEDS = {
  '새카테고리': 'RSS_FEED_URL',
  // ...
};
\`\`\`

### 디자인 변경

\`scripts/generateSite.js\`의 CSS 섹션 수정

## 🔒 안전 기능

- 19금, 폭력, 범죄 관련 뉴스 자동 필터링
- 광고성 콘텐츠 제외
- 13세 눈높이에 맞는 순화된 표현

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 📧 문의

- 이슈 제기: [GitHub Issues](https://github.com/your-username/playdokyung/issues)
- 이메일: feedback@playdokyung.com

## 🌟 지원

이 프로젝트가 도움이 되었다면 ⭐️ 스타를 눌러주세요!

---

**Made with ❤️ for 13-year-olds learning about the world**
