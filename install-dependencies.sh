#!/bin/bash
set -e  # Exit on any error

echo "Installing root dependencies..."
npm install

echo "Installing client dependencies..."
cd client
npm install
cd ..

echo "✅ All dependencies installed successfully!"
