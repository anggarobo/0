import fs from 'fs';
import path from 'path';

export async function load() {
    try {
        // Resolve the file path to projects.json
        const filePath = path.resolve('src/lib', 'projects.json');
        const data = fs.readFileSync(filePath, 'utf-8'); // Read the file
        const projects = JSON.parse(data); // Parse the JSON data
        
        // Return the data as a plain object
        return { projects };
    } catch (err) {
        console.error('Error loading data:', err);
        return { projects: [] };
    }
}
