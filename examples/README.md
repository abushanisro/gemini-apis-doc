# Code Examples 

Comprehensive code examples for evaluating Gemini models across different programming languages and frameworks.

##  Table of Contents

1. [Python Examples](#python-examples)
2. [JavaScript Examples](#javascript-examples)
3. [TypeScript Examples](#typescript-examples)
4. [Framework Integration Examples](#framework-integration-examples)
5. [Evaluation Pipeline Examples](#evaluation-pipeline-examples)

## Python Examples

### Basic Text Generation

#### Simple Text Evaluation
```python
import os
import requests
import json

def evaluate_text_generation(prompt, model="gemini-2.5-pro"):
    """
    Evaluate basic text generation capabilities
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": os.getenv("GOOGLE_API_KEY")
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.0,  # Deterministic for evaluation
            "maxOutputTokens": 1024,
            "topP": 1.0
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()

    result = response.json()
    return {
        "prompt": prompt,
        "response": result["candidates"][0]["content"]["parts"][0]["text"],
        "usage": result.get("usageMetadata", {}),
        "model": model
    }

# Example usage
if __name__ == "__main__":
    prompts = [
        "Explain quantum computing in simple terms",
        "Write a Python function to calculate fibonacci numbers",
        "What are the benefits of renewable energy?"
    ]

    results = []
    for prompt in prompts:
        result = evaluate_text_generation(prompt)
        results.append(result)
        print(f"Prompt: {prompt}")
        print(f"Response: {result['response'][:100]}...")
        print("---")

    # Save results
    with open("evaluation_results.json", "w") as f:
        json.dump(results, f, indent=2)
```

### Advanced Multimodal Evaluation

#### Image Analysis
```python
import base64
import mimetypes
from pathlib import Path

class GeminiMultimodalEvaluator:
    def __init__(self, api_key, model="gemini-2.5-pro"):
        self.api_key = api_key
        self.model = model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def encode_image(self, image_path):
        """Encode image to base64"""
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type or not mime_type.startswith('image'):
            raise ValueError(f"Invalid image type: {mime_type}")

        with open(image_path, "rb") as image_file:
            encoded_data = base64.b64encode(image_file.read()).decode('utf-8')

        return {
            "inline_data": {
                "mime_type": mime_type,
                "data": encoded_data
            }
        }

    def evaluate_image_understanding(self, image_path, prompt):
        """Evaluate image understanding capabilities"""
        image_data = self.encode_image(image_path)

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        image_data
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 1024
            }
        }

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }

        response = requests.post(
            f"{self.base_url}/{self.model}:generateContent",
            headers=headers,
            json=payload
        )

        response.raise_for_status()
        return response.json()

    def evaluate_multiple_images(self, image_paths, prompt):
        """Evaluate with multiple images"""
        parts = [{"text": prompt}]

        for image_path in image_paths:
            parts.append(self.encode_image(image_path))

        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2048
            }
        }

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }

        response = requests.post(
            f"{self.base_url}/{self.model}:generateContent",
            headers=headers,
            json=payload
        )

        response.raise_for_status()
        return response.json()

# Example usage
def run_multimodal_evaluation():
    evaluator = GeminiMultimodalEvaluator(os.getenv("GOOGLE_API_KEY"))

    # Single image evaluation
    result1 = evaluator.evaluate_image_understanding(
        "chart.jpg",
        "Extract all data points from this chart and format as JSON"
    )

    # Multiple image comparison
    result2 = evaluator.evaluate_multiple_images(
        ["image1.jpg", "image2.jpg"],
        "Compare these two images and identify the key differences"
    )

    return [result1, result2]
```

### Function Calling Evaluation

#### Mathematical Calculator Tool
```python
import math
import re

class MathCalculatorEvaluator:
    def __init__(self, api_key, model="gemini-2.5-pro"):
        self.api_key = api_key
        self.model = model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def get_math_functions(self):
        """Define mathematical functions for evaluation"""
        return [
            {
                "name": "calculate",
                "description": "Perform mathematical calculations",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": "Mathematical expression to evaluate (e.g., '2 + 3 * 4')"
                        }
                    },
                    "required": ["expression"]
                }
            },
            {
                "name": "solve_equation",
                "description": "Solve algebraic equations",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "equation": {
                            "type": "string",
                            "description": "Equation to solve (e.g., 'x^2 + 5x + 6 = 0')"
                        },
                        "variable": {
                            "type": "string",
                            "description": "Variable to solve for",
                            "default": "x"
                        }
                    },
                    "required": ["equation"]
                }
            }
        ]

    def execute_function(self, function_name, args):
        """Execute the called function"""
        if function_name == "calculate":
            return self._calculate(args["expression"])
        elif function_name == "solve_equation":
            return self._solve_equation(args["equation"], args.get("variable", "x"))
        else:
            return {"error": f"Unknown function: {function_name}"}

    def _calculate(self, expression):
        """Safely evaluate mathematical expressions"""
        try:
            # Remove spaces and validate expression
            expression = expression.replace(" ", "")

            # Allow only safe mathematical operations
            allowed_chars = set('0123456789+-*/().^')
            if not all(c in allowed_chars for c in expression):
                return {"error": "Invalid characters in expression"}

            # Replace ^ with ** for Python evaluation
            expression = expression.replace("^", "**")

            # Evaluate safely
            result = eval(expression, {"__builtins__": {}}, {"sin": math.sin, "cos": math.cos, "tan": math.tan, "sqrt": math.sqrt, "log": math.log, "pi": math.pi, "e": math.e})

            return {"result": result, "expression": expression}

        except Exception as e:
            return {"error": str(e)}

    def _solve_equation(self, equation, variable):
        """Simple equation solver (placeholder implementation)"""
        # This is a simplified implementation
        # In practice, you might use sympy or similar library
        try:
            # Parse quadratic equation ax^2 + bx + c = 0
            pattern = r'(-?\d*)\*?x\^?2?\s*([+-]\s*\d*)\*?x?\s*([+-]\s*\d+)\s*=\s*0'
            match = re.match(pattern, equation.replace(" ", ""))

            if match:
                a = float(match.group(1) or "1")
                b = float(match.group(2).replace(" ", "") or "0")
                c = float(match.group(3).replace(" ", "") or "0")

                discriminant = b**2 - 4*a*c
                if discriminant >= 0:
                    x1 = (-b + math.sqrt(discriminant)) / (2*a)
                    x2 = (-b - math.sqrt(discriminant)) / (2*a)
                    return {"solutions": [x1, x2], "discriminant": discriminant}
                else:
                    return {"error": "No real solutions", "discriminant": discriminant}

            return {"error": "Equation format not supported"}

        except Exception as e:
            return {"error": str(e)}

    def evaluate_math_problem(self, problem):
        """Evaluate mathematical problem-solving capabilities"""
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": problem}
                    ]
                }
            ],
            "tools": [
                {
                    "function_declarations": self.get_math_functions()
                }
            ],
            "toolConfig": {
                "functionCallingConfig": {
                    "mode": "AUTO"
                }
            },
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 1024
            }
        }

        return self._make_request_with_function_calling(payload)

    def _make_request_with_function_calling(self, payload):
        """Handle request with potential function calling"""
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }

        response = requests.post(
            f"{self.base_url}/{self.model}:generateContent",
            headers=headers,
            json=payload
        )

        response.raise_for_status()
        result = response.json()

        # Check if model wants to call a function
        if "candidates" in result and result["candidates"]:
            candidate = result["candidates"][0]
            if "content" in candidate:
                for part in candidate["content"]["parts"]:
                    if "functionCall" in part:
                        # Execute the function
                        function_call = part["functionCall"]
                        function_result = self.execute_function(
                            function_call["name"],
                            function_call["args"]
                        )

                        # Send function result back to model
                        follow_up_payload = {
                            "contents": payload["contents"] + [
                                {
                                    "parts": [
                                        {
                                            "functionResponse": {
                                                "name": function_call["name"],
                                                "response": function_result
                                            }
                                        }
                                    ]
                                }
                            ],
                            "tools": payload["tools"],
                            "generationConfig": payload["generationConfig"]
                        }

                        follow_up_response = requests.post(
                            f"{self.base_url}/{self.model}:generateContent",
                            headers=headers,
                            json=follow_up_payload
                        )

                        follow_up_response.raise_for_status()
                        return {
                            "initial_response": result,
                            "function_call": function_call,
                            "function_result": function_result,
                            "final_response": follow_up_response.json()
                        }

        return {"response": result}

# Example usage
def run_math_evaluation():
    evaluator = MathCalculatorEvaluator(os.getenv("GOOGLE_API_KEY"))

    math_problems = [
        "Calculate the area of a circle with radius 5",
        "Solve the quadratic equation: x^2 + 5x + 6 = 0",
        "What is the derivative of x^3 + 2x^2 + x + 1?",
        "Calculate the factorial of 10"
    ]

    results = []
    for problem in math_problems:
        result = evaluator.evaluate_math_problem(problem)
        results.append({
            "problem": problem,
            "result": result
        })

    return results
```

## JavaScript Examples

### Basic Node.js Evaluation

#### Simple Text Generation
```javascript
const fetch = require('node-fetch');
const fs = require('fs').promises;

class GeminiEvaluator {
    constructor(apiKey, model = 'gemini-2.5-pro') {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    async evaluateTextGeneration(prompt, config = {}) {
        const defaultConfig = {
            temperature: 0.0,
            maxOutputTokens: 1024,
            topP: 1.0
        };

        const generationConfig = { ...defaultConfig, ...config };

        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
            generationConfig
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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        return {
            prompt,
            response: result.candidates[0].content.parts[0].text,
            usage: result.usageMetadata || {},
            model: this.model,
            timestamp: new Date().toISOString()
        };
    }

    async batchEvaluate(prompts, config = {}) {
        const results = [];

        for (const prompt of prompts) {
            try {
                const result = await this.evaluateTextGeneration(prompt, config);
                results.push(result);
                console.log(` Completed: ${prompt.substring(0, 50)}...`);

                // Add delay to respect rate limits
                await this.delay(1000);
            } catch (error) {
                console.error(` Failed: ${prompt.substring(0, 50)}...`);
                results.push({
                    prompt,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }

        return results;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async saveResults(results, filename = 'evaluation_results.json') {
        await fs.writeFile(filename, JSON.stringify(results, null, 2));
        console.log(`Results saved to ${filename}`);
    }
}

// Example usage
async function runBasicEvaluation() {
    const evaluator = new GeminiEvaluator(process.env.GOOGLE_API_KEY);

    const prompts = [
        "Explain the concept of machine learning",
        "Write a JavaScript function to reverse a string",
        "What are the advantages of cloud computing?",
        "Describe the process of photosynthesis"
    ];

    const results = await evaluator.batchEvaluate(prompts);
    await evaluator.saveResults(results);

    // Calculate success rate
    const successful = results.filter(r => !r.error).length;
    console.log(`Success rate: ${successful}/${results.length} (${(successful/results.length*100).toFixed(1)}%)`);
}

if (require.main === module) {
    runBasicEvaluation().catch(console.error);
}

module.exports = GeminiEvaluator;
```

### Advanced Browser Integration

#### Client-Side Evaluation Framework
```javascript
class BrowserGeminiEvaluator {
    constructor(apiKey, model = 'gemini-2.5-pro') {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.evaluationHistory = [];
    }

    async evaluateWithImage(prompt, imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const base64Data = e.target.result.split(',')[1];
                    const mimeType = imageFile.type;

                    const payload = {
                        contents: [
                            {
                                parts: [
                                    { text: prompt },
                                    {
                                        inline_data: {
                                            mime_type: mimeType,
                                            data: base64Data
                                        }
                                    }
                                ]
                            }
                        ],
                        generationConfig: {
                            temperature: 0.3,
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

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();
                    const evaluationResult = {
                        prompt,
                        image: {
                            name: imageFile.name,
                            size: imageFile.size,
                            type: imageFile.type
                        },
                        response: result.candidates[0].content.parts[0].text,
                        usage: result.usageMetadata || {},
                        timestamp: new Date().toISOString()
                    };

                    this.evaluationHistory.push(evaluationResult);
                    resolve(evaluationResult);

                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(imageFile);
        });
    }

    async streamingEvaluation(prompt, onChunk, onComplete, onError) {
        try {
            const payload = {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024
                }
            };

            const response = await fetch(
                `${this.baseUrl}/${this.model}:streamGenerateContent`,
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                                const text = data.candidates[0].content.parts[0].text;
                                fullResponse += text;
                                onChunk(text, fullResponse);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }

            onComplete(fullResponse);

        } catch (error) {
            onError(error);
        }
    }

    createEvaluationReport() {
        const report = {
            totalEvaluations: this.evaluationHistory.length,
            averageResponseLength: 0,
            totalTokensUsed: 0,
            evaluationTypes: {},
            timeRange: {
                start: null,
                end: null
            }
        };

        if (this.evaluationHistory.length === 0) {
            return report;
        }

        let totalLength = 0;
        let totalTokens = 0;

        this.evaluationHistory.forEach(eval => {
            totalLength += eval.response.length;
            totalTokens += (eval.usage.totalTokenCount || 0);

            const type = eval.image ? 'multimodal' : 'text';
            report.evaluationTypes[type] = (report.evaluationTypes[type] || 0) + 1;

            const timestamp = new Date(eval.timestamp);
            if (!report.timeRange.start || timestamp < new Date(report.timeRange.start)) {
                report.timeRange.start = eval.timestamp;
            }
            if (!report.timeRange.end || timestamp > new Date(report.timeRange.end)) {
                report.timeRange.end = eval.timestamp;
            }
        });

        report.averageResponseLength = Math.round(totalLength / this.evaluationHistory.length);
        report.totalTokensUsed = totalTokens;

        return report;
    }

    exportResults(format = 'json') {
        const data = {
            report: this.createEvaluationReport(),
            evaluations: this.evaluationHistory
        };

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            return URL.createObjectURL(blob);
        } else if (format === 'csv') {
            const csv = this.convertToCSV(this.evaluationHistory);
            const blob = new Blob([csv], { type: 'text/csv' });
            return URL.createObjectURL(blob);
        }
    }

    convertToCSV(data) {
        const headers = ['timestamp', 'prompt', 'response', 'hasImage', 'tokenCount'];
        const rows = data.map(item => [
            item.timestamp,
            `"${item.prompt.replace(/"/g, '""')}"`,
            `"${item.response.replace(/"/g, '""')}"`,
            !!item.image,
            item.usage.totalTokenCount || 0
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\\n');
    }
}

// HTML Integration Example
function setupEvaluationUI() {
    const html = `
        <div id="gemini-evaluator">
            <h2>Gemini Evaluation Interface</h2>

            <div class="input-section">
                <textarea id="prompt-input" placeholder="Enter your evaluation prompt..." rows="4" cols="50"></textarea>
                <br>
                <input type="file" id="image-input" accept="image/*">
                <br>
                <button id="evaluate-btn">Evaluate</button>
                <button id="streaming-btn">Streaming Evaluate</button>
            </div>

            <div class="results-section">
                <h3>Results:</h3>
                <div id="results-container"></div>
            </div>

            <div class="controls-section">
                <button id="export-json">Export JSON</button>
                <button id="export-csv">Export CSV</button>
                <button id="clear-history">Clear History</button>
            </div>

            <div class="report-section">
                <h3>Evaluation Report:</h3>
                <pre id="report-display"></pre>
            </div>
        </div>
    `;

    document.body.innerHTML = html;

    const evaluator = new BrowserGeminiEvaluator(window.GOOGLE_API_KEY);

    // Event listeners
    document.getElementById('evaluate-btn').addEventListener('click', async () => {
        const prompt = document.getElementById('prompt-input').value;
        const imageFile = document.getElementById('image-input').files[0];

        try {
            let result;
            if (imageFile) {
                result = await evaluator.evaluateWithImage(prompt, imageFile);
            } else {
                // Implement text-only evaluation
                result = await evaluator.evaluateTextGeneration(prompt);
            }

            displayResult(result);
            updateReport();
        } catch (error) {
            console.error('Evaluation failed:', error);
            alert('Evaluation failed: ' + error.message);
        }
    });

    document.getElementById('streaming-btn').addEventListener('click', () => {
        const prompt = document.getElementById('prompt-input').value;
        const resultDiv = document.createElement('div');
        resultDiv.className = 'streaming-result';
        document.getElementById('results-container').appendChild(resultDiv);

        evaluator.streamingEvaluation(
            prompt,
            (chunk, fullResponse) => {
                resultDiv.innerHTML = `<strong>Streaming:</strong><br>${fullResponse.replace(/\\n/g, '<br>')}`;
            },
            (fullResponse) => {
                resultDiv.innerHTML = `<strong>Final:</strong><br>${fullResponse.replace(/\\n/g, '<br>')}`;
                updateReport();
            },
            (error) => {
                resultDiv.innerHTML = `<strong>Error:</strong> ${error.message}`;
            }
        );
    });

    document.getElementById('export-json').addEventListener('click', () => {
        const url = evaluator.exportResults('json');
        downloadFile(url, 'gemini-evaluation-results.json');
    });

    document.getElementById('export-csv').addEventListener('click', () => {
        const url = evaluator.exportResults('csv');
        downloadFile(url, 'gemini-evaluation-results.csv');
    });

    document.getElementById('clear-history').addEventListener('click', () => {
        evaluator.evaluationHistory = [];
        document.getElementById('results-container').innerHTML = '';
        updateReport();
    });

    function displayResult(result) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'evaluation-result';
        resultDiv.innerHTML = `
            <div style="border: 1px solid #ccc; margin: 10px 0; padding: 10px;">
                <strong>Prompt:</strong> ${result.prompt}<br>
                ${result.image ? `<strong>Image:</strong> ${result.image.name}<br>` : ''}
                <strong>Response:</strong> ${result.response}<br>
                <strong>Tokens:</strong> ${result.usage.totalTokenCount || 0}<br>
                <strong>Time:</strong> ${result.timestamp}
            </div>
        `;
        document.getElementById('results-container').appendChild(resultDiv);
    }

    function updateReport() {
        const report = evaluator.createEvaluationReport();
        document.getElementById('report-display').textContent = JSON.stringify(report, null, 2);
    }

    function downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize when DOM is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', setupEvaluationUI);
}
```

## TypeScript Examples

### Comprehensive Evaluation Framework

#### Type Definitions
```typescript
// types.ts
export interface GeminiConfig {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
    responseMimeType?: string;
    responseSchema?: object;
}

export interface EvaluationResult {
    prompt: string;
    response: string;
    model: string;
    usage: UsageMetadata;
    timestamp: string;
    metadata?: Record<string, any>;
    error?: string;
}

export interface UsageMetadata {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
}

export interface MultimodalInput {
    text: string;
    images?: ImageData[];
    videos?: VideoData[];
    audio?: AudioData[];
}

export interface ImageData {
    data: string;
    mimeType: string;
    name?: string;
}

export interface VideoData {
    fileUri: string;
    mimeType: string;
}

export interface AudioData {
    data: string;
    mimeType: string;
}

export interface FunctionDeclaration {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
}

export interface EvaluationMetrics {
    totalEvaluations: number;
    successCount: number;
    failureCount: number;
    averageLatency: number;
    totalTokensUsed: number;
    costEstimate: number;
    errorBreakdown: Record<string, number>;
}
```

#### Main Evaluator Class
```typescript
// gemini-evaluator.ts
import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import {
    GeminiConfig,
    EvaluationResult,
    MultimodalInput,
    FunctionDeclaration,
    EvaluationMetrics
} from './types';

export class GeminiEvaluator {
    private apiKey: string;
    private model: string;
    private baseUrl: string;
    private evaluationHistory: EvaluationResult[] = [];
    private defaultConfig: GeminiConfig;

    constructor(
        apiKey: string,
        model: string = 'gemini-2.5-pro',
        defaultConfig: GeminiConfig = {}
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.defaultConfig = {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.9,
            ...defaultConfig
        };
    }

    async evaluateText(
        prompt: string,
        config: GeminiConfig = {},
        metadata: Record<string, any> = {}
    ): Promise<EvaluationResult> {
        const startTime = Date.now();

        try {
            const payload = {
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: { ...this.defaultConfig, ...config }
            };

            const response = await this.makeRequest(payload);
            const latency = Date.now() - startTime;

            const result: EvaluationResult = {
                prompt,
                response: response.candidates[0].content.parts[0].text,
                model: this.model,
                usage: response.usageMetadata || {},
                timestamp: new Date().toISOString(),
                metadata: { ...metadata, latency }
            };

            this.evaluationHistory.push(result);
            return result;

        } catch (error) {
            const errorResult: EvaluationResult = {
                prompt,
                response: '',
                model: this.model,
                usage: {},
                timestamp: new Date().toISOString(),
                metadata: { ...metadata, latency: Date.now() - startTime },
                error: error instanceof Error ? error.message : String(error)
            };

            this.evaluationHistory.push(errorResult);
            throw error;
        }
    }

    async evaluateMultimodal(
        input: MultimodalInput,
        config: GeminiConfig = {},
        metadata: Record<string, any> = {}
    ): Promise<EvaluationResult> {
        const parts: any[] = [{ text: input.text }];

        // Add images
        if (input.images) {
            input.images.forEach(image => {
                parts.push({
                    inline_data: {
                        mime_type: image.mimeType,
                        data: image.data
                    }
                });
            });
        }

        // Add videos
        if (input.videos) {
            input.videos.forEach(video => {
                parts.push({
                    file_data: {
                        mime_type: video.mimeType,
                        file_uri: video.fileUri
                    }
                });
            });
        }

        // Add audio
        if (input.audio) {
            input.audio.forEach(audio => {
                parts.push({
                    inline_data: {
                        mime_type: audio.mimeType,
                        data: audio.data
                    }
                });
            });
        }

        const startTime = Date.now();

        try {
            const payload = {
                contents: [{ parts }],
                generationConfig: { ...this.defaultConfig, ...config }
            };

            const response = await this.makeRequest(payload);
            const latency = Date.now() - startTime;

            const result: EvaluationResult = {
                prompt: input.text,
                response: response.candidates[0].content.parts[0].text,
                model: this.model,
                usage: response.usageMetadata || {},
                timestamp: new Date().toISOString(),
                metadata: {
                    ...metadata,
                    latency,
                    multimodal: true,
                    imageCount: input.images?.length || 0,
                    videoCount: input.videos?.length || 0,
                    audioCount: input.audio?.length || 0
                }
            };

            this.evaluationHistory.push(result);
            return result;

        } catch (error) {
            const errorResult: EvaluationResult = {
                prompt: input.text,
                response: '',
                model: this.model,
                usage: {},
                timestamp: new Date().toISOString(),
                metadata: { ...metadata, latency: Date.now() - startTime },
                error: error instanceof Error ? error.message : String(error)
            };

            this.evaluationHistory.push(errorResult);
            throw error;
        }
    }

    async evaluateWithFunctions(
        prompt: string,
        functions: FunctionDeclaration[],
        functionExecutor: (name: string, args: any) => Promise<any>,
        config: GeminiConfig = {}
    ): Promise<EvaluationResult> {
        const startTime = Date.now();

        try {
            let payload = {
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
                generationConfig: { ...this.defaultConfig, ...config }
            };

            let response = await this.makeRequest(payload);

            // Check for function calls
            const candidate = response.candidates[0];
            if (candidate.content.parts.some((part: any) => part.functionCall)) {
                const functionCalls = candidate.content.parts
                    .filter((part: any) => part.functionCall)
                    .map((part: any) => part.functionCall);

                // Execute functions
                const functionResults = await Promise.all(
                    functionCalls.map(async (call: any) => {
                        const result = await functionExecutor(call.name, call.args);
                        return {
                            functionResponse: {
                                name: call.name,
                                response: result
                            }
                        };
                    })
                );

                // Send function results back to model
                payload.contents.push({
                    parts: functionResults
                });

                response = await this.makeRequest(payload);
            }

            const latency = Date.now() - startTime;

            const result: EvaluationResult = {
                prompt,
                response: response.candidates[0].content.parts[0].text,
                model: this.model,
                usage: response.usageMetadata || {},
                timestamp: new Date().toISOString(),
                metadata: {
                    latency,
                    functionCalling: true,
                    functionsAvailable: functions.length
                }
            };

            this.evaluationHistory.push(result);
            return result;

        } catch (error) {
            const errorResult: EvaluationResult = {
                prompt,
                response: '',
                model: this.model,
                usage: {},
                timestamp: new Date().toISOString(),
                metadata: { latency: Date.now() - startTime },
                error: error instanceof Error ? error.message : String(error)
            };

            this.evaluationHistory.push(errorResult);
            throw error;
        }
    }

    async batchEvaluate(
        prompts: string[],
        config: GeminiConfig = {},
        concurrency: number = 5
    ): Promise<EvaluationResult[]> {
        const results: EvaluationResult[] = [];
        const chunks = this.chunkArray(prompts, concurrency);

        for (const chunk of chunks) {
            const chunkPromises = chunk.map(prompt =>
                this.evaluateText(prompt, config)
                    .catch(error => ({
                        prompt,
                        response: '',
                        model: this.model,
                        usage: {},
                        timestamp: new Date().toISOString(),
                        error: error.message
                    } as EvaluationResult))
            );

            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);

            // Rate limiting delay
            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await this.delay(1000);
            }
        }

        return results;
    }

    calculateMetrics(): EvaluationMetrics {
        const successful = this.evaluationHistory.filter(r => !r.error);
        const failed = this.evaluationHistory.filter(r => r.error);

        const totalLatency = this.evaluationHistory
            .filter(r => r.metadata?.latency)
            .reduce((sum, r) => sum + (r.metadata!.latency as number), 0);

        const totalTokens = this.evaluationHistory
            .reduce((sum, r) => sum + (r.usage.totalTokenCount || 0), 0);

        const errorBreakdown: Record<string, number> = {};
        failed.forEach(result => {
            const errorType = result.error || 'Unknown';
            errorBreakdown[errorType] = (errorBreakdown[errorType] || 0) + 1;
        });

        return {
            totalEvaluations: this.evaluationHistory.length,
            successCount: successful.length,
            failureCount: failed.length,
            averageLatency: this.evaluationHistory.length > 0
                ? totalLatency / this.evaluationHistory.length
                : 0,
            totalTokensUsed: totalTokens,
            costEstimate: this.estimateCost(totalTokens),
            errorBreakdown
        };
    }

    async exportResults(
        filename: string = 'evaluation_results.json',
        includeMetrics: boolean = true
    ): Promise<void> {
        const data = {
            ...(includeMetrics && { metrics: this.calculateMetrics() }),
            results: this.evaluationHistory,
            exportedAt: new Date().toISOString(),
            model: this.model,
            totalEvaluations: this.evaluationHistory.length
        };

        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`Results exported to ${filename}`);
    }

    private async makeRequest(payload: any): Promise<any> {
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

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
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

    private estimateCost(totalTokens: number): number {
        // Simplified cost calculation (example rates)
        const costPerMillionTokens = {
            'gemini-2.5-pro': 3.5,
            'gemini-2.5-flash': 0.15,
            'gemini-2.5-flash-lite': 0.075
        };

        const rate = costPerMillionTokens[this.model as keyof typeof costPerMillionTokens] || 1.0;
        return (totalTokens / 1_000_000) * rate;
    }
}

// Example usage
async function runComprehensiveEvaluation() {
    const evaluator = new GeminiEvaluator(
        process.env.GOOGLE_API_KEY!,
        'gemini-2.5-pro',
        { temperature: 0.1, maxOutputTokens: 1024 }
    );

    // Text evaluation
    const textResults = await evaluator.batchEvaluate([
        "Explain quantum computing",
        "Write a sorting algorithm",
        "Describe climate change impacts"
    ]);

    // Function calling evaluation
    const mathFunctions: FunctionDeclaration[] = [
        {
            name: "calculate",
            description: "Perform mathematical calculations",
            parameters: {
                type: "object",
                properties: {
                    expression: { type: "string" }
                },
                required: ["expression"]
            }
        }
    ];

    const functionExecutor = async (name: string, args: any) => {
        if (name === "calculate") {
            try {
                return { result: eval(args.expression) };
            } catch (error) {
                return { error: "Invalid expression" };
            }
        }
        return { error: "Unknown function" };
    };

    const functionResult = await evaluator.evaluateWithFunctions(
        "Calculate the area of a circle with radius 10",
        mathFunctions,
        functionExecutor
    );

    // Generate metrics and export
    const metrics = evaluator.calculateMetrics();
    console.log('Evaluation Metrics:', metrics);

    await evaluator.exportResults('comprehensive_evaluation.json');
}

if (require.main === module) {
    runComprehensiveEvaluation().catch(console.error);
}
```

Continue with more examples in the next file...