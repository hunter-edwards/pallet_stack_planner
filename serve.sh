#!/bin/bash

echo "============================================================"
echo "  Corrugated Pallet Planning System"
echo "============================================================"
echo ""
echo "  Starting server..."
echo ""

# Try python3 first, then python
if command -v python3 &> /dev/null; then
    python3 serve.py
elif command -v python &> /dev/null; then
    python serve.py
else
    echo "Error: Python not found!"
    echo "Please install Python 3 to run this application."
    exit 1
fi
