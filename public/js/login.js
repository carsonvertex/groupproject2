document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("LoginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    let username = document.querySelector("#username").value;
    let password = document.querySelector("#password").value;

    // Client-side validation
    if (!username || !password) {
      // Display an error message to the user
      console.error("Username and password are required.");
      return;
    }

    try {
      let res = await fetch("/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (res.ok) {
        let data = await res.json();
        window.location.href = `/profile.html?${username}`;
       
      } else {
        let errorMessage =
          "Login failed. Please check your username and password.";

        // Try to get more specific error message from server
        let errorResponse = await res.json();
        if (errorResponse && errorResponse.message) {
          errorMessage = errorResponse.message;
        }

        // Display an error message to the user
        console.error(errorMessage);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  });
});
