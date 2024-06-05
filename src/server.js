const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 5000;

app.use(cors());

app.get('/networks', (req, res) => {
  exec('nmcli -t -f SSID,IP4 dev wifi', (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(`Error: ${error.message}`);
    } else if (stderr) {
      res.status(500).send(`Stderr: ${stderr}`);
    } else {
      const networks = stdout
        .trim()
        .split('\n')
        .map(line => {
          const [ssid, ip] = line.split(':');
          return { ssid, ip };
        });
      res.json(networks);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
