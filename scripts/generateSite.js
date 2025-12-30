import fs from 'fs/promises';
import path from 'path';

// HTML 템플릿 생성
function generateHTML(newsData) {
  const { generatedAt, articles } = newsData;
  const date = new Date(generatedAt);
  const dateStr = date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  
  // 카테고리별 뉴스 그룹화
  const categories = {};
  articles.forEach(article => {
    const cat = article.category || '기타';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(article);
  });
  
  const categoryColors = {
    '용돈': '#FF6B6B',
    '저축팁': '#4ECDC4',
    '취미': '#95E1D3',
    '새로운제품기술': '#5C7CFA',
    '과학': '#845EC2',
    '날씨': '#00C9FF',
    '경제': '#FFC75F',
    '세계경제': '#F9F871',
    '부동산': '#C34A36',
    '스포츠': '#FF8066',
    '게임': '#9B59B6',
    '테크': '#3498DB',
    '지식': '#2ECC71',
    '글로벌이슈': '#E67E22'
  };
  
  const categoryIcons = {
    '용돈': '💰',
    '저축팁': '🏦',
    '취미': '🎨',
    '새로운제품기술': '📱',
    '과학': '🔬',
    '날씨': '🌤️',
    '경제': '📊',
    '세계경제': '🌍',
    '부동산': '🏠',
    '스포츠': '⚽',
    '게임': '🎮',
    '테크': '💻',
    '지식': '📚',
    '글로벌이슈': '🌐'
  };
  
  const articlesHTML = Object.entries(categories).map(([category, arts]) => {
    const color = categoryColors[category] || '#999';
    const icon = categoryIcons[category] || '📰';
    
    return arts.map(article => `
      <article class="news-card" data-category="${category}">
        <div class="news-category" style="background: ${color}">
          <span class="category-icon">${icon}</span>
          <span class="category-name">${category}</span>
        </div>
        <h2 class="news-title">${article.title}</h2>
        <p class="news-summary">${article.summary}</p>
        <div class="news-meta">
          <span class="reading-time">📖 ${article.readingTime || 2}분</span>
          <a href="${article.originalLink}" target="_blank" class="read-more">원문 보기 →</a>
        </div>
      </article>
    `).join('');
  }).join('');
  
  const totalReadingTime = articles.reduce((sum, a) => sum + (parseInt(a.readingTime) || 2), 0);
  
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="13세를 위한 경제 신문 - 플레이도경">
  <title>플레이도경 - 13세를 위한 경제 신문</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --primary-color: #0078D4;
      --secondary-color: #005A9E;
      --bg-light: #F3F3F3;
      --bg-white: #FFFFFF;
      --text-primary: #1F1F1F;
      --text-secondary: #605E5C;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
      --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
      --border-radius: 8px;
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", 
                   "Apple SD Gothic Neo", sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      color: var(--text-primary);
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    /* Header */
    header {
      background: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 30px 40px;
      margin-bottom: 30px;
      box-shadow: var(--shadow-lg);
      backdrop-filter: blur(10px);
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      font-size: 48px;
      animation: bounce 2s infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    h1 {
      font-size: 2.5rem;
      color: var(--primary-color);
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    
    .date-info {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }
    
    .date {
      font-size: 1rem;
      color: var(--text-secondary);
      padding: 8px 16px;
      background: var(--bg-light);
      border-radius: 20px;
    }
    
    .stats {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }
    
    .stat-badge {
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .tagline {
      font-size: 1.1rem;
      color: var(--text-secondary);
      text-align: center;
      padding-top: 15px;
      border-top: 2px solid var(--bg-light);
    }
    
    /* Filter Buttons */
    .filter-container {
      background: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: var(--shadow-md);
      overflow-x: auto;
    }
    
    .filter-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .filter-btn {
      padding: 10px 20px;
      border: 2px solid var(--bg-light);
      background: white;
      border-radius: 25px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      transition: var(--transition);
      white-space: nowrap;
    }
    
    .filter-btn:hover {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: white;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .filter-btn.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }
    
    /* News Grid */
    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 25px;
      margin-bottom: 40px;
    }
    
    .news-card {
      background: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 25px;
      box-shadow: var(--shadow-md);
      transition: var(--transition);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    
    .news-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    .news-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }
    
    .news-card:hover::before {
      transform: scaleX(1);
    }
    
    .news-category {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      color: white;
      margin-bottom: 15px;
      align-self: flex-start;
    }
    
    .category-icon {
      font-size: 1.1rem;
    }
    
    .news-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 12px;
      line-height: 1.4;
    }
    
    .news-summary {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.7;
      margin-bottom: 20px;
      flex-grow: 1;
    }
    
    .news-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid var(--bg-light);
    }
    
    .reading-time {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    
    .read-more {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: var(--transition);
    }
    
    .read-more:hover {
      color: var(--secondary-color);
      transform: translateX(3px);
    }
    
    /* Footer */
    footer {
      background: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 30px;
      text-align: center;
      box-shadow: var(--shadow-md);
      margin-top: 40px;
    }
    
    footer p {
      color: var(--text-secondary);
      margin-bottom: 10px;
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      margin-top: 15px;
    }
    
    .footer-links a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
      transition: var(--transition);
    }
    
    .footer-links a:hover {
      color: var(--secondary-color);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      body {
        padding: 10px;
      }
      
      header {
        padding: 20px;
      }
      
      h1 {
        font-size: 1.8rem;
      }
      
      .logo-icon {
        font-size: 36px;
      }
      
      .news-grid {
        grid-template-columns: 1fr;
      }
      
      .header-top {
        flex-direction: column;
        text-align: center;
      }
      
      .date-info {
        justify-content: center;
      }
    }
    
    @media (max-width: 480px) {
      h1 {
        font-size: 1.5rem;
      }
      
      .news-card {
        padding: 20px;
      }
      
      .news-title {
        font-size: 1.15rem;
      }
    }
    
    /* Loading Animation */
    .loading {
      display: none;
      text-align: center;
      padding: 40px;
      color: white;
      font-size: 1.2rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-top">
        <div class="logo">
          <span class="logo-icon">📰</span>
          <h1>플레이도경</h1>
        </div>
        <div class="date-info">
          <span class="date">📅 ${dateStr}</span>
          <div class="stats">
            <span class="stat-badge">📚 ${articles.length}개의 뉴스</span>
            <span class="stat-badge">⏱️ ${totalReadingTime}분 분량</span>
          </div>
        </div>
      </div>
      <p class="tagline">💡 13세를 위한 경제와 세상 이야기</p>
    </header>
    
    <div class="filter-container">
      <div class="filter-buttons">
        <button class="filter-btn active" data-filter="all">전체 보기</button>
        ${Object.keys(categories).map(cat => 
          `<button class="filter-btn" data-filter="${cat}">${categoryIcons[cat] || '📰'} ${cat}</button>`
        ).join('')}
      </div>
    </div>
    
    <div class="news-grid" id="newsGrid">
      ${articlesHTML}
    </div>
    
    <footer>
      <p><strong>플레이도경</strong> - 13세를 위한 경제 신문</p>
      <p>매일 아침 9시, 세상의 중요한 소식을 쉽고 재미있게 전해드립니다</p>
      <div class="footer-links">
        <a href="https://github.com" target="_blank">GitHub</a>
        <a href="mailto:feedback@playdokyung.com">피드백 보내기</a>
      </div>
      <p style="margin-top: 15px; font-size: 0.9rem;">
        마지막 업데이트: ${new Date(generatedAt).toLocaleString('ko-KR')}
      </p>
    </footer>
  </div>
  
  <script>
    // 필터 기능
    const filterButtons = document.querySelectorAll('.filter-btn');
    const newsCards = document.querySelectorAll('.news-card');
    
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        
        // 버튼 활성화 상태 변경
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 카드 필터링
        newsCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.5s ease';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
    
    // 카드 클릭 시 원문으로 이동
    newsCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('read-more')) return;
        const link = card.querySelector('.read-more');
        if (link) window.open(link.href, '_blank');
      });
    });
    
    // 페이드인 애니메이션
    const style = document.createElement('style');
    style.textContent = \`
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    \`;
    document.head.appendChild(style);
  </script>
</body>
</html>`;
}

async function generateSite() {
  try {
    console.log('🏗️  사이트 생성 중...');
    
    // 뉴스 데이터 읽기
    const dataPath = path.join(process.cwd(), 'src', 'news-data.json');
    const newsData = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
    
    // HTML 생성
    const html = generateHTML(newsData);
    
    // public 디렉토리 생성
    const publicDir = path.join(process.cwd(), 'public');
    await fs.mkdir(publicDir, { recursive: true });
    
    // index.html 저장
    await fs.writeFile(path.join(publicDir, 'index.html'), html);
    
    console.log('✅ 사이트 생성 완료!');
    console.log('📁 파일 위치: public/index.html');
  } catch (error) {
    console.error('❌ 사이트 생성 오류:', error);
    throw error;
  }
}

generateSite().catch(console.error);
