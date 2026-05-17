#!/bin/bash

# ==============================================================================
# MacBook Webcam Streaming Script (for Dockerized AI Worker)
#
# This script reads the MacBook webcam using FFmpeg and publishes it to a
# MediaMTX RTSP server. The AI worker in Docker can then consume this stream.
# ==============================================================================

# Variables (can be overridden by environment variables)
VIDEO_DEVICE="${VIDEO_DEVICE:-0}"
STREAM_NAME="${STREAM_NAME:-webcam}"
RTSP_URL="${RTSP_URL:-rtsp://localhost:8554/$STREAM_NAME}"

echo "----------------------------------------------------------"
echo " MacBook Webcam RTSP Streaming"
echo " Source: Device $VIDEO_DEVICE"
echo " Destination: $RTSP_URL"
echo "----------------------------------------------------------"

# 1. Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: FFmpeg is not installed."
    echo "Please install it using Homebrew: brew install ffmpeg"
    exit 1
fi

# 2. Reminder for MediaMTX
echo "Tip: Make sure MediaMTX is running (brew install mediamtx && mediamtx)"
echo "Checking if port 8554 is open..."
if ! nc -z localhost 8554 2>/dev/null; then
    echo "Warning: MediaMTX does not seem to be listening on port 8554."
    echo "The streaming might fail if MediaMTX is not started."
fi

echo "Starting streaming... Press Ctrl+C to stop."

# 3. Execute FFmpeg
# -f avfoundation: macOS native capture
# -framerate 30: 30 FPS
# -video_size 1280x720: HD resolution
# -i "$VIDEO_DEVICE:none": Video device index, no audio
# -vcodec libx264: H.264 encoding
# -preset ultrafast: Minimum CPU usage
# -tune zerolatency: Minimum delay
# -pix_fmt yuv420p: Compatibility
# -f rtsp: RTSP output format
# -rtsp_transport tcp: Use TCP for stability
ffmpeg \
    -f avfoundation \
    -framerate 30 \
    -video_size 1280x720 \
    -i "${VIDEO_DEVICE}:none" \
    -vcodec libx264 \
    -preset ultrafast \
    -tune zerolatency \
    -pix_fmt yuv420p \
    -f rtsp \
    -rtsp_transport tcp \
    "$RTSP_URL"
