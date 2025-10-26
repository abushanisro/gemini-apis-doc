#!/usr/bin/env node

/**
 * Basic Gemini API Evaluation Examples in JavaScript/Node.js
 *
 * This module provides simple examples for evaluating Gemini models
 * using JavaScript. Suitable for beginners and quick testing.
 */

// Node.js 18+ has native fetch, no need to import
const fs = require('fs').promises;
const path = require('path');

class BasicGeminiEvaluator {
    /**
     * Initialize the evaluator
     *
     * @param {string} apiKey - Google API key for Gemini
     * @param {string} model - Model name to use for evaluation
     */
    constructor(apiKey, model = 'gemini-2.5-pro') {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.results = [];
    }

    /**
     * Evaluate a single text prompt
     *
     * @param {string} prompt - Text prompt to evaluate
     * @param {number} temperature - Sampling temperature (0.0 to 2.0)
     * @param {number} maxTokens - Maximum tokens in response
     * @returns {Promise<Object>} Evaluation result object
     */
    async evaluateText(prompt, temperature = 0.7, maxTokens = 1024) {
        const startTime = Date.now();

        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                temperature,
                maxOutputTokens: maxTokens,
                topP: 0.9
            }
        };

        try {
            const response = await fetch(
                `${this.baseUrl}/${this.model}:generateContent`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': this.apiKey
                    },
                    body: JSON.stringify(payload)
                }
            );

            const latencyMs = Date.now() - startTime;

            if (!response.ok) {
                const errorText = await response.text();
                const result = {
                    prompt,
                    response: '',
                    model: this.model,
                    usage: {},
                    timestamp: new Date().toISOString(),
                    latencyMs,
                    error: `HTTP ${response.status}: ${errorText}`
                };
                this.results.push(result);
                return result;
            }

            const responseData = await response.json();

            // Extract response text
            let responseText = '';
            if (responseData.candidates && responseData.candidates.length > 0) {
                const candidate = responseData.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    responseText = candidate.content.parts[0].text || '';
                }
            }

            const result = {
                prompt,
                response: responseText,
                model: this.model,
                usage: responseData.usageMetadata || {},
                timestamp: new Date().toISOString(),
                latencyMs
            };

            this.results.push(result);
            return result;

        } catch (error) {
            const latencyMs = Date.now() - startTime;
            const result = {
                prompt,
                response: '',
                model: this.model,
                usage: {},
                timestamp: new Date().toISOString(),
                latencyMs,
                error: error.message
            };
            this.results.push(result);
            return result;
        }
    }

    /**
     * Evaluate multiple prompts with rate limiting
     *
     * @param {string[]} prompts - Array of text prompts to evaluate
     * @param {number} temperature - Sampling temperature
     * @param {number} maxTokens - Maximum tokens per response
     * @param {number} delayMs - Delay between requests in milliseconds
     * @returns {Promise<Object[]>} Array of evaluation result objects
     */
    async batchEvaluate(prompts, temperature = 0.7, maxTokens = 1024, delayMs = 1000) {
        const results = [];

        for (let i = 0; i < prompts.length; i++) {
            const prompt = prompts[i];
            console.log(`Evaluating prompt ${i + 1}/${prompts.length}: ${prompt.substring(0, 50)}...`);

            const result = await this.evaluateText(prompt, temperature, maxTokens);
            results.push(result);

            if (result.error) {
                console.log(`  Error: ${result.error}`);
            } else {
                console.log(`  Success: ${result.response.length} chars, ${result.latencyMs}ms`);
            }

            // Rate limiting delay (except for last request)
            if (i < prompts.length - 1) {
                await this.delay(delayMs);
            }
        }

        return results;
    }

    /**
     * Evaluate a prompt with an image
     *
     * @param {string} prompt - Text prompt describing the task
     * @param {string} imagePath - Path to image file
     * @param {number} temperature - Sampling temperature
     * @returns {Promise<Object>} Evaluation result object
     */
    async evaluateImage(prompt, imagePath, temperature = 0.3) {
        const startTime = Date.now();

        try {
            // Read and encode image
            const imageBuffer = await fs.readFile(imagePath);
            const imageData = imageBuffer.toString('base64');

            // Detect MIME type based on file extension
            const extension = path.extname(imagePath).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp',
                '.gif': 'image/gif'
            };
            const mimeType = mimeTypes[extension] || 'image/jpeg';

            const payload = {
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: imageData
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature,
                    maxOutputTokens: 1024
                }
            };

            const response = await fetch(
                `${this.baseUrl}/${this.model}:generateContent`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': this.apiKey
                    },
                    body: JSON.stringify(payload)
                }
            );

            const latencyMs = Date.now() - startTime;

            if (!response.ok) {
                const errorText = await response.text();
                const result = {
                    prompt: `[IMAGE] ${prompt}`,
                    response: '',
                    model: this.model,
                    usage: {},
                    timestamp: new Date().toISOString(),
                    latencyMs,
                    error: `HTTP ${response.status}: ${errorText}`
                };
                this.results.push(result);
                return result;
            }

            const responseData = await response.json();
            let responseText = '';

            if (responseData.candidates && responseData.candidates.length > 0) {
                const candidate = responseData.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    responseText = candidate.content.parts[0].text || '';
                }
            }

            const result = {
                prompt: `[IMAGE] ${prompt}`,
                response: responseText,
                model: this.model,
                usage: responseData.usageMetadata || {},
                timestamp: new Date().toISOString(),
                latencyMs
            };

            this.results.push(result);
            return result;

        } catch (error) {
            const latencyMs = Date.now() - startTime;
            const result = {
                prompt: `[IMAGE] ${prompt}`,
                response: '',
                model: this.model,
                usage: {},
                timestamp: new Date().toISOString(),
                latencyMs,
                error: error.message
            };
            this.results.push(result);
            return result;
        }
    }

    /**
     * Evaluate with function calling capabilities
     *
     * @param {string} prompt - Text prompt
     * @param {Object[]} functions - Array of function declarations
     * @param {Function} functionExecutor - Function to execute called functions
     * @returns {Promise<Object>} Evaluation result object
     */
    async evaluateWithFunctions(prompt, functions, functionExecutor) {
        const startTime = Date.now();

        try {
            const payload = {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                tools: [
                    {
                        function_declarations: functions
                    }
                ],
                toolConfig: {
                    functionCallingConfig: {
                        mode: "AUTO"
                    }
                },
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 1024
                }
            };

            let response = await fetch(
                `${this.baseUrl}/${this.model}:generateContent`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': this.apiKey
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            let responseData = await response.json();

            // Check for function calls
            const candidate = responseData.candidates[0];
            if (candidate.content && candidate.content.parts) {
                const functionCalls = candidate.content.parts.filter(part => part.functionCall);

                if (functionCalls.length > 0) {
                    // Execute functions
                    const functionResults = [];

                    for (const call of functionCalls) {
                        const result = await functionExecutor(call.functionCall.name, call.functionCall.args);
                        functionResults.push({
                            functionResponse: {
                                name: call.functionCall.name,
                                response: result
                            }
                        });
                    }

                    // Send function results back to model
                    payload.contents.push({
                        parts: functionResults
                    });

                    response = await fetch(
                        `${this.baseUrl}/${this.model}:generateContent`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-goog-api-key': this.apiKey
                            },
                            body: JSON.stringify(payload)
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
                    }

                    responseData = await response.json();
                }
            }

            const latencyMs = Date.now() - startTime;

            let responseText = '';
            if (responseData.candidates && responseData.candidates.length > 0) {
                const candidate = responseData.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    responseText = candidate.content.parts[0].text || '';
                }
            }

            const result = {
                prompt,
                response: responseText,
                model: this.model,
                usage: responseData.usageMetadata || {},
                timestamp: new Date().toISOString(),
                latencyMs,
                functionCalling: true
            };

            this.results.push(result);
            return result;

        } catch (error) {
            const latencyMs = Date.now() - startTime;
            const result = {
                prompt,
                response: '',
                model: this.model,
                usage: {},
                timestamp: new Date().toISOString(),
                latencyMs,
                error: error.message
            };
            this.results.push(result);
            return result;
        }
    }

    /**
     * Calculate basic statistics from evaluation results
     *
     * @returns {Object} Statistics object
     */
    getStatistics() {
        if (this.results.length === 0) {
            return { message: 'No evaluations performed yet' };
        }

        const successful = this.results.filter(r => !r.error);
        const failed = this.results.filter(r => r.error);

        const totalTokens = successful.reduce(
            (sum, r) => sum + (r.usage.totalTokenCount || 0), 0
        );

        const averageLatency = this.results.reduce(
            (sum, r) => sum + r.latencyMs, 0
        ) / this.results.length;

        const averageResponseLength = successful.length > 0
            ? successful.reduce((sum, r) => sum + r.response.length, 0) / successful.length
            : 0;

        return {
            totalEvaluations: this.results.length,
            successful: successful.length,
            failed: failed.length,
            successRate: (successful.length / this.results.length * 100).toFixed(1),
            averageLatencyMs: Math.round(averageLatency * 100) / 100,
            totalTokensUsed: totalTokens,
            averageResponseLength: Math.round(averageResponseLength * 100) / 100
        };
    }

    /**
     * Save evaluation results to a JSON file
     *
     * @param {string} filename - Output filename
     */
    async saveResults(filename = 'evaluation_results.json') {
        const data = {
            metadata: {
                model: this.model,
                totalEvaluations: this.results.length,
                generatedAt: new Date().toISOString()
            },
            statistics: this.getStatistics(),
            results: this.results
        };

        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`Results saved to ${filename}`);
    }

    /**
     * Print a summary of evaluation results
     */
    printSummary() {
        const stats = this.getStatistics();

        console.log('\n' + '='.repeat(50));
        console.log('EVALUATION SUMMARY');
        console.log('='.repeat(50));

        Object.entries(stats).forEach(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
            const capitalizedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);

            if (key === 'successRate') {
                console.log(`${capitalizedKey}: ${value}%`);
            } else if (typeof value === 'number' && value % 1 !== 0) {
                console.log(`${capitalizedKey}: ${value.toFixed(2)}`);
            } else {
                console.log(`${capitalizedKey}: ${value}`);
            }
        });

        console.log('\n' + '-'.repeat(50));
        console.log('RECENT RESULTS:');
        console.log('-'.repeat(50));

        // Show last 3 results
        const recentResults = this.results.slice(-3);
        recentResults.forEach(result => {
            const status = result.error ? 'ERROR' : 'SUCCESS';
            console.log(`${status} | ${result.prompt.substring(0, 40)}...`);
            if (result.error) {
                console.log(`         Error: ${result.error}`);
            } else {
                console.log(`         Response: ${result.response.substring(0, 60)}...`);
            }
            console.log(`         Latency: ${result.latencyMs}ms`);
            console.log();
        });
    }

    /**
     * Utility method to add delay between requests
     *
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Example usage of the BasicGeminiEvaluator
 */
async function main() {
    // Get API key from environment
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('Please set the GOOGLE_API_KEY environment variable');
        process.exit(1);
    }

    // Initialize evaluator
    const evaluator = new BasicGeminiEvaluator(apiKey, 'gemini-2.5-flash');

    console.log('Starting basic Gemini evaluation examples...');

    try {
        // Example 1: Single text evaluation
        console.log('\n1. Single text evaluation:');
        const result = await evaluator.evaluateText(
            'Explain machine learning in one paragraph',
            0.3
        );
        console.log(`Response: ${result.response.substring(0, 100)}...`);

        // Example 2: Batch evaluation
        console.log('\n2. Batch evaluation:');
        const prompts = [
            'What is JavaScript?',
            'Explain quantum computing briefly',
            'Write a haiku about programming',
            'List 3 benefits of cloud computing'
        ];

        await evaluator.batchEvaluate(prompts, 0.5);

        // Example 3: Function calling evaluation
        console.log('\n3. Function calling evaluation:');
        const mathFunctions = [
            {
                name: 'calculate',
                description: 'Perform mathematical calculations',
                parameters: {
                    type: 'object',
                    properties: {
                        expression: {
                            type: 'string',
                            description: 'Mathematical expression to evaluate'
                        }
                    },
                    required: ['expression']
                }
            }
        ];

        const functionExecutor = async (name, args) => {
            if (name === 'calculate') {
                try {
                    // Simple expression evaluation (be careful in production!)
                    // FIXED: Corrected regex with single backslashes
                    const result = eval(args.expression.replace(/[^0-9+\-*/().\s]/g, ''));
                    return { result };
                } catch (error) {
                    return { error: 'Invalid expression' };
                }
            }
            return { error: 'Unknown function' };
        };

        const functionResult = await evaluator.evaluateWithFunctions(
            'Calculate the area of a circle with radius 5 (use π ≈ 3.14159)',
            mathFunctions,
            functionExecutor
        );
        console.log(`Function result: ${functionResult.response.substring(0, 100)}...`);

        // Example 4: Image evaluation (if image file exists)
        const imagePath = 'sample_image.jpg';
        try {
            await fs.access(imagePath);
            console.log('\n4. Image evaluation:');
            const imageResult = await evaluator.evaluateImage(
                'Describe what you see in this image',
                imagePath
            );
            console.log(`Image analysis: ${imageResult.response.substring(0, 100)}...`);
        } catch (error) {
            console.log('\n4. Skipping image evaluation (no sample_image.jpg found)');
        }

        // Show summary
        evaluator.printSummary();

        // Save results
        await evaluator.saveResults('basic_evaluation_results.json');

    } catch (error) {
        console.error('Evaluation failed:', error);
        process.exit(1);
    }
}

// Export the class for use as a module
module.exports = BasicGeminiEvaluator;

// Run main function if this script is executed directly
if (require.main === module) {
    main().catch(console.error);
}