var ws = require("nodejs-websocket")
var http = require("http")

console.log("Registering with the concierge...")

var registration = {
  roomName: "TheNodeRoom",
  exits: [
    {
      name: "W",
      room: "RecRoom",
      description: "You see a door to the west that looks like it goes somewhere."
    }
  ],
  attributes: {
    endPoint: "ws://game-on.org/roomjs/",
    startLocation: "false"
  }
}

console.log(JSON.stringify(registration))
var options = {
  host: 'game-on.org',
  path: '/concierge/registerRoom',
  method: 'POST',
  headers: {
	  'Content-Type':'application/json'
  }
};

callback = function(response) {
  var str = ''
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    console.log("Received response: " + str);
  });
}
var req = http.request(options, callback);

req.write(JSON.stringify(registration));
req.end();

var wsServer = ws.createServer(function (conn) {
    conn.on("text", function (str) {
        console.log("Received "+str)
        conn.sendText(str.toUpperCase()+"!!!")
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })
}).listen(3000)

console.log("The WebSocket server is listening...")