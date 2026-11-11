
import csv
from pathlib import Path

# Find the dataset file
dataset_path = (
    Path(__file__).parent
    / "data"
    / "data_banknote_authentication.txt"
)

# Check whether the file exists
if not dataset_path.exists():
    print("Dataset file not found!")
    print("Check that the file is inside the data folder.")
    raise SystemExit

# Read the dataset
with dataset_path.open("r", newline="", encoding="utf-8") as file:
    reader = csv.reader(file)

    rows = [
        row for row in reader
        if row and len(row) == 5
    ]

print("Dataset loaded successfully!")
print("Number of rows:", len(rows))

# Display the first five rows
print("\nFirst five rows:")

for row in rows[:5]:
    print(row)

# Count the labels in the last column
labels = {}

for row in rows:
    label = row[4].strip()
    labels[label] = labels.get(label, 0) + 1

print("\nLabel counts:", labels)
