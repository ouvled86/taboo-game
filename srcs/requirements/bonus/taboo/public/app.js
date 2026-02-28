/* ─── Taboo Team — Frontend Client ───────────────────────── */
(function () {
    'use strict';

    const socket = io({ path: '/taboo/socket.io' });

    // ─── DOM References ──────────────────────────────────────
    const screens = {
        lobby: document.getElementById('screen-lobby'),
        teams: document.getElementById('screen-teams'),
        game: document.getElementById('screen-game'),
        result: document.getElementById('screen-result'),
        gameover: document.getElementById('screen-gameover')
    };

    const dom = {
        playerName: document.getElementById('player-name'),
        roomCodeInput: document.getElementById('room-code-input'),
        btnCreate: document.getElementById('btn-create'),
        btnJoin: document.getElementById('btn-join'),
        displayRoomCode: document.getElementById('display-room-code'),
        langBadge: document.getElementById('lang-badge'),
        teamAList: document.getElementById('team-a-list'),
        teamBList: document.getElementById('team-b-list'),
        unassignedList: document.getElementById('unassigned-list'),
        unassignedSection: document.getElementById('unassigned-section'),
        btnStart: document.getElementById('btn-start'),
        scoreA: document.getElementById('score-a'),
        scoreB: document.getElementById('score-b'),
        timerText: document.getElementById('timer-text'),
        timerProgress: document.getElementById('timer-progress'),
        roundDisplay: document.getElementById('round-display'),
        turnIndicator: document.getElementById('turn-indicator'),
        describerView: document.getElementById('describer-view'),
        guesserView: document.getElementById('guesser-view'),
        opponentView: document.getElementById('opponent-view'),
        targetWord: document.getElementById('target-word'),
        forbiddenList: document.getElementById('forbidden-list'),
        describerNameDisplay: document.getElementById('describer-name-display'),
        btnCorrect: document.getElementById('btn-correct'),
        btnSkip: document.getElementById('btn-skip'),
        btnTaboo: document.getElementById('btn-taboo'),
        resultScoreA: document.getElementById('result-score-a'),
        resultScoreB: document.getElementById('result-score-b'),
        resultRoundInfo: document.getElementById('result-round-info'),
        btnNextRound: document.getElementById('btn-next-round'),
        trophyIcon: document.getElementById('trophy-icon'),
        winnerText: document.getElementById('winner-text'),
        finalScoreA: document.getElementById('final-score-a'),
        finalScoreB: document.getElementById('final-score-b'),
        btnPlayAgain: document.getElementById('btn-play-again'),
        toastContainer: document.getElementById('toast-container'),
        tabooFlash: document.getElementById('taboo-flash')
    };

    // ─── State ───────────────────────────────────────────────
    let state = {
        myId: null,
        roomCode: null,
        isHost: false,
        myTeam: null,
        language: 'darija',
        totalTime: 60
    };

    // ─── Utilities ───────────────────────────────────────────
    function showScreen(name) {
        Object.values(screens).forEach((s) => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    function showToast(message, type) {
        type = type || 'info';
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = message;
        dom.toastContainer.appendChild(toast);
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s';
            setTimeout(function () { toast.remove(); }, 300);
        }, 3000);
    }

    function isArabic(text) {
        return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
    }

    // ─── Language Toggle ─────────────────────────────────────
    document.querySelectorAll('.toggle-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.toggle-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            state.language = btn.dataset.lang;
        });
    });

    // ─── Create Room ─────────────────────────────────────────
    dom.btnCreate.addEventListener('click', function () {
        var name = dom.playerName.value.trim();
        if (!name) {
            showToast('Please enter your name!', 'error');
            dom.playerName.focus();
            return;
        }
        socket.emit('set-name', { name: name });
        socket.emit('create-room', {
            playerName: name,
            language: state.language
        });
    });

    // ─── Join Room ───────────────────────────────────────────
    dom.btnJoin.addEventListener('click', function () {
        var name = dom.playerName.value.trim();
        var code = dom.roomCodeInput.value.trim();
        if (!name) {
            showToast('Please enter your name!', 'error');
            dom.playerName.focus();
            return;
        }
        if (!code || code.length < 4) {
            showToast('Please enter a valid room code!', 'error');
            dom.roomCodeInput.focus();
            return;
        }
        socket.emit('set-name', { name: name });
        socket.emit('join-room', {
            roomCode: code,
            playerName: name
        });
    });

    // Allow Enter key on inputs
    dom.playerName.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') dom.btnCreate.click();
    });
    dom.roomCodeInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') dom.btnJoin.click();
    });

    // ─── Join Team ───────────────────────────────────────────
    document.querySelectorAll('[data-team]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var team = btn.dataset.team;
            state.myTeam = team;
            socket.emit('join-team', { team: team });
        });
    });

    // ─── Start Game ──────────────────────────────────────────
    dom.btnStart.addEventListener('click', function () {
        socket.emit('start-game');
    });

    // ─── Game Actions ────────────────────────────────────────
    dom.btnCorrect.addEventListener('click', function () {
        socket.emit('correct');
        flashButton(dom.btnCorrect, '#00e676');
    });

    dom.btnSkip.addEventListener('click', function () {
        socket.emit('skip');
        flashButton(dom.btnSkip, '#ffd600');
    });

    dom.btnTaboo.addEventListener('click', function () {
        socket.emit('taboo');
    });

    dom.btnNextRound.addEventListener('click', function () {
        socket.emit('next-round');
    });

    dom.btnPlayAgain.addEventListener('click', function () {
        socket.emit('play-again');
    });

    function flashButton(btn, color) {
        btn.style.boxShadow = '0 0 30px ' + color;
        setTimeout(function () {
            btn.style.boxShadow = '';
        }, 200);
    }

    // ─── Socket Events ──────────────────────────────────────

    socket.on('connect', function () {
        state.myId = socket.id;
    });

    socket.on('room-created', function (data) {
        state.roomCode = data.roomCode;
        state.isHost = true;
        showScreen('teams');
        showToast('Room created! Share code: ' + data.roomCode, 'success');
    });

    socket.on('room-joined', function (data) {
        state.roomCode = data.roomCode;
        showScreen('teams');
        showToast('Joined room ' + data.roomCode, 'success');
    });

    socket.on('error-msg', function (data) {
        showToast(data.message, 'error');
    });

    // ─── Room State Update ───────────────────────────────────
    socket.on('room-state', function (data) {
        state.isHost = data.hostId === state.myId;

        // Update room code display
        dom.displayRoomCode.textContent = data.roomCode;

        // Language badge
        if (data.language === 'darija') {
            dom.langBadge.textContent = '🇲🇦 دارجة';
        } else {
            dom.langBadge.textContent = '🇬🇧 English';
        }

        // Update team lists
        renderPlayerList(dom.teamAList, data.players.teamA, data.hostId);
        renderPlayerList(dom.teamBList, data.players.teamB, data.hostId);

        // Update unassigned
        if (data.players.unassigned.length > 0) {
            dom.unassignedSection.style.display = 'block';
            renderPlayerList(dom.unassignedList, data.players.unassigned, data.hostId);
        } else {
            dom.unassignedSection.style.display = 'none';
        }

        // Figure out what team I'm on
        var inA = data.players.teamA.some(function (p) { return p.id === state.myId; });
        var inB = data.players.teamB.some(function (p) { return p.id === state.myId; });
        if (inA) state.myTeam = 'A';
        else if (inB) state.myTeam = 'B';
        else state.myTeam = null;

        // Show start button for host when teams have players
        if (state.isHost && data.players.teamA.length >= 1 && data.players.teamB.length >= 1) {
            dom.btnStart.style.display = 'block';
        } else {
            dom.btnStart.style.display = 'none';
        }

        // Update scores
        dom.scoreA.textContent = data.scores.A;
        dom.scoreB.textContent = data.scores.B;

        // Round info
        dom.roundDisplay.textContent = 'Round ' + data.round + ' / ' + data.totalRounds;
        dom.turnIndicator.textContent = 'Team ' + data.currentTeam + "'s Turn";
        dom.turnIndicator.style.color = data.currentTeam === 'A' ? '#00b894' : '#fd79a8';

        // Screen switching based on phase
        if (data.phase === 'lobby' || data.phase === 'teams') {
            showScreen('teams');
        } else if (data.phase === 'playing') {
            showScreen('game');
            updateGameView(data);
        } else if (data.phase === 'roundResult') {
            showScreen('result');
            dom.resultScoreA.textContent = data.scores.A;
            dom.resultScoreB.textContent = data.scores.B;

            if (data.round <= data.totalRounds) {
                dom.resultRoundInfo.textContent = "Next: Team " + data.currentTeam + "'s turn";
            }

            dom.btnNextRound.style.display = state.isHost ? 'block' : 'none';
        } else if (data.phase === 'gameOver') {
            // handled by game-over event
        }
    });

    function renderPlayerList(ul, players, hostId) {
        ul.innerHTML = '';
        players.forEach(function (p) {
            var li = document.createElement('li');
            var nameSpan = document.createElement('span');
            nameSpan.textContent = p.name || 'Player';
            li.appendChild(nameSpan);

            if (p.id === hostId) {
                var badge = document.createElement('span');
                badge.className = 'host-badge';
                badge.textContent = 'HOST';
                li.appendChild(badge);
            }
            if (p.isDescriber) {
                var dbadge = document.createElement('span');
                dbadge.className = 'describer-badge';
                dbadge.textContent = '🎤 DESCRIBING';
                li.appendChild(dbadge);
            }
            if (p.id === state.myId) {
                li.style.borderLeft = '3px solid var(--accent-primary)';
            }
            ul.appendChild(li);
        });
    }

    function updateGameView(data) {
        // Determine if I'm the describer
        var amDescriber = false;
        var describerName = '';

        var currentTeamPlayers = data.currentTeam === 'A'
            ? data.players.teamA
            : data.players.teamB;

        currentTeamPlayers.forEach(function (p) {
            if (p.isDescriber) {
                describerName = p.name;
                if (p.id === state.myId) {
                    amDescriber = true;
                }
            }
        });

        // Hide all views first
        dom.describerView.style.display = 'none';
        dom.guesserView.style.display = 'none';
        dom.opponentView.style.display = 'none';

        if (amDescriber) {
            dom.describerView.style.display = 'flex';
        } else if (state.myTeam === data.currentTeam) {
            dom.guesserView.style.display = 'flex';
            dom.describerNameDisplay.textContent = (describerName || 'Your teammate') + ' is describing...';
        } else {
            dom.opponentView.style.display = 'flex';
        }
    }

    // ─── Word Card ───────────────────────────────────────────
    socket.on('word-card', function (data) {
        // Set target word
        dom.targetWord.textContent = data.word;
        if (isArabic(data.word)) {
            dom.targetWord.classList.remove('ltr');
        } else {
            dom.targetWord.classList.add('ltr');
        }

        // Set forbidden words
        dom.forbiddenList.innerHTML = '';
        data.forbidden.forEach(function (w) {
            var li = document.createElement('li');
            li.textContent = w;
            if (!isArabic(w)) {
                li.classList.add('ltr');
            }
            dom.forbiddenList.appendChild(li);
        });

        // Animate card
        var card = document.getElementById('word-card');
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = 'card-in 0.3s ease-out';
    });

    // ─── Timer ───────────────────────────────────────────────
    socket.on('timer-tick', function (timeLeft) {
        dom.timerText.textContent = timeLeft;

        // Update progress ring
        var total = state.totalTime;
        var fraction = timeLeft / total;
        var circumference = 2 * Math.PI * 45; // r=45
        dom.timerProgress.style.strokeDashoffset = circumference * (1 - fraction);

        // Color changes
        dom.timerProgress.classList.remove('warning', 'danger');
        if (timeLeft <= 10) {
            dom.timerProgress.classList.add('danger');
        } else if (timeLeft <= 20) {
            dom.timerProgress.classList.add('warning');
        }

        // Store total time from first tick
        if (timeLeft > state.totalTime - 2 && timeLeft > 50) {
            state.totalTime = timeLeft + 1;
        }
    });

    // ─── Taboo Called ────────────────────────────────────────
    socket.on('taboo-called', function () {
        dom.tabooFlash.classList.add('show');
        setTimeout(function () {
            dom.tabooFlash.classList.remove('show');
        }, 600);
    });

    // ─── Game Over ───────────────────────────────────────────
    socket.on('game-over', function (data) {
        showScreen('gameover');

        dom.finalScoreA.textContent = data.scores.A;
        dom.finalScoreB.textContent = data.scores.B;

        if (data.winner === 'tie') {
            dom.trophyIcon.textContent = '🤝';
            dom.winnerText.textContent = "It's a Tie!";
        } else {
            dom.trophyIcon.textContent = '🏆';
            dom.winnerText.textContent = 'Team ' + data.winner + ' Wins!';
        }

        dom.btnPlayAgain.style.display = state.isHost ? 'block' : 'none';
    });

    // ─── Disconnect Handling ─────────────────────────────────
    socket.on('disconnect', function () {
        showToast('Disconnected from server!', 'error');
    });

    socket.on('reconnect', function () {
        showToast('Reconnected!', 'success');
    });

})();
