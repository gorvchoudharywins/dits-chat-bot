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
        if (error) {
          // Get refreshToken from cookies
          const refreshToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("refreshToken="))
            ?.split("=")[1];

          if (refreshToken) {
            console.log("Refresh token found:", refreshToken);
            handleRefreshToken(refreshToken);
          } else {
            console.log("No refresh token found in cookies.");
          }
        } else {
          console.error("API Error:", error);
        }
      });

    // TODO: Implement real API call
    const dummyResponse = {
      accessToken: "dummyAccessToken",
      refreshToken: "dummyRefreshToken",
    };
    handleResponse(dummyResponse);
    sessionStorage.setItem("last_user", JSON.stringify(payload));
  }

  function handleResponse(data) {
    console.log("API Response:", data);
    const { accessToken, refreshToken } = data;
    // Save accessToken in sessionStorage
    if (accessToken) {
      sessionStorage.setItem("accessToken", accessToken);

      // if token then move to chat screen
      inputForm.classList.add("d-none");
      messageWrapper.classList.remove("d-none");
    }

    // Save refreshToken in cookies
    if (refreshToken) {
      document.cookie = `refreshToken=${refreshToken}; path=/;`;
    }
  }

  function handleRefreshToken(refreshToken) {
    console.log("Refreshing token:", refreshToken);
    // Add your token refresh logic here
    fetch("https://dummyapi.io/data/api/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          handleResponse(data);
        }
      })
      .catch((error) => {
        console.error("Token refresh error:", error);
      });
  }
});
