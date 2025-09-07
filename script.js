// Tournament data
const groupA = ['Ashok-Uday', 'Althaf-Ravi', 'Hari-Sai','Murali-Hemanth', 'Mustafa-Shanu', 'Raj-Harsha'];
const groupB = ['Balaji-Venkat', 'Manoj-Vinoth', 'Rahul-Sabari', 'Senthilvel-Vijay', 'Suresh-Ramesh', 'Vidya-Rajesh'];

let matchResults = [];
let teamStats = {};
let tieBreakerResults = [];
let knockoutResults = {
    quarterfinals: [],
    semifinals: [],
    final: null,
    thirdPlace: null
};

// Initialize
function init() {
    // Initialize team stats
    [...groupA, ...groupB].forEach(team => {
        teamStats[team] = {
            wins: 0,
            totalPoints: 0,
            gamesPlayed: 0,
            opponents: []
        };
    });
    
    populateTeamLists();
    populateDropdowns();
}

function populateTeamLists() {
    const groupAList = document.getElementById('groupAList');
    const groupBList = document.getElementById('groupBList');
    
    groupA.forEach(team => {
        const li = document.createElement('li');
        li.textContent = team;
        groupAList.appendChild(li);
    });
    
    groupB.forEach(team => {
        const li = document.createElement('li');
        li.textContent = team;
        groupBList.appendChild(li);
    });
}

function populateDropdowns() {
    const teamASelect = document.getElementById('teamA');
    const teamBSelect = document.getElementById('teamB');
    
    groupA.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamASelect.appendChild(option);
    });
    
    groupB.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamBSelect.appendChild(option);
    });
    
    updateAvailableMatches();
}

function updateAvailableMatches() {
    const teamASelect = document.getElementById('teamA');
    const teamBSelect = document.getElementById('teamB');
    
    // Get all played matches
    const playedMatches = matchResults.map(match => `${match.teamA}-${match.teamB}`);
    
    // Update options based on available matches
    Array.from(teamASelect.options).forEach(option => {
        if (option.value) {
            const hasAvailableOpponent = groupB.some(teamB => {
                const matchKey = `${option.value}-${teamB}`;
                return !playedMatches.includes(matchKey);
            });
            option.disabled = !hasAvailableOpponent;
        }
    });
    
    updateTeamBOptions();
}

function updateTeamBOptions() {
    const teamASelect = document.getElementById('teamA');
    const teamBSelect = document.getElementById('teamB');
    const selectedTeamA = teamASelect.value;
    
    if (!selectedTeamA) return;
    
    const playedMatches = matchResults.map(match => `${match.teamA}-${match.teamB}`);
    
    Array.from(teamBSelect.options).forEach(option => {
        if (option.value) {
            const matchKey = `${selectedTeamA}-${option.value}`;
            option.disabled = playedMatches.includes(matchKey);
        }
    });
}

// Add event listener for team A selection
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('teamA').addEventListener('change', updateTeamBOptions);
});

function submitMatch() {
    const teamA = document.getElementById('teamA').value;
    const teamB = document.getElementById('teamB').value;
    const pointsA = parseInt(document.getElementById('pointsA').value) || 0;
    const pointsB = parseInt(document.getElementById('pointsB').value) || 0;
    
    if (!teamA || !teamB) {
        alert('Please select both teams');
        return;
    }
    
    if (pointsA === pointsB) {
        alert('Points cannot be equal. One team must win.');
        return;
    }
    
    // Check if match already played
    const matchExists = matchResults.some(match => 
        (match.teamA === teamA && match.teamB === teamB) ||
        (match.teamA === teamB && match.teamB === teamA)
    );
    
    if (matchExists) {
        alert('This match has already been played!');
        return;
    }
    
    const winner = pointsA > pointsB ? teamA : teamB;
    
    // Record match
    matchResults.push({
        teamA,
        teamB,
        pointsA,
        pointsB,
        winner
    });
    
    // Update team stats
    teamStats[teamA].gamesPlayed++;
    teamStats[teamB].gamesPlayed++;
    teamStats[teamA].totalPoints += pointsA;
    teamStats[teamB].totalPoints += pointsB;
    teamStats[teamA].opponents.push(teamB);
    teamStats[teamB].opponents.push(teamA);
    
    if (winner === teamA) {
        teamStats[teamA].wins++;
    } else {
        teamStats[teamB].wins++;
    }
    
    // Clear form
    document.getElementById('pointsA').value = '';
    document.getElementById('pointsB').value = '';
    
    // Update displays
    updateMatchResults();
    updateRankings();
    updateAvailableMatches();
    
    // Check if league stage is complete
    if (matchResults.length === 36) { // 6x6 = 36 matches
        checkForTieBreakers();
    }
}

function updateMatchResults() {
    const table = document.getElementById('resultsTable');
    const tbody = document.getElementById('resultsBody');
    
    tbody.innerHTML = '';
    
    matchResults.forEach(match => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = match.teamA;
        row.insertCell(1).textContent = match.teamB;
        row.insertCell(2).textContent = `${match.pointsA} - ${match.pointsB}`;
        row.insertCell(3).textContent = match.winner;
    });
    
    table.style.display = 'table';
}

function updateRankings() {
    const rankings = Object.entries(teamStats)
        .sort((a, b) => {
            // First by wins
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            // Then by total points
            if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
            // If tied, we'll handle later
            return 0;
        });
    
    const tbody = document.getElementById('rankingsBody');
    tbody.innerHTML = '';
    
    rankings.forEach((entry, index) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = entry[0];
        row.insertCell(2).textContent = entry[1].wins;
        row.insertCell(3).textContent = entry[1].totalPoints;
        row.insertCell(4).textContent = entry[1].gamesPlayed;
        
        // Highlight top 8
        if (index < 8) {
            row.classList.add('top8');
        }
    });
    
    document.getElementById('rankingsSection').style.display = 'block';
}

function checkForTieBreakers() {
    const rankings = Object.entries(teamStats)
        .sort((a, b) => {
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
            return 0;
        });
    
    // Find teams that need tie breaking for 8th position
    const tiedGroups = [];
    let currentGroup = [];
    let currentWins = null;
    let currentPoints = null;
    
    rankings.forEach((entry, index) => {
        const [team, stats] = entry;
        
        if (stats.wins === currentWins && stats.totalPoints === currentPoints) {
            currentGroup.push(team);
        } else {
            if (currentGroup.length > 1) {
                tiedGroups.push([...currentGroup]);
            }
            currentGroup = [team];
            currentWins = stats.wins;
            currentPoints = stats.totalPoints;
        }
    });
    
    if (currentGroup.length > 1) {
        tiedGroups.push(currentGroup);
    }
    
    // Check if tie affects top 8
    let needsTieBreaker = false;
    tiedGroups.forEach(group => {
        const groupRanks = group.map(team => 
            rankings.findIndex(entry => entry[0] === team) + 1
        );
        
        // If any tied group spans across the 8th position cutoff
        if (groupRanks.some(rank => rank <= 8) && groupRanks.some(rank => rank > 8)) {
            needsTieBreaker = true;
            createTieBreaker(group);
        }
    });
    
    if (!needsTieBreaker) {
        startKnockoutStage();
    }
}

function createTieBreaker(tiedTeams) {
    document.getElementById('tieBreakerSection').style.display = 'block';
    
    const container = document.getElementById('tieBreakerMatches');
    container.innerHTML = '';
    
    // Check head-to-head first
    const headToHeadResolved = resolveByHeadToHead(tiedTeams);
    
    if (!headToHeadResolved) {
        // Create tie breaker matches
        tiedTeams.forEach((teamA, i) => {
            tiedTeams.slice(i + 1).forEach(teamB => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'knockout-match';
                matchDiv.innerHTML = `
                    <span>${teamA} vs ${teamB}</span>
                    <div>
                        <input type="number" id="tie_${teamA}_${teamB}_A" placeholder="${teamA} points" min="0">
                        <input type="number" id="tie_${teamA}_${teamB}_B" placeholder="${teamB} points" min="0">
                        <button onclick="submitTieBreaker('${teamA}', '${teamB}')">Submit</button>
                    </div>
                `;
                container.appendChild(matchDiv);
            });
        });
    }
}

function resolveByHeadToHead(tiedTeams) {
    // Check if all teams have played each other
    for (let i = 0; i < tiedTeams.length; i++) {
        for (let j = i + 1; j < tiedTeams.length; j++) {
            const teamA = tiedTeams[i];
            const teamB = tiedTeams[j];
            
            const hasPlayed = matchResults.some(match =>
                (match.teamA === teamA && match.teamB === teamB) ||
                (match.teamA === teamB && match.teamB === teamA)
            );
            
            if (!hasPlayed) {
                return false; // Need tie breaker
            }
        }
    }
    
    // All have played, resolve by head-to-head
    const h2hStats = {};
    tiedTeams.forEach(team => {
        h2hStats[team] = { wins: 0, points: 0 };
    });
    
    matchResults.forEach(match => {
        if (tiedTeams.includes(match.teamA) && tiedTeams.includes(match.teamB)) {
            if (match.winner === match.teamA) {
                h2hStats[match.teamA].wins++;
            } else {
                h2hStats[match.teamB].wins++;
            }
            h2hStats[match.teamA].points += match.pointsA;
            h2hStats[match.teamB].points += match.pointsB;
        }
    });
    
    // Sort by head-to-head performance
    const h2hRanked = Object.entries(h2hStats)
        .sort((a, b) => {
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            return b[1].points - a[1].points;
        });
    
    // Update team stats with tie-breaker resolution
    h2hRanked.forEach(([team], index) => {
        teamStats[team].tieBreakerRank = index;
    });
    
    startKnockoutStage();
    return true;
}

function submitTieBreaker(teamA, teamB) {
    const pointsA = parseInt(document.getElementById(`tie_${teamA}_${teamB}_A`).value) || 0;
    const pointsB = parseInt(document.getElementById(`tie_${teamA}_${teamB}_B`).value) || 0;
    
    if (pointsA === pointsB) {
        alert('Tie breaker cannot end in a tie!');
        return;
    }
    
    const winner = pointsA > pointsB ? teamA : teamB;
    
    tieBreakerResults.push({
        teamA,
        teamB,
        pointsA,
        pointsB,
        winner
    });
    
    // Update stats
    if (winner === teamA) {
        teamStats[teamA].wins++;
    } else {
        teamStats[teamB].wins++;
    }
    
    teamStats[teamA].totalPoints += pointsA;
    teamStats[teamB].totalPoints += pointsB;
    
    // Disable the match
    document.getElementById(`tie_${teamA}_${teamB}_A`).disabled = true;
    document.getElementById(`tie_${teamA}_${teamB}_B`).disabled = true;
    
    updateRankings();
    
    // Check if all tie breakers are complete
    if (document.querySelectorAll('#tieBreakerMatches input:not(:disabled)').length === 0) {
        setTimeout(() => {
            startKnockoutStage();
        }, 1000);
    }
}

function startKnockoutStage() {
    const rankings = Object.entries(teamStats)
        .sort((a, b) => {
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
            return (a[1].tieBreakerRank || 0) - (b[1].tieBreakerRank || 0);
        });
    
    const top8 = rankings.slice(0, 8).map(entry => entry[0]);
    
    document.getElementById('knockoutSection').style.display = 'block';
    document.getElementById('leagueSection').style.display = 'none';
    document.getElementById('tieBreakerSection').style.display = 'none';
    
    createQuarterfinals(top8);
}

function createQuarterfinals(top8) {
    const matches = [
        [top8[0], top8[7]], // 1 vs 8
        [top8[1], top8[6]], // 2 vs 7
        [top8[2], top8[5]], // 3 vs 6
        [top8[3], top8[4]]  // 4 vs 5
    ];
    
    const container = document.getElementById('quarterfinalMatches');
    container.innerHTML = '';
    
    matches.forEach((match, index) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'knockout-match';
        matchDiv.innerHTML = `
            <span>QF${index + 1}: ${match[0]} vs ${match[1]}</span>
            <div>
                <input type="number" id="qf_${index}_A" placeholder="${match[0]} points" min="0">
                <input type="number" id="qf_${index}_B" placeholder="${match[1]} points" min="0">
                <button onclick="submitQuarterfinal(${index}, '${match[0]}', '${match[1]}')">Submit</button>
            </div>
        `;
        container.appendChild(matchDiv);
    });
}

function submitQuarterfinal(matchIndex, teamA, teamB) {
    const pointsA = parseInt(document.getElementById(`qf_${matchIndex}_A`).value) || 0;
    const pointsB = parseInt(document.getElementById(`qf_${matchIndex}_B`).value) || 0;
    
    if (pointsA === pointsB) {
        alert('Knockout matches cannot end in a tie!');
        return;
    }
    
    const winner = pointsA > pointsB ? teamA : teamB;
    
    knockoutResults.quarterfinals[matchIndex] = {
        teamA,
        teamB,
        pointsA,
        pointsB,
        winner
    };
    
    // Disable inputs
    document.getElementById(`qf_${matchIndex}_A`).disabled = true;
    document.getElementById(`qf_${matchIndex}_B`).disabled = true;
    
    // Check if all quarterfinals are complete
    if (knockoutResults.quarterfinals.length === 4 && knockoutResults.quarterfinals.every(qf => qf)) {
        createSemifinals();
    }
}

function createSemifinals() {
    document.getElementById('semifinalsSection').style.display = 'block';
    
    const winners = knockoutResults.quarterfinals.map(qf => qf.winner);
    const matches = [
        [winners[0], winners[2]], // QF1 winner vs QF3 winner
        [winners[1], winners[3]]  // QF2 winner vs QF4 winner
    ];
    
    const container = document.getElementById('semifinalMatches');
    container.innerHTML = '';
    
    matches.forEach((match, index) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'knockout-match';
        matchDiv.innerHTML = `
            <span>SF${index + 1}: ${match[0]} vs ${match[1]}</span>
            <div>
                <input type="number" id="sf_${index}_A" placeholder="${match[0]} points" min="0">
                <input type="number" id="sf_${index}_B" placeholder="${match[1]} points" min="0">
                <button onclick="submitSemifinal(${index}, '${match[0]}', '${match[1]}')">Submit</button>
            </div>
        `;
        container.appendChild(matchDiv);
    });
}

function submitSemifinal(matchIndex, teamA, teamB) {
    const pointsA = parseInt(document.getElementById(`sf_${matchIndex}_A`).value) || 0;
    const pointsB = parseInt(document.getElementById(`sf_${matchIndex}_B`).value) || 0;
    
    if (pointsA === pointsB) {
        alert('Knockout matches cannot end in a tie!');
        return;
    }
    
    const winner = pointsA > pointsB ? teamA : teamB;
    const loser = pointsA > pointsB ? teamB : teamA;
    
    knockoutResults.semifinals[matchIndex] = {
        teamA,
        teamB,
        pointsA,
        pointsB,
        winner,
        loser
    };
    
    // Disable inputs
    document.getElementById(`sf_${matchIndex}_A`).disabled = true;
    document.getElementById(`sf_${matchIndex}_B`).disabled = true;
    
    // Check if both semifinals are complete
    if (knockoutResults.semifinals.length === 2 && knockoutResults.semifinals.every(sf => sf)) {
        createFinals();
    }
}

function createFinals() {
    document.getElementById('finalsSection').style.display = 'block';
    
    const sf1 = knockoutResults.semifinals[0];
    const sf2 = knockoutResults.semifinals[1];
    
    const container = document.getElementById('finalMatches');
    container.innerHTML = `
        <div class="knockout-match">
            <span>3rd Place: ${sf1.loser} vs ${sf2.loser}</span>
            <div>
                <input type="number" id="third_A" placeholder="${sf1.loser} points" min="0">
                <input type="number" id="third_B" placeholder="${sf2.loser} points" min="0">
                <button onclick="submitThirdPlace('${sf1.loser}', '${sf2.loser}')">Submit</button>
            </div>
        </div>
        <div class="knockout-match">
            <span>Final: ${sf1.winner} vs ${sf2.winner}</span>
            <div>
                <input type="number" id="final_A" placeholder="${sf1.winner} points" min="0">
                <input type="number" id="final_B" placeholder="${sf2.winner} points" min="0">
                <button onclick="submitFinal('${sf1.winner}', '${sf2.winner}')">Submit</button>
            </div>
        </div>
    `;
}

function submitThirdPlace(teamA, teamB) {
    const pointsA = parseInt(document.getElementById('third_A').value) || 0;
    const pointsB = parseInt(document.getElementById('third_B').value) || 0;
    
    if (pointsA === pointsB) {
        alert('Knockout matches cannot end in a tie!');
        return;
    }
    
    const winner = pointsA > pointsB ? teamA : teamB;
    
    knockoutResults.thirdPlace = {
        teamA,
        teamB,
        pointsA,
        pointsB,
        winner
    };
    
    // Disable inputs
    document.getElementById('third_A').disabled = true;
    document.getElementById('third_B').disabled = true;
    
    checkTournamentComplete();
}

function submitFinal(teamA, teamB) {
    const pointsA = parseInt(document.getElementById('final_A').value) || 0;
    const pointsB = parseInt(document.getElementById('final_B').value) || 0;
    
    if (pointsA === pointsB) {
        alert('Knockout matches cannot end in a tie!');
        return;
    }
    
    const winner = pointsA > pointsB ? teamA : teamB;
    const runnerUp = pointsA > pointsB ? teamB : teamA;
    
    knockoutResults.final = {
        teamA,
        teamB,
        pointsA,
        pointsB,
        winner,
        runnerUp
    };
    
    // Disable inputs
    document.getElementById('final_A').disabled = true;
    document.getElementById('final_B').disabled = true;
    
    checkTournamentComplete();
}

function checkTournamentComplete() {
    if (knockoutResults.final && knockoutResults.thirdPlace) {
        displayFinalResults();
    }
}

function displayFinalResults() {
    const winnerSection = document.getElementById('winnerSection');
    const resultsDiv = document.getElementById('finalResults');
    
    const champion = knockoutResults.final.winner;
    const runnerUp = knockoutResults.final.runnerUp;
    const thirdPlace = knockoutResults.thirdPlace.winner;
    const fourthPlace = knockoutResults.thirdPlace.teamA === thirdPlace ? 
        knockoutResults.thirdPlace.teamB : knockoutResults.thirdPlace.teamA;
    
    resultsDiv.innerHTML = `
        <div style="margin: 10px 0; font-size: 1.3em;">
            🥇 <strong>Champion:</strong> ${champion}
        </div>
        <div style="margin: 10px 0; font-size: 1.2em;">
            🥈 <strong>Runner-up:</strong> ${runnerUp}
        </div>
        <div style="margin: 10px 0; font-size: 1.1em;">
            🥉 <strong>3rd Place:</strong> ${thirdPlace}
        </div>
        <div style="margin: 10px 0; font-size: 1.0em;">
            <strong>4th Place:</strong> ${fourthPlace}
        </div>
        <div style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
            Final Score: ${knockoutResults.final.pointsA} - ${knockoutResults.final.pointsB}<br>
            3rd Place Score: ${knockoutResults.thirdPlace.pointsA} - ${knockoutResults.thirdPlace.pointsB}
        </div>
    `;
    
    winnerSection.style.display = 'block';
    
    // Scroll to results
    winnerSection.scrollIntoView({ behavior: 'smooth' });
}

// Initialize the tournament when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
});