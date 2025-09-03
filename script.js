const teamAList = [
  "Manoj-Vinoth", "Suresh-Ramesh", "Vidya-Rajesh",
  "Rahul-Sabari", "Balaji-Venkat", "Senthilvel-Vijay"
];

const teamBList = [
  "Ashok-Uday", "Hari-Sai", "Mustafa-Shanu",
  "Murali-Hemanth", "Raj-Harsha", "Althaf-Ravi"
];

const rankings = {};
const playedMatches = new Set();

document.getElementById("resultForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const teamA = document.getElementById("teamA").value;
  const teamB = document.getElementById("teamB").value;
  const teamAPoints = parseInt(document.getElementById("teamAPoints").value);
  const teamBPoints = parseInt(document.getElementById("teamBPoints").value);
  const winnerSelection = document.getElementById("winner").value;

  if (!teamAList.includes(teamA) || !teamBList.includes(teamB)) {
    alert("Invalid matchup. Team A must be from Team A list and Team B from Team B list.");
    return;
  }

  const matchKey = `${teamA} vs ${teamB}`;
  if (playedMatches.has(matchKey)) {
    alert("This match has already been played.");
    return;
  }

  if (isNaN(teamAPoints) || isNaN(teamBPoints) || !winnerSelection) {
    alert("Please fill out all fields correctly.");
    return;
  }

  // Initialize teams
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

  playedMatches.add(matchKey);
  updateRankings();
  updateMatrix();
  e.target.reset();

  if (playedMatches.size === teamAList.length * teamBList.length) {
    alert("✅ All matches completed!");
  }
});

function updateRankings() {
  const display = document.getElementById("rankingsDisplay");
  display.innerHTML = "";

  const sorted = Object.keys(rankings).sort((a, b) => rankings[b].points - rankings[a].points);

  sorted.forEach(team => {
    const { wins, losses, points } = rankings[team];
    const div = document.createElement("div");
    div.textContent = `${team} — Wins: ${wins}, Losses: ${losses}, Points: ${points}`;
    display.appendChild(div);
  });
}

function updateMatrix() {
  const table = document.getElementById("matchMatrix");
  table.innerHTML = "";

  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `<th>Team A \\ Team B</th>` + teamBList.map(b => `<th>${b}</th>`).join("");
  table.appendChild(headerRow);

  teamAList.forEach(a => {
    const row = document.createElement("tr");
    row.innerHTML = `<td><strong>${a}</strong></td>` + teamBList.map(b => {
      const key = `${a} vs ${b}`;
      return `<td style="text-align:center">${playedMatches.has(key) ? "✅" : "❌"}</td>`;
    }).join("");
    table.appendChild(row);
  });
}

// Initialize matrix on load
updateMatrix();