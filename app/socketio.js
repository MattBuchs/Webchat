const { Server } = require('socket.io');

// le nombre max de messages conversés
const maxHistoryLength = 50;

// un tableau pour stocker l'historique des messages
const history = [];

/**
 * add message to history
 *
 * @param {Object} msgObj
 */
function addMessageToHistory(msgObj) {
  // on ajoute le message dans le tableau history
  history.push(msgObj);
  // si la longueur du tableau est supérieure à maxHistoryLength
  if (history.length > maxHistoryLength) {
    // on supprime le message le plus ancien
    history.shift();
  }
}

function init(httpServer) {
  const io = new Server(httpServer);

  // mise en place des gestionnaires d'évènements liés à socket.io
  io.on('connection', (socket) => {
    // le paramètre socket représente la connexion qui s'établit entre chaque client et le serveur
    console.log('un utilisateur vient de se connecter');
    socket.emit('history', history);

    // quand on reçoit le pseudo d'un client
    socket.on('client-nickname', (nickname) => {
      // on le stocke dans l'objet qui représente sa connexion au serveur
      socket.data.nickname = nickname;
    });

    // quand on reçoit  un message d'un client
    socket.on('client-message', (msg) => {
      const msgObj = {
        nickname: socket.data.nickname,
        message: msg,
      };
      // on redistribue ce message à tous les clients, avec le pseudonyme associé au socket qui a envoyé le message
      io.emit('server-message', msgObj);
      // on l'ajoute à l'historique
      addMessageToHistory(msgObj);
    });

    // quand on reçoit la position de la souris d'un client
    socket.on('client-mousemove', (mousePos) => {
      // on envoie cette position avec le pseudo et l'identifiant unique du socket à tous les clients,
      // sauf celui qui a envoyé la position de sa souris (https://socket.io/fr/docs/v3/emit-cheatsheet/)
      socket.broadcast.emit('server-mousemove', {
        nickname: socket.data.nickname,
        socketId: socket.id,
        x: mousePos.x,
        y: mousePos.y,
      });
    });
  });
}

module.exports = init;
