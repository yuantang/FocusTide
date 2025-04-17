#!/bin/bash

# Create directory if it doesn't exist
mkdir -p public/audio/whitenoise

# Download sample white noise files
echo "Downloading white noise audio files..."

# Rain sound
echo "Downloading rain sound..."
curl -L "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1fb1f3a94d.mp3" -o public/audio/whitenoise/rain.mp3

# Forest sound
echo "Downloading forest sound..."
curl -L "https://cdn.pixabay.com/download/audio/2021/09/06/audio_8a49069f5c.mp3" -o public/audio/whitenoise/forest.mp3

# Ocean sound
echo "Downloading ocean sound..."
curl -L "https://cdn.pixabay.com/download/audio/2021/08/09/audio_c8a849bb0c.mp3" -o public/audio/whitenoise/ocean.mp3

# Fan sound
echo "Downloading fan sound..."
curl -L "https://cdn.pixabay.com/download/audio/2022/03/10/audio_270f8a1a14.mp3" -o public/audio/whitenoise/fan.mp3

# Fireplace sound
echo "Downloading fireplace sound..."
curl -L "https://cdn.pixabay.com/download/audio/2021/08/08/audio_dc39bde808.mp3" -o public/audio/whitenoise/fireplace.mp3

# Cafe sound
echo "Downloading cafe sound..."
curl -L "https://cdn.pixabay.com/download/audio/2022/03/15/audio_2b9a9e2a2d.mp3" -o public/audio/whitenoise/cafe.mp3

echo "White noise audio files downloaded successfully!"
echo "All files are from Pixabay and are licensed under the Pixabay License (free for commercial use, no attribution required)."
