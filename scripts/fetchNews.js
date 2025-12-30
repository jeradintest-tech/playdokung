import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const parser = new Parser({
  customFields: {
    item: ['description', 'pubDate', 'link']
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 뉴스 카테고리별 RSS 피드 - URL 인코딩된 주소 사용
const RSS_FEEDS = {
  '경제': 'https://www.mk.co.kr/rss/30100041/',  // 매일경제 경제
  '과학기술': 'http://rss.etnews.com/03.xml',  // 전자신문 IT
  '세계경제': 'https://rss.hankyung.com/economy.xml',  // 한국경제
  '부동산': 'https://land.naver.com/news/rss.naver',  // 네이버 부동산
  '날씨': 'https://www.weather.go.kr/w/rss/rss-weather.do',  // 기상청 RSS
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
async function rewriteForKids(article) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
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

JSON 형식으로만 답변해주세요 (다른 설명 없이):
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
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        originalLink: article.link,
        pubDate: article.pubDate || article.isoDate || new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('AI 재작성 오류:', error.message);
    return null;
  }
}

// 메인 함수
async function fetchNews() {
  console.log('📰 뉴스 수집 시작...');
  
  const allArticles = [];
  
  // 각 카테고리별 RSS 피드에서 뉴스 수집
  for (const [category, feedUrl] of Object.entries(RSS_FEEDS)) {
    try {
      console.log(`📡 ${category} 뉴스 가져오는 중... (${feedUrl})`);
      
      const feed = await parser.parseURL(feedUrl);
      console.log(`   수집된 항목: ${feed.items.length}개`);
      
      // 최대 2개씩만 수집 (총 13개 목표)
      const items = feed.items.slice(0, 2).filter(filterNews);
      console.log(`   필터링 후: ${items.length}개`);
      
      for (const item of items) {
        console.log(`   🤖 AI 변환 중: ${item.title?.substring(0, 30)}...`);
        const rewritten = await rewriteForKids(item);
        
        if (rewritten) {
          allArticles.push(rewritten);
          console.log(`   ✅ ${rewritten.title}`);
        } else {
          console.log(`   ⚠️  AI 변환 실패`);
        }
        
        // API 레이트 리밋 고려 (Gemini 무료: 분당 60회)
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ ${category} 피드 오류:`, error.message);
    }
  }
  
  // 날짜순 정렬
  allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  // 최대 13개로 제한
  const selectedArticles = allArticles.slice(0, 13);
  
  console.log(`\n📊 수집 완료: ${selectedArticles.length}개`);
  
  // 데이터 저장
  const dataDir = path.join(process.cwd(), 'src');
  await fs.mkdir(dataDir, { recursive: true });
  
  const newsData = {
    generatedAt: new Date().toISOString(),
    articles: selectedArticles,
    totalCount: selectedArticles.length
  };
  
  await fs.writeFile(
    path.join(dataDir, 'news-data.json'),
    JSON.stringify(newsData, null, 2),
    'utf-8'
  );
  
  console.log(`✅ news-data.json 저장 완료!`);
  console.log(`📁 위치: src/news-data.json`);
  
  return newsData;
}

// 실행
fetchNews().catch(console.error);
