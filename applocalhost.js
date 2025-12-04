const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
app.use(bodyparser.json())
app.use(express.static(path.join(__dirname, 'public')))

const server = app.listen(3000, function() {
    console.log('Listening to 3000!')
})

const wss = new WebSocket.Server({ server: server });
const websocketHandler = require('./websockets/handler');

wss.on('connection', (ws,req) => {
  websocketHandler.connection(wss, ws, req)
})

const getRequestFiles = fs
    .readdirSync(path.join(__dirname, "requests", "get"))
    .filter((file) => file.endsWith('.js'));
const postRequestFiles = fs
    .readdirSync(path.join(__dirname, "requests", "post"))
    .filter((file) => file.endsWith('.js'));

for (const file of getRequestFiles) {
    const req = require(path.join(__dirname, "requests", "get", file));

    app.get(req.endpoint, async(request, response) => {
        req.execute(request, response)
    })

    console.log(`Pushed GET request ${req.endpoint}`)
}