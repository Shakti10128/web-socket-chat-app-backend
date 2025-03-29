"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allSocket = [];
wss.on("connection", function (socket) {
    // console.log("hello connection");
    socket.on("message", (message) => {
        // the message will be string of json object, you can see below, in websocket we can only
        // communicate in binary or strings
        var _a;
        // so convert the string to an object first
        //@ts-ignore
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "join") {
            console.log(parsedMessage.payload.roomId);
            const room = parsedMessage.payload.roomId;
            allSocket.push({ socket, room });
            // Notify everyone in the room that a new user joined
            allSocket.forEach((x) => {
                if (x.room === room) {
                    x.socket.send(JSON.stringify({ type: "notification", payload: { message: "A new user joined the room!" } }));
                }
            });
        }
        if (parsedMessage.type === 'chat') {
            // find the room of the user who sent the message
            const currentUserRoom = (_a = allSocket.find(s => s.socket === socket)) === null || _a === void 0 ? void 0 : _a.room;
            // broadcast this message to all the user who have already joined that room
            allSocket.forEach(x => {
                if (currentUserRoom === x.room) {
                    x.socket.send(parsedMessage.payload.message);
                }
            });
        }
    });
    // remove the socket of the disconnect user, else websocket will try to send 
    // the message to dead connection
    socket.on("disconnect", () => {
        allSocket = allSocket.filter(disconnectSocket => {
            disconnectSocket.socket != socket;
        });
    });
});
/* Join a Room
{
    "type":"join",
    "payload":{
        "roomId":"123"
    }
}
*/
/* send a message
{
    "type":"chat",
    "payload":{
        "message":"hi"
    }
}
*/
