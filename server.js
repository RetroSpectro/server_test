const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const http = require('http');
const app = express();

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

let port = normalizePort(process.env.PORT || '3000');
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

let server = require('http').Server(app);

let io = require('socket.io')(server);



//Allow Cross Domain Requests
io.set('transports', ['websocket']);


let users = {};
let socketToRoom = {};
io.on('connection', socket => {
    console.log(`connected: ${socket.id}`)
    socket.on("join room", roomID => {

        console.log(`User: ${socket.id}     joined room: ${roomID}`)
        if (users[roomID]) {
            let length = users[roomID].length;
            if (length === 2) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        let usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        console.log("in sending signal")

        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("message", msg => {
        let roomID = socketToRoom[socket.id];

        let usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        if (usersInThisRoom) {

            usersInThisRoom.forEach(usr => {
                io.to(usr).emit('message', msg)
            })
        }
    });



    socket.on("returning signal", payload => {
        console.log("in returning signal")

        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        let roomID = socketToRoom[socket.id];

        let room = users[roomID];

        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;

            users[roomID].forEach(usr => {
                io.to(usr).emit('disconnect', socket.id)
            })
        }

    });

});

server.listen(port, () => {
    console.log(`Listening on port *: ${port}`);
});