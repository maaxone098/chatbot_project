const menuButton = document.getElementById('menuButton');
const history = document.getElementById('history');
const cancel = document.getElementById('cancel');

menuButton.addEventListener('click', () => {
    if (history.style.display === 'none' || history.style.display === '') {
        history.style.display = 'block';
        cancel.style.display = 'block';
        menuButton.style.display = 'none';
    } else {
        history.style.display = 'none';     
    }
});

cancel.addEventListener('click', () => {
    if (history.style.display === 'block') {
        history.style.display = 'none';
        cancel.style.display = 'none';
        menuButton.style.display = 'block';
    } else {
        history.style.display = 'none';
    }
});

const speechSynthesis = window.speechSynthesis;

function speakText(responseText) {
    const utterance = new SpeechSynthesisUtterance(responseText);
    speechSynthesis.speak(utterance);
}

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";

document.getElementById("voice-input-btn").addEventListener("click", () => {
    recognition.start();
});

recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    document.getElementById("text-input").value = spokenText;
};

// Function to handle sending messages
async function sendMessage() {
    const messageInput = document.getElementById("text-input");
    const message = messageInput.value.trim();

    if (message === "") {
        alert("Please enter a message.");
        return;
    }

    messageInput.value = "";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.response;

        const messagesDiv = document.getElementById("messages");
        messagesDiv.innerHTML += `<p class="me"><b>You:</b> ${message}</p>`;
        messagesDiv.innerHTML += `<p class="bot"><b>Arcane:</b> ${responseText}</p>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        speakText(responseText);

        const historyList = document.getElementById("history-list");
        const historyItem = document.createElement("li");
        historyItem.textContent = message;
        historyList.appendChild(historyItem);
    } catch (error) {
        console.error("Error:", error);
        alert("There was an error processing your request.");
    }
}

// Event listener for the "Send" button
document.getElementById("send-btn").addEventListener("click", sendMessage);

// Event listener for pressing Enter in the input field
document.getElementById("text-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission
        sendMessage(); // Call the sendMessage function
    }
});
