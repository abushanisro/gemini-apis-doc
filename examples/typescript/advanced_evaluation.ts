#!/usr/bin/env ts-node

/**
 * Advanced Gemini API Evaluation Framework in TypeScript
 *
 * This module provides a comprehensive evaluation framework for Gemini models
 * with advanced features like streaming, batch processing, metrics collection,
 * and comprehensive error handling.
 */

import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EventEmitter } from 'events';

// Type definitions
interface GeminiConfig {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
    responseMimeType?: string;
    responseSchema?: Record<string, any>;
}

interface SafetySettings {
    category: string;
    threshold: string;
}

interface FunctionDeclaration {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
}

interface EvaluationResult {
    id: string;
    prompt: string;
    response: string;
    model: string;
    config: GeminiConfig;
    usage: UsageMetadata;
    timestamp: string;
    latencyMs: number;
    metadata: Record<string, any>;
    error?: string;
    safetyRatings?: any[];
}

interface UsageMetadata {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
}

interface EvaluationMetrics {
    totalEvaluations: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    averageLatency: number;
    medianLatency: number;
    p95Latency: number;
    totalTokensUsed: number;
    averageTokensPerRequest: number;
    costEstimate: number;
    errorBreakdown: Record<string, number>;
    throughput: number;
    startTime: string;
    endTime: string;
    durationSeconds: number;
}

interface BatchOptions {
    concurrency?: number;
    retryAttempts?: number;
    retryDelayMs?: number;
    onProgress?: (completed: number, total: number) => void;
    onError?: (error: Error, prompt: string) => void;
}

interface StreamingOptions {
    onChunk?: (chunk: string, fullResponse: string) => void;
    onComplete?: (fullResponse: string) => void;
    onError?: (error: Error) => void;
}

class AdvancedGeminiEvaluator extends EventEmitter {
    private apiKey: string;
    private model: string;
    private baseUrl: string;
    private defaultConfig: GeminiConfig;
    private defaultSafetySettings: SafetySettings[];
    private results: EvaluationResult[] = [];
    private startTime: Date | null = null;

    constructor(
        apiKey: string,
        model: string = 'gemini-2.5-pro',
        defaultConfig: GeminiConfig = {},
        safetySettings: SafetySettings[] = []
    ) {
        super();
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.defaultConfig = {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.9,
            ...defaultConfig
        };
        this.defaultSafetySettings = safetySettings;
    }

    /**
     * Evaluate a single text prompt with comprehensive error handling
     */
    async evaluateText(
        prompt: string,
        config: GeminiConfig = {},
        metadata: Record<string, any> = {}
    ): Promise<EvaluationResult> {
        const id = this.generateId();
        const startTime = Date.now();

        if (!this.startTime) {
            this.startTime = new Date();
        }

        try {
            const mergedConfig = { ...this.defaultConfig, ...config };

            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: mergedConfig,
                ...(this.defaultSafetySettings.length > 0 && {
                    safetySettings: this.defaultSafetySettings
                })
            };

            const response = await this.makeRequest(payload);
            const latencyMs = Date.now() - startTime;

            let responseText = '';
            let safetyRatings: any[] = [];

            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    responseText = candidate.content.parts[0].text || '';
                }
                safetyRatings = candidate.safetyRatings || [];
            }

            const result: EvaluationResult = {
                id,
                prompt,
                response: responseText,
                model: this.model,
                config: mergedConfig,
                usage: response.usageMetadata || {},
                timestamp: new Date().toISOString(),
                latencyMs,
                metadata: { ...metadata, type: 'text' },
                safetyRatings
            };

            this.results.push(result);
            this.emit('evaluation:complete', result);
            return result;

        } catch (error) {
            const latencyMs = Date.now() - startTime;
            const result: EvaluationResult = {
                id,
                prompt,
                response: '',
                model: this.model,
                config: { ...this.defaultConfig, ...config },
                usage: {},
                timestamp: new Date().toISOString(),
                latencyMs,
                metadata: { ...metadata, type: 'text' },
                error: error instanceof Error ? error.message : String(error)
            };

            this.results.push(result);
            this.emit('evaluation:error', error, result);
            throw error;
        }
    }

    /**
     * Evaluate with multimodal inputs (text + images/videos/audio)
     */
    async evaluateMultimodal(
        text: string,
        mediaFiles: Array<{
            type: 'image' | 'video' | 'audio';
            path?: string;
            data?: string;
            mimeType: string;
            fileUri?: string;
        }>,
        config: GeminiConfig = {},
        metadata: Record<string, any> = {}
    ): Promise<EvaluationResult> {
        const id = this.generateId();
        const startTime = Date.now();

        try {
            const parts: any[] = [{ text }];

            for (const media of mediaFiles) {
                if (media.type === 'image' || media.type === 'audio') {
                    let mediaData = media.data;
                    if (!mediaData && media.path) {
                        const buffer = await fs.readFile(media.path);
                        mediaData = buffer.toString('base64');
                    }

                    if (mediaData) {
                        parts.push({
                            inline_data: {
                                mime_type: media.mimeType,
                                data: mediaData
                            }
                        });
                    }
                } else if (media.type === 'video' && media.fileUri) {
                    parts.push({
                        file_data: {
                            mime_type: media.mimeType,
                            file_uri: media.fileUri
                        }
                    });
                }
            }

            const payload = {
                contents: [
                    {
                        role: "user",
                        parts
                    }
                ],
                generationConfig: { ...this.defaultConfig, ...config },
                ...(this.defaultSafetySettings.length > 0 && {
                    safetySettings: this.defaultSafetySettings
                })
            };

            const response = await this.makeRequest(payload);
            const latencyMs = Date.now() - startTime;

            let responseText = '';
            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    responseText = candidate.content.parts[0].text || '';
                }
            }

            const result: EvaluationResult = {
                id,
                prompt: `[MULTIMODAL] ${text}`,
                response: responseText,
                model: this.model,
                config: { ...this.defaultConfig, ...config },
                usage: response.usageMetadata || {},
                timestamp: new Date().toISOString(),
                latencyMs,
                metadata: {
                    ...metadata,
                    type: 'multimodal',
                    mediaCount: mediaFiles.length,
                    mediaTypes: mediaFiles.map(m => m.type)
                }
            };

            this.results.push(result);
            this.emit('evaluation:complete', result);
            return result;

        } catch (error) {
            const latencyMs = Date.now() - startTime;
            const result: EvaluationResult = {
                id,
                prompt: `[MULTIMODAL] ${text}`,
                response: '',
                model: this.model,
                config: { ...this.defaultConfig, ...config },
                usage: {},
                timestamp: new Date().toISOString(),
                latencyMs,
                metadata: { ...metadata, type: 'multimodal' },
                error: error instanceof Error ? error.message : String(error)
            };

            this.results.push(result);
            this.emit('evaluation:error', error, result);
            throw error;
        }
    }

    /**
     * Evaluate with function calling capabilities
     */
    async evaluateWithFunctions(
        prompt: string,
        functions: FunctionDeclaration[],
        functionExecutor: (name: string, args: any) => Promise<any>,
        config: GeminiConfig = {},
        metadata: Record<string, any> = {}
    ): Promise<EvaluationResult> {
        const id = this.generateId();
        const startTime = Date.now();

        try {
            const initialPayload = {
                contents: [
                    {
                        role: "user",
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
                generationConfig: { ...this.defaultConfig, ...config }
            };

            let response = await this.makeRequest(initialPayload);

            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                const functionCalls = candidate.content.parts.filter(
                    (part: any) => part.functionCall
                );

                if (functionCalls.length > 0) {
                    const functionResults = [];

                    for (const call of functionCalls) {
                        try {
                            const result = await functionExecutor(
                                call.functionCall.name,
                                call.functionCall.args
                            );
                            functionResults.push({
                                functionResponse: {
                                    name: call.functionCall.name,
                                    response: result
                                }
                            });
                        } catch (funcError) {
                            functionResults.push({
                                functionResponse: {
                                    name: call.functionCall.name,
                                    response: {
                                        error: funcError instanceof Error
                                            ? funcError.message
                                            : String(funcError)
                                    }
                                }
                            });
                        }
                    }

                    const followUpPayload = {
                        contents: [
                            {
                                role: "user",
                                parts: [{ text: prompt }]
                            },
                            {
                                role: "model",
                                parts: candidate.content.parts
                            },
                            {
                                role: "user",
                                parts: functionResults
                            }
                        ],
                        tools: initialPayload.tools,
                        toolConfig: initialPayload.toolConfig,
                        generationConfig: initialPayload.generationConfig
                    };

                    response = await this.makeRequest(followUpPayload);
                }
            }

            const latencyMs = Date.now() - startTime;

            let responseText = '';
            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    const textPart = candidate.content.parts.find((p: any) => p.text);
                    responseText = textPart?.text || '';
                }
            }

            const result: EvaluationResult = {
                id,
                prompt: `[FUNCTION] ${prompt}`,
                response: responseText,
                model: this.model,
                config: { ...this.defaultConfig, ...config },
                usage: response.usageMetadata || {},
                timestamp: new Date().toISOString(),
                latencyMs,
                metadata: {
                    ...metadata,
                    type: 'function_calling',
                    functionsAvailable: functions.length
                }
            };

            this.results.push(result);
            this.emit('evaluation:complete', result);
            return result;

        } catch (error) {
            const latencyMs = Date.now() - startTime;
            const result: EvaluationResult = {
                id,
                prompt: `[FUNCTION] ${prompt}`,
                response: '',
                model: this.model,
                config: { ...this.defaultConfig, ...config },
                usage: {},
                timestamp: new Date().toISOString(),
                latencyMs,
                metadata: { ...metadata, type: 'function_calling' },
                error: error instanceof Error ? error.message : String(error)
            };

            this.results.push(result);
            this.emit('evaluation:error', error, result);
            throw error;
        }
    }

    /**
     * Streaming evaluation with real-time response chunks
     */
    async evaluateStreaming(
        prompt: string,
        config: GeminiConfig = {},
        options: StreamingOptions = {}
    ): Promise<EvaluationResult> {
        const id = this.generateId();
        const startTime = Date.now();

        try {
            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: { ...this.defaultConfig, ...config }
            };

            const response = await fetch(
                `${this.baseUrl}/${this.model}:streamGenerateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            let fullResponse = '';
            let totalTokens = 0;

            if (!response.body) {
                throw new Error('No readable stream available');
            }

            const body = response.body as any;
            
            return new Promise((resolve, reject) => {
                let buffer = '';

                body.on('data', (chunk: Buffer) => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                                    const text = data.candidates[0].content.parts[0]?.text || '';
                                    fullResponse += text;
                                    options.onChunk?.(text, fullResponse);

                                    if (data.usageMetadata) {
                                        totalTokens = data.usageMetadata.totalTokenCount || 0;
                                    }
                                }
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                });

                body.on('end', () => {
                    options.onComplete?.(fullResponse);

                    const latencyMs = Date.now() - startTime;

                    const result: EvaluationResult = {
                        id,
                        prompt,
                        response: fullResponse,
                        model: this.model,
                        config: { ...this.defaultConfig, ...config },
                        usage: { totalTokenCount: totalTokens },
                        timestamp: new Date().toISOString(),
                        latencyMs,
                        metadata: { type: 'streaming' }
                    };

                    this.results.push(result);
                    this.emit('evaluation:complete', result);
                    resolve(result);
                });

                body.on('error', (err: Error) => {
                    options.onError?.(err);

                    const latencyMs = Date.now() - startTime;
                    const result: EvaluationResult = {
                        id,
                        prompt,
                        response: '',
                        model: this.model,
                        config: { ...this.defaultConfig, ...config },
                        usage: {},
                        timestamp: new Date().toISOString(),
                        latencyMs,
                        metadata: { type: 'streaming' },
                        error: err.message
                    };

                    this.results.push(result);
                    this.emit('evaluation:error', err, result);
                    reject(err);
                });
            });

        } catch (error) {
            options.onError?.(error instanceof Error ? error : new Error(String(error)));

            const latencyMs = Date.now() - startTime;
            const result: EvaluationResult = {
                id,
                prompt,
                response: '',
                model: this.model,
                config: { ...this.defaultConfig, ...config },
                usage: {},
                timestamp: new Date().toISOString(),
                latencyMs,
                metadata: { type: 'streaming' },
                error: error instanceof Error ? error.message : String(error)
            };

            this.results.push(result);
            this.emit('evaluation:error', error, result);
            throw error;
        }
    }

    /**
     * Advanced batch evaluation with concurrency control and retry logic
     */
    async batchEvaluate(
        prompts: string[],
        config: GeminiConfig = {},
        options: BatchOptions = {}
    ): Promise<EvaluationResult[]> {
        const {
            concurrency = 5,
            retryAttempts = 3,
            retryDelayMs = 1000,
            onProgress,
            onError
        } = options;

        const results: EvaluationResult[] = [];
        let completed = 0;

        const chunks = this.chunkArray(prompts, concurrency);

        for (const chunk of chunks) {
            const chunkPromises = chunk.map(async (prompt) => {
                let lastError: Error | null = null;

                for (let attempt = 1; attempt <= retryAttempts; attempt++) {
                    try {
                        const result = await this.evaluateText(
                            prompt,
                            config,
                            { attempt, batchSize: prompts.length }
                        );
                        completed++;
                        onProgress?.(completed, prompts.length);
                        return result;
                    } catch (error) {
                        lastError = error instanceof Error ? error : new Error(String(error));

                        if (attempt < retryAttempts) {
                            await this.delay(retryDelayMs * attempt);
                        }
                    }
                }

                onError?.(lastError!, prompt);
                completed++;
                onProgress?.(completed, prompts.length);

                return {
                    id: this.generateId(),
                    prompt,
                    response: '',
                    model: this.model,
                    config,
                    usage: {},
                    timestamp: new Date().toISOString(),
                    latencyMs: 0,
                    metadata: { type: 'batch', failed: true },
                    error: lastError!.message
                } as EvaluationResult;
            });

            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);

            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await this.delay(500);
            }
        }

        return results;
    }

    /**
     * Calculate comprehensive evaluation metrics
     */
    calculateMetrics(): EvaluationMetrics {
        if (this.results.length === 0) {
            throw new Error('No evaluations to calculate metrics from');
        }

        const successful = this.results.filter(r => !r.error);
        const failed = this.results.filter(r => r.error);

        const latencies = this.results.map(r => r.latencyMs).sort((a, b) => a - b);
        const totalTokens = successful.reduce((sum, r) => sum + (r.usage.totalTokenCount || 0), 0);

        const p95Index = Math.floor(latencies.length * 0.95);
        const medianIndex = Math.floor(latencies.length * 0.5);

        const errorBreakdown: Record<string, number> = {};
        failed.forEach(result => {
            const errorType = this.categorizeError(result.error || 'Unknown');
            errorBreakdown[errorType] = (errorBreakdown[errorType] || 0) + 1;
        });

        const endTime = new Date();
        const startTime = this.startTime || endTime;
        const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

        return {
            totalEvaluations: this.results.length,
            successCount: successful.length,
            failureCount: failed.length,
            successRate: (successful.length / this.results.length) * 100,
            averageLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
            medianLatency: latencies.length > 0 ? latencies[medianIndex] : 0,
            p95Latency: latencies.length > 0 ? latencies[p95Index] : 0,
            totalTokensUsed: totalTokens,
            averageTokensPerRequest: successful.length > 0 ? totalTokens / successful.length : 0,
            costEstimate: this.estimateCost(totalTokens),
            errorBreakdown,
            throughput: this.results.length / Math.max(durationSeconds, 1),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            durationSeconds
        };
    }

    /**
     * Export evaluation results in various formats
     */
    async exportResults(
        filename: string,
        format: 'json' | 'csv' = 'json',
        includeMetrics: boolean = true
    ): Promise<void> {
        const data = {
            ...(includeMetrics && { metrics: this.calculateMetrics() }),
            metadata: {
                model: this.model,
                exportedAt: new Date().toISOString(),
                totalEvaluations: this.results.length
            },
            results: this.results
        };

        switch (format) {
            case 'json':
                await fs.writeFile(filename, JSON.stringify(data, null, 2));
                break;
            case 'csv':
                const csv = this.convertToCSV(this.results);
                await fs.writeFile(filename, csv);
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }

        console.log(`Results exported to ${filename}`);
    }

    /**
     * Generate comprehensive evaluation report
     */
    generateReport(): string {
        const metrics = this.calculateMetrics();

        let report = '\n';
        report += '='.repeat(60) + '\n';
        report += 'GEMINI EVALUATION REPORT\n';
        report += '='.repeat(60) + '\n\n';

        report += `Model: ${this.model}\n`;
        report += `Evaluation Period: ${metrics.startTime} to ${metrics.endTime}\n`;
        report += `Duration: ${metrics.durationSeconds.toFixed(2)} seconds\n\n`;

        report += 'PERFORMANCE METRICS:\n';
        report += '-'.repeat(30) + '\n';
        report += `Total Evaluations: ${metrics.totalEvaluations}\n`;
        report += `Success Rate: ${metrics.successRate.toFixed(1)}%\n`;
        report += `Throughput: ${metrics.throughput.toFixed(2)} requests/second\n`;
        report += `Average Latency: ${metrics.averageLatency.toFixed(2)}ms\n`;
        report += `Median Latency: ${metrics.medianLatency.toFixed(2)}ms\n`;
        report += `95th Percentile Latency: ${metrics.p95Latency.toFixed(2)}ms\n\n`;

        report += 'TOKEN USAGE:\n';
        report += '-'.repeat(30) + '\n';
        report += `Total Tokens: ${metrics.totalTokensUsed.toLocaleString()}\n`;
        report += `Average Tokens per Request: ${metrics.averageTokensPerRequest.toFixed(2)}\n`;
        report += `Estimated Cost: $${metrics.costEstimate.toFixed(4)}\n\n`;

        if (Object.keys(metrics.errorBreakdown).length > 0) {
            report += 'ERROR BREAKDOWN:\n';
            report += '-'.repeat(30) + '\n';
            Object.entries(metrics.errorBreakdown).forEach(([error, count]) => {
                report += `${error}: ${count}\n`;
            });
            report += '\n';
        }

        report += 'SAMPLE RESULTS:\n';
        report += '-'.repeat(30) + '\n';
        const sampleResults = this.results.slice(0, 3);
        sampleResults.forEach((result, index) => {
            const status = result.error ? 'ERROR' : 'SUCCESS';
            report += `${index + 1}. ${status} - ${result.prompt.substring(0, 50)}...\n`;
            report += `   Response: ${result.response.substring(0, 80)}...\n`;
            report += `   Latency: ${result.latencyMs}ms\n\n`;
        });

        return report;
    }

    private async makeRequest(payload: any): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    }

    private generateId(): string {
        return `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private categorizeError(error: string): string {
        if (error.includes('401')) return 'Authentication Error';
        if (error.includes('403')) return 'Permission Denied';
        if (error.includes('429')) return 'Rate Limit Exceeded';
        if (error.includes('500')) return 'Server Error';
        if (error.includes('timeout')) return 'Timeout Error';
        return 'Unknown Error';
    }

    private estimateCost(totalTokens: number): number {
        const costPerMillionTokens: Record<string, number> = {
            'gemini-2.5-pro': 3.5,
            'gemini-2.5-flash': 0.15,
            'gemini-2.5-flash-8b': 0.075,
            'gemini-1.5-pro': 1.25,
            'gemini-1.5-flash': 0.075
        };

        const rate = costPerMillionTokens[this.model] || 1.0;
        return (totalTokens / 1_000_000) * rate;
    }

    private convertToCSV(results: EvaluationResult[]): string {
        const headers = [
            'id',
            'timestamp',
            'prompt',
            'response',
            'model',
            'latencyMs',
            'totalTokens',
            'type',
            'error'
        ];

        const rows = results.map(result => [
            result.id,
            result.timestamp,
            `"${result.prompt.replace(/"/g, '""')}"`,
            `"${result.response.replace(/"/g, '""')}"`,
            result.model,
            result.latencyMs,
            result.usage.totalTokenCount || 0,
            result.metadata.type || 'text',
            result.error || ''
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    clearResults(): void {
        this.results = [];
        this.startTime = null;
    }

    getResults(): EvaluationResult[] {
        return [...this.results];
    }
}

async function main() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('Please set the GOOGLE_API_KEY environment variable');
        process.exit(1);
    }

    const evaluator = new AdvancedGeminiEvaluator(
        apiKey,
        'gemini-2.0-flash-exp',
        {
            temperature: 0.3,
            maxOutputTokens: 1024
        },
        [
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE'
            }
        ]
    );

    evaluator.on('evaluation:complete', (result: EvaluationResult) => {
        console.log(`Completed: ${result.prompt.substring(0, 30)}...`);
    });

    evaluator.on('evaluation:error', (error: Error, result: EvaluationResult) => {
        console.log(`Failed: ${result.prompt.substring(0, 30)}... (${error.message})`);
    });

    console.log('Starting advanced Gemini evaluation...\n');

    try {
        const prompts = [
            'Explain quantum computing principles'
        ];

        console.log('Running batch evaluation...');
        const batchResults = await evaluator.batchEvaluate(
            prompts,
            { temperature: 0.2 },
            {
                concurrency: 3,
                onProgress: (completed: number, total: number) => {
                    console.log(`Progress: ${completed}/${total} (${(completed/total*100).toFixed(1)}%)`);
                }
            }
        );

        console.log('\nTesting function calling...');
        const mathFunctions: FunctionDeclaration[] = [
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

        const functionExecutor = async (name: string, args: any) => {
            if (name === 'calculate') {
                try {
                    const sanitized = args.expression.replace(/[^0-9+\-*/().\s]/g, '');
                    const result = eval(sanitized);
                    return { result };
                } catch (error) {
                    return { error: 'Invalid expression' };
                }
            }
            return { error: 'Unknown function' };
        };

        await evaluator.evaluateWithFunctions(
            'Calculate the area of a circle with radius 7. Use pi equals 3.14159',
            mathFunctions,
            functionExecutor
        );

        console.log('\nStarting streaming evaluation...');
        console.log('Response: ');
        await evaluator.evaluateStreaming(
            'Write a very short haiku about artificial intelligence',
            { temperature: 0.8, maxOutputTokens: 100 },
            {
                onChunk: (chunk: string) => {
                    process.stdout.write(chunk);
                },
                onComplete: (fullResponse: string) => {
                    console.log('\n\nStreaming complete');
                }
            }
        );

        console.log('\n' + '='.repeat(60));
        const report = evaluator.generateReport();
        console.log(report);

        console.log('Exporting results...');
        await evaluator.exportResults('advanced_evaluation_results.json');
        await evaluator.exportResults('advanced_evaluation_results.csv', 'csv');
        
        console.log('\nEvaluation complete. Results exported successfully.');

    } catch (error) {
        console.error('\nEvaluation failed:', error);
        process.exit(1);
    }
}

export default AdvancedGeminiEvaluator;
export type {
    GeminiConfig,
    SafetySettings,
    FunctionDeclaration,
    EvaluationResult,
    UsageMetadata,
    EvaluationMetrics,
    BatchOptions,
    StreamingOptions
};

if (require.main === module) {
    main().catch(console.error);
}