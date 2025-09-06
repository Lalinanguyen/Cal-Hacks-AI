const fs = require('fs');
const path = require('path');

// This script converts your XLSX data to JSON
// Run this once: node convertData.js

// For now, let's create a sample JSON structure based on what we expect
// You can manually convert your XLSX to this format or use an online converter

const sampleData = [
  {
    Name: 'John Doe',
    Major: 'Computer Science',
    Connections: 100,
    Score: 100,
  },
  
];

// Write the data to a JSON file
const outputPath = path.join(__dirname, 'berkeleyData.json');
fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));

console.log(`Data converted and saved to: ${outputPath}`);
console.log(`Sample data created with ${sampleData.length} entries`);
console.log('You can now replace this with your actual ALLCSDATA.xlsx content`);

// Instructions for manual conversion
console.log(`
📋 MANUAL CONVERSION INSTRUCTIONS:
1. Open your ALLCSDATA.xlsx file in Excel/Google Sheets
2. Export as CSV or copy the data
3. Use an online converter (like https://www.convertcsv.com/excel-to-json.htm)
4. Replace the sampleData array above with your converted data
5. Run this script again: node convertData.js
6. The berkeleyData.json file will be ready for your React Native app
`); 
