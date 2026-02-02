import * as cheerio from 'cheerio';

export interface ScrapedProblem {
    id: string;
    name: string;
    timeLimit: string;
    memoryLimit: string;
    description: string;
    inputSpecification: string;
    outputSpecification: string;
    sampleTestCases: Array<{
        input: string;
        output: string;
    }>;
    note?: string;
    tags: string[];
    rating?: number;
}

const scraperCache = new Map<string, { data: ScrapedProblem | null, timestamp: number }>();
const ongoingScrapes = new Map<string, Promise<ScrapedProblem | null>>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function fetchProblemMetadataFromAPI(contestId: string, index: string): Promise<ScrapedProblem | null> {
    try {
        const response = await fetch(`https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`);
        const data = await response.json();

        if (data.status === 'OK') {
            const problem = data.result.problems.find((p: any) => p.index === index);
            if (problem) {
                return {
                    id: `${contestId}${index}`,
                    name: problem.name,
                    timeLimit: 'See Codeforces',
                    memoryLimit: 'See Codeforces',
                    description: '', // HTML not available via API
                    inputSpecification: '',
                    outputSpecification: '',
                    sampleTestCases: [],
                    note: '',
                    tags: problem.tags || [],
                    rating: problem.rating
                };
            }
        }
    } catch (error) {
        console.error('API Fallback failed:', error);
    }
    return null;
}

async function fetchWithCloudscraper(url: string): Promise<{ body: string | null, statusCode: number }> {
    try {
        const cloudscraperModule = await import('cloudscraper');
        const cloudscraper = (cloudscraperModule as any).default || cloudscraperModule;
        
        return new Promise((resolve) => {
            const requestFunc = cloudscraper.get || cloudscraper;
            
            if (typeof requestFunc !== 'function') {
                console.error('Cloudscraper not properly loaded');
                resolve({ body: null, statusCode: 0 });
                return;
            }
            
            try {
                const result = requestFunc({
                    uri: url,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    },
                    followAllRedirects: true,
                    timeout: 10000
                }, (error: any, response: any, body: string) => {
                    if (error) {
                        // Only log the message, not the full error object to avoid clutter
                        console.warn(`Cloudscraper bypass skipped for ${url}: ${error.message || 'Unknown error'}`);
                        resolve({ body: null, statusCode: error.statusCode || 0 });
                    } else if (response && response.statusCode !== 200) {
                        console.warn(`Cloudscraper received HTTP ${response.statusCode} for ${url}`);
                        resolve({ body: null, statusCode: response.statusCode });
                    } else {
                        resolve({ body: body || null, statusCode: 200 });
                    }
                });

                // cloudscraper can return a promise that rejects even if a callback is provided.
                // We MUST catch it to prevent "unhandledRejection" errors in logs.
                if (result && typeof result.catch === 'function') {
                    result.catch((err: any) => {
                        // This error is already handled via the callback above, 
                        // but we catch the promise to keep the console clean.
                    });
                }
            } catch (syncError: any) {
                console.warn(`Cloudscraper sync error for ${url}: ${syncError.message}`);
                resolve({ body: null, statusCode: 0 });
            }
        });
    } catch (error) {
        console.error('Cloudscraper environment error:', error);
        return { body: null, statusCode: 0 };
    }
}

export async function scrapeProblem(contestId: string, index: string, force = false): Promise<ScrapedProblem | null> {
    const cacheKey = `${contestId}${index}`;
    
    if (force) {
        scraperCache.delete(cacheKey);
    }

    // Check if there is already an ongoing scrape for this problem
    const ongoing = ongoingScrapes.get(cacheKey);
    if (ongoing) return ongoing;

    const scrapeTask = (async () => {
        try {
            return await performScrape(contestId, index, force);
        } finally {
            ongoingScrapes.delete(cacheKey);
        }
    })();

    ongoingScrapes.set(cacheKey, scrapeTask);
    return scrapeTask;
}

export async function performScrape(contestId: string, index: string, force = false): Promise<ScrapedProblem | null> {
    const cacheKey = `${contestId}${index}`;
    
    // Check memory cache first
    const cached = scraperCache.get(cacheKey);
    if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    // Check database cache
    if (!force) {
        try {
            const prisma = (await import('@/lib/db/prisma')).default;
            
            const dbCached = await prisma.problemStatement.findUnique({
                where: { problemId: cacheKey }
            });

            if (dbCached) {
                const result: ScrapedProblem = {
                    id: dbCached.problemId,
                    name: dbCached.name,
                    timeLimit: dbCached.timeLimit,
                    memoryLimit: dbCached.memoryLimit,
                    description: dbCached.description,
                    inputSpecification: dbCached.inputSpecification,
                    outputSpecification: dbCached.outputSpecification,
                    sampleTestCases: dbCached.sampleTestCases as Array<{ input: string; output: string }>,
                    note: dbCached.note || undefined,
                    tags: dbCached.tags,
                    rating: dbCached.rating || undefined
                };
                
                scraperCache.set(cacheKey, { data: result, timestamp: Date.now() });
                return result;
            }
        } catch (error) {
            console.error('Database cache check failed:', error);
        }
    }

    const urls = [
        `https://codeforces.com/contest/${contestId}/problem/${index}`,
        `https://codeforces.com/problemset/problem/${contestId}/${index}`
    ];

    const commonHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://codeforces.com/problemset',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
    };

    for (const url of urls) {
        try {
            // Try cloudscraper first for Cloudflare bypass
            const { body: html, statusCode } = await fetchWithCloudscraper(url);
            
            if (!html) {
                console.warn(`Cloudscraper failed for ${url} (HTTP ${statusCode}), skipping...`);
                continue;
            }
            
            // Check for Cloudflare block page
            if (html.includes('Cloudflare') && html.includes('Checking your browser')) {
                console.warn(`Cloudflare challenge detected for ${url}`);
                continue;
            }

            const $ = cheerio.load(html);

            const problemStatement = $('.problem-statement');
            if (problemStatement.length === 0) {
                console.warn(`Problem statement not found for ${url}`);
                continue;
            }

            const name = problemStatement.find('.header .title').text().trim();
            const timeLimit = problemStatement.find('.header .time-limit').contents().filter((_: number, el: any) => {
                return el.nodeType === 3;
            }).text().trim();
            const memoryLimit = problemStatement.find('.header .memory-limit').contents().filter((_: number, el: any) => {
                return el.nodeType === 3;
            }).text().trim();

            const description = problemStatement.find('.header').nextUntil('.input-specification').map((_: number, el: any) => {
                return $(el).html();
            }).get().join('');

            const inputSpecElement = problemStatement.find('.input-specification');
            inputSpecElement.find('.section-title').remove();
            const inputSpecification = inputSpecElement.html() || '';

            const outputSpecElement = problemStatement.find('.output-specification');
            outputSpecElement.find('.section-title').remove();
            const outputSpecification = outputSpecElement.html() || '';

            const noteElement = problemStatement.find('.note');
            noteElement.find('.section-title').remove();
            const note = noteElement.html() || '';

            const sampleTestCases: Array<{ input: string, output: string }> = [];
            $('.sample-test').each((_: number, sampleTest: any) => {
                const extractText = (selector: string) => {
                    const element = $(sampleTest).find(selector);
                    if (element.length === 0) return '';

                    // Replace Unicode characters Codeforces uses that break things
                    const normalizeText = (text: string) => {
                        return text
                            .replace(/\u2217/g, '*') // normalize ∗ to *
                            .replace(/\u2013/g, '-') // normalize en dash
                            .replace(/\u2014/g, '--'); // normalize em dash
                    };

                    // New structure: lines wrapped in div.test-example-line
                    const lines = element.find('.test-example-line');
                    if (lines.length > 0) {
                        return normalizeText(
                            lines.map((_: number, line: any) => $(line).text()).get().join('\n').trim()
                        );
                    }

                    // Fallback for older problems: pre with <br> or just text
                    const clone = element.clone();
                    clone.find('br').replaceWith('\n');
                    clone.find('div').each((_: number, div: any) => {
                        $(div).prepend('\n');
                    });
                    
                    return normalizeText(clone.text().trim());
                };

                const input = extractText('.input pre');
                const output = extractText('.output pre');
                
                if (input || output) {
                    sampleTestCases.push({ input, output });
                }
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

            const result = {
                id: `${contestId}${index}`,
                name,
                timeLimit,
                memoryLimit,
                description,
                inputSpecification,
                outputSpecification,
                sampleTestCases,
                note,
                tags,
                rating
            };

            // Cache in memory
            scraperCache.set(cacheKey, { data: result, timestamp: Date.now() });
            
            // Save to database for future use (async, don't wait)
            try {
                const prisma = (await import('@/lib/db/prisma')).default;
                
                await prisma.problemStatement.upsert({
                    where: { problemId: cacheKey },
                    create: {
                        problemId: cacheKey,
                        name,
                        timeLimit,
                        memoryLimit,
                        description,
                        inputSpecification,
                        outputSpecification,
                        sampleTestCases: sampleTestCases as any,
                        note,
                        tags,
                        rating: rating || null
                    },
                    update: {
                        name,
                        timeLimit,
                        memoryLimit,
                        description,
                        inputSpecification,
                        outputSpecification,
                        sampleTestCases: sampleTestCases as any,
                        note,
                        tags,
                        rating: rating || null,
                        updatedAt: new Date()
                    }
                });
                
                console.log(`✓ Saved ${cacheKey} to database`);
            } catch (dbError) {
                console.error('Failed to save to database:', dbError);
                // Don't fail the request if DB save fails
            }
            
            return result;
        } catch (error) {
            console.error(`Error scraping ${url}:`, error);
        }
    }

    // Attempt API fallback if scraping failed
    console.log(`Scraping failed for ${contestId}${index}, attempting API fallback...`);
    const apiResult = await fetchProblemMetadataFromAPI(contestId, index);
    scraperCache.set(cacheKey, { data: apiResult, timestamp: Date.now() });
    return apiResult;
}

export async function scrapeSubmission(contestId: string, submissionId: string): Promise<{ code: string | null, error?: string }> {
    const url = `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;
    try {
        const { body: html, statusCode } = await fetchWithCloudscraper(url);
        
        if (!html) {
            // Try secondary URL format (problemset view)
            const secondaryUrl = `https://codeforces.com/problemset/submission/${contestId}/${submissionId}`;
            const { body: secondaryHtml, statusCode: secondaryStatusCode } = await fetchWithCloudscraper(secondaryUrl);
            
            if (!secondaryHtml) {
                if (statusCode === 403 || secondaryStatusCode === 403) {
                    return { code: null, error: 'Access Blocked: Cloudflare protection prevented us from fetching this code. This often happens for private submissions or if Codeforces is under high load.' };
                }
                return { code: null };
            }
            
            const $ = cheerio.load(secondaryHtml);
            const code = $('#program-source-text').text();
            return { code: code ? code.trim() : null };
        }
        
        const $ = cheerio.load(html);
        const code = $('#program-source-text').text();
        return { code: code ? code.trim() : null };
    } catch (error) {
        console.error(`Error scraping submission ${submissionId}:`, error);
        return { code: null };
    }
}
