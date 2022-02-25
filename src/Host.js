/*
 * src/Host.js
 *
 * All host specific functionality (host creation and message distribution).
 */
import Peer from 'peerjs';
import { updateGameID, getGameID, updateUsername, getUsername, setPeer, readData, sendData, setPeer } from './App';

var hostCons = [];
var hostConsUsers = [];

/*
 * Getter and setter methods.
 */

function getHostCons() {
    return hostCons.slice();
}

function getHostConsUsers() {
    return hostConsUsers.slice();
}

function addHostConsUsers(newUser) {
    hostConsUsers.push(newUser);
}

/* 
 * host()
 * 
 * Create a connection to start listening on (a "room").
 * This creates the Peer object for our end of the connection.
 * Sets up callbacks that handle any events related to our
 * peer object.
 */
function host() {
    updateGameID();
    updateUsername();
    gameID = getGameID();
  
    // Check for non-null inputs
    if (!getUsername()) {
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
    setPeer(peer);
  
    // Runs when the peer has been created
    peer.on('open', function (id) {
      console.log('ID: ' + peer.id);
      sendLocalChat("Room created with ID '<b>" + gameID + "</b>'.");
    });
  
    // Runs when a connection has been established
    peer.on('connection', function (c) {
      console.log("Connected to: " + c.peer);
      hostCons.push(c);
      //sendData('connection') the receiver doesn't get this, could be a timing issue
  
      // Runs when data is received
      c.on('data', (data) => readData(c, data));
    });
} //host()

/*
 * distributeData()
 *
 * Host sends a message, connection, other other data to all
 * connected peers that require it.
 */
function distributeData(source, data) {
    var response = null;
    console.log("Distributing info from host.");
  
    switch (data.type) {
        case 'connection':
            response = 'hostconnection';
            break;
        case 'msg':
        default: 
            //Assume a chat message
            break;
    }
  
    // Loop all connections and distribute the message
    for (var i = 0; i < hostCons.length; i++) {
        if (source && hostCons[i].peer === source.peer) { 
            if (response) {
                // Send response to the source peer
                console.log("Replying to source.");
                sendData(source, response);
            }
        } else {
            // Tell all other peers about the message
            console.log("Relaying msg to: " + hostCons[i].peer);
            sendData(hostCons[i], data.type, data.msg, data.username);
        }
    }
} //distributeData()

export { getHostCons, getHostConsUsers, addHostConsUsers, host, distributeData };