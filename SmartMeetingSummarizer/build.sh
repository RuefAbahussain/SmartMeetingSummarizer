#!/bin/bash
set -e

# Install Python dependencies
pip install -r backend/requirements.txt

# Install system dependencies required by python-magic and ffmpeg
apt-get update
apt-get install -y libmagic1 ffmpeg
