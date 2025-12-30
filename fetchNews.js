import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const parser = new Parser({
  customFields: {
    item: ['description', 'pubDate', 'link', 'content:encoded']
  },
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 실제로 작동하는 RSS 피드 (2024-2025년 검증됨)
const RSS_FEEDS = {
  '경제': 'https://www.mk.co.kr/rss/30100041/',
  '세계경제': 'https://www.hankyung.com/feed/economy',
  '사회': 'http://rss.nocutnews.co.kr/NocutSocial.xml',
  '정치': 'http://www.khan.co.kr/rss/rssdata/politic.xml',
  'IT과학': 'http://www.khan.co.kr/rss/rssdata/itnews.xml',
  '스포츠': 'http://www.khan.co.kr/rss/rssdata/sports.xml',
  '문화': 'http://rss.donga.com/culture.xml',
  '생활': 'http://rss.hankooki.com/news/hk_life.xml'
};

// 제외할 키워드
const EXCLUDE_KEYWORDS = [
  '성인', '19금', '쇼핑몰', '광고', '협찬', 
  '아이돌', '연예인', '드라마', '영화', '음악',
  '사망', '살인', '폭력', '자살', '범죄'
];

// 뉴스 필터링
function filterNews(item) {
  const title = item.title || '';
  const description = item.contentSnippet || item.description || '';
  const content = `${title} ${description}`.toLowerCase();
  
  // 제외 키워드 체크
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (content.includes(keyword.toLowerCase())) {
      return false;
    }
  }
  
  // 너무 짧은 내용 제외
  if (title.length < 10) {
    return false;
  }
  
  return true;
}

// AI로 13세 눈높이에 맞게 재작성
async function rewriteForKids(article, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // gemini-1.5-flash 모델 사용
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      const prompt = `당신은 13세 청소년을 위한 뉴스 작가입니다. 다음 뉴스를 13세가 이해하기 쉽고 흥미롭게 재작성해주세요.

원본 뉴스:
제목: ${article.title}
내용: ${article.contentSnippet || article.description || ''}

요구사항:
1. 제목은 간결하고 호기심을 자극하는 방식으로 (30자 이내), 이모지 1개 포함
2. 본문은 150-200자 정도로 핵심만 담아서
3. 어려운 경제/전문 용어는 쉬운 말로 설명
4. 13세가 공감할 수 있는 예시나 비유 사용
5. 긍정적이고 교육적인 톤으로 작성
6. 부정적이거나 폭력적인 내용은 순화하여 표현

반드시 JSON 형식으로만 답변하고, 다른 설명은 추가하지 마세요:
{
  "title": "재작성된 제목",
  "summary": "재작성된 본문",
  "category": "가장 적합한 카테고리 (용돈, 저축팁, 취미, 새로운제품기술, 과학, 날씨, 경제, 세계경제, 부동산, 스포츠, 게임, 테크, 지식 중 하나)",
  "readingTime": "2"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // 백틱이나 마크다운 코드 블록 제거
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // JSON 파싱 시도
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // 필수 필드 확인
          if (!parsed.title || !parsed.summary || !parsed.category) {
            console.log(`   ⚠️  필수 필드 누락`);
            continue;
          }
          
          return {
            title: parsed.title,
            summary: parsed.summary,
            category: parsed.category,
            readingTime: parsed.readingTime || "2",
            originalLink: article.link,
            pubDate: article.pubDate || article.isoDate || new Date().toISOString()
          };
        } catch (parseError) {
          console.log(`   ⚠️  JSON 파싱 오류: ${parseError.message}`);
          continue;
        }
      } else {
        console.log(`   ⚠️  JSON 형식을 찾을 수 없음. 응답: ${text.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.error(`   ⚠️  AI 재작성 시도 ${attempt + 1}/${retries} 실패:`, error.message);
      
      // API 키 오류인 경우 즉시 종료
      if (error.message.includes('API_KEY_INVALID') || 
          error.message.includes('API key not valid') ||
          error.message.includes('invalid')) {
        console.error('\n❌ API 키 오류! GEMINI_API_KEY를 확인하세요.');
        console.error('💡 https://aistudio.google.com/app/apikey 에서 키를 발급받으세요.\n');
        process.exit(1);
      }
      
      // 모델 오류인 경우
      if (error.message.includes('not found for API version') || 
          error.message.includes('404') ||
          error.message.includes('not supported')) {
        console.error('\n❌ 모델 오류! gemini-1.5-flash 모델을 사용할 수 없습니다.');
        console.error('💡 API 키가 최신 SDK와 호환되는지 확인하세요.');
        console.error('💡 또는 Google AI Studio에서 새 API 키를 발급받으세요.\n');
        process.exit(1);
      }
      
      if (attempt < retries - 1) {
        console.log(`   ⏳ 3초 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  return null;
}

// RSS 피드 가져오기
async function fetchFeed(feedUrl, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const feed = await parser.parseURL(feedUrl);
      return feed;
    } catch (error) {
      console.error(`   ⚠️  피드 가져오기 시도 ${i + 1}/${retries} 실패: ${error.message}`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// 메인 함수
async function fetchNews() {
  console.log('📰 뉴스 수집 시작...');
  console.log(`⏰ 시작 시간: ${new Date().toLocaleString('ko-KR')}\n`);
  
  // API 키 확인
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다!');
    console.error('💡 .env 파일에 GEMINI_API_KEY=your_api_key를 추가하세요.');
    console.error('💡 https://aistudio.google.com/app/apikey 에서 키를 발급받으세요.\n');
    process.exit(1);
  }
  
  // API 키 유효성 간단 체크
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`🔑 API Key: ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`);
  console.log('🤖 사용 모델: gemini-1.5-flash');
  console.log('📦 SDK: @google/generative-ai v0.21.0+');
  console.log('🌐 API Version: v1beta (default)\n');
  
  const allArticles = [];
  let successCount = 0;
  let failCount = 0;
  
  // 각 카테고리별 RSS 피드에서 뉴스 수집
  for (const [category, feedUrl] of Object.entries(RSS_FEEDS)) {
    try {
      console.log(`📡 ${category} 뉴스 가져오는 중...`);
      console.log(`   URL: ${feedUrl}`);
      
      const feed = await fetchFeed(feedUrl);
      console.log(`   ✓ 수집된 항목: ${feed.items.length}개`);
      
      // 최대 2개씩만 수집
      const items = feed.items.slice(0, 2).filter(filterNews);
      console.log(`   ✓ 필터링 후: ${items.length}개`);
      
      for (const item of items) {
        const titlePreview = item.title?.substring(0, 40) || '제목 없음';
        console.log(`   🤖 AI 변환 중: ${titlePreview}...`);
        
        const rewritten = await rewriteForKids(item);
        
        if (rewritten) {
          allArticles.push(rewritten);
          successCount++;
          console.log(`   ✅ ${rewritten.title}`);
        } else {
          failCount++;
          console.log(`   ❌ AI 변환 최종 실패`);
        }
        
        // API 레이트 리밋 고려 (안전 마진)
        console.log(`   ⏱️  다음 요청까지 5초 대기...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      console.log('');
    } catch (error) {
      failCount++;
      console.error(`❌ ${category} 피드 오류:`, error.message);
      console.log('');
    }
  }
  
  // 날짜순 정렬
  allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  // 최대 13개로 제한
  const selectedArticles = allArticles.slice(0, 13);
  
  console.log('='.repeat(60));
  console.log(`📊 수집 완료 통계:`);
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${failCount}개`);
  console.log(`   📰 최종 선택: ${selectedArticles.length}개`);
  console.log('='.repeat(60));
  
  // 데이터 저장
  const dataDir = path.join(process.cwd(), 'src');
  await fs.mkdir(dataDir, { recursive: true });
  
  const newsData = {
    generatedAt: new Date().toISOString(),
    generatedAtKST: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    articles: selectedArticles,
    totalCount: selectedArticles.length,
    metadata: {
      sdkVersion: '@google/generative-ai v0.21.0+',
      model: 'gemini-1.5-flash',
      apiVersion: 'v1beta'
    }
  };
  
  await fs.writeFile(
    path.join(dataDir, 'news-data.json'),
    JSON.stringify(newsData, null, 2),
    'utf-8'
  );
  
  console.log(`\n✅ news-data.json 저장 완료!`);
  console.log(`📁 위치: src/news-data.json`);
  console.log(`⏰ 완료 시간: ${new Date().toLocaleString('ko-KR')}`);
  
  if (selectedArticles.length === 0) {
    console.warn('\n⚠️  경고: 수집된 뉴스가 0개입니다!');
    console.warn('💡 다음을 확인하세요:');
    console.warn('   1. GEMINI_API_KEY가 올바른지');
    console.warn('   2. API 키가 활성화되어 있는지');
    console.warn('   3. Gemini API 할당량이 남아있는지 (무료: 60회/분)');
    console.warn('   4. 인터넷 연결 상태');
    console.warn('   5. https://aistudio.google.com/app/apikey 에서 새 키 발급\n');
  }
  
  return newsData;
}

// 실행
fetchNews().catch(error => {
  console.error('\n💥 치명적 오류 발생:', error);
  console.error('스택 트레이스:', error.stack);
  process.exit(1);
});
