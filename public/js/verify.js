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
  const picture = canvas.toDataURL("image/png").split(";base64,")[1];

  // Do something with the picture (e.g., display, save, or upload)
  console.log(picture);

  // Disable the "Take Photo" button
  takePhotoBtn.disabled = true;
  takePhotoBtn.innerText = "Photo Captured";

  // Display verifying message on the client-side
  const verificationMessage = document.createElement("p");
  verificationMessage.innerText =
    "The picture is verifying. Please wait for a few moments.";
  document.body.appendChild(verificationMessage);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const username = urlParams.get("user");

  const payload = { picture: picture };

  // Upload the picture to the server
  fetch(`/account/verification/${username}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      // Handle the server response
      if (response.ok) {
        console.log("Picture uploaded successfully!");
        // Update the verification message with the response message
        verificationMessage.innerText = "Picture uploaded successfully!";
      } else {
        console.error("Failed to upload picture:", response.statusText);
        // Update the verification message with the error message
        verificationMessage.innerText =
          "Failed to upload picture. Please try again.";
      }
    })
    .catch((error) => {
      console.error("Error uploading picture:", error);
      // Update the verification message with the error message
      verificationMessage.innerText =
        "An error occurred while uploading the picture. Please try again.";
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
