
from pathlib import Path
import joblib

# Locate the saved model
model_path = Path(__file__).parent / "banknote_model.pkl"

# Load the trained model
model = joblib.load(model_path)

print("Trained model loaded successfully!")

# Four example numerical features from the dataset
sample = [[3.6216, 8.6661, -2.8073, -0.44699]]

# Ask the model to make a prediction
prediction = model.predict(sample)

print("Predicted class:", prediction[0])
