/*
 * src/App.js
 *
 * Main React page, along with basic peer-to-peer connectivity.
 */
import './App.css';
import Peer from 'peerjs';

// Global variables
var peer = null;
var conn = null;
var message = null;
var username = null;
var gameID = null;

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

  // Check for non-null inputs
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
    sendData('connection');
    
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
  gameID = document.getElementById('game-id').value;
  username = document.getElementById('username').value;

  // Check for non-null inputs
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
    sendLocalChat("Room created with ID '<b>" + gameID + "</b>'.");
  });

  // Runs when a connection has been established
  peer.on('connection', function (c) {
    conn = c;
    console.log("Connected to: " + conn.peer);
    //sendData('connection') the receiver doesn't get this, could be a timing issue

    // Runs when data is received
    conn.on('data', (data) => readData(data));
  });
};

/*
 * sendData()
 * 
 * Prepares and sends the given data to all
 * users in the connection.
 */
function sendData(type, txt) {
  if (!conn) {
    console.log("Failed to send data to non-existent connection.");
    return;
  }

  // Create the JSON object to send
  var data = {
    username: username,
    type: type
  }

  // Modify it depending on what kind of data we want to send
  switch(type) {
    case 'connection':
      break;
    case 'msg':
    default:
      data.msg = txt;
      break;
  }
  conn.send(data);
}

/*
 * readData()
 * 
 * Reads the sent data and interprets it as
 * necessary.
 */
function readData(data) {
  console.log("Data recieved: ", data);

  // Check what type of data was sent
  const type = data.type;
  switch (type) {
    case 'connection':
      // Reply if this is the host
      if (gameID && gameID == peer.id) {
        sendData('connection');
      }
      
      sendLocalChat("Connected to: " + data.username);
      break;
    case 'msg':
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
 * Records the text in the 'chat' HTML element and sends
 * it to the sendOnlineChat() function (recording the chat
 * locally and sending to all other users in the room).
 */
function enterChat() {
  const msg = document.getElementById('chat').value;
  sendOnlineChat(msg);
}

/*
 * sendOnlineChat(msg)
 *
 * Sends the given text to all users in the connection, and
 * adds a record of it in the chat box.
 */
function sendOnlineChat(msg) {
  if (!conn) {
    alert("You need to be in a room with other people!");
    return;
  }

  sendData('msg', msg);
  console.log("Sent message: " + username + "," + msg);
  addChatBox("<span class=\"selfMsg\">" + username + ": </span>" + msg);
}

/*
 * sendLocalChat(msg)
 *
 * Records a local copy of the msg to the chat box.
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
  message.innerHTML = "<br><span class=\"msgTime\">" + time + "</span>  -  " + msg + message.innerHTML;
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
      <table className="chatSection">
        <tbody>
          <tr>
            <td className="noPad"><h1 className="chatHeader">Chat</h1></td>
          </tr>
          <tr>
            <td className="chatBox">
              <input type="text" id="chat"></input>
              <button onClick={enterChat}>Send</button>
            </td>
          </tr>
          <tr>
            <td className="chatLog">
              <div id="message"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Main (starting) code
create();

export default App;
