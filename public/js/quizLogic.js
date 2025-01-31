function displayToggle(element, className) {
    element.classList.toggle(className);
}

// Start and end game logic
const Transition = (() => {
    const buttonStart = document.getElementById('start-button');
    const teamInput = document.getElementById('enter-teams');
    const quizSection = document.getElementById('game-area');
    const resultSection = document.getElementById('end-score');
    const teamResults = document.getElementById('end-teams');

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            startQuiz();
        }
    };

    buttonStart.addEventListener('click', startQuiz);
    document.addEventListener('keydown', handleKeyDown);

    function startQuiz() {
        Teams.setTeams();
        const teams = Teams.getTeams();

        if (teams.length < 1) {
            alert("Uneti bar 1 tim");
            return;
        }

        document.removeEventListener('keydown', handleKeyDown);

        Teams.createHandlers();
        DisplayManager.displayTeams(teams);

        displayToggle(teamInput, "display-none");
        displayToggle(quizSection, "display-none");

        // Add delay before appearing
        setTimeout(function () {
            displayToggle(quizSection, "opacity-1");
        }, 200);

        setTimeout(() => {
            Timer.startTimer();
            DisplayManager.setText();
        }, 400);

        Teams.addKeyListener();
    }

    function showResults() {
        const teams = Teams.getTeams();
        teams.sort((a, b) => b.getPoints() - a.getPoints());
        
        teams.forEach((team, index) => {
            const imageName = String.fromCharCode(97 + index); // 97 is 'a' in ASCII
            const teamRow = document.createElement("div");
            teamRow.classList.add("team-result");
    
            teamRow.innerHTML = `
                <div class="wrapper"><img class="team-result__image" src="/img/answer-${imageName}.svg" alt=""></div>
                <p class="team-result__name">${team.getName()}</p>
                <p class="team-result__score">${team.getPoints()}</p>
            `;
            teamResults.appendChild(teamRow);
        });
        
        displayToggle(resultSection, "display-none");
        displayToggle(quizSection, "opacity-0");
        displayToggle(quizSection, "display-none");

        setTimeout(() => {
            displayToggle(resultSection, "opacity-1");
        }, 100);
    }

    // Hover style for start button
    buttonStart.addEventListener("mouseenter", () => {
        buttonStart.children[0].src = "./img/main-menu-selected.png"
    });

    buttonStart.addEventListener("mouseleave", () => {
        buttonStart.children[0].src = "./img/main-menu-not-selected.png"
    });

    return { 
        showResults 
    };
})();

// Teams
const Team = (newName) => {
    const name = newName;
    let points = 0;

    return {
        getName: () => name,
        getPoints: () => points,
        setPoints: (number) => { points += number; }
    };
};

const Teams = (() => {
    const teamsDOM = Array.from(document.querySelectorAll('.input--text'));

    let teams = [];
    let answerOrder = [];
    let handlerArray = [];

    function setTeams() {
        teamsDOM.forEach((team) => {
            if (team.value !== "") {
                teams.push(Team(team.value.substring(0, 15)));
            }
        });
    }

    function updateTeamPoints() {
        teams.forEach((team, index) => {
            const scoreElement = document.getElementById(`team-${index}-score`);
            if (scoreElement) {
                scoreElement.textContent = team.getPoints();
            }
        });
    }

    // Log answers
    // Closure, nije potrebno proslediti event parametar
    function teamAnswered(teamName, answerIndex, index) {
        answerOrder.push({ team: teamName, key: event.key, answer: answerIndex });
        Sounds.playAnswer();
        DisplayManager.updatePosition(index);
        // Check if all teams have answered
        if (answerOrder.length === teams.length) {
            Timer.jumpToFourSeconds();
        }
    }

    // Assigns keys to each team
    const Team1_Keys = {
        a: () => teamAnswered(teams[0].getName(), 1, 0),
        s: () => teamAnswered(teams[0].getName(), 2, 0),
        d: () => teamAnswered(teams[0].getName(), 3, 0),
        f: () => teamAnswered(teams[0].getName(), 4, 0),
    }

    const Team2_Keys = {
        g: () => teamAnswered(teams[1].getName(), 1, 1),
        h: () => teamAnswered(teams[1].getName(), 2, 1),
        j: () => teamAnswered(teams[1].getName(), 3, 1),
        k: () => teamAnswered(teams[1].getName(), 4, 1),
    }

    const Team3_Keys = {
        q: () => teamAnswered(teams[2].getName(), 1, 2),
        w: () => teamAnswered(teams[2].getName(), 2, 2),
        e: () => teamAnswered(teams[2].getName(), 3, 2),
        r: () => teamAnswered(teams[2].getName(), 4, 2),
    }

    const Team4_Keys = {
        u: () => teamAnswered(teams[3].getName(), 1, 3),
        i: () => teamAnswered(teams[3].getName(), 2, 3),
        o: () => teamAnswered(teams[3].getName(), 3, 3),
        p: () => teamAnswered(teams[3].getName(), 4, 3),
    }

    const Team_Keys = [Team1_Keys, Team2_Keys, Team3_Keys, Team4_Keys];

    // Creates and stores handlers in array
    function createHandlers() {
        for (let i = 0; i < teams.length; i++) {
            const handler = createKeydownHandler(i);
            handlerArray.push(handler);
        }
    }

    // Creates function for event listener
    const createKeydownHandler = (index) => {
        const keydownFunc = (e) => {
            keydownHandler(e, Team_Keys[index], index);
        };
        return keydownFunc;
    };

    function keydownHandler(event, TeamKeys, index) {
        if (!event.repeat) {
            if (TeamKeys[event.key]) {
                removeKeyListener(index);
                TeamKeys[event.key]();
            } else {
                // console.log("Key not found");
            }
            // console.log(answerOrder);
        }
    }

    function addKeyListener() {
        for (let i = 0; i < teams.length; i++) {
            document.addEventListener("keydown", handlerArray[i]);
        }
    }

    function removeKeyListener(index) {
        document.removeEventListener("keydown", handlerArray[index]);
    }

    function removeAllKeyListeners() {
        for (let i = 0; i < teams.length; i++) {
            removeKeyListener(i);
        }
    }

    return {
        setTeams,
        getTeams: () => teams,
        getAnswerOrder: () => answerOrder,
        resetAnswers: () => { answerOrder = [] },
        addKeyListener,
        removeKeyListener,
        removeAllKeyListeners,
        createKeydownHandler,
        createHandlers,
        updateTeamPoints
    };
})();

const GameLogic = (() => {
    let pointsSettings = {};

    function setSettings(data) {
        pointsSettings = data;
    }

    // Function to assign points to teams based on the answer order
    function assignPoints() {
        const teams = Teams.getTeams();
        const correctIndex = GameData.getCorrectIndex();
        const answerOrder = Teams.getAnswerOrder();
        let trackTeams = [];

        // Track correct answers and their order
        const correctAnswersOrder = [];

        // Determine which answers are correct and their order
        answerOrder.forEach((entry, index) => {
            if (entry.answer === correctIndex + 1) {
                correctAnswersOrder.push({ teamName: entry.team, order: index });
                trackTeams.push({ teamName: entry.team, correct: 1 });
            }
        });

        // Sort by the order in which they were answered
        correctAnswersOrder.sort((a, b) => a.order - b.order);

        // Assign points based on order
        correctAnswersOrder.forEach((entry, i) => {
            const teamName = entry.teamName;
            const team = teams.find(t => t.getName() === teamName);

            switch (i) {
                case 0:
                    team.setPoints(pointsSettings.prvi);
                    // console.log(`${team.getName()} (first correct) received ${pointsSettings.prvi} points.`);
                    break;
                case 1:
                    team.setPoints(pointsSettings.drugi);
                    // console.log(`${team.getName()} (second correct) received ${pointsSettings.drugi} points.`);
                    break;
                case 2:
                    team.setPoints(pointsSettings.treci);
                    // console.log(`${team.getName()} (third correct) received ${pointsSettings.treci} points.`);
                    break;
                case 3:
                    team.setPoints(pointsSettings.cetvrti);
                    // console.log(`${team.getName()} (fourth correct) received ${pointsSettings.cetvrti} points.`);
                    break;
                default:
                    break;
            }
        });

        // Deduct points for incorrect answers
        answerOrder.forEach(entry => {
            if (!correctAnswersOrder.some(correctEntry => correctEntry.teamName === entry.team)) {
                const team = teams.find(t => t.getName() === entry.team);
                team.setPoints(pointsSettings.netacan);
                trackTeams.push({ teamName: entry.team, correct: 0 });
                // console.log(`${team.getName()} answered incorrectly and received ${pointsSettings.netacan} points.`);
            }
        });

        DisplayManager.showAwardedPoints(teams, trackTeams, [pointsSettings.prvi, pointsSettings.drugi, pointsSettings.treci, pointsSettings.cetvrti, pointsSettings.netacan]);

        // Log total points for each team
        // teams.forEach(team => {
        //     console.log(`Total points for ${team.getName()}: ${team.getPoints()}`);
        // });
    }

    return { setSettings, assignPoints };
})();

// Shuffle function used for shuffling questions and answers
function shuffleArray(array) {

    for (let i = array.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        // Swap elements at indices i and randomIndex
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }

    return array;
}

function nextQuestion() {
    DisplayManager.showCorrectAnswer();
    DisplayManager.resetPositions();
    setTimeout(() => {
        DisplayManager.resetAnswerStyles();
    }, 70);

    Teams.updateTeamPoints();
    Teams.removeAllKeyListeners();
    const teamsAnswered = Teams.getAnswerOrder().length;

    // Kraj igre
    if (GameData.getRound() == GameData.getMaxRounds()) {
        saveContestants();
        Transition.showResults();
        return;
    } else {
        GameData.nextRound();
        DisplayManager.setText();
        Timer.resetTimer();
        Teams.resetAnswers();
        Teams.addKeyListener();
    }

    // Check if no one answered
    if (teamsAnswered === 0) {
        Sounds.noAnswers.play();
    }
}

// Questions, rounds
const GameData = (() => {
    let questions = [];
    let correctIndex = 0;
    let currentRound = 1;
    let maxRounds = 0;

    async function fetchAndStoreData() {
        try {
            // Fetch data in parallel
            const [questionsResponse, settingsResponse] = await Promise.all([
                fetch('/api/questions'),
                fetch('/api/settings')
            ]);
    
            if (!questionsResponse.ok || !settingsResponse.ok) throw new Error('API fetch failed');
    
            const [questionsData, settingsData] = await Promise.all([
                questionsResponse.json(),
                settingsResponse.json()
            ]);
    
            // Shuffle and store the data
            shuffleArray(questionsData);
            questions = questionsData;
            maxRounds = questionsData.length;
            GameLogic.setSettings(settingsData.poeni);
            Timer.setTimerDuration(settingsData.vremeSekunde);
        } 
        catch (error) {
            console.error('Error:', error.message);
        }
    }

    // Call to get questions when script loads
    fetchAndStoreData();

    return {
        getQuestion: (index) => questions[index],
        getCorrectIndex: () => correctIndex,
        setCorrectIndex: (index) => { correctIndex = index; },
        getRound: () => currentRound,
        getMaxRounds: () => maxRounds,
        nextRound: () => { currentRound += 1; }
    };
})();

// Prikaz teksta
const DisplayManager = (() => {
    const roundText = document.getElementById('current-round');
    const questionText = document.getElementById('question-text');
    const answers = Array.from(document.querySelectorAll('.answer'));
    const answersText = Array.from(document.querySelectorAll('.answer__text'));
    const resultsContainer = document.getElementById('team-scores');

    function setRoundText() {
        roundText.textContent = `${GameData.getRound()} / ${GameData.getMaxRounds()}`;
    }

    function setQuestionText() {
        let index = GameData.getRound() - 1;
        questionText.textContent = GameData.getQuestion(index).pitanje;
    }

    function setAnswerText() {
        let index = GameData.getRound() - 1;
        let currentQuestion = GameData.getQuestion(index);

        let answers = [
            { text: currentQuestion.tacanOdg },
            { text: currentQuestion.netacanOdg1 },
            { text: currentQuestion.netacanOdg2 },
            { text: currentQuestion.netacanOdg3 }
        ];

        shuffleArray(answers);

        // Set index of correct answer
        const correctIndex = answers.findIndex(answer => answer.text === currentQuestion.tacanOdg);
        GameData.setCorrectIndex(correctIndex);

        // Set answer text
        answers.forEach((answer, i) => {
            answersText[i].textContent = answer.text;
        });
    }

    function setText() {
        setRoundText();
        setQuestionText();
        setAnswerText();
    }

    function displayTeams(teams) {
        resultsContainer.innerHTML = '';
        teams.forEach((team, index) => {
            const teamRow = document.createElement("div");
            teamRow.classList.add("team");

            teamRow.innerHTML = `
                <div class="team__position">
                    <img class="team__position__image" src="/img/timer.png" alt="">
                    <p class="text"></p>
                </div>
                <div class="team__name">
                    <p class="text">${team.getName()}</p>
                </div>
                <div class="team__score">
                    <img class="team__score__image" src="/img/timer.png" alt="">
                    <p class="text" id="team-${index}-score">0</p>
                </div>
            `;
            resultsContainer.appendChild(teamRow);
        });
    }

    // Show the position when a team answers a question
    function updatePosition(index) {
        const teamPositions = Array.from(document.querySelectorAll('.team__position .text'));
        teamPositions[index].textContent = `${Teams.getAnswerOrder().length}.`;
    }

    function resetPositions() {
        const teamPositions = Array.from(document.querySelectorAll('.team__position .text'));
        teamPositions.forEach(position => { position.textContent = ""; });
    }

    function showAwardedPoints(teams, teamOrder, points) {
        teams.forEach((team, index) => {
            const scoreElement = document.getElementById(`team-${index}-score`);
            const foundIndex = teamOrder.findIndex(entry => entry.teamName === team.getName());
            const foundTeam = teamOrder[foundIndex];

            if (foundTeam) {
                if (foundTeam.correct === 1) {
                    scoreElement.textContent = `+${points[foundIndex]}`;
                }
                else if (foundTeam.correct === 0) {
                    // Negativni poeni
                    scoreElement.textContent = `${points[4]}`;
                }
            }
            else {
                scoreElement.textContent = 0;
            }
        });
    }

    function resetAnswerStyles() {
        answers.forEach(answer => {
            answer.classList.remove("correct-answer", "wrong-answer");
        });
    }

    function showCorrectAnswer() {
        const correctIndex = GameData.getCorrectIndex();

        answers.forEach((answer, index) => {
            if (index === correctIndex) {
                answer.classList.toggle("correct-answer");
            }
            else {
                answer.classList.toggle("wrong-answer");
            }
        });
    }

    function manageTimerAlert() {
        const timerAlert = document.getElementById('timer-alert');

        function toggle() {
            timerAlert.classList.toggle("opacity-0");
        }
    
        function hide() {
            timerAlert.classList.add("opacity-0");
        }
    
        function flash() {
            return flashInterval = setInterval(() => {
                toggle();
            }, 500);
        }

        return {
            toggle,
            hide,
            flash
        };
    }

    return {
        setText,
        displayTeams,
        updatePosition,
        resetPositions,
        showAwardedPoints,
        showCorrectAnswer,
        resetAnswerStyles,
        timerAlert: manageTimerAlert()
    };
})();

// Create audio elements / Zvukovi
const Sounds = (() => {
    const round = new Audio('../assets/audio/sound.mp3');
    const finalCountdown = new Audio('../assets/audio/tick.mp3');
    const noAnswers = new Audio('../assets/audio/sound_quiz_2.mp3');

    // Function so that it can overlap audio
    function playAnswer() {
        const answer = new Audio('../assets/audio/sound_quiz_1.mp3');
        answer.play();
    }

    function roundEnding() {
        Sounds.round.pause();
        Sounds.round.currentTime = 0;
        Sounds.finalCountdown.currentTime = 0;
        Sounds.finalCountdown.play();
    }

    function roundEnded() {
        Sounds.round.pause();
        Sounds.round.currentTime = 0;
        Sounds.finalCountdown.pause();
        Sounds.finalCountdown.currentTime = 0;
    }

    round.loop = true;

    return { 
        round,
        finalCountdown,
        noAnswers,
        playAnswer,
        roundEnding,
        roundEnded
    };
})();

// Timer / Tajmer
const Timer = (() => {
    const display = document.getElementById('timer-text');
    const timerAlertManager = DisplayManager.timerAlert;

    const TIME_BETWEEN_QUESTIONS = 3000;
    let timerInterval;
    let flashInterval;
    let initialDuration;
    let seconds;

    function setTimerDuration(secondsInput) {
        initialDuration = secondsInput;
        seconds = initialDuration; // Initialize seconds
    }

    function startTimer() {
        clearInterval(timerInterval); // Stop any existing timer
        seconds = initialDuration; // Reset seconds to initial duration
        display.textContent = seconds;

        Sounds.round.play();

        timerInterval = setInterval(() => {
            seconds--;
            display.textContent = seconds;

            // Play final countdown sound when 4 seconds left
            if (seconds === 4) {
                Sounds.roundEnding();
                timerAlertManager.toggle();
                flashInterval = timerAlertManager.flash();
            }

            if (seconds <= 0) {
                clearInterval(timerInterval);
                clearInterval(flashInterval);

                timerAlertManager.hide();
                Teams.removeAllKeyListeners();
                
                setTimeout(GameLogic.assignPoints, 1000);
                setTimeout(DisplayManager.showCorrectAnswer, 1000);

                Sounds.roundEnded();

                setTimeout(nextQuestion, TIME_BETWEEN_QUESTIONS);
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        startTimer(); // Restart the timer with the initial duration
    }

    function jumpToFourSeconds() {
        if (seconds > 5) {
            seconds = 4;
            display.textContent = seconds;
            timerAlertManager.toggle();
            flashInterval = timerAlertManager.flash();
            Sounds.roundEnding();
        }
    }

    return {
        startTimer,
        resetTimer,
        setTimerDuration,
        jumpToFourSeconds
    };
})();

const saveContestants = async () => {
    try {
        const teams = Teams.getTeams();
        const teamNames = teams.map(team => team.getName());
        const teamPoints = teams.map(team => team.getPoints());

        console.log('Saving data:', { names: teamNames, points: teamPoints });

        const response = await fetch('/api/contestants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: teamNames, points: teamPoints })
        });

        if (response.ok) {
            const savedContestants = await response.json();
            console.log('Contestants and points saved:', savedContestants);
        } else {
            throw new Error('Failed to save contestants');
        }
    }
    catch (error) {
        console.error('Error saving contestants:', error.message);
    }
};