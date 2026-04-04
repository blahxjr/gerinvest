const fs = require('fs');
const path = require('path');

// Create directory structure
const baseDir = path.join(__dirname, 'src', 'ui', 'components', 'base');

fs.mkdirSync(baseDir, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating directory:', err);
    process.exit(1);
  }
  console.log('Directory created successfully:', baseDir);
});
