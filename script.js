document.addEventListener("DOMContentLoaded", () => {
  const teamAList = [
    "Manoj-Vinoth", "Suresh-Ramesh", "Vidya-Rajesh",
    "Rahul-Sabari", "Balaji-Venkat", "Senthilvel-Vijay"
  ];

  const teamBList = [
    "Ashok-Uday", "Hari-Sai", "Mustafa-Shanu",
    "Murali-Hemanth", "Raj-Harsha", "Althaf-Ravi"
  ];

  const rankings = {};
  const playedMatches = new Map();
  const headToHeadRecords = new Map(); // Track head-to-head results
  const tieBreakerNeeded = new Set(); // Track teams that need tie breaker matches
  const allMatchups = [];

  const teamASelect = document.getElementById("teamA");
  const teamBSelect = document.getElementById("teamB");
  const resultForm = document.getElementById("resultForm");
  const rankingsTableBody = document.querySelector("#rankingsTable tbody");
  const matchesTableBody = document.querySelector("#matchesTable tbody");
  const playoffInputs = document.getElementById("playoffInputs");
  const playoffResults = document.getElementById("playoffResults");
  const finalWinnerDisplay = document.getElementById("finalWinner");
  const startPlayoffsBtn = document.getElementById("startPlayoffs");

  // Populate Team A dropdown
  teamAList.forEach(team => {
    const option = document.createElement("option");
    option.value = team;
    option.textContent = team;
    teamASelect.appendChild(option);
    rankings[team] = { wins: 0, losses: 0, points: 0 };
  });

  // Populate Team B dropdown with filter
  function populateTeamB(excludeTeam) {
    teamBSelect.innerHTML = "";
    teamBList.forEach(team => {
      if (team !== excludeTeam) {
        const option = document.createElement("option");
        option.value = team;
        option.textContent = team;
        teamBSelect.appendChild(option);
      }
    });
  }
  populateTeamB();

  teamASelect.addEventListener("change", () => {
    populateTeamB(teamASelect.value);
  });

  // Initialize rankings for Team B list
  teamBList.forEach(team => {
    rankings[team] = { wins: 0, losses: 0, points: 0 };
  });

  // Generate all valid matchups
  teamAList.forEach(a => {
    teamBList.forEach(b => {
      allMatchups.push({ teamA: a, teamB: b });
    });
  });

  // Get head-to-head record between two teams
  function getHeadToHead(team1, team2) {
    const key1 = `${team1} vs ${team2}`;
    const key2 = `${team2} vs ${team1}`;
    
    let team1Wins = 0;
    let team2Wins = 0;
    
    if (playedMatches.has(key1)) {
      const match = playedMatches.get(key1);
      if (match.teamAPoints > match.teamBPoints) team1Wins++;
      else if (match.teamBPoints > match.teamAPoints) team2Wins++;
    }
    
    if (playedMatches.has(key2)) {
      const match = playedMatches.get(key2);
      if (match.teamAPoints > match.teamBPoints) team2Wins++;
      else if (match.teamBPoints > match.teamAPoints) team1Wins++;
    }
    
    return { team1Wins, team2Wins };
  }

  // Check if teams have played each other
  function haveTeamsPlayed(team1, team2) {
    const key1 = `${team1} vs ${team2}`;
    const key2 = `${team2} vs ${team1}`;
    return playedMatches.has(key1) || playedMatches.has(key2);
  }

  // Custom sorting function with new ranking logic
  function sortTeamsByRanking(teamsList) {
    return teamsList.sort((a, b) => {
      const aStats = rankings[a];
      const bStats = rankings[b];
      
      // 1. First priority: Most wins
      if (aStats.wins !== bStats.wins) {
        return bStats.wins - aStats.wins;
      }
      
      // 2. Second priority: If wins are equal, most points
      if (aStats.points !== bStats.points) {
        return bStats.points - aStats.points;
      }
      
      // 3. Third priority: Head-to-head record
      if (haveTeamsPlayed(a, b)) {
        const h2h = getHeadToHead(a, b);
        if (h2h.team1Wins !== h2h.team2Wins) {
          return h2h.team2Wins - h2h.team1Wins; // Return negative for team a advantage
        }
      }
      
      // 4. If no head-to-head or tied head-to-head, mark for tie breaker
      if (aStats.wins === bStats.wins && aStats.points === bStats.points) {
        tieBreakerNeeded.add(a);
        tieBreakerNeeded.add(b);
      }
      
      // For now, maintain alphabetical order for teams needing tie breaker
      return a.localeCompare(b);
    });
  }

  function updateMatchesTable() {
    matchesTableBody.innerHTML = "";
    const unplayed = [];
    const played = [];

    allMatchups.forEach(({ teamA, teamB }) => {
      const key = `${teamA} vs ${teamB}`;
      if (playedMatches.has(key)) {
        played.push({ teamA, teamB, ...playedMatches.get(key) });
      } else {
        unplayed.push({ teamA, teamB });
      }
    });

    [...unplayed, ...played].forEach(match => {
      const row = document.createElement("tr");
      const score = match.teamAPoints !== undefined
        ? `${match.teamAPoints} - ${match.teamBPoints}`
        : "-";
      const status = match.teamAPoints !== undefined ? "✅ Played" : "❌ Pending";
      row.innerHTML = `
        <td>${match.teamA}</td>
        <td>${match.teamB}</td>
        <td>${score}</td>
        <td>${status}</td>
      `;
      matchesTableBody.appendChild(row);
    });
  }

  function updateRankings() {
    rankingsTableBody.innerHTML = "";
    tieBreakerNeeded.clear(); // Reset tie breaker tracking
    
    const allTeams = Object.keys(rankings);
    const sortedTeams = sortTeamsByRanking(allTeams);
    
    sortedTeams.forEach((team, index) => {
      const { wins, losses, points } = rankings[team];
      const row = document.createElement("tr");
      
      // Add visual indicator if tie breaker is needed
      const tieBreakerIndicator = tieBreakerNeeded.has(team) ? " ⚠️" : "";
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${team}${tieBreakerIndicator}</td>
        <td>${wins}</td>
        <td>${losses}</td>
        <td>${points}</td>
      `;
      rankingsTableBody.appendChild(row);
    });
    
    // Show tie breaker message if needed
    if (tieBreakerNeeded.size > 0) {
      const tieBreakerTeams = Array.from(tieBreakerNeeded).join(", ");
      console.log(`Tie breaker matches needed between: ${tieBreakerTeams}`);
      
      // You could add a visual notification here
      const notification = document.createElement("div");
      notification.style.cssText = "background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 5px;";
      notification.innerHTML = `<strong>⚠️ Tie Breaker Needed:</strong> Teams marked with ⚠️ have identical records and need additional matches to determine final ranking.`;
      
      // Remove any existing notifications
      const existingNotification = document.querySelector('.tie-breaker-notification');
      if (existingNotification) existingNotification.remove();
      
      notification.classList.add('tie-breaker-notification');
      rankingsTableBody.parentElement.parentElement.insertBefore(notification, rankingsTableBody.parentElement.parentElement.querySelector('h2:nth-of-type(3)'));
    } else {
      // Remove notification if no tie breakers needed
      const existingNotification = document.querySelector('.tie-breaker-notification');
      if (existingNotification) existingNotification.remove();
    }
  }

  // Global function to process tie breaker results
  window.processTieBreaker = function(tieBreakerIndex, teams) {
    const tieBreakerResults = {};
    let allFieldsFilled = true;
    
    teams.forEach(team => {
      const fieldId = `tb_${tieBreakerIndex}_${team.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const field = document.getElementById(fieldId);
      if (field && field.value !== '') {
        tieBreakerResults[team] = parseInt(field.value);
      } else {
        allFieldsFilled = false;
      }
    });
    
    if (!allFieldsFilled) {
      alert('Please fill in all tie breaker scores');
      return;
    }
    
    // Update rankings with tie breaker results
    Object.entries(tieBreakerResults).forEach(([team, points]) => {
      rankings[team].points += points;
      // Optionally add a small bonus to wins for tie breaker winner
      if (teams.length === 2) {
        const otherTeam = teams.find(t => t !== team);
        if (points > tieBreakerResults[otherTeam]) {
          rankings[team].wins += 0.1; // Small fractional win for tie breaker
        }
      }
    });
    
    // For multi-team tie breakers, determine winner by highest points
    if (teams.length > 2) {
      const sortedByTieBreaker = teams.sort((a, b) => tieBreakerResults[b] - tieBreakerResults[a]);
      sortedByTieBreaker.forEach((team, index) => {
        rankings[team].wins += (teams.length - index - 1) * 0.01; // Small incremental bonus
      });
    }
    
    // Record the tie breaker match
    if (teams.length === 2) {
      const [team1, team2] = teams;
      const matchKey = `TB_${team1}_vs_${team2}`;
      playedMatches.set(matchKey, { 
        teamAPoints: tieBreakerResults[team1], 
        teamBPoints: tieBreakerResults[team2],
        isTieBreaker: true 
      });
    }
    
    updateRankings();
    alert('Tie breaker results processed successfully!');
  };

  resultForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const teamA = teamASelect.value;
    const teamB = teamBSelect.value;
    const teamAPoints = parseInt(document.getElementById("teamAPoints").value);
    const teamBPoints = parseInt(document.getElementById("teamBPoints").value);

    if (teamA === teamB || isNaN(teamAPoints) || isNaN(teamBPoints)) {
      alert("Please enter valid teams and scores.");
      return;
    }

    const matchKey = `${teamA} vs ${teamB}`;
    if (!allMatchups.some(m => m.teamA === teamA && m.teamB === teamB)) {
      alert("Invalid matchup. Team A must play Team B.");
      return;
    }

    if (playedMatches.has(matchKey)) {
      alert("This match has already been played.");
      return;
    }

    playedMatches.set(matchKey, { teamAPoints, teamBPoints });
    rankings[teamA].points += teamAPoints;
    rankings[teamB].points += teamBPoints;

    if (teamAPoints > teamBPoints) {
      rankings[teamA].wins += 1;
      rankings[teamB].losses += 1;
    } else if (teamBPoints > teamAPoints) {
      rankings[teamB].wins += 1;
      rankings[teamA].losses += 1;
    }

    updateRankings();
    updateMatchesTable();
    resultForm.reset();
    populateTeamB();
  });

  startPlayoffsBtn.addEventListener("click", () => {
    playoffInputs.innerHTML = "";
    playoffResults.innerHTML = "";
    finalWinnerDisplay.textContent = "";

    // Use the new ranking system for playoffs
    const allTeams = Object.keys(rankings);
    const sortedTeams = sortTeamsByRanking(allTeams);
    const [team1, team2, team3, team4] = sortedTeams.slice(0, 4);

    // Qualifier 1
    playoffInputs.innerHTML += `
      <h3>Qualifier 1: ${team1} vs ${team2}</h3>
      <label>${team1} Score:</label><input type="number" id="q1A" min="0" />
      <label>${team2} Score:</label><input type="number" id="q1B" min="0" />
    `;

    // Eliminator
    playoffInputs.innerHTML += `
      <h3>Eliminator: ${team3} vs ${team4}</h3>
      <label>${team3} Score:</label><input type="number" id="elimA" min="0" />
      <label>${team4} Score:</label><input type="number" id="elimB" min="0" />
    `;

    function checkStage1() {
      const q1A = parseInt(document.getElementById("q1A").value);
      const q1B = parseInt(document.getElementById("q1B").value);
      const elimA = parseInt(document.getElementById("elimA").value);
      const elimB = parseInt(document.getElementById("elimB").value);

      if ([q1A, q1B, elimA, elimB].some(isNaN)) return;

      const q1Winner = q1A > q1B ? team1 : team2;
      const q1Loser = q1A > q1B ? team2 : team1;
      const elimWinner = elimA > elimB ? team3 : team4;

      renderQualifier2(q1Loser, elimWinner, q1Winner);
    }

    document.getElementById("q1A").addEventListener("input", checkStage1);
    document.getElementById("q1B").addEventListener("input", checkStage1);
    document.getElementById("elimA").addEventListener("input", checkStage1);
    document.getElementById("elimB").addEventListener("input", checkStage1);

    function renderQualifier2(q2TeamA, q2TeamB, q1Winner) {
      playoffResults.innerHTML = `
        <h3>Qualifier 2: ${q2TeamA} vs ${q2TeamB}</h3>
        <label>${q2TeamA} Score:</label><input type="number" id="q2A" min="0" />
        <label>${q2TeamB} Score:</label><input type="number" id="q2B" min="0" />
      `;

      function checkQ2() {
        const q2A = parseInt(document.getElementById("q2A").value);
        const q2B = parseInt(document.getElementById("q2B").value);
        if (isNaN(q2A) || isNaN(q2B)) return;

        const q2Winner = q2A > q2B ? q2TeamA : q2TeamB;
        renderFinal(q1Winner, q2Winner);
      }

      document.getElementById("q2A").addEventListener("input", checkQ2);
      document.getElementById("q2B").addEventListener("input", checkQ2);
    }

    function renderFinal(finalTeamA, finalTeamB) {
      playoffResults.innerHTML += `
        <h3>Final: ${finalTeamA} vs ${finalTeamB}</h3>
        <label>${finalTeamA} Score:</label><input type="number" id="finalA" min="0" />
        <label>${finalTeamB} Score:</label><input type="number" id="finalB" min="0" />
      `;

      function checkFinal() {
        const finalA = parseInt(document.getElementById("finalA").value);
        const finalB = parseInt(document.getElementById("finalB").value);
        if (isNaN(finalA) || isNaN(finalB)) return;

        const champion = finalA > finalB ? finalTeamA : finalTeamB;
        finalWinnerDisplay.textContent = `🏆 Champion: ${champion}`;
      }

      document.getElementById("finalA").addEventListener("input", checkFinal);
      document.getElementById("finalB").addEventListener("input", checkFinal);
    }
  });

  // Initial updates
  updateRankings();
  updateMatchesTable();
});