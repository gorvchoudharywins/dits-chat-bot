document.addEventListener("DOMContentLoaded", function () {
  var inputForm = document.querySelector(".chatbot-input-form");
  var sendForm = document.querySelector(".chatbox-send-form");
  var messageWrapper = document.querySelector(".chatbox-messages");
  var messageList = document.querySelector(".chatbot-message-wrapper");
  var chatbotCircle = document.querySelector(".chatbot-circle");
  var chatbotContainer = document.querySelector(".chatbot-container");
  var chatbotClose = document.getElementById("chatbot-close");
  var circleOpen = document.querySelector(".chatbot-circle-open");
  var circleClose = document.querySelector(".chatbot-circle-close");
  const chatWrapper = document.querySelector(".chatbot-body-wrapper");
  const addNewChat = document.getElementById("new-chatbox");
  // Fullscreen toggle
  const fullScreenBtn = document.getElementById("fullscreen-toggle");
  const enterIcon = document.getElementById("fullscreen-icon");
  const exitIcon = document.getElementById("exitfullscreen-icon");

  fullScreenBtn.addEventListener("click", () => {
    const entering = fullScreenBtn.getAttribute("aria-pressed") !== "true";
    fullScreenBtn.setAttribute("aria-pressed", entering ? "true" : "false");
    fullScreenBtn.setAttribute(
      "aria-label",
      entering ? "Exit full screen" : "Enter full screen"
    );
    enterIcon.hidden = entering;
    exitIcon.hidden = !entering;

    if (entering) {
      chatbotContainer.style.width = `200vh`;
      chatWrapper.style.setProperty("height", "73vh", "important");

      enterIcon.style.display = "none";
      exitIcon.style.display = "inline";
    } else {
      chatbotContainer.style.width = "";
      chatWrapper.style.setProperty("height", "", "important");

      enterIcon.style.display = "inline";
      exitIcon.style.display = "none";
    }
    // Always scroll to bottom of messages
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  });
  /////////////

  // Hide scrollbar for message list
  (function hideMessageScrollbar() {
    var style = document.createElement("style");
    style.innerHTML = `
      .chatbot-message-wrapper {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
      }
      .chatbot-message-wrapper::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
    `;
    document.head.appendChild(style);
  })();

  // Initialize Functionality
  (function init() {
    fullScreenBtn.style.display = "none";
    addNewChat.style.display = "none";

    const lastUser = JSON.parse(sessionStorage.getItem("last_user"));
    if (lastUser) {
      console.log("Last user found in sessionStorage:", lastUser);
      document.getElementById("chatbot-name").value = lastUser.username || "";
      document.getElementById("chatbot-email").value = lastUser.email || "";
      document.getElementById("chatbot-mobile").value = lastUser.mobile || "";
    }

    // If session exists, show chat and load history
    const sessionId = sessionStorage.getItem("sessionId");
    if (sessionId) {
      // show chat container
      inputForm.classList.add("d-none");
      messageWrapper.classList.remove("d-none");
      // show full-screen/new chat button
      fullScreenBtn.style.display = "inline";
      addNewChat.style.display = "inline";

      getPreviousChat();
    }
  })();

  addNewChat.addEventListener("click", function () {
    // Logic to add a new chat box
    inputForm.classList.remove("d-none");
    messageWrapper.classList.add("d-none");

    fullScreenBtn.style.display = "none";
    addNewChat.style.display = "none";
    sessionStorage.removeItem("sessionId");

    chatbotContainer.style.width = "";
    chatWrapper.style.setProperty("height", "", "important");

    const lastUser = JSON.parse(sessionStorage.getItem("last_user"));
    if (lastUser) {
      console.log("Last user found in sessionStorage:", lastUser);
      document.getElementById("chatbot-name").value = lastUser.username || "";
      document.getElementById("chatbot-email").value = lastUser.email || "";
      document.getElementById("chatbot-mobile").value = lastUser.mobile || "";
    }
  });

  // Method for chat box open
  chatbotCircle.addEventListener("click", function () {
    chatbotContainer.classList.toggle("show");
    var isShown = chatbotContainer.classList.contains("show");
    if (isShown) {
      circleOpen.classList.add("d-none");
      circleClose.classList.remove("d-none");
      messageList.scrollTop = messageList.scrollHeight;
    } else {
      circleOpen.classList.remove("d-none");
      circleClose.classList.add("d-none");
    }
  });

  // Method for chat box close
  chatbotClose.addEventListener("click", function () {
    chatbotContainer.classList.remove("show");
    circleOpen.classList.remove("d-none");
    circleClose.classList.add("d-none");
  });

  // Method for Submit register form
  inputForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    //Api payload
    const payload = {
      username: document.getElementById("chatbot-name").value,
      email: document.getElementById("chatbot-email").value,
      mobile: document.getElementById("chatbot-mobile").value,
      browser: navigator.userAgent, // Browser info
    };

    // Get ip address
    try {
      // Get public IP address (IPv4)
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      payload.ip = data.ip;
    } catch (e) {
      payload.ip = "Unavailable"; // fallback if API fails
    }

    // Call API
    handleSubmit(payload);
  });

  // Call API
  function handleSubmit(payload) {
    console.log("API Payload:", payload);

    fetch("https://64169343f09e.ngrok-free.app/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          handleResponse(data);
          sessionStorage.setItem("last_user", JSON.stringify(payload));
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  }

  function handleResponse(data) {
    console.log("API Response:", data);
    const { session_id } = data;

    // Save sessionId in sessionStorage
    if (session_id) {
      sessionStorage.setItem("sessionId", session_id);

      // if session id exists then move to chat screen
      inputForm.classList.add("d-none");
      messageWrapper.classList.remove("d-none");

      // show add new chat and full screen button
      fullScreenBtn.style.display = "inline";
      addNewChat.style.display = "inline";

      enterIcon.style.display = "inline";
      exitIcon.style.display = "none";

      // init message
      messageList.innerHTML = "";
      addMessage("bot", "How can I assist you today?");
    }
  }

  function getPreviousChat() {
    const sessionId = sessionStorage.getItem("sessionId");
    if (sessionId) {
      fetch(`https://64169343f09e.ngrok-free.app/chat/${sessionId}/messages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.messages.length > 0) {
            messageList.innerHTML = "";
            data.messages.forEach((msg) => {
              if (msg.role === "bot") {
                addMessage("bot", msg.message);
              } else {
                addMessage("user", msg.message);
              }
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching previous chat:", error);
        });
    }
  }

  // Send message
  sendForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get message input
    var messageInput = document.getElementById("chatbot-message").value;
    var message = messageInput.trim();
    if (message) {
      addMessage("user", message);
      showTypingIndicator();

      const payload = {
        query: message,
        session_id: sessionStorage.getItem("sessionId"),
      };

      fetch("https://64169343f09e.ngrok-free.app/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.answer) {
            removeTypingIndicator();
            addMessage("bot", data.answer);
          }
        })
        .catch((error) => {
          removeTypingIndicator();
          console.error("API Error:", error);
        });
    }
    document.getElementById("chatbot-message").value = "";
  });

  function addMessage(type, text) {
    if (!messageList) return;

    var messageElement = document.createElement("div");
    messageElement.classList.add("message-container");
    if (type === "user") {
      messageElement.classList.add("user-message");
      messageElement.innerHTML = `
        <div class="message-content">
          ${text}
        </div>
      `;
    } else {
      messageElement.innerHTML = `
        <div class="message-avatar">
          <img src="images/logo-white.svg" alt="DITS">
        </div>
        <div class="message-content">
          ${text}
        </div>
      `;
    }
    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
  }

  // Show typing indicator
  function showTypingIndicator() {
    var messageList = document.querySelector(".chatbot-message-wrapper");
    if (!messageList) return;
    // Prevent duplicates
    if (messageList.querySelector(".typing-indicator")) {
      messageList.scrollTop = messageList.scrollHeight;
      return;
    }
    var typingDiv = document.createElement("div");
    typingDiv.className = "message-container typing-indicator";
    typingDiv.innerHTML = `
      <div class="message-avatar">
        <img src="images/logo-white.svg" alt="DITS">
      </div>
      <div class="message-content">
        <span class="dot">.</span>
        <span class="dot">.</span>
        <span class="dot">.</span>
      </div>
    `;
    messageList.appendChild(typingDiv);
    messageList.scrollTop = messageList.scrollHeight;
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    var messageList = document.querySelector(".chatbot-message-wrapper");
    if (!messageList) return;
    var typingDiv = messageList.querySelector(".typing-indicator");
    if (typingDiv) {
      messageList.removeChild(typingDiv);
    }
  }
});
