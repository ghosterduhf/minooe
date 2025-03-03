
const express = require('express');
const server = express();
const port = 3000;

server.all('/', (req, res) => {
  res.send('👁️ Bot is watching...');
});

function keepAlive() {
  server.listen(port, '0.0.0.0', () => {
    console.log(`🕸️ Keep-alive server running on port ${port}`);
  });
}

module.exports = keepAlive;
