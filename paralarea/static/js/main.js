
var ws = new WebSocket("ws://localhost:9292/");

ws.onopen = function() {
    data = {
        id: 0,
        jsonrpc: '2.0',
        method: 'upper',
        params: {
            text: 'Hello, World!'
        }
    };
    ws.send(JSON.stringify(data));
};
ws.onmessage = function (evt) {
    alert(evt.data);
};