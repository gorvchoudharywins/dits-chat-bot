document.addEventListener("DOMContentLoaded", function () {
  var inputForm = document.querySelector(".chatbot-input-form");
  var messageWrapper = document.querySelector(".chatbox-messages");
  var chatbotCircle = document.querySelector(".chatbot-circle");
  var chatbotContainer = document.querySelector(".chatbot-container");
  var chatbotClose = document.querySelector(".chatbot-close");
  var circleOpen = document.querySelector(".chatbot-circle-open");
  var circleClose = document.querySelector(".chatbot-circle-close");

  function init() {
    const lastUser = JSON.parse(sessionStorage.getItem("last_user"));
    if (lastUser) {
      console.log("Last user found in sessionStorage:", lastUser);
      document.getElementById("chatbot-name").value = lastUser.name || "";
      document.getElementById("chatbot-email").value = lastUser.email || "";
      document.getElementById("chatbot-mobile").value = lastUser.mobile || "";
    }
  }
  // call init automatically
  init();

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
  inputForm.addEventListener("submit", function (e) {
    e.preventDefault();

    //Api payload
    const payload = {
      name: document.getElementById("chatbot-name").value,
      email: document.getElementById("chatbot-email").value,
      mobile: document.getElementById("chatbot-mobile").value,
    };

    // Call API
    handleSubmit(payload);
  });

  // Call API
  function handleSubmit(payload) {
    console.log("API Payload:", payload);

    fetch("https://dummyapi.io/data/api/chatbot", {
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

    // TODO: Implement real API call
    const dummyResponse = {
      sessionId: "dummySessionId",
    };
    handleResponse(dummyResponse);
    sessionStorage.setItem("last_user", JSON.stringify(payload));
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
