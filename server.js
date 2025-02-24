const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/capture', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send({ error: 'URL is required' });
  }

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' }); // Wait for page to fully load

    // Get viewport dimensions
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }));

    // Function to recursively get visible elements
    const getVisibleElements = async (element) => {
      const isVisible = await page.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0 &&
               rect.left < window.innerWidth && rect.right > 0;
      }, element);

      if (!isVisible) return null;

      const tagName = await page.evaluate(el => el.tagName, element);
      const computedStyle = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          border: style.border,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          color: style.color
        };
      }, element);
      const boundingBox = await element.boundingBox();

      const node = {
        type: tagName.toLowerCase(),
        styles: computedStyle,
        position: {
          x: boundingBox.x,
          y: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height
        },
        children: []
      };

      // Handle images
      if (tagName === 'IMG') {
        node.imageUrl = await page.evaluate(el => el.src, element);
      }
      // Handle text content
      else if (element.children.length === 0 && element.textContent.trim()) {
        node.type = 'text';
        node.text = await page.evaluate(el => el.textContent.trim(), element);
      }

      // Recursively process children
      const children = await element.$$(':scope > *');
      for (const child of children) {
        const childNode = await getVisibleElements(child);
        if (childNode) node.children.push(childNode);
      }

      return node;
    };

    // Start from the body and build the tree
    const bodyHandle = await page.$('body');
    const tree = await getVisibleElements(bodyHandle);

    await browser.close();

    res.send({ viewport, tree });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
