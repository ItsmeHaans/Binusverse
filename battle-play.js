const buttons = document.querySelectorAll(".answers button");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        buttons.forEach(btn => btn.style.background = "#00c3ff");
        button.style.background = "#ffd166";
    });
});