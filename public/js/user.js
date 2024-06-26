document.addEventListener("DOMContentLoaded", function () {
  getProfilePics();
  checkVerifiedUsers()
});

document.getElementById("verify-btn").onclick = function () {
  location.href = `/verify.html?user=${new URLSearchParams(
    window.location.search
  ).get("user")}`;
};

async function getProfilePics() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("user");
  console.log("this is username", username);
  document.getElementById("edit").onclick = function () {
    location.href = `/profile.html?user=${username}`;
  };
  try {
    const response = await fetch(`/account/getProfilePic/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    console.log("Data:", data);

    if (data) {
      // Get references to the profile picture divs
      const p1 = document.getElementById('p1');
      const p2 = document.getElementById('p2');
      const p3 = document.getElementById('p3');
      const p4 = document.getElementById('p4');
      const p5 = document.getElementById('p5');
      const p6 = document.getElementById('p6');

      // Set the background images for each div
      p1.style.backgroundImage = `url(${data.p1})`;
      p1.style.backgroundSize = 'cover';
      p1.style.backgroundRepeat = 'no-repeat';
      p1.style.backgroundPosition = 'center';

      p2.style.backgroundImage = `url(${data.p2})`;
      p2.style.backgroundSize = 'cover';
      p2.style.backgroundRepeat = 'no-repeat';
      p2.style.backgroundPosition = 'center';

      p3.style.backgroundImage = `url(${data.p3})`;
      p3.style.backgroundSize = 'cover';
      p3.style.backgroundRepeat = 'no-repeat';
      p3.style.backgroundPosition = 'center';

      p4.style.backgroundImage = `url(${data.p4})`;
      p4.style.backgroundSize = 'cover';
      p4.style.backgroundRepeat = 'no-repeat';
      p4.style.backgroundPosition = 'center';

      p5.style.backgroundImage = `url(${data.p5})`;
      p5.style.backgroundSize = 'cover';
      p5.style.backgroundRepeat = 'no-repeat';
      p5.style.backgroundPosition = 'center';

      p6.style.backgroundImage = `url(${data.p6})`;
      p6.style.backgroundSize = 'cover';
      p6.style.backgroundRepeat = 'no-repeat';
      p6.style.backgroundPosition = 'center';
    }
  } catch (error) {
    console.error("Error getting profile pics:", error);
  }
}

//submit checkVerifiedUsers


async function checkVerifiedUsers() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("user");
  console.log("this is username", username);

  const chatButton = document.getElementById("chatButton");

  try {
    const response = await fetch(`/account/chatFuntion/${username}`);

    if (response.ok) {
      const data = await response.json();
      console.log("verifiedData:", data);

      if (data.user.verificationStatus) {
        // The user is verified
        console.log(data.message); // "You are a real user!"
        chatButton.disabled = false;
        chatButton.onclick = function () {
          location.href = `/chatbox.html?user=${username}`;
        };
      } else {
        // The user is not verified
        console.log(data.message); // "You are not a real user!"
        chatButton.disabled = true;
        chatButton.onclick = null; // Remove the onclick event handler
      }
    } else {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (error) {
    console.error("Error checking user verification:", error);
    chatButton.disabled = true;
    chatButton.onclick = null; // Remove the onclick event handler
  }
}




