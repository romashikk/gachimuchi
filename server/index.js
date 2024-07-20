import fetch from 'node-fetch';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());

let userCoins = 0;
let referrals = [
  { name: 'User1', earnedCoins: 10 },
  { name: 'User2', earnedCoins: 20 },
];
let referralLink = 'https://yourapp.com/referral/username';

let tasks = [
  { id: 1, description: 'Подписаться на канал', reward: 50, completed: false },
  { id: 2, description: 'Пригласить друга', reward: 100, completed: false },
];

const TELEGRAM_BOT_TOKEN = '7178816361:AAG5Uta5gHX_o0Z6PG5OncVTKPDDQrroJls';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Обработка вебхуков от Telegram
app.post('/webhook', async (req, res) => {
  const { message } = req.body;
  if (message) {
    const chatId = message.chat.id;
    const username = message.from.username;
    const avatar = await getAvatar(message.from.id);

    console.log(`Received message from ${username}: ${message.text}`);

    // Добавьте логику для обработки различных команд
    if (message.text === '/start') {
      sendMessage(chatId, 'Welcome to Gachimuchi bot! Use /claim to get your coins.');
    } else if (message.text === '/claim') {
      userCoins += 10;
      sendMessage(chatId, `You have claimed 10 Gachi Coins. Your total is now ${userCoins} Gachi Coins.`);
    } else {
      sendMessage(chatId, 'Sorry, I did not understand that command.');
    }

    res.send('Webhook received');
  } else {
    res.send('No message received');
  }
});

// Функция для отправки сообщений
async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });
}

// Получение аватара пользователя
async function getAvatar(userId) {
  const response = await fetch(`${TELEGRAM_API_URL}/getUserProfilePhotos?user_id=${userId}`);
  const data = await response.json();
  if (data.result && data.result.photos.length > 0) {
    const fileId = data.result.photos[0][0].file_id;
    const fileResponse = await fetch(`${TELEGRAM_API_URL}/getFile?file_id=${fileId}`);
    const fileData = await fileResponse.json();
    return `${TELEGRAM_API_URL}/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;
  }
  return null;
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/claim', (req, res) => {
  userCoins += 10;
  res.json({ coins: userCoins });
});

app.get('/api/referrals', (req, res) => {
  res.json({ referrals, referralLink });
});

app.get('/api/tasks', (req, res) => {
  res.json({ tasks });
});

app.post('/api/tasks/:taskId/complete', (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    userCoins += task.reward;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Задание не найдено' });
  }
});

app.listen(5000, () => {
  console.log(`Server is running on http://localhost:5000`);
});

export default app;
