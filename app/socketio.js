const { Server } = require("socket.io");

const maxHistoryLength = 50;
const history = [];

/**
 * add message to history
 *
 * @param {Object} msgObj
 */
function addMessageToHistory(msgObj) {
    history.push(msgObj);
    if (history.length > maxHistoryLength) {
        history.shift();
    }
}

function init(httpServer) {
    const io = new Server(httpServer);

    // mise en place des gestionnaires d'évènements liés à socket.io
    io.on("connection", (socket) => {
        console.log("un utilisateur vient de se connecter");
        socket.emit("history", history);

        // quand on reçoit le pseudo d'un client
        socket.on("client-nickname", (nickname) => {
            socket.data.nickname = nickname;
        });

        // quand on reçoit  un message d'un client
        socket.on("client-message", (msg) => {
            const msgObj = {
                nickname: socket.data.nickname,
                message: msg,
                socketId: socket.id,
            };
            io.emit("server-message", msgObj);

            addMessageToHistory(msgObj);
        });

        // quand on reçoit la position de la souris d'un client
        socket.on("client-mousemove", (mousePos) => {
            socket.broadcast.emit("server-mousemove", {
                nickname: socket.data.nickname,
                socketId: socket.id,
                x: mousePos.x,
                y: mousePos.y,
            });
        });
    });
}

module.exports = init;
