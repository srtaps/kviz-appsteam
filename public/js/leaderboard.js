document.addEventListener('DOMContentLoaded', () => {
    fetchContestants();
});

async function fetchContestants() {
    try {
        const contestantsResponse = await fetch('/api/contestants');

        if (!contestantsResponse.ok) {
            throw new Error('Failed to fetch contestants');
        }

        const contestantsData = await contestantsResponse.json();
        displayContestants(contestantsData);
    } catch (error) {
        console.error('Error fetching contestants:', error);
    }
}

function displayContestants(contestants) {
    const container = document.querySelector('.leaderboard');

    contestants.forEach((contestant, index) => {
        const row = document.createElement('div');
        row.classList.add('contestant');

        row.innerHTML = `
            <img src="${index % 2 === 1 ? '/img/highscore-row-1.png' : '/img/highscore-row-2.png'}" alt="">
            <div class="info">
                <p class="info__index">${index + 1}.</p>
                <p class="info__name">${contestant.name}</p>
                <p class="info__points">${contestant.points}</p>
                <p class="info__date">${contestant.date}</p>
            </div>
        `;
        container.appendChild(row);
    });
}