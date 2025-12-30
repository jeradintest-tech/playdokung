# 🚀 플레이도경 빠른 시작 가이드

## 📋 필수 준비물

1. **GitHub 계정** (없다면 https://github.com 에서 무료 가입)
2. **Google Gemini API 키** (무료)
3. **Node.js 20 이상** (https://nodejs.org)

---

## ⚡ 5분 안에 시작하기

### 1단계: Google Gemini API 키 발급 (2분)

1. https://makersuite.google.com/app/apikey 접속
2. **"Get API Key"** 버튼 클릭
3. 프로젝트 선택 또는 새로 만들기
4. **"Create API key in existing project"** 클릭
5. 생성된 API 키 복사 (나중에 사용)

### 2단계: GitHub에 프로젝트 업로드 (3분)

1. **GitHub에서 새 저장소 만들기**
   - 저장소 이름: `playdokyung` (또는 원하는 이름)
   - Public으로 설정
   - README 추가 체크 해제

2. **로컬에서 프로젝트 업로드**
   ```bash
   cd playdokyung
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/jeradintest-tech/playdokyung.git
   git push -u origin main
   ```

### 3단계: GitHub Secrets 설정 (1분)

1. GitHub 저장소 페이지에서 **Settings** 클릭
2. 왼쪽 메뉴에서 **Secrets and variables** → **Actions** 클릭
3. **New repository secret** 버튼 클릭
4. Secret 추가:
   - Name: `GEMINI_API_KEY`
   - Secret: 1단계에서 복사한 API 키 붙여넣기
5. **Add secret** 클릭

### 4단계: GitHub Pages 활성화 (30초)

1. 저장소 **Settings** → **Pages** 클릭
2. **Source** 드롭다운에서 **GitHub Actions** 선택
3. 저장 (자동 저장됨)

### 5단계: 첫 배포 실행 (1분)

1. 저장소 상단의 **Actions** 탭 클릭
2. 왼쪽에서 **Daily News Update** 워크플로우 선택
3. **Run workflow** 버튼 클릭 → **Run workflow** 확인
4. 1-2분 기다리면 배포 완료!

### 6단계: 웹사이트 확인 ✅

브라우저에서 다음 주소로 접속:
```
https://당신의아이디.github.io/playdokyung/
```

---

## 🎯 이제 끝!

✅ 매일 오전 9시에 자동으로 뉴스가 업데이트됩니다
✅ 수동으로 업데이트하려면 Actions 탭에서 Run workflow 실행
✅ 문제가 생기면 Actions 탭에서 오류 로그 확인 가능

---

## 🔧 자주 묻는 질문 (FAQ)

### Q1. API 키가 무료인가요?
A. 네! Google Gemini API는 월 60회까지 무료입니다. 매일 한 번 실행하면 충분해요.

### Q2. 비용이 드나요?
A. **완전 무료**입니다! GitHub Pages와 GitHub Actions 모두 공개 저장소에서 무료로 사용 가능합니다.

### Q3. 뉴스 업데이트 시간을 변경하려면?
A. `.github/workflows/daily-update.yml` 파일의 cron 표현식을 수정하세요.
```yaml
schedule:
  - cron: '0 1 * * *'  # 오전 10시로 변경 (UTC+9)
```

### Q4. 뉴스가 업데이트 안 돼요!
A. Actions 탭에서 워크플로우 실행 로그를 확인하세요. 대부분 API 키 문제입니다.

### Q5. 카테고리를 추가하려면?
A. `scripts/fetchNews.js` 파일의 `RSS_FEEDS` 객체에 새 카테고리를 추가하세요.

---

## 📞 도움이 필요하신가요?

- GitHub Issues에 질문 올리기
- README.md 파일 자세히 읽어보기
- 커뮤니티에 질문하기

---

**🎉 축하합니다! 플레이도경이 이제 당신의 것입니다!**
