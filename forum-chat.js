const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const container = document.getElementById("chatContainer");

function sendMessage() {

    const text = input.value.trim();
    if (text === "") return;

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", "me");

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    const time = new Date();
    const formattedTime =
        time.getHours().toString().padStart(2,'0') + ":" +
        time.getMinutes().toString().padStart(2,'0');

    bubble.innerHTML = text + `<span class="time">${formattedTime}</span>`;

    messageDiv.appendChild(bubble);
    container.appendChild(messageDiv);

    input.value = "";
    container.scrollTop = container.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        sendMessage();
    }
});