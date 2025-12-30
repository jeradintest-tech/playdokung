import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// public 디렉토리 정적 파일 서빙
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 플레이도경 개발 서버 실행 중!`);
  console.log(`📱 브라우저에서 열기: http://localhost:${PORT}`);
  console.log(`⏹️  서버 종료: Ctrl + C`);
});
