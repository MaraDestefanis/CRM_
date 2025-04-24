const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const files = fs.readdirSync(modelsDir);

files.forEach(file => {
  if (file.endsWith('.js') && file !== 'database.js' && file !== 'index.js') {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes("require('../config/database')")) {
      content = content.replace(
        /const sequelize = require\(['"]\.\.\/config\/database['"]\);/g,
        ""
      );
      
      if (!content.startsWith('module.exports = (sequelize)')) {
        content = content.replace(
          /const (.*) = sequelize\.define/,
          'module.exports = (sequelize) => {\n  const { DataTypes } = require(\'sequelize\');\n  const $1 = sequelize.define'
        );
        
        if (!content.includes('return')) {
          content = content.replace(
            /module\.exports = (.*);$/m,
            'return $1;\n};'
          );
        }
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});

console.log('All model files updated successfully');
