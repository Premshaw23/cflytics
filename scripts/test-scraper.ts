import { scrapeProblem } from '../src/lib/api/scraper';

async function testScraper() {
    console.log('Testing Codeforces scraper with cloudscraper...\n');
    
    const testCases = [
        { contestId: '2180', index: 'B' },
        { contestId: '1', index: 'A' },
        { contestId: '4', index: 'A' }
    ];
    
    for (const { contestId, index } of testCases) {
        console.log(`\n=== Testing ${contestId}${index} ===`);
        try {
            const problem = await scrapeProblem(contestId, index);
            
            if (problem) {
                console.log(`✓ Success!`);
                console.log(`  Name: ${problem.name}`);
                console.log(`  Rating: ${problem.rating || 'N/A'}`);
                console.log(`  Tags: ${problem.tags.join(', ') || 'N/A'}`);
                console.log(`  Sample tests: ${problem.sampleTestCases.length}`);
                console.log(`  Description length: ${problem.description.length} chars`);
            } else {
                console.log(`✗ Failed to scrape`);
            }
        } catch (error) {
            console.error(`✗ Error:`, error instanceof Error ? error.message : error);
        }
    }
}

testScraper().catch(console.error);
