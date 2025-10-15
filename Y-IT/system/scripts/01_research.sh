#!/bin/bash
set -e

# --- Configuration ---
TOPIC_DIR=$1
SCRIPT_NAME="01_research"
OUTPUT_FILENAME="01_research_input.md"
CONFIG_FILE="$TOPIC_DIR/config.json"
STATE_FILE="$TOPIC_DIR/production_state.json"
MANUSCRIPTS_DIR="$TOPIC_DIR/Manuscripts"
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
  echo "Manual mode: Please place your research file at:"
  echo "$MANUSCRIPTS_DIR/$OUTPUT_FILENAME"
  read -p "Press enter to continue once the file is in place..."
elif [ "$MODE" == "auto" ]; then
  echo "Auto mode: Simulating API call to generate research..."
  # In a real scenario, this would be a call to the Gemini API
  echo "# Simulated Research for $(basename $TOPIC_DIR)" > "$MANUSCRIPTS_DIR/$OUTPUT_FILENAME"
  echo "Simulated research file created."
fi

# Verification
if [ ! -f "$MANUSCRIPTS_DIR/$OUTPUT_FILENAME" ]; then
  echo "Error: Output file was not found after execution."
  exit 1
fi

# Archival
echo "Archiving output..."
cp "$MANUSCRIPTS_DIR/$OUTPUT_FILENAME" "$ARCHIVE_DIR/"
echo "Output archived to $ARCHIVE_DIR/$OUTPUT_FILENAME"

# Update State
update_state

echo "--- Step $SCRIPT_NAME Finished ---"
