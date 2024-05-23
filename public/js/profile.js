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

//submit pictures

// document.getElementById("profile").addEventListener("submit", async (e) => {
//   e.preventDefault(); // Prevent the default form submission

// });

//get profile pics
document.addEventListener("DOMContentLoaded", function () {
  getProfilePics();
});

async function getProfilePics() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('user');
  console.log("fuck" + urlParams)
  console.log("fuck" + username)


  try {
    const response = await fetch(`/account/getProfilePic/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    console.log("Data:", data);
    // Handle the data as needed
  } catch (error) {
    console.error("Error getting profile pics:", error);
  }
}

getProfilePics()