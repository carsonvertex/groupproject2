// upload pictures preview
function uploadMultiple() {
  const fileUploaderInputs = document.querySelectorAll(".file-uploader");
  const profilePictures = document.querySelectorAll(".profile-picture");

  for (let i = 0; i < fileUploaderInputs.length; i++) {
    const image = fileUploaderInputs[i].files[0];
    // check if the file selected is not an image file
    if (!image || !image.type.includes("image")) {
      continue;
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(image);

    fileReader.onload = (fileReaderEvent) => {
      handleImageUpload(fileReaderEvent.target.result, profilePictures[i]);
    };
  }
}

function handleImageUpload(imageData, profilePicture) {
  profilePicture.style.backgroundImage = `url(${imageData})`;
}

document.addEventListener("DOMContentLoaded", function () {
  getProfilePics();
});

async function getProfilePics() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("user");
  console.log("this is username", username);
  try {
    const response = await fetch(`/account/getProfilePic/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    console.log("Data:", data);

    if (data.length > 0) {
      console.log("this is data length", data.length);
      // User profile pictures found, display them instead of uploadMultiple pictures
      const profilePictures = document.querySelectorAll(".profile-picture");
      data.forEach((pic, index) => {
        console.log("this is pic", pic.p1);
        console.log("this is Index", index);
        if (profilePictures[index]) {
          profilePictures[index].style.backgroundImage = `url(${pic.p1})`;
        }
      });
    }
  } catch (error) {
    console.error("Error getting profile pics:", error);
  }
}

getProfilePics();

//submit pictures

document.getElementById("profile").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default form submission

  const form = event.target;
  const formData = new FormData();
  let hasFiles = false;

  for (let i = 1; i <= 6; i++) {
    const fileInput = form[`p${i}`];
    if (fileInput.files[0]) {
      formData.append(`p${i}`, fileInput.files[0]);
      hasFiles = true;
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const user = urlParams.get("user");

  if (!hasFiles) {
    // Redirect to Facebook.com if no files are selected
    location.href = `/user.html?user=${user}`;
    return;
  }

  try {
    const res = await fetch(`/account/editProfilePic/${user}`, {
      method: "put",
      body: formData,
    });

    if (res.ok) {
      getProfilePics();
      location.href = `/user.html?user=${user}`;
    } else {
      const errorData = await res.json();
      console.error("Error updating profile pictures:", errorData.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

//get profile pics
function handleImageUpload(imageData, profilePicture) {
  profilePicture.style.backgroundImage = `url(${imageData})`;
}

document.addEventListener("DOMContentLoaded", getProfilePics);

async function getProfilePics() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("user");

  try {
    const response = await fetch(`/account/getProfilePic/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();

    const profilePictureIds = ["p1", "p2", "p3", "p4", "p5", "p6"];

    profilePictureIds.forEach((id) => {
      const profilePicture = document.querySelector(`#${id}`);

      if (data[id]) {
        console.log("Profile picture found");
        profilePicture.style.backgroundImage = `url(${data[id]})`;
      } else {
        console.log("Profile picture not found");
      }
    });

    uploadMultiple();
  } catch (error) {
    console.error("Error getting profile picture:", error);
    uploadMultiple();
  }
}

//webcam

// go to verify
// const queryString = window.location.search;
// const usernameFromUrl = new URLSearchParams(queryString);
// console.log("dfgiuhgfcg", usernameFromUrl);

