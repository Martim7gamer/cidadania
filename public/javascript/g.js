let initialLoadDone = false;

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${mm}:${ss}`;
}

let cacheServerVariables = {};
let newAnimTimer;

function HandleServerVariables(serverVariables) {
    if (serverVariables.hasStarted == false) {
        document.getElementById('starting-soon').style.removeProperty('display');
    } else {
        document.getElementById('starting-soon').style.display = "none";
    }

    if (serverVariables.claim != {}) {
        document.querySelector('#premise span').textContent = serverVariables.claim.text;
        document.querySelector('#topic').textContent = `TÓPICO: ${serverVariables.claim.topic.toUpperCase()}`;
        document.querySelector('#premise-num').textContent = `Premissa #${serverVariables.claim_index+1}`;

        document.querySelector('#timer-side1').textContent = formatSeconds(serverVariables.time1);
        document.querySelector('#timer-side2').textContent = formatSeconds(serverVariables.time2);

        const timerTotal = document.querySelector('#timer-total')

        timerTotal.textContent = formatSeconds(serverVariables.time1 + serverVariables.time2);
        const maxSpan = document.createElement('span');
        maxSpan.classList.add('max-timer')
        maxSpan.innerHTML = ' / 05:00'
        timerTotal.appendChild(maxSpan)

        console.log(cacheServerVariables)
        console.log(serverVariables)

        if (serverVariables.claim != {} && (cacheServerVariables.claim && cacheServerVariables.claim != {}) && (cacheServerVariables.claim.text != serverVariables.claim.text)) {
            if (newAnimTimer) {
                clearTimeout(newAnimTimer);
                newAnimTimer = null;
            }
            if (document.querySelector('#premise').classList.contains('new')) {
                document.querySelector('#premise').classList.remove('new');
            }
            document.querySelector('#premise').classList.add('new');
            newAnimTimer = setTimeout(() => {
                document.querySelector('#premise').classList.remove('new');
            }, 1000);
        }

        for (const timer of document.querySelectorAll('.timers .timer')) {
            if (timer.classList.contains('active')) {
                timer.classList.remove('active');
            }
        }

        if (serverVariables.timer_side != -1) {
            document.getElementById(`timer-side${serverVariables.timer_side}`).parentElement.classList.add('active');
        }
    }

    cacheServerVariables = serverVariables
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