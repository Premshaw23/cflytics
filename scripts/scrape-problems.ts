import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { setTimeout } from 'timers/promises';

const prisma = new PrismaClient();

interface ProblemData {
  contestId: string;
  index: string;
  name: string;
  timeLimit: string;
  memoryLimit: string;
  description: string;
  inputSpec: string;
  outputSpec: string;
  sampleTests: { input: string; output: string }[];
  tags: string[];
  rating?: number;
}

async function scrapeWithRetry(
  contestId: string,
  index: string,
  maxRetries = 3
): Promise<ProblemData | null> {
  const cloudscraper = (await import('cloudscraper')) as any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`  Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await setTimeout(delay);
      }

      const url = `https://codeforces.com/problemset/problem/${contestId}/${index}`;
      
      const html: string = await new Promise((resolve, reject) => {
        cloudscraper.get({
          uri: url,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          }
        }, (error: any, response: any, body: string) => {
          if (error) {
            reject(error);
          } else if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}`));
          } else {
            resolve(body);
          }
        });
      });
      
      // Check for Cloudflare block
      if (html.includes('Cloudflare') || html.includes('Checking your browser')) {
        throw new Error('Cloudflare protection detected');
      }

      const $ = cheerio.load(html);
      const problemStatement = $('.problem-statement');

      if (problemStatement.length === 0) {
        throw new Error('Problem statement not found');
      }

      const name = problemStatement.find('.header .title').text().replace(/^[A-Z][0-9]*\.\s*/, '').trim();
      
      const timeLimit = problemStatement.find('.header .time-limit').contents().filter((_: number, el: any) => {
        return el.nodeType === 3;
      }).text().trim();
      
      const memoryLimit = problemStatement.find('.header .memory-limit').contents().filter((_: number, el: any) => {
        return el.nodeType === 3;
      }).text().trim();

      const description = problemStatement.find('.header').nextUntil('.input-specification').map((_: number, el: any) => {
        return $(el).html();
      }).get().join('');

      const inputSpec = problemStatement.find('.input-specification').html() || '';
      const outputSpec = problemStatement.find('.output-specification').html() || '';

      const sampleTests: { input: string; output: string }[] = [];
      $('.sample-test .input pre').each((i: number, el: any) => {
        const input = $(el).html()?.replace(/<br\s*\/?>/gi, '\n').trim() || '';
        const outputTextarea = $('.sample-test .output pre').eq(i);
        const output = outputTextarea.html()?.replace(/<br\s*\/?>/gi, '\n').trim() || '';
        
        sampleTests.push({
          input: cheerio.load(input).text(), 
          output: cheerio.load(output).text()
        });
      });

      const tags: string[] = [];
      $('.tag-box').each((_: number, el: any) => {
        const tag = $(el).text().trim();
        if (tag && !tag.startsWith('*')) {
          tags.push(tag);
        }
      });

      let rating: number | undefined;
      $('.tag-box').each((_: number, el: any) => {
        const text = $(el).text().trim();
        if (text.startsWith('*')) {
          rating = parseInt(text.substring(1));
        }
      });

      return {
        contestId,
        index,
        name,
        timeLimit,
        memoryLimit,
        description,
        inputSpec,
        outputSpec,
        sampleTests,
        tags,
        rating
      };
    } catch (error) {
      console.error(`  Attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : error);
      if (attempt === maxRetries - 1) return null;
    }
  }
  return null;
}

async function scrapeAllProblems(limit?: number) {
  console.log('Fetching problem list from Codeforces API...');
  
  const response = await fetch('https://codeforces.com/api/problemset.problems');
  const { result } = await response.json();
  const problems = result.problems;

  const totalProblems = limit || problems.length;
  console.log(`Found ${problems.length} problems. Scraping ${totalProblems}...\n`);

  let scraped = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < Math.min(problems.length, totalProblems); i++) {
    const problem = problems[i];
    const { contestId, index } = problem;
    const problemId = `${contestId}${index}`;

    console.log(`[${i + 1}/${totalProblems}] ${problemId}: ${problem.name}`);

    // Check if already scraped
    const existing = await prisma.problemStatement.findUnique({
      where: { problemId }
    });

    if (existing) {
      console.log(`  ✓ Already exists, skipping`);
      skipped++;
      continue;
    }

    const data = await scrapeWithRetry(contestId.toString(), index);

    if (data) {
      await prisma.problemStatement.create({
        data: {
          problemId,
          name: data.name,
          timeLimit: data.timeLimit,
          memoryLimit: data.memoryLimit,
          description: data.description,
          inputSpecification: data.inputSpec,
          outputSpecification: data.outputSpec,
          sampleTestCases: data.sampleTests,
          tags: data.tags,
          rating: data.rating,
        },
      });
      console.log(`  ✓ Saved to database`);
      scraped++;
    } else {
      console.log(`  ✗ Failed to scrape`);
      failed++;
    }

    // Respectful delay between requests (2-3 seconds)
    const delay = 2000 + Math.random() * 1000;
    await setTimeout(delay);
  }

  console.log(`\n=== Scraping Complete ===`);
  console.log(`Scraped: ${scraped}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${scraped + skipped + failed}`);
}

// Get limit from command line args
const limit = process.argv[2] ? parseInt(process.argv[2]) : undefined;

scrapeAllProblems(limit)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
