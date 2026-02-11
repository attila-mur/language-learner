// Configuration
const API_BASE = 'http://localhost:8080/api';

// State
let currentCards = [];
let currentIndex = 0;
let correctCount = 0;
let incorrectCount = 0;
let userAnswers = [];
let currentCard = null;

// DOM Elements
const setupPanel = document.getElementById('setup-panel');
const gamePanel = document.getElementById('game-panel');
const resultsPanel = document.getElementById('results-panel');

const sourceLangSelect = document.getElementById('source-lang');
const targetLangSelect = document.getElementById('target-lang');
const topicSelect = document.getElementById('topic');
const cardCountSelect = document.getElementById('card-count');

const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const retryBtn = document.getElementById('retry-btn');
const newSessionBtn = document.getElementById('new-session-btn');

const card = document.getElementById('card');
const answerInput = document.getElementById('answer-input');
const sourceWord = document.getElementById('source-word');
const exampleSentence = document.getElementById('example-sentence');
const targetWord = document.getElementById('target-word');
const pronunciation = document.getElementById('pronunciation');
const resultIcon = document.getElementById('result-icon');
const resultMessage = document.getElementById('result-message');

const currentCardSpan = document.getElementById('current-card');
const totalCardsSpan = document.getElementById('total-cards');
const correctCountSpan = document.getElementById('correct-count');
const incorrectCountSpan = document.getElementById('incorrect-count');
const progressFill = document.getElementById('progress-fill');

const inputArea = document.getElementById('input-area');
const nextArea = document.getElementById('next-area');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await Promise.all([
        loadLanguages(),
        loadTopics()
    ]);
    
    // Event Listeners
    startBtn.addEventListener('click', startSession);
    submitBtn.addEventListener('click', checkAnswer);
    nextBtn.addEventListener('click', nextCard);
    retryBtn.addEventListener('click', retrySession);
    newSessionBtn.addEventListener('click', showSetup);
    
    // Enter key support
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!nextArea.classList.contains('hidden')) {
                nextCard();
            } else {
                checkAnswer();
            }
        }
    });
}

async function loadLanguages() {
    try {
        const response = await fetch(`${API_BASE}/languages`);
        const languages = await response.json();
        
        sourceLangSelect.innerHTML = languages
            .map(lang => `<option value="${lang.code}">${lang.name}</option>`)
            .join('');
        
        targetLangSelect.innerHTML = languages
            .map(lang => `<option value="${lang.code}">${lang.name}</option>`)
            .join('');
        
        // Default: English -> Spanish
        sourceLangSelect.value = 'en';
        targetLangSelect.value = 'es';
    } catch (error) {
        console.error('Failed to load languages:', error);
        // Fallback options
        sourceLangSelect.innerHTML = '<option value="en">English</option>';
        targetLangSelect.innerHTML = `
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
        `;
    }
}

async function loadTopics() {
    try {
        const response = await fetch(`${API_BASE}/topics`);
        const topics = await response.json();
        
        topicSelect.innerHTML = '<option value="all">All Topics</option>' +
            topics.map(topic => 
                `<option value="${topic.id}">${topic.name}</option>`
            ).join('');
    } catch (error) {
        console.error('Failed to load topics:', error);
        // Fallback topics
        topicSelect.innerHTML = `
            <option value="all">All Topics</option>
            <option value="food">Food</option>
            <option value="animals">Animals</option>
            <option value="colors">Colors</option>
            <option value="greetings">Greetings</option>
            <option value="numbers">Numbers</option>
        `;
    }
}

async function startSession() {
    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;
    const topic = topicSelect.value;
    const cardCount = parseInt(cardCountSelect.value);
    
    try {
        const response = await fetch(
            `${API_BASE}/words?sourceLang=${sourceLang}&targetLang=${targetLang}&topic=${topic}&count=${cardCount}`
        );
        currentCards = await response.json();
        
        if (currentCards.length === 0) {
            alert('No words found for this combination. Try different options.');
            return;
        }
        
        // Reset state
        currentIndex = 0;
        correctCount = 0;
        incorrectCount = 0;
        userAnswers = [];
        
        // Update UI
        totalCardsSpan.textContent = currentCards.length;
        updateScore();
        
        // Show game panel
        setupPanel.classList.add('hidden');
        resultsPanel.classList.add('hidden');
        gamePanel.classList.remove('hidden');
        
        // Load first card
        loadCard();
    } catch (error) {
        console.error('Failed to start session:', error);
        alert('Failed to load words. Is the server running?');
    }
}

function loadCard() {
    currentCard = currentCards[currentIndex];
    
    // Reset card state
    card.classList.remove('flipped', 'incorrect');
    answerInput.value = '';
    answerInput.classList.remove('correct', 'incorrect');
    answerInput.disabled = false;
    submitBtn.disabled = false;
    
    // Show input, hide next
    inputArea.classList.remove('hidden');
    nextArea.classList.add('hidden');
    
    // Update content
    sourceWord.textContent = currentCard.sourceText;
    exampleSentence.textContent = currentCard.example ? `"${currentCard.example}"` : '';
    
    // Update progress
    currentCardSpan.textContent = currentIndex + 1;
    updateProgress();
    
    // Focus input
    answerInput.focus();
}

function checkAnswer() {
    const userAnswer = answerInput.value.trim();
    
    if (!userAnswer) {
        answerInput.focus();
        return;
    }
    
    // Check answer
    const isCorrect = userAnswer.toLowerCase() === 
        currentCard.targetText.toLowerCase();
    
    // Store result
    userAnswers.push({
        card: currentCard,
        userAnswer: userAnswer,
        isCorrect: isCorrect
    });
    
    // Update counts
    if (isCorrect) {
        correctCount++;
        answerInput.classList.add('correct');
    } else {
        incorrectCount++;
        answerInput.classList.add('incorrect');
        card.querySelector('.card-back').classList.add('incorrect');
    }
    
    updateScore();
    
    // Show answer on card
    targetWord.textContent = currentCard.targetText;
    pronunciation.textContent = currentCard.pronunciation || '';
    resultIcon.textContent = isCorrect ? '✓' : '✗';
    resultMessage.textContent = isCorrect ? 'Correct! 🎉' : 
        `You said: "${userAnswer}"`;
    
    // Flip card
    card.classList.add('flipped');
    
    // Disable input, show next
    answerInput.disabled = true;
    submitBtn.disabled = true;
    inputArea.classList.add('hidden');
    nextArea.classList.remove('hidden');
    nextBtn.focus();
}

function nextCard() {
    currentIndex++;
    
    if (currentIndex >= currentCards.length) {
        showResults();
    } else {
        loadCard();
    }
}

function updateScore() {
    correctCountSpan.textContent = correctCount;
    incorrectCountSpan.textContent = incorrectCount;
}

function updateProgress() {
    const progress = ((currentIndex) / currentCards.length) * 100;
    progressFill.style.width = `${progress}%`;
}

function showResults() {
    gamePanel.classList.add('hidden');
    resultsPanel.classList.remove('hidden');
    
    const total = currentCards.length;
    const percentage = Math.round((correctCount / total) * 100);
    
    // Update score display
    document.getElementById('final-score').textContent = correctCount;
    document.getElementById('final-total').textContent = total;
    document.getElementById('score-percentage').textContent = `${percentage}%`;
    
    // Update message
    let message = '';
    if (percentage >= 90) message = '🌟 Excellent! You\'re a language pro!';
    else if (percentage >= 70) message = '👏 Great job! Keep practicing!';
    else if (percentage >= 50) message = '💪 Good effort! Try again for a better score!';
    else message = '📚 Keep studying! You\'ll get there!';
    
    document.getElementById('score-message').textContent = message;
    
    // Animate circle
    const scoreCircle = document.getElementById('score-circle');
    const circumference = 2 * Math.PI * 45; // r = 45
    const offset = circumference - (percentage / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;
    
    // Color based on score
    if (percentage >= 70) {
        scoreCircle.style.stroke = 'var(--success)';
    } else if (percentage >= 50) {
        scoreCircle.style.stroke = 'var(--warning)';
    } else {
        scoreCircle.style.stroke = 'var(--error)';
    }
    
    // Build review list
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = userAnswers.map(answer => `
        <div class="review-item">
            <div class="review-icon ${answer.isCorrect ? 'correct' : 'incorrect'}">
                ${answer.isCorrect ? '✓' : '✗'}
            </div>
            <div class="review-words">
                <div class="review-source">${answer.card.sourceText}</div>
                <div class="review-target">→ ${answer.card.targetText}</div>
                ${!answer.isCorrect ? 
                    `<div class="review-user-answer">You said: ${answer.userAnswer}</div>` : 
                    ''}
            </div>
        </div>
    `).join('');
}

function retrySession() {
    // Shuffle cards and restart
    currentCards = shuffleArray([...currentCards]);
    currentIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    userAnswers = [];
    
    updateScore();
    
    resultsPanel.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    
    loadCard();
}

function showSetup() {
    gamePanel.classList.add('hidden');
    resultsPanel.classList.add('hidden');
    setupPanel.classList.remove('hidden');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
