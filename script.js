const form = document.getElementById("resultForm");
const rankingsDisplay = document.getElementById("rankingsDisplay");

const rankings = {};

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const teamA = document.getElementById("teamA").value.trim();
  const teamB = document.getElementById("teamB").value.trim();
  const teamAPoints = parseInt(document.getElementById("teamAPoints").value);
  const teamBPoints = parseInt(document.getElementById("teamBPoints").value);
  const winnerSelection = document.getElementById("winner").value;

  if (!teamA || !teamB || isNaN(teamAPoints) || isNaN(teamBPoints) || !winnerSelection) {
    alert("Please fill out all fields correctly.");
    return;
  }

  // Initialize teams if not already present
  [teamA, teamB].forEach(team => {
    if (!rankings[team]) {
      rankings[team] = { wins: 0, losses: 0, points: 0 };
    }
  });

  const winner = winnerSelection === "teamA" ? teamA : teamB;
  const loser = winner === teamA ? teamB : teamA;

  rankings[winner].wins += 1;
  rankings[loser].losses += 1;

  rankings[teamA].points += teamAPoints;
  rankings[teamB].points += teamBPoints;

  updateRankings();
  form.reset();
});

function updateRankings() {
  rankingsDisplay.innerHTML = "";

  const sortedTeams = Object.keys(rankings).sort((a, b) => rankings[b].points - rankings[a].points);

  sortedTeams.forEach(team => {
    const { wins, losses, points } = rankings[team];
    const div = document.createElement("div");
    div.textContent = `${team} — Wins: ${wins}, Losses: ${losses}, Total Points: ${points}`;
    rankingsDisplay.appendChild(div);
  });
}