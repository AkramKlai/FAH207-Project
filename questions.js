const ARTWORK_IMAGES = {
    'Anavysos Kouros': 'Images/Artwork/Anavysos_Kouros.jpg',
    'Aphrodite of Knidos': 'Images/Artwork/Aphrodite_of_Knidos.jpg',
    'Augustus': 'Images/Artwork/Augustus.jpg',
    'Doryphoros': 'Images/Artwork/Doryphoros.jpg',
    'Eleusis Amphora': 'Images/Artwork/Eleusis_Amphora.jpg',
    'Flavian Lady': 'Images/Artwork/Flavian_Lady.jpg',
    'New York Kouros': 'Images/Artwork/New_York_Kouros.jpg',
    'Panathenaic Prize Amphora': 'Images/Artwork/Panathenaic_Prize_Amphora_.jpg',
    'Phrasiklea': 'Images/Artwork/Phrasiklea.jpg',
    'Pompey': 'Images/Artwork/Pompey.jpg',
    'Revellers': 'Images/Artwork/Revellers.jpg',
    'Seated Boxer': 'Images/Artwork/Seated_Boxer.jpg'
};

let QUESTIONS = [];

async function loadTextFile(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
    }
    return response.text();
}

function parseQuestions(text) {
    const blocks = text.split(/\n\s*\n/).filter(block => block.trim() !== '');
    const questions = [];

    for (const block of blocks) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line !== '');
        if (lines.length < 2) continue;

        const headerMatch = lines[0].match(/\[(MCQ|TF)\]\s*\[(.+?)\]/);
        if (!headerMatch) continue;

        const type = headerMatch[1];
        const artwork = headerMatch[2];
        const questionText = lines[1];
        const options = [];

        for (let i = 2; i < lines.length; i++) {
            const optionMatch = lines[i].match(/^([A-D])\s+(.+)$/);
            if (optionMatch) {
                options.push({
                    letter: optionMatch[1],
                    text: optionMatch[2]
                });
            }
        }

        questions.push({
            type,
            artwork,
            question: questionText,
            options
        });
    }

    return questions;
}

function parseAnswers(text) {
    const blocks = text.split(/\n\s*\n/).filter(block => block.trim() !== '');
    const answers = [];

    for (const block of blocks) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line !== '');
        if (lines.length < 2) continue;

        const headerMatch = lines[0].match(/\[(MCQ|TF)\]\s*\[(.+?)\]/);
        if (!headerMatch) continue;

        answers.push({
            type: headerMatch[1],
            artwork: headerMatch[2],
            correctAnswer: lines[1],
            explanation: lines[2] || ''
        });
    }

    return answers;
}

async function loadQuestions() {
    const questionsText = await loadTextFile('Game%20Info/Questions.txt');
    const answersText = await loadTextFile('Game%20Info/Answers.txt');

    const questions = parseQuestions(questionsText);
    const answers = parseAnswers(answersText);

    QUESTIONS = questions.map(q => {
        const answer = answers.find(a =>
            a.type === q.type && a.artwork === q.artwork
        );

        return {
            ...q,
            correctAnswer: answer?.correctAnswer || '',
            explanation: answer?.explanation || ''
        };
    });
}

function selectRandomQuestions(count) {
    if (QUESTIONS.length === 0) return [];

    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, QUESTIONS.length));

    const availablePositions = [];
    for (let i = 1; i <= 34; i++) {
        availablePositions.push(i);
    }

    const shuffledPositions = availablePositions.sort(() => Math.random() - 0.5);

    return selected.map((q, index) => ({
        ...q,
        position: shuffledPositions[index]
    }));
}

function getArtworkImages(artworkName) {
    const names = artworkName.split(',').map(name => name.trim());
    const images = [];

    for (const name of names) {
        const key = Object.keys(ARTWORK_IMAGES).find(key =>
            key.toLowerCase() === name.toLowerCase()
        );
        if (key) {
            images.push(ARTWORK_IMAGES[key]);
        }
    }

    return images;
}

function getQuestionAtPosition(position) {
    return QUESTIONS.find(q => q.position === position);
}

function isActionSpace(position) {
    return QUESTIONS.some(q => q.position === position);
}
