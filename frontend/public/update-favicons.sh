#!/bin/bash
cd /Users/macbook/Desktop/pet-community/frontend/public
echo "🔄 파비콘 업데이트 중..."
sips -z 16 16 icon.png --out icon-16x16.png
sips -z 32 32 icon.png --out icon-32x32.png
sips -z 180 180 icon.png --out apple-icon.png
echo "✅ 완료! 파일 목록:"
ls -lh icon*.png apple-icon.png
