// on se connecte au serveur
const socket = io();

const form = document.querySelector("form");
const input = document.querySelector("input");

const nickname = prompt("Quel est ton pseudo ?");
// const nickname = "Matt";

// on envoie le pseudo au serveur
socket.emit("client-nickname", nickname);

window.addEventListener(
    "mousemove",
    // onMouseMove
    _.throttle(onMouseMove, 250, { leading: true, trailing: true })
);

form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (input.value) {
        // on envoie le message au serveur
        socket.emit("client-message", input.value);
        input.value = "";
    }
});

// quand on reçoit l'historique des messages
socket.on("history", (history) => {
    history.forEach((msg) => {
        addMessage(msg);
    });
});

// quand on reçoit un message du serveur
socket.on("server-message", (msg) => {
    addMessage(msg);
});

socket.on("server-mousemove", (mouseObj) => {
    const pointer = getUserPointer(mouseObj);
    pointer.style.left = mouseObj.x + "px";
    pointer.style.top = mouseObj.y + "px";
});

// quand la souris se déplace
function onMouseMove(event) {
    socket.emit("client-mousemove", { x: event.clientX, y: event.clientY });
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
    const pointer = document.createElement("div");

    pointer.classList.add("user-pointer");
    pointer.setAttribute("data-id", socketId);
    pointer.textContent = nickname;
    pointer.style.color = "wheat";

    return pointer;
}

function addMessage(msg) {
    const messageContainer = document.querySelector(".messages");
    const containerMyMessage = document.createElement("div");
    const myNickname = document.createElement("p");
    const myMessage = document.createElement("p");
    const dateMessage = document.createElement("span");

    containerMyMessage.classList.add("container-one-message");
    myNickname.classList.add("nickname");
    myMessage.classList.add("message");

    if (socket.id === msg.socketId) {
        containerMyMessage.classList.add("my-message");
    }

    myNickname.textContent = msg.nickname;
    myMessage.textContent = msg.message;
    dateMessage.textContent = new Date().toLocaleDateString("fr");

    containerMyMessage.append(myNickname, myMessage);
    myNickname.append(dateMessage);
    messageContainer.append(containerMyMessage);

    element = document.querySelector(".messages");
    element.scrollTop = element.scrollHeight;
}
