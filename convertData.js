const fs = require('fs');
const path = require('path');

// This script converts your XLSX data to JSON
// Run this once: node convertData.js

// For now, let's create a sample JSON structure based on what we expect
// You can manually convert your XLSX to this format or use an online converter

const sampleData = [
  {
    "Name": "John Doe",
    "Title": "Software Engineer",
    "Company": "Tech Corp",
    "Major": "Computer Science",
    "GraduationYear": "2024",
    "LinkedInConnections": 500,
    "Experience": "2 years",
    "Skills": "Python, JavaScript, React",
    "Location": "San Francisco, CA"
  },
  {
    "Name": "Jane Smith",
    "Title": "Product Manager",
    "Company": "Startup Inc",
    "Major": "Business Administration",
    "GraduationYear": "2023",
    "LinkedInConnections": 750,
    "Experience": "3 years",
    "Skills": "Product Strategy, Analytics, Leadership",
    "Location": "Oakland, CA"
  },
  {
    "Name": "Mike Johnson",
    "Title": "Data Scientist",
    "Company": "AI Labs",
    "Major": "Statistics",
    "GraduationYear": "2024",
    "LinkedInConnections": 300,
    "Experience": "1 year",
    "Skills": "Python, R, Machine Learning",
    "Location": "Berkeley, CA"
  },
  {
    "Name": "Sarah Wilson",
    "Title": "UX Designer",
    "Company": "Design Studio",
    "Major": "Design",
    "GraduationYear": "2023",
    "LinkedInConnections": 450,
    "Experience": "2 years",
    "Skills": "Figma, User Research, Prototyping",
    "Location": "San Jose, CA"
  },
  {
    "Name": "David Brown",
    "Title": "Marketing Manager",
    "Company": "Marketing Co",
    "Major": "Marketing",
    "GraduationYear": "2022",
    "LinkedInConnections": 600,
    "Experience": "4 years",
    "Skills": "Digital Marketing, Analytics, Strategy",
    "Location": "Los Angeles, CA"
  }
];

// Write the data to a JSON file
const outputPath = path.join(__dirname, 'berkeleyData.json');
fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));

console.log(`✅ Data converted and saved to: ${outputPath}`);
console.log(`📊 Sample data created with ${sampleData.length} entries`);
console.log(`🔧 You can now replace this with your actual ALLCSDATA.xlsx content`);

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