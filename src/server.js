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

var exits = [
 {
     name: "W",
     longName: "West",
     room: "RecRoom",
     description: "You see a door to the west that looks like it goes somewhere."
   }
]

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
	    var typeEnd = incoming.indexOf(',')
	    var targetEnd = incoming.indexOf(',', typeEnd+1)
	
		var messageType = incoming.substr(0,typeEnd)
		var target = incoming.substr(typeEnd+1, targetEnd-typeEnd-1)
		var objectStr = incoming.substr(targetEnd+1)
		var object = JSON.parse(objectStr)
		
		console.log("Parsed a message of type \"" + messageType + "\" sent to target \"" + target + "\".")
		
		if (messageType === "roomHello")
		{
			sayHello(conn, object.userId, object.username)
		}
        if (messageType === "room")
        {
        	if (object.content.indexOf('/') == 0)
        	{
    			parseCommand(conn, object.userId, object.content)
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
	console.log(username + " sent chat message \"" + content + "\"")
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

function parseCommand(conn, target, content) {
	
	if (content.substr(1,3) == "go ")
	{
		parseGoCommand(conn, target, content)
	}
	else
	{
		sendUnknownCommand(conn, target, content)
	}
}

function parseGoCommand(conn, target, content)
{
	var exitName = content.substr(4)
	console.log("Player \"" + target + "\" wants to go direction \"" + exitName + "\"")
	
	var found = false
	var myexit = {}
	for (var j=0;j<exits.length;j++)
	{
		if (exits[j].name === exitName)
		{
			found = true
			myexit = exits[j]
			break;
		}
	}
	
	if (found)
	{
		console.log("That direction exists, telling \"" + target + "\" that they've gone that direction.")
		var sendTarget = target
		var sendMessageType = "playerLocation"
		var messageObject = {
			type: "exit",
			exitId: myexit.name,
			content: "You head " + myexit.longName,
			bookmark: 97
		}
		
		var messageText = sendMessageType + "," +
							sendTarget + "," + 
							JSON.stringify(messageObject)
		
		conn.sendText(messageText)
		
		console.log("And announcing that \"" + target + "\" has left the room.")
		var broadcastMessageType = "player"
		var broadcastMessageTarget = "*"
		var broadcastMessageObject = {
			type: "event",
			content: {
				"*": username + " leaves the room."
			},
			bookmark: 1001
		}
		var broadcastMessage = broadcastMessageType + "," +
								broadcastMessageTarget + "," +
								JSON.stringify(broadcastMessageObject)
	
		broadcast(broadcastMessage)
	}
	else
	{
		console.log("That direction wasn't found; we're telling the user.")
		var sendTarget = target
		var sendMessageType = "player"
		var messageObject = {
			type: "event",
			content: {
				
			},
			bookmark: 1002
		}
		
		messageObject.content[target] = "There isn't an exit in that direction, genius."
		
		var messageText = sendMessageType + "," +
							sendTarget + "," + 
							JSON.stringify(messageObject)
		
		conn.sendText(messageText)
	}
	
}

function sendUnknownCommand(conn, target, content) {
	console.log("Unknown command from user: " + content)
	var responseObject = {
        	type: "event",
        	"content": {
        	}
        }
        
		responseObject.content[target] = "Node.js looked at your command, and barfed."
        var sendMessageType = "player"
        var sendTarget = target
        
        var messageText = sendMessageType + "," +
        					sendTarget + "," +
        					JSON.stringify(responseObject)
		
		conn.sendText(messageText)
}

function sayHello(conn, target, username) {
	console.log("Saying hello to \"" + target + "\"")
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
	
	console.log("And announcing that \"" + username + "\" has arrived.")
	var broadcastMessageType = "player"
	var broadcastMessageTarget = "*"
	var broadcastMessageObject = {
		type: "event",
		content: {
			"*": username + " enters the room."
		},
		bookmark: 51
	}
	var broadcastMessage = broadcastMessageType + "," +
							broadcastMessageTarget + "," +
							JSON.stringify(broadcastMessageObject)

	broadcast(broadcastMessage)
}

function broadcast(message) {
	wsServer.connections.forEach(function (conn) {
        conn.sendText(message)
    })
}

console.log("The WebSocket server is listening...")