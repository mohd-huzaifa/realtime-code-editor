const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const {exec} = require('child_process');
const cors = require('cors');

const server = http.createServer(app);
const io = new Server(server);
app.use(express.json())
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('build'));
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});


app.post('/run', (req, res) => {
    console.log(req.body);
    const fileId = uuid();
    if (!fs.existsSync('codes')) {
        fs.mkdirSync('codes');
    }
    const {code , language} = req.body;
    try{

        
    console.log(language);
    console.log(code);
    const codes = path.join(__dirname, 'codes');
    const fileName = `${fileId}.${req.body.language}`; //${req.body.language}
    const filePath = path.join(codes, fileName);
    // res.send({ msg:filePath});
    fs.writeFileSync(filePath, code)

    exec(`cd codes &&  gcc ${fileName} -o run && run`, (error, stdout, stderr) => {
        if (error) {
            console.log(error)
            return
        }
        if (stdout) {
            res.send({ output: stdout });
            return;
        }
        if (stderr) {
            console.log(stderr);
            return;
        }
    })

    }catch(err){
        res.status(400).send({msg:err});
    }

})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
