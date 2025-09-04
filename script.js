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

 startPlayoffsBtn.addEventListener("click", () => {
  playoffInputs.innerHTML = "";
  playoffResults.innerHTML = "";
  finalWinnerDisplay.textContent = "";

  const sortedTeams = Object.keys(rankings)
    .sort((a, b) => rankings[b].points - rankings[a].points);
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
});