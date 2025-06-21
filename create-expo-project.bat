@echo off
echo Creating a new Expo project...
echo.

REM Create a directory without spaces
cd /d C:\Users\swann
if exist expo-app rmdir /s /q expo-app
mkdir expo-app
cd expo-app

echo Created project directory: C:\Users\swann\expo-app
echo.
echo Now run these commands in Command Prompt:
echo 1. npx create-expo-app@latest my-app
echo 2. cd my-app
echo 3. npx expo start
echo.
echo Or if you want to use your existing files:
echo 1. Copy your App.js, package.json, and app.json files to C:\Users\swann\expo-app
echo 2. Run: npm install
echo 3. Run: npx expo start
echo.
pause 