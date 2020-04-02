const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count =0
let message = 'Welcome to Chat'
io.on('connection', (socket) => {
    console.log('New Websocket connection')

    // socket.emit('countUpdated', count)
    // socket.on('increment',()=>{

    //     count++
    //     // socket.emit('countUpdated', count) // for single socket connection
    //     io.emit('countUpdated', count)// for every socket connection ie connected
    // })


    // socket.emit('serverToClient',generateMessage('Welcome!'))
    // socket.broadcast.emit('serverToClient',generateMessage('A new user has joined!'))

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)// specific socket function to join rooms

        socket.emit('serverToClient', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('serverToClient', generateMessage('Admin', user.username + ' has joined!'))


        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()
        // socket.emit io.emit socket.broadcast.emit
        // io.to.emit socket.broadcast.to.emit
    })



    socket.on('clientToServer', (message, callback) => {

        const user = getUser(socket.id)

        if (user) {
            const filter = new Filter()
            if (filter.isProfane(message)) {
                return callback('word is profane')
            }
            io.to(user.room).emit('serverToClient', generateMessage(user.username, message))
            callback() 
        }
        
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, 'https://google.com/maps?q=' + coords.latitude + ',' + coords.longitude))
        callback('Location shared!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('serverToClient', generateMessage('Admin',user.username + ' has left'))

            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }

    })
})

server.listen(port, () => {
    console.log('Server is up and running on port ' + port)
})

