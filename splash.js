document.addEventListener("DOMContentLoaded", () => {
    const splashContent = document.getElementById('splash-content');
    const startBtn = document.getElementById('start-btn');

    setTimeout(() => {
        splashContent.classList.remove('hidden');
    }, 500);

    startBtn.addEventListener('click', () => {
        document.body.style.transition = "opacity 0.8s steps(8)";
        document.body.style.opacity = "0";
        
        setTimeout(() => {
            window.location.href = "home.html";
        }, 850);
    });
});