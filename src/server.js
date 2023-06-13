const express = require('express');
const connectDb = require('./config/dbConnection');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const bodyParser = require('body-parser');

var cookieParser = require('cookie-parser');
// const dotenv = require('dotenv').config();
require('dotenv').config();

connectDb();

const app = express();
app.use(cors());
app.use(cookieParser());
const port = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use("/api/contacts", require("./routes/contactRoutes"));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/playerResults', require('./routes/playerResultRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

//Socket server
const { instrument } = require('@socket.io/admin-ui');
// const Port = 'http://172.20.131.26:4000';

const io = require('socket.io')(3001, {
    cors: {
        origin: [
            'http://192.168.146.18:4000',
            'https://admin.socket.io/#/sockets'
        ]
    }
});

let game;
let gameIdCurrent;
let pinGames = [];
let leaderboard;
let leaderBoardGame = [];
let players = [];

const addPlayer = (userName, playerId, avatar, socketId) => {
    !players.some((player) => player.socketId === socketId) &&
        players.push({ userName, playerId, avatar, socketId });
};

const getPlayer = (socketId) => {
    return players.find((player) => player.socketId === socketId);
};

io.on('connection', (socket) => {
    console.log(socket.id + 'connected');
    socket.on('disconnect', (reason) => {
        console.log('Socket ' + socket.id + ' was disconnected');
        console.log(reason);
    });

    socket.on('init-game', (newGame, newLeaderboard) => {
        game = JSON.parse(JSON.stringify(newGame));
        pinGames.push(game.pin);
        leaderboard = JSON.parse(JSON.stringify(newLeaderboard));
        leaderBoardGame.push(leaderboard);
        socket.join(game.pin);
        hostId = socket.id;
        console.log(
            'Host with id ' +
                socket.id +
                ' started game and joined room: ' +
                game.pin
        );
    });

    socket.on('add-player', (user, socketId, pin, cb) => {
        if (pinGames.includes(pin)) {
            leaderBoardGame.map((leaderboard) => {
                if (leaderboard.pin === pin) {
                    gameIdCurrent = leaderboard.gameId;
                }
            });
            addPlayer(user.userName, user._id, user.avatar, socketId);
            cb('correct', user._id, gameIdCurrent);
            socket.join(pin);
            console.log(
                'Student ' +
                    user.userName +
                    ' with id ' +
                    socket.id +
                    ' joined room ' +
                    pin
            );
            let player = getPlayer(socketId);
            io.emit('player-added', player, pin);
        } else {
            cb('wrong', gameIdCurrent);
        }
    });

    socket.on(
        'start-game',
        (game, leaderboard, length, playerList, pointsPerQuestion) => {
            console.log('Move players to game');
            socket
                .to(game?.pin)
                .emit(
                    'move-to-game-page',
                    game?._id,
                    game?.pin,
                    leaderboard?._id,
                    length,
                    playerList,
                    pointsPerQuestion
                );
        } 
    );

    socket.on('countdown-preview', (gamePin, cb) => {
        cb();
        socket.to(gamePin).emit('host-countdown-preview', gamePin);
    });

    socket.on('start-question-timer', (gamePin, time, question, cb) => {
        console.log(
            'Send question ' + question.questionIndex + ' data to players'
        );
        socket.to(gamePin).emit('host-start-question-timer', time, question);
        cb();
    });

    socket.on('send-answer-to-host', (data, score, pinGame, leaderboardId) => {
        let player = getPlayer(socket.id);
        console.log(data, player.userName, score, pinGame, leaderboardId);
        socket
            .to(pinGame)
            .emit('get-answer-from-player', data, leaderboardId, score, player);
    });

    socket.on('host-end-game', (pinGame) => {
        console.log('End', pinGame);
        socket.to(pinGame).emit('host-end-gamee');
    });

    socket.on('host-leave-WattingRoom', (pin) => {
        console.log('Host with id ' + socket.id + ' leave room: ' + pin);
        pinGames = pinGames.filter((item) => item !== pin);
        leaderBoardGame = leaderBoardGame.filter((item) => item.pin !== pin);

        socket.to(pin).emit('notify-host-leave-WattingRoom', pin);
        socket.leave(pin);
        console.log(pin);
    });

    socket.on('studen-leave-JoinRoom', (pin) => {
        console.log('Student with id ' + socket.id + ' leave room: ' + pin);
        let player = getPlayer(socket.id);

        socket.to(pin).emit('notify-student-leave-JoinRoom', player, pin);
        socket.leave(pin);
    });

    socket.on('host-leave-room', (pin) => {
        console.log('Host with id ' + socket.id + ' leave room: ' + pin);
        pinGames = pinGames.filter((item) => item !== pin);
        leaderBoardGame = leaderBoardGame.filter((item) => item.pin !== pin);

        socket.to(pin).emit('host-leave', pin);
        socket.leave(pin);
    });
});

instrument(io, { auth: false });
