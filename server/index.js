import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
