import { scrapeProblem } from '../src/lib/api/scraper';
import * as fs from 'fs';

async function debugHtml() {
    console.log('Fetching problem 2180B...\n');
    
    const problem = await scrapeProblem('2180', 'B');
    
    if (problem) {
        console.log('✓ Problem fetched successfully!');
        console.log(`Name: ${problem.name}\n`);
        
        // Save HTML samples to files for inspection
        fs.writeFileSync('./debug-description.html', problem.description);
        fs.writeFileSync('./debug-input.html', problem.inputSpecification);
        fs.writeFileSync('./debug-output.html', problem.outputSpecification);
        
        console.log('Saved HTML files for inspection:');
        console.log('- debug-description.html');
        console.log('- debug-input.html');
        console.log('- debug-output.html');
        
        console.log('\n--- DESCRIPTION PREVIEW (first 500 chars) ---');
        console.log(problem.description.substring(0, 500));
        
        console.log('\n--- INPUT SPEC PREVIEW (first 300 chars) ---');
        console.log(problem.inputSpecification.substring(0, 300));
        
        // Check for LaTeX patterns
        const hasLatex = problem.description.includes('\\') || 
                        problem.inputSpecification.includes('\\') ||
                        problem.description.includes('$$$');
        console.log(`\n Has LaTeX markers: ${hasLatex}`);
    } else {
        console.log('✗ Failed to fetch problem');
    }
}

debugHtml().catch(console.error);
