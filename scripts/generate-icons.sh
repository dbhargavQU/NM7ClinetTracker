#!/bin/bash

# Generate PWA icons from a simple design
# This creates basic colored square icons with text

# Colors
BG_COLOR="#000000"
TEXT_COLOR="#FFFFFF"

# Create 192x192 icon
sips -z 192 192 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericDocumentIcon.icns --out public/icon-192x192.png 2>/dev/null || \
convert -size 192x192 xc:"$BG_COLOR" -gravity center -pointsize 72 -fill "$TEXT_COLOR" -annotate +0+0 "NM7" public/icon-192x192.png 2>/dev/null || \
echo "Note: Please create icon-192x192.png (192x192px) and icon-512x512.png (512x512px) manually in the public folder"

# Create 512x512 icon  
sips -z 512 512 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericDocumentIcon.icns --out public/icon-512x512.png 2>/dev/null || \
convert -size 512x512 xc:"$BG_COLOR" -gravity center -pointsize 200 -fill "$TEXT_COLOR" -annotate +0+0 "NM7" public/icon-512x512.png 2>/dev/null || \
echo "Note: Please create icon-512x512.png (512x512px) manually in the public folder"

echo "Icons generation attempted. If tools are not available, please create icons manually."

