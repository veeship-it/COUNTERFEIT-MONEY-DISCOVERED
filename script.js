// =====================================
// 1. SELECT HTML ELEMENTS
// =====================================

const currencyImage = document.getElementById("currency-image");
const uploadArea = document.getElementById("upload-area");

const previewContainer = document.getElementById("preview-container");
const imagePreview = document.getElementById("image-preview");
const fileName = document.getElementById("file-name");

const removeImageButton = document.getElementById("remove-image");
const analyseButton = document.getElementById("analyse-button");

const cameraButton = document.getElementById("camera-button");
const cameraContainer = document.getElementById("camera-container");
const cameraVideo = document.getElementById("camera-video");

const captureButton = document.getElementById("capture-button");
const closeCameraButton = document.getElementById("close-camera");

const statusMessage = document.getElementById("status-message");


// =====================================
// 2. VARIABLES
// =====================================

let selectedImage = null;
let cameraStream = null;
let previewURL = null;


// =====================================
// 3. DISPLAY STATUS MESSAGES
// =====================================

function showMessage(message) {
    statusMessage.textContent = message;
}


// =====================================
// 4. DISPLAY IMAGE PREVIEW
// =====================================

function displayImage(file) {

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        showMessage("Please select a valid image file.");
        return;
    }

    const maxFileSize = 10 * 1024 * 1024;

    if (file.size > maxFileSize) {
        showMessage("Image is too large. Please select an image under 10 MB.");
        return;
    }

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
    }

    selectedImage = file;
    previewURL = URL.createObjectURL(file);

    imagePreview.src = previewURL;
    fileName.textContent = file.name;

    uploadArea.hidden = true;
    previewContainer.hidden = false;

    analyseButton.disabled = false;

    showMessage("Image selected successfully. AI analysis is not yet connected.");
}


// =====================================
// 5. HANDLE IMAGE UPLOAD
// =====================================

currencyImage.addEventListener("change", function (event) {

    const file = event.target.files[0];

    displayImage(file);

});


// =====================================
// 6. REMOVE SELECTED IMAGE
// =====================================

removeImageButton.addEventListener("click", function () {

    selectedImage = null;

    currencyImage.value = "";

    imagePreview.removeAttribute("src");
    fileName.textContent = "";

    previewContainer.hidden = true;
    uploadArea.hidden = false;

    analyseButton.disabled = true;

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }

    showMessage("Image removed.");

});


// =====================================
// 7. DRAG AND DROP IMAGE UPLOAD
// =====================================

uploadArea.addEventListener("dragover", function (event) {

    event.preventDefault();

    uploadArea.classList.add("drag-over");

});


uploadArea.addEventListener("dragleave", function () {

    uploadArea.classList.remove("drag-over");

});


uploadArea.addEventListener("drop", function (event) {

    event.preventDefault();

    uploadArea.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    displayImage(file);

});


// =====================================
// 8. OPEN CAMERA
// =====================================

cameraButton.addEventListener("click", async function () {

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showMessage("Camera access is unavailable. Open the website using HTTPS or localhost.");
        return;
    }

    try {

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: "environment"
                }
            },
            audio: false
        });

        cameraVideo.srcObject = cameraStream;

        cameraContainer.hidden = false;

        showMessage("Camera opened. Position the banknote clearly and capture the image.");

    } catch (error) {

        console.error("Camera error:", error);

        if (error.name === "NotAllowedError") {
            showMessage("Camera permission was denied. Allow camera access in your browser settings.");
        } else if (error.name === "NotFoundError") {
            showMessage("No suitable camera was found on this device.");
        } else {
            showMessage("Unable to open the camera. Check your browser permissions and try again.");
        }

    }

});


// =====================================
// 9. CAPTURE IMAGE FROM CAMERA
// =====================================

captureButton.addEventListener("click", function () {

    if (!cameraStream || !cameraVideo.videoWidth) {
        showMessage("The camera is not ready. Please wait a moment.");
        return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
        cameraVideo,
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvas.toBlob(function (blob) {

        if (!blob) {
            showMessage("Unable to capture the image. Please try again.");
            return;
        }

        const capturedImage = new File(
            [blob],
            `banknote-${Date.now()}.jpg`,
            {
                type: "image/jpeg"
            }
        );

        displayImage(capturedImage);

        closeCamera();

    }, "image/jpeg", 0.92);

});


// =====================================
// 10. CLOSE CAMERA
// =====================================

function closeCamera() {

    if (cameraStream) {

        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });

        cameraStream = null;
    }

    cameraVideo.srcObject = null;

    cameraContainer.hidden = true;

}


closeCameraButton.addEventListener("click", function () {

    closeCamera();

    showMessage("Camera closed.");

});


 // =====================================
 // 11. ANALYSE BUTTON — CONNECT TO FLASK
 // =====================================

analyseButton.addEventListener("click", async function () {

    if (!selectedImage) {
        showMessage("Please upload or capture a banknote image first.");
        return;
    }

    // Prevent repeated clicks while analysing
    analyseButton.disabled = true;
    showMessage("Uploading image to CurrencyGuard... Please wait.");

    try {

        // Prepare the image for the Flask backend
        const formData = new FormData();
        formData.append("image", selectedImage);

        // Send the image to Flask
        const response = await fetch("http://127.0.0.1:5000/api/analyze", {
            method: "POST",
            body: formData
        });

        // Read Flask's response
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to process the image.");
        }

        // The backend validates images but has no AI model yet
        if (result.status === "model_not_configured") {
            showMessage(
                "Image received successfully! However, counterfeit detection is not yet available because the AI model has not been connected."
            );
            return;
        }

        showMessage(result.message || "The server responded successfully.");

    } catch (error) {

        console.error("CurrencyGuard error:", error);

        showMessage(
            "Could not connect to CurrencyGuard's backend. Make sure Flask is running at http://127.0.0.1:5000."
        );

    } finally {

        // Allow another attempt if an image is still selected
        analyseButton.disabled = !selectedImage;

    }

});


// =====================================
// 12. CLEAN UP CAMERA WHEN LEAVING
// =====================================

window.addEventListener("pagehide", function () {

    closeCamera();

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }

});