import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Получение текущего каталога в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Настройка раздачи статических файлов
app.use(express.static(path.join(__dirname, '../client/build')));

// Ваши API маршруты
app.get('/api', (req, res) => {
  res.send('Hello from the API!');
});

// Обработка всех остальных маршрутов и отправка index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
