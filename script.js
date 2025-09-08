// Tournament data
const groupA = ['Ashok-Uday', 'Althaf-Ravi', 'Hari-Sai', 'Murali-Hemanth', 'Mustafa-Shanu', 'Raj-Harsha'];
const groupB = ['Balaji-Venkat', 'Manoj-Vinoth', 'Rahul-Sabari', 'Senthilvel-Vijay', 'Suresh-Ramesh', 'Vidya-Rajesh'];

let matchResults = [];
let teamStats = {};
let tieBreakerResults = [];
let tieBreakerProcessed = false; // Flag to prevent duplicate tie breaker creation
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
            opponents: [],
            headToHeadWinner: false,
            tieBreakerWinner: false,
            tieBreakerRank: null
        };
    });
    
    populateTeamLists();
    populateDropdowns();
    updateMatchStatusTable();
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

// Generate all possible matches
function getAllPossibleMatches() {
    const allMatches = [];
    groupA.forEach(teamA => {
        groupB.forEach(teamB => {
            allMatches.push({ teamA, teamB });
        });
    });
    return allMatches;
}

// Update match status table
function updateMatchStatusTable() {
    const tbody = document.getElementById('matchStatusBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const allMatches = getAllPossibleMatches();
    const playedMatches = matchResults.map(match => `${match.teamA}-${match.teamB}`);
    
    // Separate remaining and played matches
    const remainingMatches = allMatches.filter(match => 
        !playedMatches.includes(`${match.teamA}-${match.teamB}`)
    );
    
    const playedMatchesData = matchResults.slice();
    
    // Add remaining matches first
    remainingMatches.forEach(match => {
        const row = tbody.insertRow();
        row.classList.add('remaining-match');
        row.insertCell(0).textContent = match.teamA;
        row.insertCell(1).textContent = match.teamB;
        row.insertCell(2).textContent = 'Not Played';
        row.insertCell(3).textContent = '-';
        row.insertCell(4).textContent = '-';
    });
    
    // Add separator row if there are both remaining and played matches
    if (remainingMatches.length > 0 && playedMatchesData.length > 0) {
        const separatorRow = tbody.insertRow();
        separatorRow.classList.add('separator-row');
        separatorRow.innerHTML = '<td colspan="5"><strong>PLAYED MATCHES</strong></td>';
    }
    
    // Add played matches
    playedMatchesData.forEach((match, index) => {
        const row = tbody.insertRow();
        row.classList.add('played-match');
        row.insertCell(0).textContent = match.teamA;
        row.insertCell(1).textContent = match.teamB;
        row.insertCell(2).textContent = `${match.pointsA} - ${match.pointsB}`;
        row.insertCell(3).textContent = match.winner;
        
        const editCell = row.insertCell(4);
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.className = 'edit-btn';
        editBtn.onclick = () => editMatch(index);
        editBtn.title = 'Edit match result';
        editCell.appendChild(editBtn);
    });
    
    // Show the table
    const table = document.getElementById('matchStatusTable');
    if (table) {
        table.style.display = 'table';
    }
}

// Edit match function
function editMatch(matchIndex) {
    const match = matchResults[matchIndex];
    const newPointsA = prompt(`Enter new points for ${match.teamA}:`, match.pointsA);
    const newPointsB = prompt(`Enter new points for ${match.teamB}:`, match.pointsB);
    
    if (newPointsA === null || newPointsB === null) return;
    
    const pointsA = parseInt(newPointsA);
    const pointsB = parseInt(newPointsB);
    
    if (isNaN(pointsA) || isNaN(pointsB)) {
        alert('Please enter valid numbers');
        return;
    }
    
    if (pointsA === pointsB) {
        alert('Points cannot be equal. One team must win.');
        return;
    }
    
    // Update the match result
    const oldPointsA = match.pointsA;
    const oldPointsB = match.pointsB;
    const oldWinner = match.winner;
    
    match.pointsA = pointsA;
    match.pointsB = pointsB;
    match.winner = pointsA > pointsB ? match.teamA : match.teamB;
    
    // Update team stats
    teamStats[match.teamA].totalPoints = teamStats[match.teamA].totalPoints - oldPointsA + pointsA;
    teamStats[match.teamB].totalPoints = teamStats[match.teamB].totalPoints - oldPointsB + pointsB;
    
    // Update wins
    if (oldWinner === match.teamA) {
        teamStats[match.teamA].wins--;
    } else {
        teamStats[match.teamB].wins--;
    }
    
    if (match.winner === match.teamA) {
        teamStats[match.teamA].wins++;
    } else {
        teamStats[match.teamB].wins++;
    }
    
    // Reset tie breaker and head-to-head flags
    Object.keys(teamStats).forEach(team => {
        teamStats[team].headToHeadWinner = false;
        teamStats[team].tieBreakerWinner = false;
        teamStats[team].tieBreakerRank = null;
    });
    
    // Reset tie breaker processed flag
    tieBreakerProcessed = false;
    tieBreakerResults = [];
    
    // Clear tie breaker section
    document.getElementById('tieBreakerSection').style.display = 'none';
    document.getElementById('tieBreakerMatches').innerHTML = '';
    
    // Update displays
    updateMatchResults();
    updateRankings();
    updateMatchStatusTable();
    
    // Check if league stage is complete
    if (matchResults.length === 36) {
        checkForTieBreakers();
    }
}

// Add event listener for team A selection
document.addEventListener('DOMContentLoaded', function() {
    const teamASelect = document.getElementById('teamA');
    if (teamASelect) {
        teamASelect.addEventListener('change', updateTeamBOptions);
    }
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
    updateMatchStatusTable();
    
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
    // Sort teams by wins first, then by points, then by tie breaker rank
    const rankings = Object.entries(teamStats)
        .sort((a, b) => {
            // First by wins
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            // Then by total points
            if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
            // Then by tie breaker rank (lower number = better rank)
            if (a[1].tieBreakerRank !== null && b[1].tieBreakerRank !== null) {
                return a[1].tieBreakerRank - b[1].tieBreakerRank;
            }
            return 0;
        });
    
    const tbody = document.getElementById('rankingsBody');
    tbody.innerHTML = '';
    
    rankings.forEach((entry, index) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = entry[0];
        row.insertCell(2).textContent = entry[1].gamesPlayed;
        row.insertCell(3).textContent = entry[1].wins;
        row.insertCell(4).textContent = entry[1].totalPoints;
        
        // Add status tags
        let status = '';
        if (entry[1].headToHeadWinner) {
            status += '<span class="tag head-to-head">Head to Head Winner</span>';
        }
        if (entry[1].tieBreakerWinner) {
            status += '<span class="tag tie-breaker-tag">Tie Break Winner</span>';
        }
        row.insertCell(5).innerHTML = status;
        
        // Highlight top 8
        if (index < 8) {
            row.classList.add('top8');
        }
    });
    
    document.getElementById('rankingsSection').style.display = 'block';
}

function checkForTieBreakers() {
    // Prevent duplicate processing
    if (tieBreakerProcessed) {
        return;
    }
    
    console.log('Checking for tie breakers...');
    
    // Reset all flags first
    Object.keys(teamStats).forEach(team => {
        teamStats[team].headToHeadWinner = false;
        teamStats[team].tieBreakerWinner = false;
        teamStats[team].tieBreakerRank = null;
    });
    
    const rankings = Object.entries(teamStats)
        .sort((a, b) => {
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
            return 0;
        });
    
    console.log('Current rankings:', rankings.map((r, i) => `${i+1}. ${r[0]} (W:${r[1].wins}, P:${r[1].totalPoints})`));
    
    // Find ALL tied groups, not just those affecting top 8
    const tiedGroups = [];
    let i = 0;
    while (i < rankings.length) {
        let currentGroup = [rankings[i][0]];
        let j = i + 1;
        
        while (j < rankings.length && 
               rankings[j][1].wins === rankings[i][1].wins && 
               rankings[j][1].totalPoints === rankings[i][1].totalPoints) {
            currentGroup.push(rankings[j][0]);
            j++;
        }
        
        if (currentGroup.length > 1) {
            const groupPositions = currentGroup.map(team => 
                rankings.findIndex(entry => entry[0] === team) + 1
            );
            
            console.log(`Found tied group: ${currentGroup.join(', ')} at positions ${groupPositions.join(', ')}`);
            
            // Process ALL ties that involve positions 1-10 (to be safe for top 8 qualification)
            if (groupPositions.some(pos => pos <= 10)) {
                tiedGroups.push({
                    teams: currentGroup,
                    positions: groupPositions,
                    startPos: Math.min(...groupPositions)
                });
            }
        }
        
        i = j;
    }
    
    console.log(`Found ${tiedGroups.length} tied groups to process`);
    
    // Process each tied group
    let needsTieBreaker = false;
    for (const group of tiedGroups) {
        console.log(`Processing tie for positions ${group.startPos}-${group.startPos + group.teams.length - 1}: ${group.teams.join(', ')}`);
        const resolved = resolveByHeadToHead(group.teams);
        if (!resolved) {
            console.log(`Creating tie breaker for: ${group.teams.join(', ')}`);
            needsTieBreaker = true;
            createTieBreaker(group.teams, group.startPos);
        } else {
            console.log(`Resolved by head-to-head: ${group.teams.join(', ')}`);
        }
    }
    
    if (!needsTieBreaker) {
        console.log('No tie breakers needed, starting knockout stage');
        updateRankings();
        startKnockoutStage();
    } else {
        console.log('Tie breakers created, waiting for results');
        tieBreakerProcessed = true; // Mark as processed to prevent duplicates
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
    
    // Check if head-to-head actually resolves the tie
    let isResolved = true;
    for (let i = 0; i < h2hRanked.length - 1; i++) {
        if (h2hRanked[i][1].wins === h2hRanked[i+1][1].wins && 
            h2hRanked[i][1].points === h2hRanked[i+1][1].points) {
            isResolved = false;
            break;
        }
    }
    
    if (isResolved) {
        // Mark teams as head-to-head winners (all but the last one get the tag)
        for (let i = 0; i < h2hRanked.length - 1; i++) {
            teamStats[h2hRanked[i][0]].headToHeadWinner = true;
        }
        return true;
    }
    
    return false; // Still tied, need tie breaker
}

function createTieBreaker(tiedTeams, startPosition) {
    document.getElementById('tieBreakerSection').style.display = 'block';
    
    const container = document.getElementById('tieBreakerMatches');
    container.innerHTML = ''; // Clear any existing content
    
    // Add title showing what positions are being decided
    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `<h3>Tie Breaker for positions ${startPosition} to ${startPosition + tiedTeams.length - 1}</h3>`;
    titleDiv.style.marginBottom = '20px';
    container.appendChild(titleDiv);
    
    // Create tie breaker matches (round robin between tied teams)
    tiedTeams.forEach((teamA, i) => {
        tiedTeams.slice(i + 1).forEach(teamB => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'knockout-match';
            matchDiv.innerHTML = `
                <span>${teamA} vs ${teamB}</span>
                <div>
                    <input type="number" id="tie_${teamA.replace(/[^a-zA-Z0-9]/g, '_')}_${teamB.replace(/[^a-zA-Z0-9]/g, '_')}_A" placeholder="${teamA} points" min="0">
                    <input type="number" id="tie_${teamA.replace(/[^a-zA-Z0-9]/g, '_')}_${teamB.replace(/[^a-zA-Z0-9]/g, '_')}_B" placeholder="${teamB} points" min="0">
                    <button onclick="submitTieBreaker('${teamA}', '${teamB}', ${JSON.stringify(tiedTeams).replace(/"/g, '&quot;')})">Submit</button>
                </div>
            `;
            container.appendChild(matchDiv);
        });
    });
}

function submitTieBreaker(teamA, teamB, tiedTeams) {
    const teamAId = teamA.replace(/[^a-zA-Z0-9]/g, '_');
    const teamBId = teamB.replace(/[^a-zA-Z0-9]/g, '_');
    
    const pointsA = parseInt(document.getElementById(`tie_${teamAId}_${teamBId}_A`).value) || 0;
    const pointsB = parseInt(document.getElementById(`tie_${teamAId}_${teamBId}_B`).value) || 0;
    
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
    
    // Disable the match inputs
    document.getElementById(`tie_${teamAId}_${teamBId}_A`).disabled = true;
    document.getElementById(`tie_${teamAId}_${teamBId}_B`).disabled = true;
    
    // Check if all tie breakers are complete for this group
    const totalTieBreakersNeeded = (tiedTeams.length * (tiedTeams.length - 1)) / 2;
    const completedTieBreakers = tieBreakerResults.filter(tb => 
        tiedTeams.includes(tb.teamA) && tiedTeams.includes(tb.teamB)
    ).length;
    
    if (completedTieBreakers === totalTieBreakersNeeded) {
        // Calculate tie breaker standings
        const tbStats = {};
        tiedTeams.forEach(team => {
            tbStats[team] = { wins: 0, points: 0 };
        });
        
        tieBreakerResults.forEach(tb => {
            if (tiedTeams.includes(tb.teamA) && tiedTeams.includes(tb.teamB)) {
                if (tb.winner === tb.teamA) {
                    tbStats[tb.teamA].wins++;
                } else {
                    tbStats[tb.teamB].wins++;
                }
                tbStats[tb.teamA].points += tb.pointsA;
                tbStats[tb.teamB].points += tb.pointsB;
            }
        });
        
        // Sort by tie breaker performance
        const tbRanked = Object.entries(tbStats)
            .sort((a, b) => {
                if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
                return b[1].points - a[1].points;
            });
        
        // Assign tie breaker ranks and mark winners (only the actual winners get the tag)
        tbRanked.forEach(([team], index) => {
            teamStats[team].tieBreakerRank = index;
            // Only mark as tie breaker winner if they're not in the last position
            if (index < tbRanked.length - 1) {
                teamStats[team].tieBreakerWinner = true;
            }
        });
        
        updateRankings();
        
        setTimeout(() => {
            // Check if there are more ties to resolve
            const stillTied = checkForMoreTies();
            if (!stillTied) {
                startKnockoutStage();
            }
        }, 1000);
    } else {
        updateRankings();
    }
}

function checkForMoreTies() {
    const rankings = Object.entries(teamStats)
        .sort((a, b) => {
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
            if (a[1].tieBreakerRank !== null && b[1].tieBreakerRank !== null) {
                return a[1].tieBreakerRank - b[1].tieBreakerRank;
            }
            return 0;
        });
    
    // Check if there are still ties affecting top 8
    for (let i = 0; i < Math.min(10, rankings.length - 1); i++) {
        const current = rankings[i][1];
        const next = rankings[i + 1][1];
        
        if (current.wins === next.wins && 
            current.totalPoints === next.totalPoints &&
            current.tieBreakerRank === next.tieBreakerRank) {
            // There's still a tie that might affect top 8
            if (i < 8 || i + 1 === 8) {
                tieBreakerProcessed = false; // Reset flag
                checkForTieBreakers();
                return true;
            }
        }
    }
    
    return false;
}

function startKnockoutStage() {
    const rankings = Object.entries(teamStats)
        .sort((a, b) => {
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
            if (a[1].tieBreakerRank !== null && b[1].tieBreakerRank !== null) {
                return a[1].tieBreakerRank - b[1].tieBreakerRank;
            }
            return 0;
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