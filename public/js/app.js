// on se connecte au serveur
const socket = io();

// on récupère le formulaire et l'input text utilisés pour l'envoi de messages
const form = document.querySelector('form');
const input = document.querySelector('input');

// on demande son peudo à l'utilisateur
const nickname = prompt('Quel est ton pseudo ?');

// on envoie le pseudo au serveur
socket.emit('client-nickname', nickname);

// on écoute les déplacements de la souris
window.addEventListener(
  'mousemove',
  _.throttle(onMouseMove, 250, { leading: true, trailing: true })
);

// quand le formulaire est soumis
form.addEventListener('submit', function (event) {
  // on empèche le fonctionnement normal de l'évènement
  event.preventDefault();
  // si l'utilisateur a bien entré un message
  if (input.value) {
    // on envoie le message au serveur
    socket.emit('client-message', input.value);
    // on vide l'input
    input.value = '';
  }
});

// quand on reçoit l'historique des messages
socket.on('history', (history) => {
  // on boucle sur le contenu d'history
  history.forEach((msg) => {
    // on ajoute au chat chaque message de l'historique
    addMessage(msg);
  });
});

// quand on reçoit un message du serveur
socket.on('server-message', (msg) => {
  // on ajoute le message reçu au DOM
  addMessage(msg);
});

socket.on('server-mousemove', (mouseObj) => {
  const pointer = getUserPointer(mouseObj);
  pointer.style.left = mouseObj.x + 'px';
  pointer.style.top = mouseObj.y + 'px';
});

// quand la souris se déplace
function onMouseMove(event) {
  // console.log(`xpos: ${event.clientX}, ypos: ${event.clientY}`);
  // on envoie la position de la souris au serveur
  socket.emit('client-mousemove', { x: event.clientX, y: event.clientY });
}

function getUserPointer(mouseObj) {
  let pointer = document.querySelector(
    `.user-pointer[data-id="${mouseObj.socketId}"]`
  );
  if (!pointer) {
    pointer = createPointer(mouseObj.nickname, mouseObj.socketId);
    document.body.append(pointer);
  }
  return pointer;
}

function createPointer(nickname, socketId) {
  const pointer = document.createElement('div');
  pointer.classList.add('user-pointer');
  pointer.setAttribute('data-id', socketId);
  pointer.textContent = nickname;
  return pointer;
}

function addMessage(msg) {
  const messageContainer = document.querySelector('.messages');
  const myMessage = document.createElement('div');
  myMessage.textContent = `${msg.nickname}: ${msg.message}`;
  messageContainer.append(myMessage);
}
