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
		var messageType = incoming.substr(0,typeEnd)
		var target = incoming.substr(typeEnd+1, targetEnd-typeEnd-1)
		var objectStr = incoming.substr(targetEnd+1)
		var object = JSON.parse(objectStr)
		console.log("Message Type: " + messageType)
		console.log("Target: " + target)
		console.log("ObjectStr: " + objectStr)
		console.log("Object: " + object.username)
		
		
		if (messageType === "roomHello")
		{
			sayHello(conn, object.userId)
		}
        if (messageType === "room")
        {
        	if (object.content.indexOf('/') == 0)
        	{
    			sendNoCommands(conn, object.userId, object.content)
        	}
    		else
	    	{
    			sendChatMessage(conn, object.username, object.content)
	    	}
        }
		else
		{
			
		}
		
		
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })
}).listen(3000)


function sendChatMessage(conn, username, content) {
	var responseObject = {
        	type: "chat",
        	username: username,
        	content: content,
        	bookmark: 92
        }
        
        var sendMessageType = "player"
        var sendTarget = "*"
        
        var messageText = sendMessageType + "," +
        					sendTarget + "," +
        					JSON.stringify(responseObject)
		
		broadcast(messageText)
}

//player,dummy:AnonymousGoogleUser,{"type":"event","content":{"dummy:AnonymousGoogleUser":"I'm sorry Dave, I don't know how to do that"},"bookmark":25}
function sendNoCommands(conn, target, content) {
	console.log("This is a command!")
	var responseObject = {
        	type: "event",
        	"content": {
        	}
        }
        
		responseObject.content[target] = "I'm sorry Dave, I don't know how to do that!"
        var sendMessageType = "player"
        var sendTarget = target
        
        var messageText = sendMessageType + "," +
        					sendTarget + "," +
        					JSON.stringify(responseObject)
		
		conn.sendText(messageText)
}

function sayHello(conn, target) {
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
        var sendTarget = target
        
        var messageText = sendMessageType + "," +
        					sendTarget + "," +
        					JSON.stringify(responseObject)
		
		conn.sendText(messageText)
}

function broadcast(message) {
	wsServer.connections.forEach(function (conn) {
        conn.sendText(message)
    })
}

console.log("The WebSocket server is listening...")