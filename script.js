document.addEventListener("DOMContentLoaded", function () {
  var inputForm = document.querySelector(".chatbot-input-form");
  var sendForm = document.querySelector(".chatbox-send-form");
  var messageWrapper = document.querySelector(".chatbox-messages");
  var messageList = document.querySelector(".chatbot-message-wrapper");
  var chatbotCircle = document.querySelector(".chatbot-circle");
  var chatbotContainer = document.querySelector(".chatbot-container");
  var chatbotClose = document.querySelector(".chatbot-close");
  var circleOpen = document.querySelector(".chatbot-circle-open");
  var circleClose = document.querySelector(".chatbot-circle-close");

  // Hide scrollbar for message list
  function hideMessageScrollbar() {
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
  }
  hideMessageScrollbar();

  // Initialize Functionality
  function init() {
    const lastUser = JSON.parse(sessionStorage.getItem("last_user"));
    if (lastUser) {
      console.log("Last user found in sessionStorage:", lastUser);
      document.getElementById("chatbot-name").value = lastUser.username || "";
      document.getElementById("chatbot-email").value = lastUser.email || "";
      document.getElementById("chatbot-mobile").value = lastUser.mobile || "";
    }
    // Render dummy messages if chat is shown
    renderDummyMessages();
  }
  // call init automatically
  init();

  // Function to render dummy messages dynamically
  function renderDummyMessages() {
    if (!messageList) return;
    messageList.innerHTML = "";
    const messages = [
      { type: "bot", text: "HI! How can I assist you?" },
      { type: "user", text: "Hello! I need help with my account." },
      { type: "bot", text: "Sure, what issue are you facing?" },
      { type: "user", text: "I can't log in." },
      { type: "bot", text: "Have you tried resetting your password?" },
      { type: "user", text: "Yes, but it didn't work." },
    ];
    messages.forEach((msg) => {
      if (msg.type === "bot") {
        messageList.innerHTML += `
          <div class=\"message-container\">
            <div class=\"message-avatar\">
              <img src=\"images/logo-white.svg\" alt=\"DITS\">
            </div>
            <div class=\"message-content\">
              ${msg.text}
            </div>
          </div>
        `;
      } else {
        messageList.innerHTML += `
          <div class=\"message-container user-message\">
            <div class=\"message-content\">
              ${msg.text}
            </div>
          </div>
        `;
      }
    });
    // Scroll to bottom after rendering
    messageList.scrollTop = messageList.scrollHeight;
  }

  // Method for chat box open
  chatbotCircle.addEventListener("click", function () {
    chatbotContainer.classList.toggle("show");
    var isShown = chatbotContainer.classList.contains("show");
    if (isShown) {
      circleOpen.classList.add("d-none");
      circleClose.classList.remove("d-none");
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

  // Method for user input
  inputForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    //Api payload
    const payload = {
      username: document.getElementById("chatbot-name").value,
      email: document.getElementById("chatbot-email").value,
      mobile: document.getElementById("chatbot-mobile").value,
      browser: navigator.userAgent, // Browser info
    };

    try {
      // Get public IP address (IPv4)
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      payload.ip = data.ip;
    } catch (e) {
      payload.ip = "Unavailable"; // fallback if API fails
    }

    // Call API
    // handleSubmit(payload);
    inputForm.classList.add("d-none");
    messageWrapper.classList.remove("d-none");
    renderDummyMessages();
  });

  // send message
  sendForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get message input
    var messageInput = document.getElementById("chatbot-message").value;
    var message = messageInput.trim();
    if (message) {
      // Add user message to chat
      addMessage("user", message);
      document.getElementById("chatbot-message").value = "";
    }
  });

  addMessage = function (type, text) {
    var messageList = document.querySelector(".chatbot-message-wrapper");
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
  };

  // Call API
  function handleSubmit(payload) {
    console.log("API Payload:", payload);

    fetch("https://c93c7b32cfc9.ngrok-free.app/user/register", {
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
    const { sessionId } = data;

    // Save sessionId in sessionStorage
    if (sessionId) {
      sessionStorage.setItem("sessionId", sessionId);
      getPreviousChat();

      // if token then move to chat screen
      inputForm.classList.add("d-none");
      messageWrapper.classList.remove("d-none");
    }
  }

  function getPreviousChat() {
    const sessionId = sessionStorage.getItem("sessionId");
    if (sessionId) {
      fetch(`https://dummyapi.io/data/api/chatbot/${sessionId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            displayPreviousChat(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching previous chat:", error);
        });
    }
  }
});
