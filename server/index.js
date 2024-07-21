import fetch from 'node-fetch';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Получение текущего каталога в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function getUpdates(offset) {
  const response = await fetch(`${TELEGRAM_API_URL}/getUpdates?offset=${offset}`);
  const data = await response.json();
  return data.result;
}

async function processUpdates() {
  let offset = 0;
  while (true) {
    try {
      const updates = await getUpdates(offset);
      if (Array.isArray(updates) && updates.length > 0) {
        for (const update of updates) {
          offset = update.update_id + 1;
          const message = update.message;
          const chatId = message.chat.id;
          const text = message.text;

          if (text === '/start') {
            await sendMessage(chatId, 'Welcome to Gachimuchi bot! Use /claim to get your coins.');
          } else if (text === '/claim') {
            userCoins += 10;
            await sendMessage(chatId, `You have claimed 10 Gachi Coins. Your total is now ${userCoins} Gachi Coins.`);
          } else if (text === '/tasks') {
            const taskList = tasks.map(task => `${task.id}. ${task.description} - Reward: ${task.reward}`).join('\n');
            await sendMessage(chatId, `Here are your tasks:\n${taskList}`);
          } else if (text === '/referrals') {
            const referralList = referrals.map(ref => `${ref.name} - Earned Coins: ${ref.earnedCoins}`).join('\n');
            await sendMessage(chatId, `Here are your referrals:\n${referralList}\nInvite link: ${referralLink}`);
          } else {
            await sendMessage(chatId, 'Sorry, I did not understand that command. Here are the commands you can use:\n/start\n/claim\n/tasks\n/referrals');
          }
        }
      } else {
        console.log('No new updates'); // закомментируйте или удалите эту строку
      }
    } catch (error) {
      console.error('Error processing updates:', error);
    }
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 секундная задержка
  }
}

async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}

processUpdates();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hellof World!');
});

app.get('/users', (req, res) => {
  res.json({
    coins: userCoins,
    referrals: referrals
  });
});

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.get('/referrals', (req, res) => {
  res.json(referrals);
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
    if (task && !task.completed) {
      task.completed = true;
      userCoins += task.reward;
      res.json({ success: true, coins: userCoins });
    } else {
      res.status(404).json({ error: 'Задание не найдено или уже выполнено' });
    }
  });
  

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
