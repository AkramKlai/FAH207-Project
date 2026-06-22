const BOARD_SIZE = 6;
const TOTAL_SQUARES = BOARD_SIZE * BOARD_SIZE;
const WINNING_SQUARE = TOTAL_SQUARES - 1;
const CORRECT_MOVE = 5;
const INCORRECT_MOVE = -3;

const PLAYER_IMAGES = [
    'Images/Pieces/player1_piece.png',
    'Images/Pieces/player2_piece.png'
];

let playerPositions = [0, 0];
let currentPlayer = 0;
let gameOver = false;
let questionPending = false;

const boardElement = document.getElementById('board');
const turnIndicatorElement = document.getElementById('turn-indicator');
const diceDisplayElement = document.getElementById('dice-display');
const rollBtn = document.getElementById('roll-btn');

const questionModal = document.getElementById('question-modal');
const questionArtwork = document.getElementById('question-artwork');
const questionText = document.getElementById('question-text');
const questionOptions = document.getElementById('question-options');
const questionFeedback = document.getElementById('question-feedback');
const questionContinueBtn = document.getElementById('question-continue-btn');

function getSquareNumber(row, col) {
    // Bottom row is row 0, top row is row 5
    // visualCol 0 = left side, visualCol 5 = right side
    // Squares are numbered from bottom right to top left,
    // so each row is numbered right to left.
    return row * BOARD_SIZE + (BOARD_SIZE - 1 - col);
}

function createBoard() {
    // Build from top row to bottom row so grid fills naturally
    for (let visualRow = BOARD_SIZE - 1; visualRow >= 0; visualRow--) {
        for (let visualCol = 0; visualCol < BOARD_SIZE; visualCol++) {
            const squareNumber = getSquareNumber(visualRow, visualCol);
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.square = squareNumber;
            square.id = `square-${squareNumber}`;

            if (squareNumber === 0) {
                square.classList.add('start-square');
            } else if (squareNumber === WINNING_SQUARE) {
                square.classList.add('end-square');
            }

            if (isActionSpace(squareNumber)) {
                square.classList.add('action-space');
                const actionLabel = document.createElement('span');
                actionLabel.classList.add('action-label');
                actionLabel.textContent = '?';
                square.appendChild(actionLabel);
            }

            const numberLabel = document.createElement('span');
            numberLabel.classList.add('square-number');
            numberLabel.textContent = squareNumber;
            square.appendChild(numberLabel);

            const pieceContainer = document.createElement('div');
            pieceContainer.classList.add('piece-container');
            square.appendChild(pieceContainer);

            boardElement.appendChild(square);
        }
    }
}

function renderPieces() {
    // Clear all pieces
    document.querySelectorAll('.piece').forEach(piece => piece.remove());

    // Place pieces
    playerPositions.forEach((position, playerIndex) => {
        const square = document.getElementById(`square-${position}`);
        if (square) {
            const piece = document.createElement('img');
            piece.classList.add('piece', `player-${playerIndex + 1}`);
            piece.src = PLAYER_IMAGES[playerIndex];
            piece.alt = `Player ${playerIndex + 1}`;
            piece.title = `Player ${playerIndex + 1}`;
            square.querySelector('.piece-container').appendChild(piece);
        }
    });
}

function updateTurnIndicator() {
    if (gameOver) {
        turnIndicatorElement.textContent = `Player ${currentPlayer + 1} Wins!`;
        turnIndicatorElement.style.color = currentPlayer === 0 ? '#c0392b' : '#2980b9';
        return;
    }

    turnIndicatorElement.textContent = `Player ${currentPlayer + 1}'s Turn`;
    turnIndicatorElement.style.color = currentPlayer === 0 ? '#c0392b' : '#2980b9';
}

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function movePlayer(playerIndex, spaces) {
    let newPosition = playerPositions[playerIndex] + spaces;
    if (newPosition > WINNING_SQUARE) {
        newPosition = WINNING_SQUARE;
    }
    if (newPosition < 0) {
        newPosition = 0;
    }
    playerPositions[playerIndex] = newPosition;
    return newPosition;
}

function checkWin(playerIndex) {
    return playerPositions[playerIndex] === WINNING_SQUARE;
}

function switchTurn() {
    currentPlayer = currentPlayer === 0 ? 1 : 0;
}

function endTurn() {
    if (gameOver) return;

    switchTurn();
    updateTurnIndicator();
    diceDisplayElement.textContent = 'Roll the die';
    rollBtn.disabled = false;
    questionPending = false;
}

function handleWin() {
    gameOver = true;
    updateTurnIndicator();
    diceDisplayElement.innerHTML += `<div class="winner-message">Player ${currentPlayer + 1} wins the game!</div>`;
    rollBtn.textContent = 'Play Again';
    rollBtn.disabled = false;
    questionPending = false;
}

function showQuestionModal(question) {
    questionPending = true;
    questionModal.classList.remove('hidden');
    questionFeedback.classList.add('hidden');
    questionContinueBtn.classList.add('hidden');

    // Display artwork image(s)
    questionArtwork.innerHTML = '';
    const images = getArtworkImages(question.artwork);
    if (images.length > 0) {
        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = question.artwork;
            questionArtwork.appendChild(img);
        });
    }

    questionText.textContent = question.question;

    // Display options
    questionOptions.innerHTML = '';
    question.options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = `${option.letter}. ${option.text}`;
        btn.dataset.letter = option.letter;
        btn.addEventListener('click', () => handleAnswer(question, option.letter));
        questionOptions.appendChild(btn);
    });
}

function handleAnswer(question, selectedLetter) {
    const isCorrect = selectedLetter === question.correctAnswer;
    const optionButtons = questionOptions.querySelectorAll('.option-btn');

    optionButtons.forEach(btn => {
        btn.disabled = true;
        const letter = btn.dataset.letter;
        if (letter === question.correctAnswer) {
            btn.classList.add('correct');
        } else if (letter === selectedLetter) {
            btn.classList.add('incorrect');
        }
    });

    questionFeedback.classList.remove('hidden');
    if (isCorrect) {
        questionFeedback.classList.add('correct');
        questionFeedback.classList.remove('incorrect');
        questionFeedback.textContent = `Correct! ${question.explanation}`;
    } else {
        questionFeedback.classList.add('incorrect');
        questionFeedback.classList.remove('correct');
        questionFeedback.textContent = `Incorrect. ${question.explanation}`;
    }

    questionContinueBtn.classList.remove('hidden');
    questionContinueBtn.onclick = () => {
        closeQuestionModal();
        applyQuestionResult(isCorrect);
    };
}

function closeQuestionModal() {
    questionModal.classList.add('hidden');
}

function applyQuestionResult(isCorrect) {
    const movement = isCorrect ? CORRECT_MOVE : INCORRECT_MOVE;
    const resultText = isCorrect 
        ? `Correct! Move up ${CORRECT_MOVE} spaces.` 
        : `Incorrect. Move down ${Math.abs(INCORRECT_MOVE)} spaces.`;
    
    diceDisplayElement.textContent = resultText;
    movePlayer(currentPlayer, movement);
    renderPieces();

    if (checkWin(currentPlayer)) {
        handleWin();
        return;
    }

    // Check if the new position is another action space
    const currentPosition = playerPositions[currentPlayer];
    const nextQuestion = getQuestionAtPosition(currentPosition);
    if (nextQuestion) {
        setTimeout(() => {
            showQuestionModal(nextQuestion);
        }, 500);
        return;
    }

    setTimeout(() => {
        endTurn();
    }, 1000);
}

function restartGame() {
    resetGameState();
    QUESTIONS = selectRandomQuestions(QUESTIONS_PER_GAME);
    createBoard();
    renderPieces();
    updateTurnIndicator();
    diceDisplayElement.textContent = 'Roll the die';
}

function handleRoll() {
    if (questionPending) return;

    if (gameOver) {
        restartGame();
        return;
    }

    rollBtn.disabled = true;
    const roll = rollDice();
    diceDisplayElement.textContent = `Player ${currentPlayer + 1} rolled a ${roll}`;

    movePlayer(currentPlayer, roll);
    renderPieces();

    if (checkWin(currentPlayer)) {
        handleWin();
        return;
    }

    const currentPosition = playerPositions[currentPlayer];
    const question = getQuestionAtPosition(currentPosition);

    if (question) {
        setTimeout(() => {
            showQuestionModal(question);
        }, 500);
        return;
    }

    setTimeout(() => {
        endTurn();
    }, 1000);
}

const QUESTIONS_PER_GAME = 10;

function resetGameState() {
    playerPositions = [0, 0];
    currentPlayer = 0;
    gameOver = false;
    questionPending = false;
    boardElement.innerHTML = '';
    rollBtn.textContent = 'Roll Die';
    rollBtn.disabled = false;
}

async function initGame() {
    try {
        diceDisplayElement.textContent = 'Loading questions...';
        await loadQuestions();

        resetGameState();
        QUESTIONS = selectRandomQuestions(QUESTIONS_PER_GAME);

        diceDisplayElement.textContent = 'Roll the die';

        createBoard();
        renderPieces();
        updateTurnIndicator();
        rollBtn.addEventListener('click', handleRoll);
    } catch (error) {
        console.error(error);
        diceDisplayElement.innerHTML = `
            <div class="winner-message" style="color: #c0392b;">
                Error loading questions.
            </div>
            <div style="font-size: 0.9rem; margin-top: 10px;">
                Make sure you are running the game through a local web server 
                (opening the file directly in a browser will not work).
            </div>
        `;
        rollBtn.disabled = true;
    }
}

initGame();
