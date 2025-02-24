# Figma Webpage Viewport Capture Plugin

This plugin allows you to capture the visible viewport of any webpage and recreate it as Figma elements, preserving the layout, hierarchy, and basic styles of the webpage elements.

## Features

- Captures the visible viewport of any webpage
- Preserves element hierarchy and positioning
- Maintains basic styles (colors, borders, font sizes)
- Handles text content and creates placeholders for images
- Real-time status feedback during capture process
- Error handling with user-friendly messages

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Figma Desktop App](https://www.figma.com/downloads/)

## Installation

1. Clone or download this repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install the dependencies:
```bash
npm install
```

3. Import the plugin to Figma:
   - Open Figma Desktop App
   - Go to Plugins > Development > Import plugin from manifest
   - Navigate to the project directory and select `manifest.json`

## Usage

### Starting the Backend Server

1. Open a terminal in the project directory
2. Start the server:
```bash
node server.js
```
3. The server will start running at `http://localhost:3000`

### Using the Plugin in Figma

1. Open your Figma project
2. Right-click and select Plugins > Development > Webpage Viewport Capture
3. In the plugin UI:
   - Enter the URL of the webpage you want to capture
   - Click "Capture"
4. Wait for the capture process to complete
5. The plugin will create a new frame containing the webpage elements

## Technical Details

### Backend (server.js)

The backend server uses:
- Express.js for handling HTTP requests
- Puppeteer for webpage rendering and element extraction
- Custom element traversal algorithm to capture visible elements

Features:
- Viewport dimension detection
- Element visibility checking
- Style computation
- Position and size preservation
- Recursive element tree building

### Frontend (plugin.js)

The Figma plugin uses:
- Figma Plugin API for element creation
- Inter font for text elements
- Custom color parsing for style application
- Recursive node creation for maintaining hierarchy

### UI (ui.html)

The plugin interface includes:
- URL input field
- Capture button
- Status feedback display
- Error messaging
- Loading state indication

## File Structure

```
.
├── manifest.json     # Plugin configuration
├── plugin.js        # Figma plugin logic
├── ui.html          # Plugin user interface
├── server.js        # Backend server
├── package.json     # Project dependencies
└── README.md        # Documentation
```

## Limitations

- Images are represented as gray placeholders due to CORS restrictions
- Some complex CSS properties might not be perfectly replicated
- Dynamic content might not be captured if it requires user interaction
- The backend server must be running locally for the plugin to work

## Development

To modify the plugin:
1. Make changes to the relevant files
2. If modifying the UI, update `ui.html`
3. If changing backend behavior, modify `server.js`
4. For plugin logic changes, update `plugin.js`
5. Test changes by rerunning the plugin in Figma

## Troubleshooting

Common issues and solutions:

1. **Plugin can't connect to server**
   - Ensure the server is running at `http://localhost:3000`
   - Check for any console errors in the browser
   - Verify your firewall settings

2. **Webpage not loading**
   - Verify the URL is accessible
   - Check if the webpage requires authentication
   - Ensure proper CORS headers are present

3. **Elements not appearing correctly**
   - Some complex layouts might require manual adjustment
   - Check if the webpage uses dynamic rendering
   - Verify the viewport size settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
