document.getElementById("searchBtn").addEventListener("click", function() {
    alert("Searching for opponent...");
});

document.getElementById("dailyBtn").addEventListener("click", function() {
    alert("Daily Quiz Started!");
});

const raidCards = document.querySelectorAll(".raid-card");

raidCards.forEach(card => {
    card.addEventListener("click", function() {
        alert("You selected " + this.textContent + " mode!");
    });
});