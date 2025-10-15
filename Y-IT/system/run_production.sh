#!/bin/bash
set -e

# --- Configuration ---
SYSTEM_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SCRIPTS_DIR="$SYSTEM_DIR/scripts"
TOPICS_DIR="$SYSTEM_DIR/../topics"

# --- Helper Functions ---
function show_usage() {
  echo "Usage: $0 --topic <TOPIC_NAME> --pipeline <kdp|ebook|digital|podcast> [--start-at <STEP_NUMBER>]"
  echo "Example: $0 --topic SAMPLE_TOPIC --pipeline kdp"
  echo "Example: $0 --topic SAMPLE_TOPIC --pipeline kdp --start-at 3"
  exit 1
}

# --- Argument Parsing ---
TOPIC_NAME=""
PIPELINE=""
START_STEP=1

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --topic) TOPIC_NAME="$2"; shift ;;
        --pipeline) PIPELINE="$2"; shift ;;
        --start-at) START_STEP="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; show_usage ;;
    esac
    shift
done

# --- Validation ---
if [ -z "$TOPIC_NAME" ] || [ -z "$PIPELINE" ]; then
  echo "Error: Both --topic and --pipeline are required."
  show_usage
fi

TOPIC_DIR="$TOPICS_DIR/$TOPIC_NAME"
if [ ! -d "$TOPIC_DIR" ]; then
  echo "Error: Topic directory not found at $TOPIC_DIR"
  exit 1
fi

# --- Main Logic ---
echo "--- Starting Y-It Production Pipeline ---"
echo "Topic: $TOPIC_NAME"
echo "Pipeline: $PIPELINE"
echo "Starting at Step: $START_STEP"
echo "-----------------------------------------"

function run_step() {
  local step_number=$1
  local script_name=$2

  if [ "$step_number" -ge "$START_STEP" ]; then
    bash "$SCRIPTS_DIR/$script_name" "$TOPIC_DIR"
  else
    echo "Skipping Step $step_number: $script_name (due to --start-at)"
  fi
}

# --- Pipeline Definitions ---
case $PIPELINE in
  kdp)
    run_step 1 "01_research.sh"
    run_step 2 "02_gemini_draft.sh"
    run_step 3 "03_claude_rewrite.sh"
    run_step 4 "04_image_generation.sh"
    run_step 5 "05_kdp_assembly.sh"
    ;;
  ebook)
    run_step 1 "01_research.sh"
    run_step 2 "02_gemini_draft.sh"
    run_step 3 "03_claude_rewrite.sh"
    run_step 4 "04_image_generation.sh"
    run_step 6 "06_ebook_assembly.sh"
    ;;
  digital)
    run_step 1 "01_research.sh"
    run_step 2 "02_gemini_draft.sh"
    run_step 3 "03_claude_rewrite.sh"
    run_step 4 "04_image_generation.sh"
    run_step 7 "07_digital_assembly.sh"
    ;;
  podcast)
    run_step 1 "01_research.sh"
    run_step 2 "02_gemini_draft.sh"
    run_step 3 "03_claude_rewrite.sh"
    run_step 8 "08_podcast_assembly.sh"
    ;;
  *)
    echo "Error: Invalid pipeline specified: '$PIPELINE'"
    show_usage
    ;;
esac

echo "--- Pipeline '$PIPELINE' for topic '$TOPIC_NAME' finished. ---"
