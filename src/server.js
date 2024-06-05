const express = require('express');
const ping = require('ping');
const cors = require('cors');
const app = express();
const port = 5000;

// Налаштування CORS
app.use(cors()); // Дозволити доступ з будь-якого джерела

app.use(express.json());

app.get('/ping', async (req, res) => {
  const { ip } = req.query;
  if (!ip) {
    console.log('IP address is required');
    return res.status(400).json({ error: 'IP address is required' });
  }

  try {
    console.log(`Pinging IP address: ${ip}`);
    const result = await ping.promise.probe(ip);
    console.log(`Ping result for ${ip}:`, result);
    if (result.alive) {
      res.json({ status: 'є світло' });
    } else {
      res.json({ status: 'немає світла' });
    }
  } catch (error) {
    console.error('Error pinging the IP address:', error);
    res.status(500).json({ error: 'Error pinging the IP address' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
