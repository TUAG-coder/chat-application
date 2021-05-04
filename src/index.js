const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const badWords = require('bad-words');

const { addUser, removeUser, getUser, getAllUsers }= require('./utils/users.js');

const {
    generateMessage: generateMessage,
    generateLocationMessage: generateLocationMessage
} = require('./utils/messages.js');

const filter = new badWords();

const app = express();
const server = http.createServer(app); 
const io = socketio(server); 

const port = process.env.PORT || 3000;

const publicStaticDirectory = path.join(__dirname, '../public');

app.use(express.static(publicStaticDirectory));

let count = 0;

io.on('connection', (socket) => {
    console.log("New client connected");
    
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        

        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username + ' has joined chat room...'));

        io.to(user.room).emit('usersList', {
            room: user.room,
            allUsers: getAllUsers(user.room)
        })

        callback();
    })
    
    socket.on('sent', (msg, callback) => {
        const user = getUser(socket.id);

        if (filter.isProfane(msg)) {
            return callback('Please mind your language');
        }
        io.to(user.room).emit('message', generateMessage(msg), user.username);  
        callback();
    })

    socket.on('sendPosition', (pos, callback) => {
        const user = getUser(socket.id);

        link = `https://google.com/maps?q=${pos.Latitude},${pos.Longitude}`;
        io.to(user.room).emit('messageLocation', generateLocationMessage(link), user.username);
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat room...`));
            io.to(user.room).emit('usersList', {
                room: user.room,
                allUsers: getAllUsers(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log("Server is up on port ", port);
})