# Corrugated Pallet Planning System

A web-based application that generates optimized pallet configurations for corrugated packaging materials, calculates specifications, and produces visual print cards for production floor use.

## Features

### Core Functionality

- **Product Management**
  - Support for flat sheets (single/double/triple wall)
  - Glued/folded pieces with fold configurations
  - Kit support (multiple components bundled together)
  - Nestable product optimization
  - Custom product creation

- **Pallet Configuration Engine**
  - Standard pallet sizes (48"×40", 48"×48", 40"×48")
  - Custom pallet dimensions support
  - Automatic orientation optimization (portrait vs landscape)
  - Weight distribution calculations
  - Overhang tolerance settings
  - Maximum height constraints

- **Intelligent Stacking Logic**
  - Calculates optimal units per layer
  - Determines maximum safe height
  - Applies weight distribution rules
  - Slip sheet insertion at configurable intervals
  - Nesting optimization for compatible products

- **Visual Print Cards**
  - Production-ready print layouts
  - Top and side view diagrams
  - Complete specifications table
  - Warning and special handling notes
  - Slip sheet placement indicators
  - PDF export functionality

- **Real-time Calculations**
  - Total weight (product + pallet + slip sheets)
  - Overall height and dimensions
  - Space utilization percentage
  - Stability scoring
  - Center of gravity calculations
  - Packing efficiency metrics

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Visualizations**: HTML5 Canvas for 2D diagrams
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Quick Start (No Installation Required)

If you already have the built application, simply run:

**Option 1: Double-click the launcher** (Easiest)
- **Windows**: Double-click `serve.bat`
- **Mac/Linux**: Double-click `serve.sh` (or run `./serve.sh` in terminal)

**Option 2: Using npm**
```bash
npm run serve
```

**Option 3: Manual Python command**
```bash
python3 serve.py
```

The application will automatically open in your browser at `http://localhost:8080`

### Development Setup

If you want to modify the code:

**Prerequisites**: Node.js 18+ and npm, Python 3

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory. Run with `npm run serve` or the launcher scripts.

## Usage Guide

### Quick Start

1. **Select a Product** - Choose from pre-loaded samples or create custom
2. **Configure Pallet** - Select size and adjust advanced settings
3. **Calculate Configuration** - View results, visualizations, and print cards
4. **Export** - Print or download PDF for production floor

### Advanced Options

- **Max Overhang**: How far units can extend beyond pallet edge (1-2")
- **Slip Sheet Interval**: Insert slip sheets every N layers
- **Preferred Orientation**: Force portrait/landscape or auto-optimize
- **Prioritize Stability**: Trade space efficiency for better stability

## Project Structure

```
src/
├── algorithms/         # Optimization algorithms
├── components/        # React components
├── models/           # TypeScript types
├── store/            # State management
├── utils/            # Utility functions
└── App.tsx           # Main component
```

## Sample Products Included

- Standard Single Wall Sheet (48"×40")
- Double Wall Sheet (48"×48")
- Nestable Tray (24"×18")
- Triple Wall Heavy Duty (60"×48")

## License

Copyright © 2025. All rights reserved.
