async function login(username, password) {
  try {
    const response = await fetch("/account/getusername", {
      // Add any necessary headers or request parameters for authentication
    });

    if (response.ok) {
      const data = await response.json();
      const loggedInUsername = data.data.username;
      // Customize the content of the page based on the logged-in username
      const greetingDiv = document.querySelector(".accountButton");
      greetingDiv.innerHTML = `<button type="button" onclick="logout();"class="btn btn-outline-primary me-2 logoutButton accountButton" >Logout</button><div>Hi, ${loggedInUsername}</div>`;
      // Add event listener to the new logout button
      const logoutButton = document.querySelector(".logoutButton");
      logoutButton.addEventListener("click", logout);
      // Remove the login button
      const loginButton = document.querySelector(".loginButton");
      if (loginButton) {
        loginButton.remove();
      }
    } else {
      // Handle login error
      console.log("Login failed");
    }
  } catch (error) {
    console.error("Error logging in", error);
  }
}

async function logout() {
  try {
    const response = await fetch("/account/logout", {
      method: "POST", // Change request method to POST
      // Optionally, you can include headers or a request body if required
    });
    if (!response.ok) {
      throw new Error("Logout request failed with status " + response.status);
    }
    // Handle successful logout, such as redirecting to the login page
    console.log("Logout successful");
    // Reset the content of the greetingDiv
    const greetingDiv = document.querySelector(".usernameConatiner");
    if (greetingDiv) {
      greetingDiv.innerHTML = "";
    } else {
      console.error("Greeting div not found");
    }
    // Add the login button back
    const accountButton = document.querySelector(".accountButton");
    if (accountButton) {
      accountButton.innerHTML = `<button type="button" onclick="window.location.href = '/login.html'" class="btn btn-outline-primary me-2 loginButton accountButton"> Login</button>`;
    } else {
      console.error("Account button not found");
    }
    window.location.href = "/login.html";
  } catch (error) {
    // Handle any errors that occur during logout
    console.error("Error logging out", error);
    // You can display an error message to the user or take other appropriate actions
    window.alert(
      "An error occurred while logging out. Please try again later."
    );
  }
}

// Example usage
const username = 'exampleUser';
const password = 'examplePassword';
login(username, password);



// back to last page button
function goBack() {
  window.history.back();
}
