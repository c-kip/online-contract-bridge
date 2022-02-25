/*
 * src/App.js
 *
 * Main React page, along with basic peer-to-peer connectivity.
 */
import './App.css';
import Peer from 'peerjs';
import { join } from './Peer';
import { getHostCons, getHostConsUsers, host, distributeData } from './Host';

// Global variables
var peer = null;
var conn = null;
var messageHTML = null;
var username = null;
var gameID = null;

/*
 * Getter and setter methods
 */

function updateGameID() {
  gameID = document.getElementById('game-id').value;
}

function getGameID() {
  return gameID;
}

function updateUsername() {
  username = document.getElementById('username').value;
}

function getUsername() {
  return username;
}

function getPeer() {
  return peer;
}

function setPeer(newPeer) {
  peer = newPeer;
}

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
 * sendData()
 * 
 * Prepares and sends the given data to all
 * users in the connection.
 */
function sendData(connection, type, txt, otherUser) {
  if (!connection) {
    console.log("Failed to send data to non-existent connection.");
    return;
  }

  // Create the JSON object to send
  var data = {
    type: type
  }
  if (otherUser) {
    data.username = otherUser;
  } else {
    data.username = username;
  }

  // Modify it depending on what kind of data we want to send
  switch(type) {
    case 'hostconnection':
      data.allUsers = getHostConsUsers().slice();
      break;
    case 'connection':
      break;
    case 'msg':
      data.msg = txt;
      break;
    default:
      console.log("Unrecognized response attempted to send, returning.");
      return;
  }
  connection.send(data);
}

/*
 * readData()
 * 
 * Reads the sent data and interprets it as
 * necessary.
 */
function readData(connection, data) {
  console.log("Data recieved: ", data);

  // Check what type of data was sent
  switch (data.type) {
    case 'hostconnection':
      console.log("Host connection received.");
      sendLocalChat("Connected to: " + data.username);
      for (var i = 0; i < data.allUsers.length; i++) {
        if (data.allUsers[i] !== username) {
          sendLocalChat("Connected to: " + data.allUsers[i]);
        }
      }
      break;
    case 'connection':
      console.log("Connection received.");
      addHostConsUsers(data.username);
      sendLocalChat("Connected to: " + data.username);
      break;
    case 'msg':
      //Assume a chat message
      console.log("Message or otherwise received.");
      sendLocalChat("<span class=\"selfMsg\">" + data.username + ": </span>" + data.msg);
      break;
    default: 
      console.log("Unrecognized response attempted to send, returning.");
      return;
  }

  // Distribute if this is the host
  if (gameID && gameID === peer.id) {
    distributeData(connection, data);
  }
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
  var msgData = {
    type: 'msg',
    msg: msg
  }

  if (gameID && gameID === peer.id) {
    // Device is the host, so send data to all peers. First check they have a connection
    if (!getHostCons()[0]) {
      alert("You need to be in a room with other people!");
      return;
    }

    distributeData(null, msgData);
    console.log("Sent message to all peers: " + username + "," + msg);

  } else {
    // Device is a peer, first check they have a connection
    if (!conn) {
      alert("You need to be in a room with other people!");
      return;
    }

    // Send the data
    sendData(conn, 'msg', msg);
    console.log("Sent message: " + username + "," + msg);
  }
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
  if (!messageHTML) {
    messageHTML = document.getElementById("message");
  }

  const time = getTimeStr();
  messageHTML.innerHTML = "<br><span class=\"msgTime\">" + time + "</span>  -  " + msg + messageHTML.innerHTML;
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
export { updateGameID, updateUsername, getGameID, getUsername, getPeer, setPeer, readData, sendData };