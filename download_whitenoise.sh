#!/bin/bash

# Create directory if it doesn't exist
mkdir -p public/audio/whitenoise

# Download sample white noise files
echo "Downloading white noise audio files..."

# Rain sound
echo "Downloading rain sound..."
curl -L "https://freesound.org/data/previews/169/169131_2975501-lq.mp3" -o public/audio/whitenoise/rain.mp3

# Forest sound
echo "Downloading forest sound..."
curl -L "https://freesound.org/data/previews/573/573577_5762546-lq.mp3" -o public/audio/whitenoise/forest.mp3

# Ocean sound
echo "Downloading ocean sound..."
curl -L "https://freesound.org/data/previews/47/47539_173245-lq.mp3" -o public/audio/whitenoise/ocean.mp3

# Fan sound
echo "Downloading fan sound..."
curl -L "https://freesound.org/data/previews/243/243627_4355482-lq.mp3" -o public/audio/whitenoise/fan.mp3

# Fireplace sound
echo "Downloading fireplace sound..."
curl -L "https://freesound.org/data/previews/17/17141_59479-lq.mp3" -o public/audio/whitenoise/fireplace.mp3

# Cafe sound
echo "Downloading cafe sound..."
curl -L "https://freesound.org/data/previews/427/427830_7474987-lq.mp3" -o public/audio/whitenoise/cafe.mp3

echo "White noise audio files downloaded successfully!"
echo "All files are from freesound.org and are licensed under Creative Commons."
echo "Attribution information:"
echo "- Rain: https://freesound.org/people/jmbphilmes/sounds/169131/"
echo "- Forest: https://freesound.org/people/klankbeeld/sounds/573577/"
echo "- Ocean: https://freesound.org/people/Luftrum/sounds/47539/"
echo "- Fan: https://freesound.org/people/keweldog/sounds/243627/"
echo "- Fireplace: https://freesound.org/people/pushtobreak/sounds/17141/"
echo "- Cafe: https://freesound.org/people/InspectorJ/sounds/427830/"
