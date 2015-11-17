var ws = require("nodejs-websocket")
var async = require("async")

var helloMessage = 'roomHello,bsPlayer,{"username":"bsPlayer","userId":"bsPlayer"}'
var helloReply = 'player,bsPlayer,{"type":"location","name":"The Node Room","description":"This room is filled with little JavaScripts running around everywhere.","exits":{"W":"You see a door to the west that looks like it goes somewhere."},"pockets":[],"objects":[],"bookmark":5}'
var helloAnnounce = 'player,*,{"type":"event","content":{"*":"bsPlayer enters the room."},"bookmark":51}'

var chatMessage = 'room,TheNodeRoom,{"username":"AnonymousGoogleUser","userId":"dummy:AnonymousGoogleUser","content":"chats"}'
var chatAnnounce = 'player,*,{"type":"chat","username":"AnonymousGoogleUser","content":"chats","bookmark":92}'

var unknownCommand = 'room,TheNodeRoom,{"username":"AnonymousGoogleUser","userId":"dummy:AnonymousGoogleUser","content":"/plwef"}'	
var unknownCmdResponse = 'player,dummy:AnonymousGoogleUser,{"type":"event","content":{"dummy:AnonymousGoogleUser":"Node.js looked at your command, and barfed."}}'

var unknownDirection = 'room,TheNodeRoom,{"username":"AnonymousGoogleUser","userId":"dummy:AnonymousGoogleUser","content":"/go E"}'	
var unknownDirResponse = 'player,dummy:AnonymousGoogleUser,{"type":"event","content":{"dummy:AnonymousGoogleUser":"There isn\'t an exit in that direction, genius."},"bookmark":1002}'

var goDirection = 'room,TheNodeRoom,{"username":"AnonymousGoogleUser","userId":"dummy:AnonymousGoogleUser","content":"/go W"}'	
var goResponse = 'playerLocation,dummy:AnonymousGoogleUser,{"type":"exit","exitId":"W","content":"You head West","bookmark":97}'
	
var goodbyeMessage = 'roomGoodbye,TheNodeRoom,{"username":"AnonymousGoogleUser","userId":"dummy:AnonymousGoogleUser"}'
var goodbyeAnnounce = 'player,*,{"type":"event","content":{"*":"AnonymousGoogleUser leaves the room."},"bookmark":1001}'
var exitsMessage = 'room,TheNodeRoom,{"username":"AnonymousGoogleUser","userId":"dummy:AnonymousGoogleUser","content":"/exits"}'	
var exitsReply = 'player,dummy:AnonymousGoogleUser,{"type":"exits","bookmark":2222,"content":{"W":"You see a door to the west that looks like it goes somewhere."}}'

var helpMessage = 'room,TheNodeRoom,{"username":"AnonymousGoogleUser","userId":"dummy:AnonymousGoogleUser","content":"/help"}'
var helpReply = 'player,dummy:AnonymousGoogleUser,{"type":"event","bookmark":2223,"content":{"dummy:AnonymousGoogleUser":"The following commands are supported: [/help, /go, /exits]"}}'
	
var inventoryMessage = 'room,TheNodeRoom,{"username":"AnonymousGoogleUser","userId":"dummy:AnonymousGoogleUser","content":"/inventory"}'
var inventoryReply = 'player,dummy:AnonymousGoogleUser,{"type":"event","bookmark":2223,"content":{"dummy:AnonymousGoogleUser":"You may have been carrying something, but you lost it cause everything is so asynchronous."}}'

var examineMessage = 'room,TheNodeRoom,{"username":"AnonymousGoogleUser","userId":"dummy:AnonymousGoogleUser","content":"/examine"}'
var examineReply = 'player,dummy:AnonymousGoogleUser,{"type":"event","bookmark":2223,"content":{"dummy:AnonymousGoogleUser":"There\'s nothing in here to really examine."}}'
	
	
var sawHello = false
var sawAnnounce = false
var sawGoResponse = false
var sawGoAnnounce = false
async.series([
  function(callback){
	  var connection = ws.connect("ws://localhost:3000")
	  connection.on("connect", function() {
		  connection.sendText(helloMessage)
	  })
	  connection.on("text", function(str) {
		  if (str == helloReply)
		  {
			  sawHello = true
			  console.log("The room said hello.")
		  }
		  else if (str == helloAnnounce)
		  {
			  console.log("And announced our arrival!")
			  sawAnnounce = true
		  }
		  
	      if (sawHello && sawAnnounce)
	      {
			  connection.close()
			  console.log("roomHello is working.")
			  callback()
	      }
	  })
  },
  function(callback){
	  var connection = ws.connect("ws://localhost:3000")
	  connection.on("connect", function() {
		  connection.sendText(chatMessage)
	  })
	  connection.on("text", function(str) {
		  if (str == chatAnnounce)
		  {
			  console.log("When we send a chat message, the room announces it.")
			  connection.close()
			  callback()  
		  }
	  })
  },
  function(callback){
	  var connection = ws.connect("ws://localhost:3000")
	  connection.on("connect", function() {
		  connection.sendText(unknownCommand)
	  })
	  connection.on("text", function(str) {
		  if (str == unknownCmdResponse)
		  {
			  console.log("When we send an unknown command, the room 'barfs' as expected.")
			  connection.close()
			  callback()  
		  }
	  })
  },
  function(callback){
	  var connection = ws.connect("ws://localhost:3000")
	  connection.on("connect", function() {
		  connection.sendText(unknownDirection)
	  })
	  connection.on("text", function(str) {
		  if (str == unknownDirResponse)
		  {
			  console.log("When we send an unknown direction, it cusses us out.")
			  connection.close()
			  callback()  
		  }
	  })
  },
  function(callback){
	  var connection = ws.connect("ws://localhost:3000")
	  connection.on("connect", function() {
		  connection.sendText(goodbyeMessage)
	  })
	  connection.on("text", function(str) {
		  if (str == goodbyeAnnounce)
		  {
			  console.log("The room announced that we left when we did.")
			  connection.close()
			  callback()
		  }
	  })
  },
  function(callback){
	  var connection = ws.connect("ws://localhost:3000")
	  connection.on("connect", function() {
		  connection.sendText(goDirection)
	  })
	  connection.on("text", function(str) {
		  if (str == goResponse)
		  {
			  sawGoResponse = true
			  console.log("The room told us we were leaving...")
			  connection.close()
			  callback()
		  }
	  })
  },
  function(callback){
	  var connection = ws.connect("ws://localhost:3000")
	  connection.on("connect", function() {
		  connection.sendText(exitsMessage)
	  })
	  connection.on("text", function(str) {
		  if (str == exitsReply)
		  {
			  console.log("The room told us the right exits.")
			  connection.close()
			  callback()
		  }
	  })
  },
  function(callback){
	  var connection = ws.connect("ws://localhost:3000")
	  connection.on("connect", function() {
		  connection.sendText(helpMessage)
	  })
	  connection.on("text", function(str) {
		  if (str == helpReply)
		  {
			  console.log("And tells us the right help information.")
			  connection.close()
			  callback()
		  }
	  })
  },
  function(callback){
	  var connection = ws.connect("ws://localhost:3000")
	  connection.on("connect", function() {
		  connection.sendText(inventoryMessage)
	  })
	  connection.on("text", function(str) {
		  if (str == inventoryReply)
		  {
			  console.log("Inventory works (such as it is).")
			  connection.close()
			  callback()
		  }
	  })
  },
  function(callback){
	  var connection = ws.connect("ws://localhost:3000")
	  connection.on("connect", function() {
		  connection.sendText(examineMessage)
	  })
	  connection.on("text", function(str) {
		  if (str == examineReply)
		  {
			  console.log("Examining works.")
			  connection.close()
			  callback()
		  }
	  })
  }
]);
