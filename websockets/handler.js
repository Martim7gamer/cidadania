const claims = require('./claims.json');

const serverVariables = {
    hasStarted: false,
    claim: claims.claims[0],
    claim_index: 0,
    time1: 0,
    time2: 0,
    time_total: 0,
    timer_side: -1,
}

let timer_interval;
let wss;

async function onConnection(wss, ws,req) {
    let isValid = req.url.split('/')[1] === "game";
    if (!isValid) { ws.close(1008, 'Not a valid connection'); return };
    
    ws.on('message', (message) => {
        const jsonObject = JSON.parse(message);

        if (jsonObject.retrieve == true) { // Those who are simply trying to retrieve information are not replicated to others
            switch (jsonObject.retrieveType) {
                case "serverVariables":
                    ws.send(JSON.stringify({
                        "retrieve": true,
                        "type": "serverVariables",
                        "serverVariables": serverVariables
                    }))
                    break;
            }
        } else if (jsonObject.operation == true) {
            switch (jsonObject.type) {
                case "startGame":
                    serverVariables.hasStarted = true;
                    serverVariables.claim_index = 0
                    serverVariables.claim = claims.claims[serverVariables.claim_index],
                    serverVariables.timer_side = -1

                    break;
                case "nextClaim":
                    const index = claims.claims.indexOf(serverVariables.claim);
                    const newIndex = index + 1;

                    serverVariables.claim_index = newIndex;
                    serverVariables.claim = claims.claims[newIndex];
                    serverVariables.time1 = 0
                    serverVariables.time2 = 0
                    serverVariables.time_total = 0
                    serverVariables.timer_side = -1

                    if (timer_interval) {
                        clearInterval(timer_interval);
                        timer_interval = null
                    }

                    break;
                case "changeTimerSide":
                    const timeSide = jsonObject.timeSide;
                    if (timer_interval) {
                        clearInterval(timer_interval);
                        timer_interval = null;
                    };

                    serverVariables.timer_side = timeSide
                    
                    switch (timeSide) {
                        case 1:
                            timer_interval = setInterval(() => {
                                serverVariables.time1 += 1
                                wss.clients.forEach(function(client) {
                                    client.send(JSON.stringify({
                                        operation: true,
                                        type: "update",
                                        serverVariables: serverVariables
                                    }));
                                });
                            }, 1000);
                            break;
                        case 2:
                            timer_interval = setInterval(() => {
                                serverVariables.time2 += 1
                                wss.clients.forEach(function(client) {
                                    client.send(JSON.stringify({
                                        operation: true,
                                        type: "update",
                                        serverVariables: serverVariables
                                    }));
                                });
                            }, 1000);
                            break;
                    }
                    
                    break;
                case "pauseTimers":
                    if (timer_interval) {
                        clearInterval(timer_interval);
                        timer_interval = null
                    }

                    serverVariables.timer_side = -1

                    break;
                case "resetTimers":
                    if (timer_interval) {
                        clearInterval(timer_interval);
                        timer_interval = null
                    }

                    serverVariables.time1 = 0
                    serverVariables.time2 = 0
                    serverVariables.time_total = 0
                    serverVariables.timer_side = -1

                    break;
                /*case "resume-timer":
                    timerInterval = setInterval(() => {
                        jokerServerVariables.time -= 1
                        wss.clients.forEach(function(client) {
                            client.send(JSON.stringify({
                                operation: true,
                                type: "update",
                                serverVariables: jokerServerVariables
                            }));
                        });
    
                        if (jokerServerVariables.time <= 0) {
                            clearInterval(timerInterval)
                            timerInterval = null
                        }
                    }, 1000);
                        
                    break;*/
            }

            wss.clients.forEach(function(client) {
                client.send(JSON.stringify({
                    operation: true,
                    type: "update",
                    serverVariables: serverVariables
                }));
            });

            /*if (updateQuestion === true) {
                wss.clients.forEach(function(client) {
                    client.send(JSON.stringify({
                        operation: true,
                        type: "newQuestion",
                        serverVariables: jokerServerVariables
                    }));
                });

                if (timerInterval) clearInterval(timerInterval)

                if (!firstBonus && jokerServerVariables.currentQuestion.tipo === "bonus") { firstBonus = true; jokerServerVariables.time = 70 };

                if (jokerServerVariables.currentQuestion.tipo === "normal") {
                    jokerServerVariables.time = 60
                    firstBonus = false
                } // caso contrário, o tempo continuará normalmente (rondas bónus)
                
                if (jokerServerVariables.currentQuestion.tipo === "bonus") {
                    timerInterval = setInterval(() => {
                        jokerServerVariables.time -= 1
                        wss.clients.forEach(function(client) {
                            client.send(JSON.stringify({
                                operation: true,
                                type: "update",
                                serverVariables: jokerServerVariables
                            }));
                        });

                        if (jokerServerVariables.time <= 0) {
                            clearInterval(timerInterval)
                            timerInterval = null
                        }
                    }, 1000);
                }
            }*/
        } else {
            // Now send the parsed JSON object to clients
            wss.clients.forEach(function(client) {
                client.send(JSON.stringify(jsonObject));
            });
        }
    });    
}

//module.exports = {
//    setUp(secure) {
//        if (wss) return;
//        if (secure) {
//            wss = new WebSocket.Server({ port: 8443 });
//        } else {
//            wss = new WebSocket.Server({ port: 80 });
//        }
//        
//        wss.on('connection', onConnection)
//
//        console.log("Websockets successfully set up!")
//    }
//}

module.exports = {
    connection: onConnection,
}