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
  console.log("this is username", username)
  try {
    const response = await fetch(`/account/getProfilePic/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    console.log("Data:", data);

    if (data.length > 0) {
      console.log("this is data length", data.length)
      // User profile pictures found, display them instead of uploadMultiple pictures
      const profilePictures = document.querySelectorAll(".profile-picture");
      data.forEach((pic, index) => {
        console.log("this is pic", pic.p1)
        console.log("this is Index", index)
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

  for (let i = 1; i <= 6; i++) {
    const fileInput = form[`p${i}`];
    if (fileInput.files[0]) {
      formData.append(`p${i}`, fileInput.files[0]);
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const user = urlParams.get("user");

  try {
    const res = await fetch(`/account/editProfilePic/${user}`, {
      method: 'put',
      body: formData,
    });

    if (res.ok) {
      getProfilePics();
      
    } else {
      const errorData = await res.json();
      console.error('Error updating profile pictures:', errorData.message);
    }
  } catch (error) {
    console.error('Error:', error);
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

const webcam = document.getElementById("webcam");
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const takePhotoBtn = document.getElementById("take-photo-btn");
const verificationMessage = document.getElementById("verification-message");
let isWebcamOn = false;

if (navigator.mediaDevices.getUserMedia) {
  takePhotoBtn.addEventListener("click", function () {
    if (!isWebcamOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          webcam.srcObject = stream;
          isWebcamOn = true;
          takePhotoBtn.innerText = "Capture Photo";
        })
        .catch((error) => {
          console.error("Error accessing webcam:", error);
        });
    } else {
      takePicture();
      closeWebcam();
    }
  });
} else {
  console.error("getUserMedia not supported in this browser.");
}

function takePicture() {
  // Set canvas size to match video dimensions
  canvas.width = webcam.videoWidth;
  canvas.height = webcam.videoHeight;

  // Draw the current video frame onto the canvas
  context.drawImage(webcam, 0, 0, canvas.width, canvas.height);

  // Convert the canvas image to PNG format
  const picture = canvas.toDataURL("image/png");

  // Do something with the picture (e.g., display, save, or upload)
  console.log(picture);

  // Disable the "Take Photo" button
  takePhotoBtn.disabled = true;
  takePhotoBtn.innerText = "Photo Captured";

  // Display verifying message on the client-side
  const verificationMessage = document.createElement("p");
  verificationMessage.innerText = "The picture is verifying. Please wait for a few moments.";
  document.body.appendChild(verificationMessage);

  // Upload the picture to the server
  fetch("https://example.com/upload", {
    method: "POST",
    body: picture
  })
    .then(response => {
      // Handle the server response
      if (response.ok) {
        console.log("Picture uploaded successfully!");
        // Update the verification message with the response message
        verificationMessage.innerText = "Picture uploaded successfully!";
      } else {
        console.error("Failed to upload picture:", response.statusText);
        // Update the verification message with the error message
        verificationMessage.innerText = "Failed to upload picture. Please try again.";
      }
    })
    .catch(error => {
      console.error("Error uploading picture:", error);
      // Update the verification message with the error message
      verificationMessage.innerText = "An error occurred while uploading the picture. Please try again.";
    });
}

function closeWebcam() {
  // Stop the webcam stream
  const stream = webcam.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });

  // Clear the video source and update button text
  webcam.srcObject = null;
  isWebcamOn = false;
  takePhotoBtn.innerText = "Take Photo";
}

