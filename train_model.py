
import csv
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# 1. Find and load the dataset
dataset_path = (
    Path(__file__).parent
    / "data"
    / "data_banknote_authentication.txt"
)

features = []
labels = []

with dataset_path.open("r", newline="", encoding="utf-8") as file:
    reader = csv.reader(file)

    for row in reader:
        if row and len(row) == 5:
            features.append([float(value) for value in row[:4]])
            labels.append(int(row[4]))

# 2. Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    features,
    labels,
    test_size=0.2,
    random_state=42,
    stratify=labels
)

# 3. Create and train the model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# 4. Test the model
predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("Model training completed!")
print("Training examples:", len(X_train))
print("Testing examples:", len(X_test))
print(f"Test accuracy: {accuracy:.2%}")

print("\nClassification report:")
print(classification_report(y_test, predictions))

# 5. Save the trained model
import joblib

model_path = Path(__file__).parent / "banknote_model.pkl"
joblib.dump(model, model_path)

print("Model saved to:", model_path)
