async function sendMessage(msg = null) {
  const inputField = document.getElementById("user-input");
  const message = msg || inputField.value.trim();
  if (!message) return;

  appendMessage("user", message);
  inputField.value = "";

  // Show typing indicator
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("chat-message-wrapper", "bot");
  typingDiv.id = "typing";

  const typingMsg = document.createElement("div");
  typingMsg.classList.add("chat-message", "bot");
  typingMsg.innerText = "Ana is typing...";

  const avatar = document.createElement("img");
  avatar.src = "/static/img/ana-avatar.png";
  avatar.alt = "Ana Avatar";
  avatar.classList.add("bot-avatar");

  typingDiv.appendChild(avatar);
  typingDiv.appendChild(typingMsg);
  document.getElementById("chat-box").appendChild(typingDiv);

  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  document.getElementById("typing").remove();

  const data = await response.json();
  appendMessage("bot", data.reply);
}

function appendMessage(sender, message) {
  const chatBox = document.getElementById("chat-box");

  const wrapper = document.createElement("div");
  wrapper.classList.add("chat-message-wrapper", sender);

  // Add avatar for bot
  if (sender === "bot") {
    const avatar = document.createElement("img");
    avatar.src = "/static/img/ana-avatar.png";
    avatar.alt = "Ana Avatar";
    avatar.classList.add("bot-avatar");
    wrapper.appendChild(avatar);
  }

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("chat-message", sender);

  if (sender === "bot" && message.includes("[Button:")) {
    const lines = message.split("\n");
    lines.forEach(line => {
      const match = line.match(/\[Button:\s*(.*?)\]/i);
      if (match) {
        const label = match[1].split("(")[0].trim();
        const button = document.createElement("button");
        button.innerText = label;
        button.onclick = () => sendMessage(label);
        button.className = "quick-reply-button";
        messageDiv.appendChild(button);
      } else {
        const p = document.createElement("p");
        p.innerHTML = renderMarkdown(line);
        messageDiv.appendChild(p);
      }
    });
  } else {
    messageDiv.innerHTML = renderMarkdown(message);
  }

  wrapper.appendChild(messageDiv);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Simple Markdown Parser: Supports links [text](url)
function renderMarkdown(text) {
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return text;
}
