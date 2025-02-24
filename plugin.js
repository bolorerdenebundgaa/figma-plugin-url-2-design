/**
 * Figma Webpage Viewport Capture Plugin - Plugin Logic
 * @author Bolorerdene Bundgaa
 */

figma.showUI(__html__, { width: 300, height: 150 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'capture') {
    const url = msg.url;
    try {
      // Send status update
      figma.ui.postMessage({ type: 'status', message: 'Capturing webpage...' });

      // Send request to backend
      const response = await fetch('http://localhost:3000/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();

      if (data.error) {
        figma.ui.postMessage({ 
          type: 'status', 
          message: `Error: ${data.error}`,
          success: false 
        });
        return;
      }

      // Create a frame for the viewport
      const viewportFrame = figma.createFrame();
      viewportFrame.resize(data.viewport.width, data.viewport.height);
      viewportFrame.name = `Viewport - ${url}`;
      figma.currentPage.appendChild(viewportFrame);

      // Function to create Figma nodes from the JSON tree
      const createNode = async (nodeData, parent) => {
        let node;
        
        if (nodeData.type === 'text') {
          node = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          node.characters = nodeData.text;
          if (nodeData.styles.fontSize) {
            node.fontSize = parseInt(nodeData.styles.fontSize);
          }
          if (nodeData.styles.color) {
            const color = parseColor(nodeData.styles.color);
            node.fills = [{ type: 'SOLID', color }];
          }
        } else if (nodeData.type === 'img') {
          node = figma.createRectangle();
          node.name = 'Image Placeholder';
          node.fills = [{ 
            type: 'SOLID', 
            color: { r: 0.9, g: 0.9, b: 0.9 } 
          }];
        } else {
          node = figma.createFrame();
          node.name = nodeData.type;
        }

        // Set position and size
        node.x = nodeData.position.x;
        node.y = nodeData.position.y;
        node.resize(
          Math.max(1, nodeData.position.width), 
          Math.max(1, nodeData.position.height)
        );

        // Apply background color if it exists and isn't transparent
        if (nodeData.styles.backgroundColor && 
            nodeData.styles.backgroundColor !== 'transparent' && 
            nodeData.styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const color = parseColor(nodeData.styles.backgroundColor);
          node.fills = [{ type: 'SOLID', color }];
        }

        // Apply border if it exists
        if (nodeData.styles.border && nodeData.styles.border !== 'none') {
          const borderColor = { r: 0, g: 0, b: 0 }; // Default to black
          node.strokes = [{ type: 'SOLID', color: borderColor }];
          node.strokeWeight = 1; // Default width
        }

        // Add node to parent
        parent.appendChild(node);

        // Recursively create children
        for (const childData of nodeData.children) {
          await createNode(childData, node);
        }

        return node;
      };

      // Create the design from the tree
      await createNode(data.tree, viewportFrame);

      // Center the viewport frame in view
      figma.viewport.scrollAndZoomIntoView([viewportFrame]);

      figma.ui.postMessage({ 
        type: 'status', 
        message: 'Viewport captured successfully!',
        success: true 
      });
    } catch (error) {
      figma.ui.postMessage({ 
        type: 'status', 
        message: `Error: ${error.message}`,
        success: false 
      });
    }
  }
};

// Helper function to parse color string to Figma color format
function parseColor(colorStr) {
  // Handle rgba format
  if (colorStr.startsWith('rgba')) {
    const values = colorStr.match(/[\d.]+/g).map(Number);
    return {
      r: values[0] / 255,
      g: values[1] / 255,
      b: values[2] / 255
    };
  }
  // Handle rgb format
  else if (colorStr.startsWith('rgb')) {
    const values = colorStr.match(/\d+/g).map(Number);
    return {
      r: values[0] / 255,
      g: values[1] / 255,
      b: values[2] / 255
    };
  }
  // Default to black if color format is not recognized
  return { r: 0, g: 0, b: 0 };
}
