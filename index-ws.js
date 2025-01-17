const express = require('express');
const server = require('http').createServer();
const app = express();
const PORT = 3000;

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);
server.listen(PORT, function () { console.log('Listening on ' + PORT); });

process.on('SIGINT', () => {
  wss.clients.forEach(function each(client) {
    client.close();
  });

  server.close(() => {
    shutdownDB();
  })
})

/** Websocket */
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({server: server});

wss.on('connection', function connection(ws) {
  const numCLients = wss.clients.size;
  console.log('Clients connected', numCLients);

  wss.broadcast(`Current visitors: ${numCLients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send('Welcome to my server');
  }

  db.run(`
    INSERT INTO visitors (count, time)
    VALUES (${numCLients}, datetime('now'))
  `)

  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${wss.clients.size}`);
    console.log('A client has disconnected');
  });

  ws.on('error', function error() {
    //
  });
});

/**
 * Broadcast data to all connected clients
 * @param  {Object} data
 * @void
 */
wss.broadcast = function broadcast(data) {
  console.log('Broadcasting: ', data);
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};
/** End Websocket **/


/** Database **/
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

// .seralize ensures DB is set up before any queries
db.serialize(() => {
  db.run(`CREATE TABLE visitors (
    count INTEGER,
    time TEXT
    )`);
});


function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log('shutting down DB');
  db.close();
}