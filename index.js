require('dotenv').config();

const express = require('express');
const http = require('http');
const initSocketIo = require('./app/socketio');

const PORT = process.env.PORT ?? 3000;
const app = express();
const server = http.createServer(app);
initSocketIo(server);

app.use(express.static('./public'));

server.listen(PORT, () => {
  console.log('server ready at http://localhost:' + PORT);
});
