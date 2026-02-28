const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// ─── Load Word Banks ────────────────────────────────────────────────
const darijaWords = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'words', 'darija.json'), 'utf8')
);
const englishWords = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'words', 'english.json'), 'utf8')
);

const WORD_BANKS = { darija: darijaWords, english: englishWords };

// ─── Express + Socket.IO Setup ──────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    path: '/socket.io'
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Game Constants ─────────────────────────────────────────────────
const ROUND_DURATION = 60; // seconds
const TOTAL_ROUNDS = 4;    // 2 turns per team

// ─── Room Storage ───────────────────────────────────────────────────
const rooms = new Map();

// ─── Helper: Generate Room Code ─────────────────────────────────────
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return rooms.has(code) ? generateRoomCode() : code;
}

// ─── Helper: Pick a Word ────────────────────────────────────────────
function pickWord(room) {
    const bank = WORD_BANKS[room.language] || WORD_BANKS.darija;
    const available = bank.filter((w) => !room.usedWords.has(w.word));
    if (available.length === 0) {
        room.usedWords.clear();
        return bank[Math.floor(Math.random() * bank.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
}

// ─── Helper: Get Room Player List ───────────────────────────────────
function getPlayerList(room) {
    return {
        teamA: room.teams.A.players.map((p) => ({
            id: p.id,
            name: p.name,
            isDescriber: room.phase === 'playing' &&
                room.currentTeam === 'A' &&
                room.teams.A.players[room.currentDescriber.A] &&
                room.teams.A.players[room.currentDescriber.A].id === p.id
        })),
        teamB: room.teams.B.players.map((p) => ({
            id: p.id,
            name: p.name,
            isDescriber: room.phase === 'playing' &&
                room.currentTeam === 'B' &&
                room.teams.B.players[room.currentDescriber.B] &&
                room.teams.B.players[room.currentDescriber.B].id === p.id
        })),
        unassigned: room.unassigned.map((p) => ({ id: p.id, name: p.name }))
    };
}

// ─── Helper: Broadcast Room State ───────────────────────────────────
function broadcastRoomState(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    const state = {
        roomCode,
        phase: room.phase,
        players: getPlayerList(room),
        scores: { A: room.teams.A.score, B: room.teams.B.score },
        currentTeam: room.currentTeam,
        round: room.round,
        totalRounds: TOTAL_ROUNDS,
        timeLeft: room.timeLeft,
        language: room.language,
        hostId: room.hostId
    };

    io.to(roomCode).emit('room-state', state);
}

// ─── Helper: Start a Round ──────────────────────────────────────────
function startRound(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.phase = 'playing';
    room.timeLeft = ROUND_DURATION;
    room.roundScore = 0;

    const word = pickWord(room);
    room.currentWord = word;
    room.usedWords.add(word.word);

    // Send word only to describer
    const team = room.teams[room.currentTeam];
    const describerIdx = room.currentDescriber[room.currentTeam];
    const describer = team.players[describerIdx];

    if (describer) {
        io.to(describer.id).emit('word-card', {
            word: word.word,
            forbidden: word.forbidden
        });
    }

    broadcastRoomState(roomCode);

    // Start timer
    room.timer = setInterval(() => {
        room.timeLeft--;
        io.to(roomCode).emit('timer-tick', room.timeLeft);

        if (room.timeLeft <= 0) {
            clearInterval(room.timer);
            endRound(roomCode);
        }
    }, 1000);
}

// ─── Helper: End a Round ────────────────────────────────────────────
function endRound(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    if (room.timer) {
        clearInterval(room.timer);
        room.timer = null;
    }

    room.phase = 'roundResult';
    room.currentWord = null;
    room.round++;

    // Rotate describer
    const team = room.currentTeam;
    room.currentDescriber[team] =
        (room.currentDescriber[team] + 1) % room.teams[team].players.length;

    // Switch teams
    room.currentTeam = room.currentTeam === 'A' ? 'B' : 'A';

    if (room.round > TOTAL_ROUNDS) {
        room.phase = 'gameOver';
        let winner = 'tie';
        if (room.teams.A.score > room.teams.B.score) winner = 'A';
        else if (room.teams.B.score > room.teams.A.score) winner = 'B';

        io.to(roomCode).emit('game-over', {
            scores: { A: room.teams.A.score, B: room.teams.B.score },
            winner
        });
    }

    broadcastRoomState(roomCode);
}

// ─── Socket.IO Connection ───────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`[Taboo] Player connected: ${socket.id}`);
    let currentRoom = null;

    // ── Create Room ─────────────────────────────────────────────────
    socket.on('create-room', ({ playerName, language }) => {
        const roomCode = generateRoomCode();
        const room = {
            hostId: socket.id,
            language: language || 'darija',
            phase: 'lobby', // lobby | teams | playing | roundResult | gameOver
            teams: {
                A: { players: [], score: 0 },
                B: { players: [], score: 0 }
            },
            unassigned: [{ id: socket.id, name: playerName }],
            currentTeam: 'A',
            currentDescriber: { A: 0, B: 0 },
            currentWord: null,
            round: 1,
            timeLeft: ROUND_DURATION,
            roundScore: 0,
            usedWords: new Set(),
            timer: null
        };

        rooms.set(roomCode, room);
        socket.join(roomCode);
        currentRoom = roomCode;

        socket.emit('room-created', { roomCode });
        broadcastRoomState(roomCode);
        console.log(`[Taboo] Room ${roomCode} created by ${playerName}`);
    });

    // ── Join Room ───────────────────────────────────────────────────
    socket.on('join-room', ({ roomCode, playerName }) => {
        const code = roomCode.toUpperCase().trim();
        const room = rooms.get(code);

        if (!room) {
            socket.emit('error-msg', { message: 'Room not found!' });
            return;
        }
        if (room.phase !== 'lobby' && room.phase !== 'teams') {
            socket.emit('error-msg', { message: 'Game already in progress!' });
            return;
        }

        room.unassigned.push({ id: socket.id, name: playerName });
        socket.join(code);
        currentRoom = code;

        socket.emit('room-joined', { roomCode: code });
        broadcastRoomState(code);
        console.log(`[Taboo] ${playerName} joined room ${code}`);
    });

    // ── Join Team ───────────────────────────────────────────────────
    socket.on('join-team', ({ team }) => {
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        if (!room) return;

        // Remove from unassigned and other team
        room.unassigned = room.unassigned.filter((p) => p.id !== socket.id);
        room.teams.A.players = room.teams.A.players.filter((p) => p.id !== socket.id);
        room.teams.B.players = room.teams.B.players.filter((p) => p.id !== socket.id);

        // Find player name
        const allPlayers = [
            ...room.teams.A.players,
            ...room.teams.B.players,
            ...room.unassigned
        ];
        let playerName = 'Player';
        // Check all sockets in room
        const existingNames = new Map();
        io.sockets.adapter.rooms.get(currentRoom)?.forEach((sid) => {
            // We stored players in unassigned/teams, search there
        });

        // Re-search in backup (we removed already, use socket data)
        // Simpler: store name on socket
        playerName = socket.data?.playerName || 'Player';

        room.teams[team].players.push({ id: socket.id, name: playerName });
        room.phase = 'teams';

        broadcastRoomState(currentRoom);
    });

    // ── Set Language ────────────────────────────────────────────────
    socket.on('set-language', ({ language }) => {
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        if (!room || socket.id !== room.hostId) return;

        room.language = language;
        broadcastRoomState(currentRoom);
    });

    // ── Start Game ──────────────────────────────────────────────────
    socket.on('start-game', () => {
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        if (!room || socket.id !== room.hostId) return;

        if (room.teams.A.players.length < 1 || room.teams.B.players.length < 1) {
            socket.emit('error-msg', { message: 'Each team needs at least 1 player!' });
            return;
        }

        room.round = 1;
        room.teams.A.score = 0;
        room.teams.B.score = 0;
        room.currentTeam = 'A';
        room.currentDescriber = { A: 0, B: 0 };
        room.usedWords.clear();

        startRound(currentRoom);
    });

    // ── Correct (Got It) ───────────────────────────────────────────
    socket.on('correct', () => {
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        if (!room || room.phase !== 'playing') return;

        // Only describer can press this
        const team = room.teams[room.currentTeam];
        const describer = team.players[room.currentDescriber[room.currentTeam]];
        if (!describer || describer.id !== socket.id) return;

        team.score++;

        // Pick next word
        const word = pickWord(room);
        room.currentWord = word;
        room.usedWords.add(word.word);

        socket.emit('word-card', { word: word.word, forbidden: word.forbidden });
        broadcastRoomState(currentRoom);
    });

    // ── Skip ────────────────────────────────────────────────────────
    socket.on('skip', () => {
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        if (!room || room.phase !== 'playing') return;

        const team = room.teams[room.currentTeam];
        const describer = team.players[room.currentDescriber[room.currentTeam]];
        if (!describer || describer.id !== socket.id) return;

        // Pick next word, no score change
        const word = pickWord(room);
        room.currentWord = word;
        room.usedWords.add(word.word);

        socket.emit('word-card', { word: word.word, forbidden: word.forbidden });
    });

    // ── Taboo (penalty) ────────────────────────────────────────────
    socket.on('taboo', () => {
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        if (!room || room.phase !== 'playing') return;

        // Anyone from opposing team can press taboo
        const opposingTeam = room.currentTeam === 'A' ? 'B' : 'A';
        const isOpposing = room.teams[opposingTeam].players.some(
            (p) => p.id === socket.id
        );
        if (!isOpposing) return;

        room.teams[room.currentTeam].score = Math.max(
            0,
            room.teams[room.currentTeam].score - 1
        );

        // Pick next word
        const word = pickWord(room);
        room.currentWord = word;
        room.usedWords.add(word.word);

        const team = room.teams[room.currentTeam];
        const describer = team.players[room.currentDescriber[room.currentTeam]];
        if (describer) {
            io.to(describer.id).emit('word-card', {
                word: word.word,
                forbidden: word.forbidden
            });
        }

        io.to(currentRoom).emit('taboo-called', { by: socket.id });
        broadcastRoomState(currentRoom);
    });

    // ── Next Round ──────────────────────────────────────────────────
    socket.on('next-round', () => {
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        if (!room || socket.id !== room.hostId) return;
        if (room.phase !== 'roundResult') return;

        startRound(currentRoom);
    });

    // ── Play Again ──────────────────────────────────────────────────
    socket.on('play-again', () => {
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        if (!room || socket.id !== room.hostId) return;

        room.phase = 'teams';
        room.teams.A.score = 0;
        room.teams.B.score = 0;
        room.round = 1;
        room.currentTeam = 'A';
        room.currentDescriber = { A: 0, B: 0 };
        room.usedWords.clear();

        broadcastRoomState(currentRoom);
    });

    // ── Store player name on socket ─────────────────────────────────
    socket.on('set-name', ({ name }) => {
        socket.data.playerName = name;
    });

    // ── Disconnect ──────────────────────────────────────────────────
    socket.on('disconnect', () => {
        console.log(`[Taboo] Player disconnected: ${socket.id}`);
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        if (!room) return;

        // Remove from all lists
        room.unassigned = room.unassigned.filter((p) => p.id !== socket.id);
        room.teams.A.players = room.teams.A.players.filter((p) => p.id !== socket.id);
        room.teams.B.players = room.teams.B.players.filter((p) => p.id !== socket.id);

        // If host left, assign new host
        if (socket.id === room.hostId) {
            const allPlayers = [
                ...room.teams.A.players,
                ...room.teams.B.players,
                ...room.unassigned
            ];
            if (allPlayers.length > 0) {
                room.hostId = allPlayers[0].id;
            } else {
                // Room is empty, clean up
                if (room.timer) clearInterval(room.timer);
                rooms.delete(currentRoom);
                return;
            }
        }

        // If in playing phase, check if describer left
        if (room.phase === 'playing') {
            const team = room.teams[room.currentTeam];
            if (team.players.length === 0) {
                endRound(currentRoom);
                return;
            }
            room.currentDescriber[room.currentTeam] =
                room.currentDescriber[room.currentTeam] % team.players.length;
        }

        broadcastRoomState(currentRoom);
    });
});

// ─── Start Server ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Taboo] Game server running on port ${PORT}`);
});
