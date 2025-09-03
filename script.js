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
const playedMatches = new Set();

const teamASelect = document.getElementById("teamA");
const teamBSelect = document.getElementById("teamB");
const resultForm = document.getElementById("resultForm");
const rankingsDisplay = document.getElementById("rankingsDisplay");
const playoffResults = document.getElementById("playoffResults");
const finalWinnerDisplay = document.getElementById("finalWinner");

allTeams.forEach(team => {
  const optionA = document.createElement("option");
  optionA.value = team;
  optionA.textContent = team;
  teamASelect.appendChild(optionA);

  const optionB = document.createElement("option");
  optionB.value = team;
  optionB.textContent = team;
  teamBSelect.appendChild(optionB);

  rankings[team] = { wins: 0, losses: 0, points: 0 };
});

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
  if (playedMatches.has(matchKey)) {
    alert("This match has already been played.");
    return;
  }

  playedMatches.add(matchKey);

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
  resultForm.reset();
});

function updateRankings() {
  rankingsDisplay.innerHTML = "";

  const sorted = Object.keys(rankings).sort((a, b) => rankings[b].points - rankings[a].points);

  sorted.forEach((team, index) => {
    const { wins, losses, points } = rankings[team];
    const div = document.createElement("div");
    div.textContent = `${index + 1}. ${team} — Wins: ${wins}, Losses: ${losses}, Points: ${points}`;
    rankingsDisplay.appendChild(div);
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

  finalWinnerDisplay.textContent = `🏆 Final Winner: ${finalWinner}`;
});

function simulateMatch(teamA, teamB) {
  return rankings[teamA].points >= rankings[teamB].points ? teamA : teamB;
}