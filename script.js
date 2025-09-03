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
    const sorted = Object.keys(rankings).sort((a, b) => rankings[b].points - rankings[a].points);
    sorted.forEach((team, index) => {
      const { wins, losses, points } = rankings[team];
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${team}</td>
        <td>${wins}</td>
        <td>${losses}</td>
        <td>${points}</td>
      `;
      rankingsTableBody.appendChild(row);
    });
  }

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

  // Playoffs: Qualifier 1 → Eliminator → Qualifier 2 → Final
  startPlayoffsBtn.addEventListener("click", () => {
    playoffInputs.innerHTML = "";
    playoffResults.innerHTML = "";
    finalWinnerDisplay.textContent = "";

    const sortedTeams = Object.keys(rankings)
      .sort((a, b) => rankings[b].points - rankings[a].points);
    const top4 = sortedTeams.slice(0, 4);

    const qualifier1 = { teamA: top4[0], teamB: top4[1] };
    const eliminator = { teamA: top4[2], teamB: top4[3] };

    playoffInputs.innerHTML += `
      <h3>Qualifier 1: ${qualifier1.teamA} vs ${qualifier1.teamB}</h3>
      <input type="number" id="q1A" placeholder="${qualifier1.teamA} score" min="0" required>
      <input type="number" id="q1B" placeholder="${qualifier1.teamB} score" min="0" required>

      <h3>Eliminator: ${eliminator.teamA} vs ${eliminator.teamB}</h3>
      <input type="number" id="elimA" placeholder="${eliminator.teamA} score" min="0" required>
      <input type="number" id="elimB" placeholder="${eliminator.teamB} score" min="0" required>
    `;

    const submitStage1 = document.createElement("button");
    submitStage1.textContent = "Submit Q1 & Eliminator";
    playoffInputs.appendChild(submitStage1);

    submitStage1.addEventListener("click", () => {
      const q1A = parseInt(document.getElementById("q1A").value);
      const q1B = parseInt(document.getElementById("q1B").value);
      const elimA = parseInt(document.getElementById("elimA").value);
      const elimB = parseInt(document.getElementById("elimB").value);

      if ([q1A, q1B, elimA, elimB].some(isNaN)) {
        alert("Please enter all scores for Q1 and Eliminator.");
        return;
      }

      const q1Winner = q1A > q1B ? qualifier1.teamA : qualifier1.teamB;
      const q1Loser = q1A > q1B ? qualifier1.teamB : qualifier1.teamA;
      const elimWinner = elimA > elimB ? eliminator.teamA : eliminator.teamB;

      playoffResults.innerHTML = `
        <h3>Qualifier 2: ${q1Loser} vs ${elimWinner}</h3>
        <input type="number" id="q2A" placeholder="${q1Loser} score" min="0" required>
        <input type="number" id="q2B" placeholder="${elimWinner} score" min="0" required>
        <button id="submitQ2">Submit Q2</button>
      `;

           document.getElementById("submitQ2").addEventListener("click", () => {
        const q2A = parseInt(document.getElementById("q2A").value);
        const q2B = parseInt(document.getElementById("q2B").value);

        if (isNaN(q2A) || isNaN(q2B)) {
          alert("Please enter scores for Qualifier 2.");
          return;
        }

        const q2Winner = q2A > q2B ? q1Loser : elimWinner;

        // Final match
        playoffResults.innerHTML += `
          <h3>Final: ${q1Winner} vs ${q2Winner}</h3>
          <input type="number" id="finalA" placeholder="${q1Winner} score" min="0" required>
          <input type="number" id="finalB" placeholder="${q2Winner} score" min="0" required>
          <button id="submitFinal">Submit Final</button>
        `;

        document.getElementById("submitFinal").addEventListener("click", () => {
          const finalA = parseInt(document.getElementById("finalA").value);
          const finalB = parseInt(document.getElementById("finalB").value);

          if (isNaN(finalA) || isNaN(finalB)) {
            alert("Please enter scores for the Final.");
            return;
          }

          const champion = finalA > finalB ? q1Winner : q2Winner;
          finalWinnerDisplay.textContent = `🏆 Champion: ${champion}`;
        });
      });
    });
  });
});