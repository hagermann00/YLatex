#!/bin/bash
set -e

# --- Configuration ---
TOPIC_DIR=$1
SCRIPT_NAME="04_image_generation"
OUTPUT_DIR="$TOPIC_DIR/Images"
CONFIG_FILE="$TOPIC_DIR/config.json"
STATE_FILE="$TOPIC_DIR/production_state.json"
ARCHIVE_DIR="$TOPIC_DIR/Archive"

# --- Helper Functions ---
function get_mode() {
  jq -r ".steps[\"$SCRIPT_NAME\"].mode" "$CONFIG_FILE"
}

function is_complete() {
  jq -r ".steps_completed[\"$SCRIPT_NAME\"]" "$STATE_FILE"
}

function update_state() {
  temp_file=$(mktemp)
  jq ".steps_completed[\"$SCRIPT_NAME\"] = true" "$STATE_FILE" > "$temp_file" && mv "$temp_file" "$STATE_FILE"
  echo "State updated: $SCRIPT_NAME is complete."
}

# --- Main Logic ---
echo "--- Running Step: $SCRIPT_NAME ---"

if [ -z "$TOPIC_DIR" ]; then
  echo "Error: Topic directory not provided."
  exit 1
fi

if [ "$(is_complete)" == "true" ]; then
  echo "Step already completed. Skipping."
  exit 0
fi

MODE=$(get_mode)
echo "Mode: $MODE"

if [ "$MODE" == "manual" ]; then
  echo "Manual mode: Please place your generated images in:"
  echo "$OUTPUT_DIR/"
  read -p "Press enter to continue once the files are in place..."
elif [ "$MODE" == "auto" ]; then
  echo "Auto mode: Simulating image generation..."
  touch "$OUTPUT_DIR/image1.png"
  touch "$OUTPUT_DIR/image2.png"
  echo "Simulated image files created."
fi

# Verification
if [ -z "$(ls -A $OUTPUT_DIR)" ]; then
  echo "Error: Output directory is empty after execution."
  exit 1
fi

# Archival
echo "Archiving output..."
cp -r "$OUTPUT_DIR/." "$ARCHIVE_DIR/Images"
echo "Output archived to $ARCHIVE_DIR/Images"

# Update State
update_state

echo "--- Step $SCRIPT_NAME Finished ---"
