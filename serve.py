#!/usr/bin/env python3
"""
Simple HTTP server for the Pallet Planning System
Just run this file to start the application in your browser
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

PORT = 8080
DIRECTORY = "dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def main():
    # Change to the script's directory
    os.chdir(Path(__file__).parent)

    # Check if dist directory exists
    if not os.path.exists(DIRECTORY):
        print(f"Error: '{DIRECTORY}' directory not found!")
        print("Please run 'npm run build' first to create the dist directory.")
        sys.exit(1)

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"\n{'='*60}")
        print(f"  Corrugated Pallet Planning System")
        print(f"{'='*60}")
        print(f"\n  Server running at: {url}")
        print(f"\n  Opening browser automatically...")
        print(f"\n  Press Ctrl+C to stop the server")
        print(f"\n{'='*60}\n")

        # Open browser
        webbrowser.open(url)

        # Start serving
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped.")
            sys.exit(0)

if __name__ == "__main__":
    main()
