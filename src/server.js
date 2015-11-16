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
    endPoint: "ws://game-on.org/roomjs",
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
    conn.on("text", function (incoming) {
        console.log("------\nReceived: "+ incoming)
	        
	    var typeEnd = incoming.indexOf(',')
	    var targetEnd = incoming.indexOf(',', typeEnd+1)
	
		console.log(incoming)
		console.log("Type end: " + typeEnd)
		console.log("Target end: " + targetEnd)
		var messageType = incoming.substr(0,typeEnd)
		var target = incoming.substr(typeEnd+1, targetEnd-typeEnd-1)
		var objectStr = incoming.substr(targetEnd+1)
		var object = JSON.parse(objectStr)
		console.log("Message Type: " + messageType)
		console.log("Target: " + target)
		console.log("ObjectStr: " + objectStr)
		console.log("Object: " + object.username)
        
		/*
		 * player,
		 * dummy:AnonymousGoogleUser,
		 * 	{
		 * 		"type":"location",
		 * 		"name":"Basement",
		 * 		"description":"A dark basement. It is dark here. You think you should probably leave.",
		 * 		"exits":{"U":"A flight of stairs leading back to the Rec Room"},
		 * 		"pockets":[],
		 * 		"objects":[],
		 * 		"bookmark":4
		 *  }
		 */
		
		var responseObject = {
        	type: "location",
        	name: "The Node Room",
        	description: "This room is filled with little JavaScripts running around everywhere.",
        	exits: {
        		"W": "You see a door to the west that looks like it goes somewhere."
        	},
        	pockets: [],
        	objects: [],
        	bookmark: 5
        }
        
        var sendMessageType = "player"
        var sendTarget = object.userId
        
        var messageText = sendMessageType + "," +
        					sendTarget + "," +
        					JSON.stringify(responseObject)
		
		conn.sendText(messageText)
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })
}).listen(3000)

console.log("The WebSocket server is listening...")