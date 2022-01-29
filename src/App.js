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

  // Create connection to destination peer specified in the input field
  conn = peer.connect(gameID);

  // Runs function after successful connection to peer
  conn.on('open', function () {
    console.log("Connected to: " + conn.peer);
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

  // Create own peer object with connection to shared PeerJS server
  peer = new Peer(gameID, {
    debug: 2
  });

  // Runs when the peer has been created
  peer.on('open', function (id) {
    console.log('ID: ' + peer.id);
    console.log("Awaiting connection...");
  });

  // Runs when a connection has been established
  peer.on('connection', function (c) {
    conn = c;
    console.log("Connected to: " + conn.peer);

    conn.on('data', function (data) {
      console.log("Data recieved");
      console.log(data);
    });
  });
};

// Main React app render
function App() {
  return (
    <div className="App">
      <span>
        Display Name:
        <input type="text" id="display-name"></input>
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
      <h1>Game</h1>
    </div>
  );
}

// Main code
create();

export default App;
