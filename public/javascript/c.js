let initialLoadDone = false;

function HandleServerVariables(serverVariables) {
    console.log(serverVariables)

    if (serverVariables.hasStarted == true) {
        document.getElementById('startgame').disabled = true;
    }

    initialLoadDone = true;
}

let wsUrl;

if (window.location.hostname === 'localhost') {
  // Running on localhost, use port 80
  wsUrl = 'ws://localhost:3000/game';
} else {
  // Running in production, use port 8443
  wsUrl = 'wss://' + window.location.hostname + '/game';
}

const ws = new WebSocket(wsUrl);

ws.onerror = function(errormessage) {
    console.warn(`Fuck you: ${errormessage.message}`)
}

ws.onopen = function() {
    console.log("Connected successfully!")
    
    ws.send(JSON.stringify({
        retrieve: true,
        retrieveType: "serverVariables"
    }))

    const buttons = {
        startgame: document.getElementById('startgame'),
        nextclaim: document.getElementById('nextclaim'),
        timerSide: document.getElementById('timerside'),
        pausetimers: document.getElementById('pausetimers'),
        resettimers: document.getElementById('resettimers')
    }

    buttons.startgame.addEventListener('click', function() {
        const con = confirm("Começar?");
        if (!con) return;

        ws.send(JSON.stringify({
            operation: true,
            type: "startGame",
        }))
    })

    buttons.nextclaim.addEventListener('click', function() {
        const con = confirm("Avançar para próxima claim?");
        if (!con) return;

        ws.send(JSON.stringify({
            operation: true,
            type: "nextClaim",
        }))
    })

    buttons.timerSide.addEventListener('input', function() {
        let side;
        if (!buttons.timerSide.checked) {
            side = 1;
        } else {
            side = 2;
        }

        ws.send(JSON.stringify({
            operation: true,
            type: "changeTimerSide",
            timeSide: side
        }))
    })

    buttons.pausetimers.addEventListener('click', function() {
        ws.send(JSON.stringify({
            operation: true,
            type: "pauseTimers",
        }))
    })

    buttons.resettimers.addEventListener('click', function() {
        ws.send(JSON.stringify({
            operation: true,
            type: "resetTimers",
        }))
    })
}

ws.onmessage = function(message) {
    const m = JSON.parse(message.data);

    if (m.retrieve == true) {
        HandleServerVariables(m.serverVariables)
    }
    if (m.operation) {
        switch (m.type) {
            case "update":
                HandleServerVariables(m.serverVariables)
                break;
        }
    }
}