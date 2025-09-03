const teamAList = [
  "Manoj-Vinoth", "Suresh-Ramesh", "Vidya-Rajesh",
  "Rahul-Sabari", "Balaji-Venkat", "Senthilvel-Vijay"
];

const teamBList = [
  "Ashok-Uday", "Hari-Sai", "Mustafa-Shanu",
  "Murali-Hemanth", "Raj-Harsha", "Althaf-Ravi"
];

const allTeams = [...teamAList, ...teamBList];
const rankings = {};
const playedMatches = new Map();
const allMatchups = [];

const teamASelect = document.getElementById("teamA");
const teamBSelect = document.getElementById("teamB");
const resultForm = document.getElementById("resultForm");
const rankingsTableBody = document.querySelector("#rankingsTable tbody");
const matchesTableBody = document.querySelector("#matchesTable tbody");
const playoffResults = document.getElementById("playoffResults");
const finalWinnerDisplay = document.getElementById("finalWinner");

// Initialize dropdowns and rankings
teamAList.forEach(team => {
  const option = document.createElement("option");
  option.value = team;
  option.textContent = team;
  teamASelect.appendChild(option);
  rankings[team] = { wins: 0, losses: 0, points: 0 };
});

teamBList.forEach(team => {
  const option = document.createElement("option");
  option.value = team;
  option.textContent = team;
  teamBSelect.appendChild(option);
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
});

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

document.getElementById("startPlayoffs").addEventListener("click", function () {
  const sortedTeams = Object.keys(rankings).sort((a, b) => rankings[b].points - rankings[a].points);
  const top4 = sortedTeams.slice(0, 4);

  if (top4.length < 4) {
    alert("Not enough teams to start playoffs.");
    return;
  }

  playoffResults.innerHTML = "";

  const [team1, team2, team3, team4] = top4;

  const qualifier1Winner = simulateMatch(team1, team2);
  const eliminatorWinner = simulateMatch(team3, team4);
  const qualifier2Winner = simulateMatch(
    qualifier1Winner === team1 ? team2 : team1,
    eliminatorWinner
  );
  const finalWinner = simulateMatch(qualifier1Winner, qualifier2Winner);

  playoffResults.innerHTML = `
    <p>Qualifier 1: ${team1} vs ${team2} → Winner: ${qualifier1Winner}</p>
    <p>Eliminator: ${team3} vs ${team4} → Winner: ${eliminatorWinner}</p>
    <p>Qualifier 2: ${qualifier1Winner === team1 ? team2 : team1} vs ${eliminatorWinner} → Winner: ${qualifier2Winner}</p>
    <p><strong>Final: ${qualifier1Winner} vs ${qualifier2Winner} → Winner: ${finalWinner}</strong></p>
  `;

  finalWinnerDisplay.textContent = `🏆 Final Winner: