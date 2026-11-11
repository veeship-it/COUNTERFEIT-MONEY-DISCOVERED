from pathlib import Path
import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError
from io import BytesIO

# Create the Flask application
app = Flask(__name__)

# Allow the frontend to communicate with the backend
CORS(app)

# Limit uploaded images to 10 MB
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

MODEL_PATH = Path(__file__).parent / "banknote_model.pkl"

model = joblib.load(MODEL_PATH)

print("CurrencyGuard model loaded successfully!")

# Home route: checks whether the backend is running
@app.route("/")
def home():
    return jsonify({
        "message": "CurrencyGuard backend is running!"
    })


# API route: receives and validates a banknote image
@app.route("/api/analyze", methods=["POST"])
def analyze_currency():

    # Check whether an image was uploaded
    if "image" not in request.files:
        return jsonify({
            "error": "Please upload a banknote image."
        }), 400

    uploaded_file = request.files["image"]

    # Check whether a file was selected
    if not uploaded_file.filename:
        return jsonify({
            "error": "No image was selected."
        }), 400

    try:
        # Read the uploaded image
        image_bytes = uploaded_file.read()

        if not image_bytes:
            return jsonify({
                "error": "The uploaded image is empty."
            }), 400

        # Check whether the file is a valid image
        image = Image.open(BytesIO(image_bytes))
        image.verify()

    except (UnidentifiedImageError, OSError, ValueError):
        return jsonify({
            "error": "The uploaded file is not a valid image."
        }), 400

    # The AI detection model has not been connected yet
    return jsonify({
        "status": "model_not_configured",
        "message": (
            "Image received successfully. "
            "Counterfeit detection is not available yet."
        )
    }), 200


# Start the development server
if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
