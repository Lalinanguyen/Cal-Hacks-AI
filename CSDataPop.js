import fs from 'fs';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Creates objects for every row in CSV files with specified properties
 */
export const createObjectsFromCSV = (filePath) => {
    const csvString = fs.readFileSync(filePath, 'utf8');
    const results = Papa.parse(csvString, { header: true, skipEmptyLines: true });

    const peopleObjects = [];

    for (let i = 0; i < results.data.length; i++) {
        const row = results.data[i];
        
        // Parse experience to get company info
        let company = '';
        let yearsExperience = 0;
        try {
            const experienceArr = JSON.parse(row.experience);
            if (Array.isArray(experienceArr) && experienceArr.length > 0) {
                company = experienceArr[0].company_name || '';
                // Calculate years of experience (simplified)
                yearsExperience = experienceArr.length; // Rough estimate
            }
        } catch (e) {
            company = '';
            yearsExperience = 0;
        }
        
        // Parse education to get major and graduation year
        let major = '';
        let graduationYear = '';
        try {
            const educationArr = JSON.parse(row.education);
            if (Array.isArray(educationArr) && educationArr.length > 0) {
                major = educationArr[0].field_of_study || '';
                graduationYear = educationArr[0].end_date ? 
                    new Date(educationArr[0].end_date).getFullYear().toString() : '';
            }
        } catch (e) {
            major = '';
            graduationYear = '';
        }
        
        // Parse skills (if available)
        let skills = '';
        try {
            if (row.skills) {
                skills = row.skills;
            }
        } catch (e) {
            skills = '';
        }
        
        const personObject = {
            Name: row.name || '',
            Title: row.title || '',
            Company: company,
            Major: major,
            GraduationYear: graduationYear,
            LinkedinConnections: '', // Not available in current data
            YearsExperience: yearsExperience,
            Skills: skills,
            Location: row.location || ''
        };
        
        peopleObjects.push(personObject);
    }

    console.log(`Created ${peopleObjects.length} objects from ${filePath}`);
    return peopleObjects;
};

/**
 * Creates objects for every row in XLSX files with specified properties
 */
export const createObjectsFromXLSX = (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const peopleObjects = [];

    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        const personObject = {
            Name: row.Name || '',
            Title: row.Title || '',
            Company: row.Company || '',
            Major: row.Major || '',
            GraduationYear: row.GraduationYear || '',
            LinkedinConnections: row.LinkedinConnections || '',
            YearsExperience: parseInt(row.YearsExperience) || 0,
            Skills: row.Skills || '',
            Location: row.Location || ''
        };
        
        peopleObjects.push(personObject);
    }

    console.log(`Created ${peopleObjects.length} objects from ${filePath}`);
    return peopleObjects;
};

// Example usage:
// const bigdata1Objects = createObjectsFromCSV('assets/BIGDATA1.csv');
// const allcsdataObjects = createObjectsFromXLSX('assets/ALLCSDATA.xlsx'); 