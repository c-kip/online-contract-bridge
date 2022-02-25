/*
 * src/Peer.js
 *
 * All peer specific functionality (peer creation/joining).
 */
import { updateGameID, getGameID, updateUsername, getUsername, getPeer, readData, sendData } from './App';

var conn = null;

/*
 * join()
 * 
 * Attempt to connect to the gameID given in the text box using
 * peer-to-peer connection.
 */
function join() {
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
  
    // Create connection to destination peer specified in the input field
    conn = getPeer().connect(gameID);
  
    // Runs function after successful connection to peer
    conn.on('open', function () {
      console.log("Connected to: " + conn.peer);
  
      // Runs when data is received
      conn.on('data', (data) => readData(conn, data));
  
      // Send an official connection message
      sendData(conn, 'connection');
    });
} //join()

export { join };