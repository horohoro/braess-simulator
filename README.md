# Braess' Paradox Simulator

A web-based interactive simulation of [Braess' Paradox](https://en.wikipedia.org/wiki/Braess%27s_paradox), demonstrating a counterintuitive phenomenon in traffic engineering: adding a road to a congested network can actually increase overall travel time.

## Overview

This project simulates 400 drivers navigating a network between two points. Drivers independently seek the fastest route based on their personal experience. The simulator allows you to toggle a central "bridge" (the shortcut that triggers the paradox) to observe how it affects traffic distribution and average travel times.

## Features

- **Real-time Visualization**: Uses [Cytoscape.js](https://js.cytoscape.org/) for dynamic network rendering.
- **Traffic Simulation**: 400 individual drivers with a "change of mind rate" of 1%.
- **Live Statistics**: Tracks fastest road, slowest travel time, and average travel time across all drivers.
- **Visual Indicators**: Road colors change from green to red based on congestion, and road width scales with the number of drivers.

## Project Structure

- `index.html`: The main entry point and UI layout.
- `braess.js`: Core simulation logic, driver behavior, and Cytoscape integration.
- `cytoscape.css`: Styling for the graph visualization.
- `cytoscape.min.js`: The Cytoscape.js library.
- `jquery-3.4.1.min.js`: jQuery for UI interactions.
- `sage.txt`: SageMath script used for calculating the mathematical optimal.

## Keyboard Controls

Interact with the simulation using the following keys:

| Key | Action |
| :--- | :--- |
| **`a`** | Start **Auto** mode (advances one day every second). |
| **`c`** | **Cancel** Auto mode. |
| **`s`** | **Switch** the bridge/shortcut (on or off). |
| **`n`** | Advance to the **Next Day**. |
| **`m`** | Advance **Multiple** (10) days. |
| **`r`** | **Reset** the graph layout. |

## Getting Started

1.  Clone or download this repository.
2.  Open `index.html` in any modern web browser.
3.  Press `a` to start the simulation or `n` to step through it day by day.
4.  Toggle the bridge with `s` to observe the paradox in action.

---
*Created as an educational tool to visualize network flow and paradoxes.*
