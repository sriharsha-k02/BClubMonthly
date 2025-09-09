// Tournament data
const groupA = ['Ashok-Uday', 'Althaf-Ravi', 'Hari-Sai', 'Murali-Hemanth', 'Mustafa-Shanu', 'Raj-Harsha','Bhaskar-Sumanth'];
const groupB = ['Balaji-Venkat', 'Manoj-Vinoth', 'Rahul-Sabari', 'Senthilvel-Vijay', 'Suresh-Ramesh', 'Vidya-Rajesh','Digvijay-Moorthy'];

let matchResults = [];
let teamStats = {};
let tieBreakerMatches = [];
let knockoutResults = {
    quarterfinals: [],
    semifinals: [],
    final: null,
    thirdPlace: null
};

// Storage keys
const STORAGE_KEYS = {
    MATCH_RESULTS: 'tournament_match_results',
    TEAM_STATS: 'tournament_team_stats',
    TIE_BREAKER_MATCHES: 'tournament_tie_breaker_matches',
    KNOCKOUT_RESULTS: 'tournament_knockout_results',
    TOURNAMENT_STATE: 'tournament_state'
};

// Save data to localStorage
function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.MATCH_RESULTS, JSON.stringify(matchResults));
        localStorage.setItem(STORAGE_KEYS.TEAM_STATS, JSON.stringify(teamStats));
        localStorage.setItem(STORAGE_KEYS.TIE_BREAKER_MATCHES, JSON.stringify(tieBreakerMatches));
        localStorage.setItem(STORAGE_KEYS.KNOCKOUT_RESULTS, JSON.stringify(knockoutResults));
        
        // Save current tournament state
        const tournamentState = {
            leagueComplete: matchResults.length === 49,
            tieBreakerActive: document.getElementById('tieBreakerSection')?.style.display === 'block',
            knockoutActive: document.getElementById('knockoutSection')?.style.display === 'block',
            tournamentComplete: document.getElementById('winnerSection')?.style.display === 'block'
        };
        localStorage.setItem(STORAGE_KEYS.TOURNAMENT_STATE, JSON.stringify(tournamentState));
        
        console.log('Data saved to localStorage');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Load data from localStorage
function loadFromStorage() {
    try {
        const savedMatchResults = localStorage.getItem(STORAGE_KEYS.MATCH_RESULTS);
        const savedTeamStats = localStorage.getItem(STORAGE_KEYS.TEAM_STATS);
        const savedTieBreakerMatches = localStorage.getItem(STORAGE_KEYS.TIE_BREAKER_MATCHES);
        const savedKnockoutResults = localStorage.getItem(STORAGE_KEYS.KNOCKOUT_RESULTS);
        const savedTournamentState = localStorage.getItem(STORAGE_KEYS.TOURNAMENT_STATE);
        
        if (savedMatchResults) {
            matchResults = JSON.parse(savedMatchResults);
            console.log(`Loaded ${matchResults.length} match results`);
        }
        
        if (savedTeamStats) {
            teamStats = JSON.parse(savedTeamStats);
            console.log('Loaded team stats');
        }
        
        if (savedTieBreakerMatches) {
            tieBreakerMatches = JSON.parse(savedTieBreakerMatches);
            console.log('Loaded tie-breaker matches');
        }
        
        if (savedKnockoutResults) {
            knockoutResults = JSON.parse(savedKnockoutResults);
            console.log('Loaded knockout results');
        }
        
        if (savedTournamentState) {
            const state = JSON.parse(savedTournamentState);
            console.log('Loaded tournament state:', state);
            return state;
        }
        
        return null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// Clear all saved data
function clearStorage() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('All tournament data cleared from localStorage');
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}

// Reset tournament (with confirmation)
function resetTournament() {
    if (matchResults.length > 0 || Object.keys(teamStats).length > 0) {
        const confirmation = confirm('Are you sure you want to reset the entire tournament? This will delete all match results and progress.');
        if (!confirmation) return;
    }
    
    // Clear data
    matchResults = [];
    teamStats = {};
    tieBreakerMatches = [];
    knockoutResults = {
        quarterfinals: [],
        semifinals: [],
        final: null,
        thirdPlace: null
    };
    
    // Clear storage
    clearStorage();
    
    // Reset UI
    document.getElementById('tieBreakerSection').style.display = 'none';
    document.getElementById('knockoutSection').style.display = 'none';
    document.getElementById('winnerSection').style.display = 'none';
    document.getElementById('leagueSection').style.display = 'block';
    
    // Reinitialize
    init();
    
    alert('Tournament has been reset!');
}

// Initialize tournament
function init() {
    console.log('Initializing tournament...');
    
    // Try to load existing data
    const savedState = loadFromStorage();
    
    // Initialize team stats if not loaded from storage
    if (Object.keys(teamStats).length === 0) {
        [...groupA, ...groupB].forEach(team => {
            teamStats[team] = {
                wins: 0,
                totalPoints: 0,
                gamesPlayed: 0,
                opponents: [],
                group: groupA.includes(team) ? 'A' : 'B'
            };
        });
    }
    
    populateTeamLists();
    populateDropdowns();
    updateMatchStatusTable();
    
    // Restore tournament state if data was loaded
    if (savedState && matchResults.length > 0) {
        updateMatchResults();
        updateRankings();
        updateAvailableMatches();
        
        // Restore UI state based on saved state
        if (savedState.tournamentComplete) {
            restoreKnockoutState();
            displayFinalResults();
        } else if (savedState.knockoutActive) {
            restoreKnockoutState();
        } else if (savedState.tieBreakerActive) {
            restoreTieBreakerState();
        } else if (savedState.leagueComplete) {
            checkForTieBreakers();
        }
        
        console.log('Tournament state restored from saved data');
    }
}

// Restore knockout state
function restoreKnockoutState() {
    document.getElementById('knockoutSection').style.display = 'block';
    document.getElementById('leagueSection').style.display = 'none';
    
    // Restore quarterfinals
    if (knockoutResults.quarterfinals.length > 0) {
        const qfContainer = document.getElementById('quarterfinalMatches');
        qfContainer.innerHTML = '';
        
        knockoutResults.quarterfinals.forEach((match, index) => {
            if (match) {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'knockout-match';
                matchDiv.innerHTML = `
                    <span>QF${index + 1}: ${match.teamA} vs ${match.teamB} | Score: ${match.pointsA} - ${match.pointsB} | Winner: ${match.winner}</span>
                    <div>
                        <button class="edit-btn" onclick="editQuarterfinal(${index})" title="Edit match">✏️</button>
                    </div>
                `;
                qfContainer.appendChild(matchDiv);
            }
        });
    }
    
    // Restore semifinals if they exist
    if (knockoutResults.semifinals.length > 0 && knockoutResults.semifinals.filter(sf => sf).length > 0) {
        document.getElementById('semifinalsSection').style.display = 'block';
        const sfContainer = document.getElementById('semifinalMatches');
        sfContainer.innerHTML = '';
        
        knockoutResults.semifinals.forEach((match, index) => {
            if (match) {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'knockout-match';
                matchDiv.innerHTML = `
                    <span>SF${index + 1}: ${match.teamA} vs ${match.teamB} | Score: ${match.pointsA} - ${match.pointsB} | Winner: ${match.winner}</span>
                    <div>
                        <button class="edit-btn" onclick="editSemifinal(${index})" title="Edit match">✏️</button>
                    </div>
                `;
                sfContainer.appendChild(matchDiv);
            }
        });
    }
    
    // Restore finals if they exist
    if (knockoutResults.final || knockoutResults.thirdPlace) {
        document.getElementById('finalsSection').style.display = 'block';
        const container = document.getElementById('finalMatches');
        container.innerHTML = '';
        
        if (knockoutResults.thirdPlace) {
            const thirdDiv = document.createElement('div');
            thirdDiv.className = 'knockout-match';
            thirdDiv.id = 'thirdPlaceMatch';
            thirdDiv.innerHTML = `
                <span>3rd Place: ${knockoutResults.thirdPlace.teamA} vs ${knockoutResults.thirdPlace.teamB} | Score: ${knockoutResults.thirdPlace.pointsA} - ${knockoutResults.thirdPlace.pointsB} | Winner: ${knockoutResults.thirdPlace.winner}</span>
                <div>
                    <button class="edit-btn" onclick="editThirdPlace()" title="Edit match">✏️</button>
                </div>
            `;
            container.appendChild(thirdDiv);
        }
        
        if (knockoutResults.final) {
            const finalDiv = document.createElement('div');
            finalDiv.className = 'knockout-match';
            finalDiv.id = 'finalMatch';
            finalDiv.innerHTML = `
                <span>Final: ${knockoutResults.final.teamA} vs ${knockoutResults.final.teamB} | Score: ${knockoutResults.final.pointsA} - ${knockoutResults.final.pointsB} | Winner: ${knockoutResults.final.winner}</span>
                <div>
                    <button class="edit-btn" onclick="editFinal()" title="Edit match">✏️</button>
                </div>
            `;
            container.appendChild(finalDiv);
        }
    }
}

// Restore tie-breaker state
function restoreTieBreakerState() {
    // This would need the same logic as createTieBreakers but with saved data
    // For now, we'll just trigger the tie-breaker check again
    checkForTieBreakers();
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
    
    // Add event listener
    document.getElementById('teamA').addEventListener('change', updateTeamBOptions);
    updateAvailableMatches();
}

function updateAvailableMatches() {
    const teamASelect = document.getElementById('teamA');
    const playedMatches = matchResults.map(match => `${match.teamA}-${match.teamB}`);
    
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

function getAllPossibleMatches() {
    const allMatches = [];
    groupA.forEach(teamA => {
        groupB.forEach(teamB => {
            allMatches.push({ teamA, teamB });
        });
    });
    return allMatches;
}

function updateMatchStatusTable() {
    const tbody = document.getElementById('matchStatusBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const allMatches = getAllPossibleMatches();
    const playedMatches = matchResults.map(match => `${match.teamA}-${match.teamB}`);
    
    const remainingMatches = allMatches.filter(match => 
        !playedMatches.includes(`${match.teamA}-${match.teamB}`)
    );
    
    // Add remaining matches
    remainingMatches.forEach(match => {
        const row = tbody.insertRow();
        row.classList.add('remaining-match');
        row.insertCell(0).textContent = match.teamA;
        row.insertCell(1).textContent = match.teamB;
        row.insertCell(2).textContent = 'Not Played';
        row.insertCell(3).textContent = '-';
        row.insertCell(4).textContent = '-';
    });
    
    // Add separator if needed
    if (remainingMatches.length > 0 && matchResults.length > 0) {
        const separatorRow = tbody.insertRow();
        separatorRow.classList.add('separator-row');
        separatorRow.innerHTML = '<td colspan="5"><strong>PLAYED MATCHES</strong></td>';
    }
    
    // Add played matches
    matchResults.forEach((match, index) => {
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
    
    document.getElementById('matchStatusTable').style.display = 'table';
    
    // Update progress indicator
    const totalMatches = getAllPossibleMatches().length;
    const playedCount = matchResults.length;
    console.log(`Progress: ${playedCount}/${totalMatches} matches played`);
}

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
    
    // Save to storage
    saveToStorage();
    
    console.log(`Match completed: ${teamA} ${pointsA} - ${pointsB} ${teamB}, Winner: ${winner}`);
    console.log(`Total matches played: ${matchResults.length}/49`);
    
    // Check if league stage is complete (updated to 49 matches)
    if (matchResults.length === 49) {
        console.log('All league matches completed!');
        checkForTieBreakers();
    }
}

function updateMatchResults() {
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    
    matchResults.forEach(match => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = match.teamA;
        row.insertCell(1).textContent = match.teamB;
        row.insertCell(2).textContent = `${match.pointsA} - ${match.pointsB}`;
        row.insertCell(3).textContent = match.winner;
    });
    
    document.getElementById('matchResultsSection').style.display = 'block';
}

function updateRankings() {
    const rankings = Object.entries(teamStats)
        .sort((a, b) => {
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
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
        row.insertCell(5).textContent = '';
        
        if (index < 8) {
            row.classList.add('top8');
        }
    });
    
    document.getElementById('rankingsSection').style.display = 'block';
}

function checkForTieBreakers() {
    console.log('Checking for tie breakers...');
    
    const rankings = Object.entries(teamStats)
        .sort((a, b) => {
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
            return 0;
        });
    
    console.log('Final rankings:', rankings.map((r, i) => `${i+1}. ${r[0]} (W:${r[1].wins}, P:${r[1].totalPoints})`));
    
    // Find tied groups that need tie-breakers
    const tieBreakerGroups = [];
    let i = 0;
    
    while (i < rankings.length) {
        let tiedTeams = [rankings[i][0]];
        let j = i + 1;
        
        while (j < rankings.length && 
               rankings[j][1].wins === rankings[i][1].wins && 
               rankings[j][1].totalPoints === rankings[i][1].totalPoints) {
            tiedTeams.push(rankings[j][0]);
            j++;
        }
        
        if (tiedTeams.length > 1) {
            const startPosition = i + 1;
            const endPosition = j;
            const crossesTop8 = startPosition <= 8 && endPosition > 8;
            const hasSameGroup = checkSameGroupInTie(tiedTeams);
            const affectsTop8 = startPosition <= 10;
            
            if (affectsTop8 && (crossesTop8 || hasSameGroup)) {
                tieBreakerGroups.push({
                    teams: tiedTeams,
                    startPos: startPosition,
                    endPos: endPosition - 1
                });
                console.log(`Tie-breaker needed for positions ${startPosition}-${endPosition-1}: ${tiedTeams.join(', ')}`);
            }
        }
        
        i = j;
    }
    
    if (tieBreakerGroups.length > 0) {
        createTieBreakers(tieBreakerGroups);
        saveToStorage(); // Save tie-breaker state
    } else {
        console.log('No tie-breakers needed, starting knockouts');
        startKnockouts();
    }
}

function checkSameGroupInTie(teams) {
    const groupACount = teams.filter(team => teamStats[team].group === 'A').length;
    const groupBCount = teams.filter(team => teamStats[team].group === 'B').length;
    return groupACount > 1 || groupBCount > 1;
}

function createTieBreakers(tieBreakerGroups) {
    console.log('Creating tie-breakers for', tieBreakerGroups.length, 'groups');
    
    const container = document.getElementById('tieBreakerMatches');
    container.innerHTML = '';
    tieBreakerMatches = [];
    
    tieBreakerGroups.forEach(group => {
        const titleDiv = document.createElement('div');
        titleDiv.innerHTML = `<h4>Positions ${group.startPos}-${group.endPos}: ${group.teams.join(' vs ')}</h4>`;
        titleDiv.style.margin = '20px 0 10px 0';
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.color = '#333';
        container.appendChild(titleDiv);
        
        // Create matches for this tie-breaker group
        for (let i = 0; i < group.teams.length; i++) {
            for (let j = i + 1; j < group.teams.length; j++) {
                const teamA = group.teams[i];
                const teamB = group.teams[j];
                
                const matchDiv = document.createElement('div');
                matchDiv.className = 'tie-breaker-input-row';
                
                const matchId = `tb_${teamA.replace(/[^a-zA-Z0-9]/g, '_')}_${teamB.replace(/[^a-zA-Z0-9]/g, '_')}`;
                
                matchDiv.innerHTML = `
                    <span>${teamA} vs ${teamB}</span>
                    <div>
                        <input type="number" id="${matchId}_A" placeholder="${teamA} points" min="0">
                        <span>-</span>
                        <input type="number" id="${matchId}_B" placeholder="${teamB} points" min="0">
                    </div>
                `;
                
                container.appendChild(matchDiv);
                
                tieBreakerMatches.push({
                    teamA,
                    teamB,
                    matchId,
                    group: group.teams
                });
            }
        }
    });
    
    document.getElementById('tieBreakerSection').style.display = 'block';
}

function submitAllTieBreakers() {
    console.log('Submitting all tie-breaker results...');
    
    const allTieBreakerResults = [];
    let allValid = true;
    
    // Collect all tie-breaker results
    tieBreakerMatches.forEach(match => {
        const pointsA = parseInt(document.getElementById(`${match.matchId}_A`).value) || 0;
        const pointsB = parseInt(document.getElementById(`${match.matchId}_B`).value) || 0;
        
        if (pointsA === 0 && pointsB === 0) {
            alert(`Please enter scores for ${match.teamA} vs ${match.teamB}`);
            allValid = false;
            return;
        }
        
        if (pointsA === pointsB) {
            alert(`Tie-breaker match ${match.teamA} vs ${match.teamB} cannot end in a tie!`);
            allValid = false;
            return;
        }
        
        const winner = pointsA > pointsB ? match.teamA : match.teamB;
        
        allTieBreakerResults.push({
            teamA: match.teamA,
            teamB: match.teamB,
            pointsA,
            pointsB,
            winner,
            group: match.group
        });
    });
    
    if (!allValid) return;
    
    // Process tie-breaker results by group
    const processedGroups = new Set();
    
    allTieBreakerResults.forEach(result => {
        const groupKey = result.group.sort().join(',');
        
        if (!processedGroups.has(groupKey)) {
            processedGroups.add(groupKey);
            processTieBreakerGroup(result.group, allTieBreakerResults);
        }
    });
    
    // Update rankings and start knockouts
    updateRankings();
    saveToStorage(); // Save after tie-breakers
    console.log('Tie-breakers processed, starting knockouts');
    
    setTimeout(() => {
        document.getElementById('tieBreakerSection').style.display = 'none';
        startKnockouts();
    }, 1000);
}

function processTieBreakerGroup(teams, allResults) {
    console.log('Processing tie-breaker group:', teams);
    
    // Calculate tie-breaker stats for this group
    const tbStats = {};
    teams.forEach(team => {
        tbStats[team] = { wins: 0, points: 0 };
    });
    
    // Add tie-breaker results
    allResults.forEach(result => {
        if (teams.includes(result.teamA) && teams.includes(result.teamB)) {
            if (result.winner === result.teamA) {
                tbStats[result.teamA].wins++;
            } else {
                tbStats[result.teamB].wins++;
            }
            tbStats[result.teamA].points += result.pointsA;
            tbStats[result.teamB].points += result.pointsB;
        }
    });
    
    // Sort teams by tie-breaker performance
    const tbRanked = Object.entries(tbStats)
        .sort((a, b) => {
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            return b[1].points - a[1].points;
        });
    
    // Update team stats with tie-breaker ranks
    tbRanked.forEach(([team], index) => {
        teamStats[team].tieBreakerRank = index;
        teamStats[team].tieBreakerWins = tbStats[team].wins;
        teamStats[team].tieBreakerPoints = tbStats[team].points;
    });
    
    console.log('Tie-breaker results for group:', tbRanked.map(([team, stats], i) => 
        `${i+1}. ${team} (${stats.wins}W, ${stats.points}P)`
    ));
}

function startKnockouts() {
    console.log('Starting knockout stage...');
    
    // Get final rankings including tie-breaker results
    const finalRankings = Object.entries(teamStats)
        .sort((a, b) => {
            if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
            if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
            if (a[1].tieBreakerRank !== undefined && b[1].tieBreakerRank !== undefined) {
                return a[1].tieBreakerRank - b[1].tieBreakerRank;
            }
            return 0;
        });
    
    const top8 = finalRankings.slice(0, 8).map(entry => entry[0]);
    
    console.log('Top 8 teams for knockout:', top8);
    
    // Show knockout section
    document.getElementById('knockoutSection').style.display = 'block';
    document.getElementById('leagueSection').style.display = 'none';
    
    // Reset knockout results
    knockoutResults = {
        quarterfinals: [],
        semifinals: [],
        final: null,
        thirdPlace: null
    };
    
    createQuarterfinals(top8);
    saveToStorage(); // Save knockout start state
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
        teamA, teamB, pointsA, pointsB, winner
    };
    
    // Update display
    const container = document.getElementById('quarterfinalMatches');
    const matchDiv = container.children[matchIndex];
    matchDiv.innerHTML = `
        <span>QF${matchIndex + 1}: ${teamA} vs ${teamB} | Score: ${pointsA} - ${pointsB} | Winner: ${winner}</span>
        <div>
            <button class="edit-btn" onclick="editQuarterfinal(${matchIndex})" title="Edit match">✏️</button>
        </div>
    `;
    
    saveToStorage(); // Save after each match
    
    // Check if all quarterfinals complete
    const completedQFs = knockoutResults.quarterfinals.filter(qf => qf).length;
    if (completedQFs === 4) {
        setTimeout(() => createSemifinals(), 500);
    }
}

function editQuarterfinal(matchIndex) {
    const match = knockoutResults.quarterfinals[matchIndex];
    if (!match) return;
    
    const newPointsA = prompt(`Enter new points for ${match.teamA}:`, match.pointsA);
    const newPointsB = prompt(`Enter new points for ${match.teamB}:`, match.pointsB);
    
    if (newPointsA === null || newPointsB === null) return;
    
    const pointsA = parseInt(newPointsA);
    const pointsB = parseInt(newPointsB);
    
    if (isNaN(pointsA) || isNaN(pointsB) || pointsA === pointsB) {
        alert('Please enter valid, non-equal numbers');
        return;
    }
    
    const winner = pointsA > pointsB ? match.teamA : match.teamB;
    knockoutResults.quarterfinals[matchIndex] = {
        ...match, pointsA, pointsB, winner
    };
    
    // Update display
    const container = document.getElementById('quarterfinalMatches');
    const matchDiv = container.children[matchIndex];
    matchDiv.innerHTML = `
        <span>QF${matchIndex + 1}: ${match.teamA} vs ${match.teamB} | Score: ${pointsA} - ${pointsB} | Winner: ${winner}</span>
        <div>
            <button class="edit-btn" onclick="editQuarterfinal(${matchIndex})" title="Edit match">✏️</button>
        </div>
    `;
    
    // Reset later stages
    document.getElementById('semifinalsSection').style.display = 'none';
    document.getElementById('finalsSection').style.display = 'none';
    document.getElementById('winnerSection').style.display = 'none';
    knockoutResults.semifinals = [];
    knockoutResults.final = null;
    knockoutResults.thirdPlace = null;
    
    saveToStorage(); // Save after edit
    
    // Check if all quarterfinals still complete
    const completedQFs = knockoutResults.quarterfinals.filter(qf => qf).length;
    if (completedQFs === 4) {
        setTimeout(() => createSemifinals(), 500);
    }
}

function createSemifinals() {
    document.getElementById('semifinalsSection').style.display = 'block';
    
    const winners = knockoutResults.quarterfinals.map(qf => qf.winner);
    const matches = [
        [winners[0], winners[2]], // QF1 vs QF3
        [winners[1], winners[3]]  // QF2 vs QF4
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
        teamA, teamB, pointsA, pointsB, winner, loser
    };
    
    // Update display
    const container = document.getElementById('semifinalMatches');
    const matchDiv = container.children[matchIndex];
    matchDiv.innerHTML = `
        <span>SF${matchIndex + 1}: ${teamA} vs ${teamB} | Score: ${pointsA} - ${pointsB} | Winner: ${winner}</span>
        <div>
            <button class="edit-btn" onclick="editSemifinal(${matchIndex})" title="Edit match">✏️</button>
        </div>
    `;
    
    saveToStorage(); // Save after each match
    
    // Check if both semifinals complete
    const completedSFs = knockoutResults.semifinals.filter(sf => sf).length;
    if (completedSFs === 2) {
        setTimeout(() => createFinals(), 500);
    }
}

function editSemifinal(matchIndex) {
    const match = knockoutResults.semifinals[matchIndex];
    if (!match) return;
    
    const newPointsA = prompt(`Enter new points for ${match.teamA}:`, match.pointsA);
    const newPointsB = prompt(`Enter new points for ${match.teamB}:`, match.pointsB);
    
    if (newPointsA === null || newPointsB === null) return;
    
    const pointsA = parseInt(newPointsA);
    const pointsB = parseInt(newPointsB);
    
    if (isNaN(pointsA) || isNaN(pointsB) || pointsA === pointsB) {
        alert('Please enter valid, non-equal numbers');
        return;
    }
    
    const winner = pointsA > pointsB ? match.teamA : match.teamB;
    const loser = pointsA > pointsB ? match.teamB : match.teamA;
    
    knockoutResults.semifinals[matchIndex] = {
        ...match, pointsA, pointsB, winner, loser
    };
    
    // Update display and reset later stages
    const container = document.getElementById('semifinalMatches');
    const matchDiv = container.children[matchIndex];
    matchDiv.innerHTML = `
        <span>SF${matchIndex + 1}: ${match.teamA} vs ${match.teamB} | Score: ${pointsA} - ${pointsB} | Winner: ${winner}</span>
        <div>
            <button class="edit-btn" onclick="editSemifinal(${matchIndex})" title="Edit match">✏️</button>
        </div>
    `;
    
    document.getElementById('finalsSection').style.display = 'none';
    document.getElementById('winnerSection').style.display = 'none';
    knockoutResults.final = null;
    knockoutResults.thirdPlace = null;
    
    saveToStorage(); // Save after edit
    
    const completedSFs = knockoutResults.semifinals.filter(sf => sf).length;
    if (completedSFs === 2) {
        setTimeout(() => createFinals(), 500);
    }
}

function createFinals() {
    document.getElementById('finalsSection').style.display = 'block';
    
    const sf1 = knockoutResults.semifinals[0];
    const sf2 = knockoutResults.semifinals[1];
    
    const container = document.getElementById('finalMatches');
    container.innerHTML = `
        <div class="knockout-match" id="thirdPlaceMatch">
            <span>3rd Place: ${sf1.loser} vs ${sf2.loser}</span>
            <div>
                <input type="number" id="third_A" placeholder="${sf1.loser} points" min="0">
                <input type="number" id="third_B" placeholder="${sf2.loser} points" min="0">
                <button onclick="submitThirdPlace('${sf1.loser}', '${sf2.loser}')">Submit</button>
            </div>
        </div>
        <div class="knockout-match" id="finalMatch">
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
    const loser = pointsA > pointsB ? teamB : teamA;
    
    knockoutResults.thirdPlace = {
        teamA, teamB, pointsA, pointsB, winner, loser
    };
    
    // Update display
    const matchDiv = document.getElementById('thirdPlaceMatch');
    matchDiv.innerHTML = `
        <span>3rd Place: ${teamA} vs ${teamB} | Score: ${pointsA} - ${pointsB} | Winner: ${winner}</span>
        <div>
            <button class="edit-btn" onclick="editThirdPlace()" title="Edit match">✏️</button>
        </div>
    `;
    
    saveToStorage(); // Save after match
    checkTournamentComplete();
}

function editThirdPlace() {
    const match = knockoutResults.thirdPlace;
    if (!match) return;
    
    const newPointsA = prompt(`Enter new points for ${match.teamA}:`, match.pointsA);
    const newPointsB = prompt(`Enter new points for ${match.teamB}:`, match.pointsB);
    
    if (newPointsA === null || newPointsB === null) return;
    
    const pointsA = parseInt(newPointsA);
    const pointsB = parseInt(newPointsB);
    
    if (isNaN(pointsA) || isNaN(pointsB) || pointsA === pointsB) {
        alert('Please enter valid, non-equal numbers');
        return;
    }
    
    const winner = pointsA > pointsB ? match.teamA : match.teamB;
    const loser = pointsA > pointsB ? match.teamB : match.teamA;
    
    knockoutResults.thirdPlace = {
        ...match, pointsA, pointsB, winner, loser
    };
    
    // Update display
    const matchDiv = document.getElementById('thirdPlaceMatch');
    matchDiv.innerHTML = `
        <span>3rd Place: ${match.teamA} vs ${match.teamB} | Score: ${pointsA} - ${pointsB} | Winner: ${winner}</span>
        <div>
            <button class="edit-btn" onclick="editThirdPlace()" title="Edit match">✏️</button>
        </div>
    `;
    
    saveToStorage(); // Save after edit
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
        teamA, teamB, pointsA, pointsB, winner, runnerUp
    };
    
    // Update display
    const matchDiv = document.getElementById('finalMatch');
    matchDiv.innerHTML = `
        <span>Final: ${teamA} vs ${teamB} | Score: ${pointsA} - ${pointsB} | Winner: ${winner}</span>
        <div>
            <button class="edit-btn" onclick="editFinal()" title="Edit match">✏️</button>
        </div>
    `;
    
    saveToStorage(); // Save after match
    checkTournamentComplete();
}

function editFinal() {
    const match = knockoutResults.final;
    if (!match) return;
    
    const newPointsA = prompt(`Enter new points for ${match.teamA}:`, match.pointsA);
    const newPointsB = prompt(`Enter new points for ${match.teamB}:`, match.pointsB);
    
    if (newPointsA === null || newPointsB === null) return;
    
    const pointsA = parseInt(newPointsA);
    const pointsB = parseInt(newPointsB);
    
    if (isNaN(pointsA) || isNaN(pointsB) || pointsA === pointsB) {
        alert('Please enter valid, non-equal numbers');
        return;
    }
    
    const winner = pointsA > pointsB ? match.teamA : match.teamB;
    const runnerUp = pointsA > pointsB ? match.teamB : match.teamA;
    
    knockoutResults.final = {
        ...match, pointsA, pointsB, winner, runnerUp
    };
    
    // Update display
    const matchDiv = document.getElementById('finalMatch');
    matchDiv.innerHTML = `
        <span>Final: ${match.teamA} vs ${match.teamB} | Score: ${pointsA} - ${pointsB} | Winner: ${winner}</span>
        <div>
            <button class="edit-btn" onclick="editFinal()" title="Edit match">✏️</button>
        </div>
    `;
    
    saveToStorage(); // Save after edit
    checkTournamentComplete();
}

function checkTournamentComplete() {
    if (knockoutResults.final && knockoutResults.thirdPlace) {
        setTimeout(() => displayFinalResults(), 500);
    }
}

function displayFinalResults() {
    const winnerSection = document.getElementById('winnerSection');
    const resultsDiv = document.getElementById('finalResults');
    
    const champion = knockoutResults.final.winner;
    const runnerUp = knockoutResults.final.runnerUp;
    const thirdPlace = knockoutResults.thirdPlace.winner;
    const fourthPlace = knockoutResults.thirdPlace.loser;
    
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
    winnerSection.scrollIntoView({ behavior: 'smooth' });
    
    saveToStorage(); // Save final state
    
    console.log('Tournament completed!');
    console.log('Final results:', { champion, runnerUp, thirdPlace, fourthPlace });
}

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
    
    // Clear tie-breaker data
    Object.keys(teamStats).forEach(team => {
        delete teamStats[team].tieBreakerRank;
        delete teamStats[team].tieBreakerWins;
        delete teamStats[team].tieBreakerPoints;
    });
    
    // Update displays
    updateMatchResults();
    updateRankings();
    updateMatchStatusTable();
    
    // Save changes
    saveToStorage();
    
    // Hide knockout/tie-breaker sections as they may need recalculation
    document.getElementById('tieBreakerSection').style.display = 'none';
    document.getElementById('knockoutSection').style.display = 'none';
    document.getElementById('winnerSection').style.display = 'none';
    
    // Check if league stage is complete (updated to 49 matches)
    if (matchResults.length === 49) {
        checkForTieBreakers();
    }
}

// Debug function to force start knockouts (for testing)
function forceStartKnockouts() {
    console.log('FORCE START KNOCKOUTS - DEBUG MODE');
    
    // Get current top 8 teams (or use first 8 if not enough matches)
    let top8;
    if (matchResults.length > 0) {
        const rankings = Object.entries(teamStats)
            .sort((a, b) => {
                if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
                if (b[1].totalPoints !== a[1].totalPoints) return b[1].totalPoints - a[1].totalPoints;
                return 0;
            });
        top8 = rankings.slice(0, 8).map(entry => entry[0]);
    } else {
        // Use first 8 teams if no matches played
        top8 = [...groupA.slice(0, 4), ...groupB.slice(0, 4)];
    }
    
    console.log('Force starting knockouts with teams:', top8);
    
    // Show knockout section and hide others
    document.getElementById('knockoutSection').style.display = 'block';
    document.getElementById('leagueSection').style.display = 'none';
    document.getElementById('tieBreakerSection').style.display = 'none';
    
    // Reset knockout results
    knockoutResults = {
        quarterfinals: [],
        semifinals: [],
        final: null,
        thirdPlace: null
    };
    
    createQuarterfinals(top8);
    saveToStorage(); // Save debug state
}

// Add UI controls for persistence
function addPersistenceControls() {
    // Create a control panel div
    const controlPanel = document.createElement('div');
    controlPanel.id = 'persistenceControls';
    controlPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        font-size: 12px;
    `;
    
    controlPanel.innerHTML = `
        <div style="margin-bottom: 5px;"><strong>Tournament Controls</strong></div>
        <button onclick="resetTournament()" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #ff4444; color: white; border: none; border-radius: 3px;">Reset Tournament</button><br>
        <button onclick="saveToStorage()" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #4444ff; color: white; border: none; border-radius: 3px;">Save Progress</button><br>
        <button onclick="forceStartKnockouts()" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #ff8800; color: white; border: none; border-radius: 3px;">Debug: Force KO</button>
        <div style="margin-top: 5px; font-size: 10px; opacity: 0.7;">
            Progress auto-saves<br>
            Total matches: ${getAllPossibleMatches().length}
        </div>
    `;
    
    document.body.appendChild(controlPanel);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced Tournament app loading...');
    init();
    addPersistenceControls(); // Add the control panel
    console.log('Enhanced Tournament app loaded successfully!');
    console.log(`Tournament setup: ${groupA.length} teams in Group A, ${groupB.length} teams in Group B`);
    console.log(`Total matches to play: ${groupA.length * groupB.length} (${groupA.length}x${groupB.length})`);
});