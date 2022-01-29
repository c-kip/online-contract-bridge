/*
 * src/App.js
 *
 * Main React page, along with basic peer-to-peer connectivity.
 */
import logo from './logo.svg';
import './App.css';
import Peer from 'peerjs';

// Global variables
var peer = null;
var conn = null;
var message = null;
var username = null;

/*
 * create()
 *
 * Create peer object for this system with a random ID,
 * and add listener to log the generated ID upon completion.
 */
function create() {
  peer = new Peer(null, {
    debug: 2
  });

  // Runs function once Peer object is ready to connect
  peer.on('open', function (id) {
    console.log('ID: ' + peer.id);
  });
}

/*
 * join()
 * 
 * Attempt to connect to the gameID given in the text box using
 * peer-to-peer connection.
 */
function join() {
  const gameID = document.getElementById('game-id').value;
  username = document.getElementById('username').value;

  if (!username) {
    alert("Please enter in a display name!");
    return;
  }
  if (!gameID) {
    alert("Please enter in a game ID!");
    return;
  }

  // Create connection to destination peer specified in the input field
  conn = peer.connect(gameID);

  // Runs function after successful connection to peer
  conn.on('open', function () {
    console.log("Connected to: " + conn.peer);
    conn.send("+" + username);
    
    // Runs when data is received
    conn.on('data', (data) => readData(data));
  });
};

/* 
 * host()
 * 
 * Create a connection to start listening on (a "room").
 * This creates the Peer object for our end of the connection.
 * Sets up callbacks that handle any events related to our
 * peer object.
 */
function host() {
  const gameID = document.getElementById('game-id').value;
  username = document.getElementById('username').value;

  if (!username) {
    alert("Please enter in a display name!");
    return;
  }
  if (!gameID) {
    alert("Please enter in a game ID!");
    return;
  }

  // Create own peer object with connection to shared PeerJS server
  peer = new Peer(gameID, {
    debug: 2
  });

  // Runs when the peer has been created
  peer.on('open', function (id) {
    console.log('ID: ' + peer.id);
    sendLocalChat("Room created with ID '" + gameID + "'.");
  });

  // Runs when a connection has been established
  peer.on('connection', function (c) {
    conn = c;
    console.log("Connected to: " + conn.peer);
    conn.send("+" + username);

    // Runs when data is received
    conn.on('data', (data) => readData(data));
  });
};

/*
 * readData()
 * 
 * Reads the sent data and interprets it as
 * necessary.
 */
function readData(data) {
  console.log("Data recieved: ", data);

  // Check what type of data was sent
  const char = data.charAt(0);
  switch (char) {
    case '+':
      sendLocalChat("Connected to: " + data.slice(1));
      break;
    default: 
      //Assume a chat message
      const commaIndex = data.indexOf(",");
      var otherUsername = data.slice(0, commaIndex);
      var message = data.slice(commaIndex + 1);
      sendLocalChat("<span class=\"selfMsg\">" + otherUsername + ": </span>" + message);
      break;
  }
}

/*
 * getTimeStr()
 * 
 * Returns a string in the format HH:MM:SS
 */
function getTimeStr() {
  // Get the date and time
  var now = new Date();
  var h = now.getHours();
  var m = addZero(now.getMinutes());
  var s = addZero(now.getSeconds());

  if (h > 12)
      h -= 12;
  else if (h === 0)
      h = 12;

  function addZero(t) {
      if (t < 10)
          t = "0" + t;
      return t;
  };

  return h + ":" + m + ":" + s
}

/*
 * enterChat()
 *
 *
 */
function enterChat() {
  const msg = document.getElementById('chat').value;
  sendOnlineChat(msg);
}

/*
 * sendOnlineChat(msg)
 *
 *
 */
function sendOnlineChat(msg) {
  if (!conn) {
    alert("You need to be in a room with other people!");
    return;
  }

  conn.send(username + "," + msg);
  console.log("Sent message: " + username + "," + msg);
  addChatBox("<span class=\"selfMsg\">" + username + ": </span>" + msg);
}

/*
 * sendLocalChat(msg)
 *
 *
 */
function sendLocalChat(msg) {
  console.log("Local message: ", msg);
  addChatBox(msg);
}

/*
 * addChatBox(msg)
 *
 * Adds a given string to the 'message' HTML object
 * (which represents the chat box).
 */
function addChatBox(msg) {
  if (!message) {
    message = document.getElementById("message");
  }

  const time = getTimeStr();
  message.innerHTML = "<br><span class=\"msg-time\">" + time + "</span>  -  " + msg + message.innerHTML;
}

// Main React app render
function App() {
  return (
    <div className="App">
      <span>
        Display Name:
        <input type="text" id="username"></input>
      </span>
      <br/>
      <span>
        Game ID:
        <input type="text" id="game-id"></input>
      </span>
      <br/>
      <span>
        <button onClick={join}>Join</button>
        <button onClick={host}>Create Game</button>
      </span>
      <h1>Chat</h1>
      <span>
        <input type="text" id="chat"></input>
        <button onClick={enterChat}>Send</button>
      </span>
      <span>
        <div id="message"><span></span></div>
      </span>
    </div>
  );
}

// Main (starting) code
create();

export default App;
