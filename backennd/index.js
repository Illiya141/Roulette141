const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 8080});

wss.on('connection', (ws)=> {
    console.log('Incoming connection...');
});


setInterval(()=> {
    const computed_random_number = Math.floor(Math.random() * 14);

    wss.clients.forEach((ws) => {
        if(ws.readyState === ws.OPEN){
            ws.send(computed_random_number);
        }
    })
}, 10000);