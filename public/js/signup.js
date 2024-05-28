document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission
  
    const form = e.target;
    const email = form.elements.email.value;
    const username = form.elements.username.value;
    const password = form.elements.password.value;
  
    // Send the form data to the server-side
    try {
      const response = await fetch("/account/signUp", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        // Registration successful
        const data = await response.json();
        console.log("Registration successful:", data);
        window.location.href = `/user.html?user=${username}`;
      } else {
        // Registration failed
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        // Display an error message or handle the error appropriately
      }
    } catch (error) {
      console.error("An error occurred during registration:", error);
      // Display an error message or handle the error appropriately
    }
  });