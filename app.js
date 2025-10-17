// Game data
const WORDLE_WORDS = [
    'CANVA', 'DECKS', 'FORMS', 'MAGIC', 'TEAMS',
    'ADOBE', 'LOGOS', 'BRIEF', 'BRAND', 'PIXEL',
    'FONTS', 'COLOR', 'STYLE', 'PRINT', 'VIRAL',
    'LIKES', 'SHARE', 'POSTS', 'STATS', 'GOALS'
];

const CONNECTIONS_DATA = {
    yellow: {
        theme: "Design Tools We Use",
        words: ["CANVA", "ADOBE", "FIGMA", "SKETCH"]
    },
    green: {
        theme: "Things We Call Our Work", 
        words: ["TICKETS", "REQUESTS", "DECKS", "BRIEFS"]
    },
    blue: {
        theme: "Team Members (First Names)",
        words: ["PHIL", "MATT", "JOSE", "JOYCE"]
    },
    purple: {
        theme: "Things That Annoy Us",
        words: ["2FA", "LOGIN", "PASSWORD", "TIMEOUT"]
    }
};

const CHEEKY_MESSAGES = {
    wordle: {
        win: [
            "Nice! You're as sharp as our brand guidelines!",
            "Boom! That was easier than Phil showing us magic tricks!",
            "Nailed it! Time to update your Monday ticket status!",
            "Perfect! You're ready for ASJ morning duty!",
            "Amazing! Even better than Matt's video skills!"
        ],
        lose: [
            "Oops! Maybe stick to Canva templates for now...",
            "Don't worry, we're all busy but not stressed, right?",
            "Better luck next time! At least it's not a 2FA login!",
            "Tough one! Those connections were trickier than our 1Pass setup!",
            "No stress! Phil still hasn't shown us those magic tricks either!"
        ]
    },
    connections: {
        win: [
            "Amazing! You connected those faster than our Mailerlite campaigns!",
            "Perfect! You're ready for ASJ morning duty!",
            "Brilliant! Phil should learn from your magic!",
            "Fantastic! Better than our Creative Cloud workflow!",
            "Incredible! Time to celebrate with a new Monday ticket!"
        ],
        lose: [
            "Tough one! Even Matt's video skills couldn't save that performance!",
            "No worries! Those connections were trickier than our 1Pass setup!",
            "Don't stress! We're busy but not stressed, remember?",
            "At least you didn't have to deal with 2FA this time!",
            "Maybe stick to PowerPoint with Phil and Paulina for now!"
        ],
        oneAway: [
            "Ooh, one away! Closer than our deadline stress levels!",
            "So close! Like when Phil almost shows us magic tricks!",
            "One off! Better than our 2FA success rate!",
            "Almost there! Keep going, we're busy but not stressed!"
        ]
    }
};

// Game state
let gameState = {
    currentGame: 'wordle',
    wordle: {
        currentRow: 0,
        currentCol: 0,
        gameOver: false,
        won: false,
        targetWord: '',
        guesses: []
    },
    connections: {
        selectedWords: [],
        foundGroups: [],
        mistakes: 0,
        gameOver: false,
        won: false,
        shuffledWords: []
    }
};

// DOM elements
const toggleBtns = document.querySelectorAll('.toggle-btn');
const gameSections = document.querySelectorAll('.game-section');
const wordleGrid = document.querySelector('.wordle-grid');
const keyboard = document.querySelector('.keyboard');
const connectionsGrid = document.querySelector('.connections-grid');
const modal = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const playAgainBtn = document.getElementById('play-again');
const switchGameBtn = document.getElementById('switch-game');
const mistakesCount = document.getElementById('mistakes-count');
const foundGroupsDiv = document.querySelector('.found-groups');

// Initialize the app
function init() {
    setupEventListeners();
    initWordle();
    initConnections();
    showGame('wordle');
}

// Event listeners
function setupEventListeners() {
    // Game toggle
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const game = btn.dataset.game;
            showGame(game);
        });
    });

    // Wordle keyboard
    keyboard.addEventListener('click', handleKeyboardClick);
    document.addEventListener('keydown', handleKeyPress);

    // Connections
    document.getElementById('shuffle-words').addEventListener('click', shuffleWords);
    document.getElementById('deselect-all').addEventListener('click', deselectAll);
    document.getElementById('submit-group').addEventListener('click', submitGroup);

    // Reset buttons
    document.getElementById('wordle-reset').addEventListener('click', resetWordle);
    document.getElementById('connections-reset').addEventListener('click', resetConnections);

    // Modal
    playAgainBtn.addEventListener('click', playAgain);
    switchGameBtn.addEventListener('click', switchGame);
}

// Game switching
function showGame(game) {
    gameState.currentGame = game;
    
    // Update toggle buttons
    toggleBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.game === game);
    });
    
    // Update game sections
    gameSections.forEach(section => {
        section.classList.toggle('active', section.id === `${game}-game`);
    });
}

// Wordle functions
function initWordle() {
    resetWordle();
}

function resetWordle() {
    gameState.wordle = {
        currentRow: 0,
        currentCol: 0,
        gameOver: false,
        won: false,
        targetWord: WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)],
        guesses: []
    };
    
    // Clear the grid
    const letterBoxes = wordleGrid.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.textContent = '';
        box.className = 'letter-box';
    });
    
    // Reset keyboard
    const keys = keyboard.querySelectorAll('.key');
    keys.forEach(key => {
        key.className = 'key' + (key.classList.contains('key-large') ? ' key-large' : '');
    });
    
    console.log('Target word:', gameState.wordle.targetWord); // For testing
}

function handleKeyboardClick(e) {
    if (!e.target.classList.contains('key')) return;
    
    const key = e.target.dataset.key;
    handleKeyInput(key);
}

function handleKeyPress(e) {
    if (gameState.currentGame !== 'wordle' || gameState.wordle.gameOver) return;
    
    const key = e.key.toUpperCase();
    
    if (key === 'ENTER') {
        handleKeyInput('ENTER');
    } else if (key === 'BACKSPACE') {
        handleKeyInput('BACKSPACE');
    } else if (key.match(/[A-Z]/)) {
        handleKeyInput(key);
    }
}

function handleKeyInput(key) {
    if (gameState.wordle.gameOver) return;
    
    const { currentRow, currentCol } = gameState.wordle;
    
    if (key === 'ENTER') {
        if (currentCol === 5) {
            submitWordle();
        }
    } else if (key === 'BACKSPACE') {
        if (currentCol > 0) {
            gameState.wordle.currentCol--;
            const box = getLetterBox(currentRow, gameState.wordle.currentCol);
            box.textContent = '';
            box.classList.remove('filled');
        }
    } else if (key.match(/[A-Z]/) && currentCol < 5) {
        const box = getLetterBox(currentRow, currentCol);
        box.textContent = key;
        box.classList.add('filled');
        gameState.wordle.currentCol++;
    }
}

function getLetterBox(row, col) {
    return wordleGrid.querySelector(`[data-row="${row}"] .letter-box:nth-child(${col + 1})`);
}

function submitWordle() {
    const { currentRow, targetWord } = gameState.wordle;
    const guess = getCurrentGuess(currentRow);
    
    if (guess.length !== 5) return;
    
    gameState.wordle.guesses.push(guess);
    
    // Animate and color the row
    animateWordleRow(currentRow, guess, targetWord);
    
    // Update keyboard colors
    updateKeyboardColors(guess, targetWord);
    
    if (guess === targetWord) {
        gameState.wordle.won = true;
        gameState.wordle.gameOver = true;
        setTimeout(() => showGameModal('wordle', true), 1500);
    } else if (currentRow === 5) {
        gameState.wordle.gameOver = true;
        setTimeout(() => showGameModal('wordle', false), 1500);
    } else {
        gameState.wordle.currentRow++;
        gameState.wordle.currentCol = 0;
    }
}

function getCurrentGuess(row) {
    let guess = '';
    for (let col = 0; col < 5; col++) {
        const box = getLetterBox(row, col);
        guess += box.textContent;
    }
    return guess;
}

function animateWordleRow(row, guess, targetWord) {
    const letterCounts = {};
    
    // Count letters in target word
    for (const letter of targetWord) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }
    
    // First pass: mark correct letters
    const results = [];
    for (let i = 0; i < 5; i++) {
        if (guess[i] === targetWord[i]) {
            results[i] = 'correct';
            letterCounts[guess[i]]--;
        } else {
            results[i] = 'unknown';
        }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
        if (results[i] === 'unknown') {
            if (letterCounts[guess[i]] > 0) {
                results[i] = 'present';
                letterCounts[guess[i]]--;
            } else {
                results[i] = 'absent';
            }
        }
    }
    
    // Animate each box
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const box = getLetterBox(row, i);
            box.classList.add(results[i]);
        }, i * 100);
    }
}

function updateKeyboardColors(guess, targetWord) {
    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const key = keyboard.querySelector(`[data-key="${letter}"]`);
        
        if (!key) continue;
        
        if (letter === targetWord[i]) {
            key.classList.remove('present', 'absent');
            key.classList.add('correct');
        } else if (targetWord.includes(letter) && !key.classList.contains('correct')) {
            key.classList.remove('absent');
            key.classList.add('present');
        } else if (!key.classList.contains('correct') && !key.classList.contains('present')) {
            key.classList.add('absent');
        }
    }
}

// Connections functions
function initConnections() {
    resetConnections();
}

function resetConnections() {
    gameState.connections = {
        selectedWords: [],
        foundGroups: [],
        mistakes: 0,
        gameOver: false,
        won: false,
        shuffledWords: []
    };
    
    // Create shuffled word list
    const allWords = [];
    Object.values(CONNECTIONS_DATA).forEach(group => {
        allWords.push(...group.words);
    });
    
    gameState.connections.shuffledWords = shuffleArray([...allWords]);
    renderConnectionsGrid();
    updateMistakesDisplay();
    foundGroupsDiv.innerHTML = '';
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function renderConnectionsGrid() {
    connectionsGrid.innerHTML = '';
    
    gameState.connections.shuffledWords.forEach(word => {
        const button = document.createElement('button');
        button.className = 'word-button';
        button.textContent = word;
        button.addEventListener('click', () => toggleWordSelection(word, button));
        
        // Check if word is already found
        const isFound = gameState.connections.foundGroups.some(group => 
            group.words.includes(word)
        );
        
        if (isFound) {
            button.classList.add('found');
            button.disabled = true;
        }
        
        connectionsGrid.appendChild(button);
    });
}

function toggleWordSelection(word, button) {
    if (button.disabled || gameState.connections.gameOver) return;
    
    const { selectedWords } = gameState.connections;
    const index = selectedWords.indexOf(word);
    
    if (index > -1) {
        selectedWords.splice(index, 1);
        button.classList.remove('selected');
    } else if (selectedWords.length < 4) {
        selectedWords.push(word);
        button.classList.add('selected');
    }
}

function shuffleWords() {
    if (gameState.connections.gameOver) return;
    
    const availableWords = gameState.connections.shuffledWords.filter(word => 
        !gameState.connections.foundGroups.some(group => group.words.includes(word))
    );
    
    const foundWords = gameState.connections.shuffledWords.filter(word => 
        gameState.connections.foundGroups.some(group => group.words.includes(word))
    );
    
    const shuffledAvailable = shuffleArray(availableWords);
    gameState.connections.shuffledWords = [...foundWords, ...shuffledAvailable];
    
    gameState.connections.selectedWords = [];
    renderConnectionsGrid();
}

function deselectAll() {
    gameState.connections.selectedWords = [];
    const buttons = connectionsGrid.querySelectorAll('.word-button');
    buttons.forEach(button => button.classList.remove('selected'));
}

function submitGroup() {
    const { selectedWords } = gameState.connections;
    
    if (selectedWords.length !== 4 || gameState.connections.gameOver) return;
    
    // Check if this group matches any category
    let matchedGroup = null;
    let groupColor = null;
    
    for (const [color, data] of Object.entries(CONNECTIONS_DATA)) {
        const isMatch = selectedWords.every(word => data.words.includes(word)) &&
                       selectedWords.length === data.words.length;
        
        if (isMatch) {
            matchedGroup = data;
            groupColor = color;
            break;
        }
    }
    
    if (matchedGroup) {
        // Correct group found
        gameState.connections.foundGroups.push({
            ...matchedGroup,
            color: groupColor,
            words: selectedWords
        });
        
        gameState.connections.selectedWords = [];
        displayFoundGroup(matchedGroup, groupColor);
        renderConnectionsGrid();
        
        // Check if game is won
        if (gameState.connections.foundGroups.length === 4) {
            gameState.connections.won = true;
            gameState.connections.gameOver = true;
            setTimeout(() => showGameModal('connections', true), 1000);
        }
    } else {
        // Wrong group
        gameState.connections.mistakes++;
        updateMistakesDisplay();
        
        // Check for "one away"
        let oneAwayGroup = null;
        for (const [color, data] of Object.entries(CONNECTIONS_DATA)) {
            const matchCount = selectedWords.filter(word => data.words.includes(word)).length;
            if (matchCount === 3) {
                oneAwayGroup = data;
                break;
            }
        }
        
        if (oneAwayGroup) {
            showTempMessage(getRandomMessage(CHEEKY_MESSAGES.connections.oneAway));
        }
        
        // Shake animation for wrong answer
        const selectedButtons = connectionsGrid.querySelectorAll('.word-button.selected');
        selectedButtons.forEach(button => {
            button.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                button.style.animation = '';
                button.classList.remove('selected');
            }, 500);
        });
        
        gameState.connections.selectedWords = [];
        
        if (gameState.connections.mistakes >= 4) {
            gameState.connections.gameOver = true;
            setTimeout(() => showGameModal('connections', false), 1000);
        }
    }
}

function displayFoundGroup(group, color) {
    const groupDiv = document.createElement('div');
    groupDiv.className = `found-group ${color}`;
    
    const themeDiv = document.createElement('div');
    themeDiv.className = 'group-theme';
    themeDiv.textContent = group.theme;
    
    const wordsDiv = document.createElement('div');
    wordsDiv.className = 'group-words';
    wordsDiv.textContent = group.words.join(', ');
    
    groupDiv.appendChild(themeDiv);
    groupDiv.appendChild(wordsDiv);
    foundGroupsDiv.appendChild(groupDiv);
}

function updateMistakesDisplay() {
    mistakesCount.textContent = 4 - gameState.connections.mistakes;
}

function showTempMessage(message) {
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--color-surface);
        padding: var(--space-16);
        border-radius: var(--radius-base);
        border: 1px solid var(--color-border);
        z-index: 999;
        font-weight: 500;
        box-shadow: var(--shadow-md);
    `;
    tempDiv.textContent = message;
    document.body.appendChild(tempDiv);
    
    setTimeout(() => {
        document.body.removeChild(tempDiv);
    }, 2000);
}

// Modal functions
function showGameModal(game, won) {
    const messages = won ? CHEEKY_MESSAGES[game].win : CHEEKY_MESSAGES[game].lose;
    const message = getRandomMessage(messages);
    
    modalTitle.textContent = won ? '🎉 Fantastic!' : '😅 Better Luck Next Time!';
    modalMessage.textContent = message;
    
    if (game === 'wordle' && !won) {
        modalMessage.textContent += ` The word was: ${gameState.wordle.targetWord}`;
    }
    
    modal.classList.add('active');
}

function hideGameModal() {
    modal.classList.remove('active');
}

function playAgain() {
    hideGameModal();
    if (gameState.currentGame === 'wordle') {
        resetWordle();
    } else {
        resetConnections();
    }
}

function switchGame() {
    hideGameModal();
    const newGame = gameState.currentGame === 'wordle' ? 'connections' : 'wordle';
    showGame(newGame);
}

function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}