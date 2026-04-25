window.onload = () => {
    const panel = document.querySelector(".result-panel");
    panel.style.transform = "scale(0.8)";
    panel.style.transition = "0.4s ease";
    
    setTimeout(() => {
        panel.style.transform = "scale(1)";
    }, 100);
};