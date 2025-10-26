# Advanced Features Documentation 

Comprehensive guide to Gemini's advanced capabilities including multimodal processing, function calling, tool usage, and error handling strategies for evaluation scenarios.

##  Table of Contents

1. [Multimodal Processing](#multimodal-processing)
2. [Function Calling & Tool Use](#function-calling--tool-use)
3. [Error Handling & Rate Limiting](#error-handling--rate-limiting)
4. [Streaming Responses](#streaming-responses)
5. [Code Execution](#code-execution)
6. [Search Integration](#search-integration)
7. [System Instructions](#system-instructions)
8. [Best Practices for Evaluation](#best-practices-for-evaluation)

## Multimodal Processing

Gemini models support text, images, video, and audio inputs, making them powerful for comprehensive evaluation scenarios.

### Image Processing

#### Supported Formats
- **JPEG** (`.jpg`, `.jpeg`)
- **PNG** (`.png`)
- **WebP** (`.webp`)
- **HEIC** (`.heic`)
- **HEIF** (`.heif`)

#### Size Limits
- **Maximum file size**: 20MB
- **Maximum dimensions**: 3072x3072 pixels
- **Recommended**: Under 4MB for optimal performance

#### Basic Image Input
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Describe what you see in this image:"
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "base64_encoded_image_data"
          }
        }
      ]
    }
  ]
}
```

#### Multiple Images
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Compare these two images:"
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "base64_image_1"
          }
        },
        {
          "inline_data": {
            "mime_type": "image/png",
            "data": "base64_image_2"
          }
        }
      ]
    }
  ]
}
```

#### Python Example
```python
import base64
import requests

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def analyze_image(image_path, prompt):
    base64_image = encode_image(image_path)

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": base64_image
                        }
                    }
                ]
            }
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": os.getenv("GOOGLE_API_KEY")
    }

    response = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
        headers=headers,
        json=payload
    )

    return response.json()

# Usage
result = analyze_image(
    "chart.jpg",
    "Extract all data points from this chart and format as JSON"
)
```

### Video Processing

#### Supported Formats
- **MP4** (H.264 codec)
- **MOV** (H.264 codec)
- **AVI** (H.264 codec)
- **FLV** (H.264 codec)
- **MKV** (H.264 codec)
- **WebM** (VP8/VP9 codec)

#### Size and Duration Limits
- **Maximum file size**: 2GB
- **Maximum duration**: 60 minutes
- **Frame rate**: Up to 30 FPS
- **Resolution**: Up to 4K (4096x4096)

#### Video Input Example
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Analyze this video and describe the key events:"
        },
        {
          "file_data": {
            "mime_type": "video/mp4",
            "file_uri": "gs://your-bucket/video.mp4"
          }
        }
      ]
    }
  ]
}
```

#### Python Video Processing
```python
def upload_to_cloud_storage(video_path, bucket_name, blob_name):
    from google.cloud import storage

    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    blob.upload_from_filename(video_path)
    return f"gs://{bucket_name}/{blob_name}"

def analyze_video(video_uri, prompt):
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "file_data": {
                            "mime_type": "video/mp4",
                            "file_uri": video_uri
                        }
                    }
                ]
            }
        ]
    }

    # Make API call...
    return response

# Usage for evaluation
video_uri = upload_to_cloud_storage("test_video.mp4", "eval-bucket", "videos/test.mp4")
result = analyze_video(video_uri, "Count the number of people in this video")
```

### Audio Processing

#### Supported Formats
- **WAV** (Linear PCM)
- **MP3** (MPEG Audio Layer III)
- **AIFF** (Audio Interchange File Format)
- **AAC** (Advanced Audio Coding)
- **OGG** (Ogg Vorbis)
- **FLAC** (Free Lossless Audio Codec)

#### Audio Limits
- **Maximum file size**: 20MB
- **Maximum duration**: 9.5 hours
- **Sample rate**: 8kHz to 48kHz
- **Channels**: Mono or stereo

#### Audio Input Example
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Transcribe this audio and identify the speakers:"
        },
        {
          "inline_data": {
            "mime_type": "audio/wav",
            "data": "base64_encoded_audio_data"
          }
        }
      ]
    }
  ]
}
```

## Function Calling & Tool Use

Gemini models support sophisticated function calling and tool integration for complex evaluation scenarios.

### Function Declaration

#### Basic Function Definition
```json
{
  "tools": [
    {
      "function_declarations": [
        {
          "name": "get_weather",
          "description": "Get current weather information for a location",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {
                "type": "string",
                "description": "The city and state, e.g. San Francisco, CA"
              },
              "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "description": "Temperature unit to use"
              }
            },
            "required": ["location"]
          }
        }
      ]
    }
  ]
}
```

#### Complex Function with Nested Objects
```json
{
  "name": "analyze_data",
  "description": "Analyze a dataset and return insights",
  "parameters": {
    "type": "object",
    "properties": {
      "data": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "timestamp": {"type": "string"},
            "value": {"type": "number"},
            "category": {"type": "string"}
          }
        }
      },
      "analysis_type": {
        "type": "string",
        "enum": ["trend", "outlier", "correlation", "summary"]
      },
      "options": {
        "type": "object",
        "properties": {
          "confidence_level": {"type": "number", "minimum": 0, "maximum": 1},
          "include_visualization": {"type": "boolean"}
        }
      }
    },
    "required": ["data", "analysis_type"]
  }
}
```

### Function Calling Modes

#### AUTO Mode (Recommended for Evaluation)
```json
{
  "toolConfig": {
    "functionCallingConfig": {
      "mode": "AUTO",
      "allowedFunctionNames": ["get_weather", "analyze_data"]
    }
  }
}
```

#### ANY Mode (Force Function Call)
```json
{
  "toolConfig": {
    "functionCallingConfig": {
      "mode": "ANY",
      "allowedFunctionNames": ["required_function"]
    }
  }
}
```

#### NONE Mode (Disable Function Calling)
```json
{
  "toolConfig": {
    "functionCallingConfig": {
      "mode": "NONE"
    }
  }
}
```

### Function Call Response Handling

#### Processing Function Calls
```python
def handle_function_call(response):
    if 'candidates' in response and response['candidates']:
        candidate = response['candidates'][0]

        if 'content' in candidate and 'parts' in candidate['content']:
            for part in candidate['content']['parts']:
                if 'functionCall' in part:
                    function_call = part['functionCall']
                    function_name = function_call['name']
                    function_args = function_call['args']

                    # Execute the function
                    result = execute_function(function_name, function_args)

                    # Return result to model
                    return create_function_response(function_name, result)

    return None

def execute_function(name, args):
    if name == "get_weather":
        return get_weather_data(args['location'], args.get('unit', 'celsius'))
    elif name == "analyze_data":
        return perform_data_analysis(args['data'], args['analysis_type'])
    else:
        return {"error": f"Unknown function: {name}"}

def create_function_response(function_name, result):
    return {
        "contents": [
            {
                "parts": [
                    {
                        "functionResponse": {
                            "name": function_name,
                            "response": result
                        }
                    }
                ]
            }
        ]
    }
```

### Multi-Step Function Calls

#### Sequential Function Execution
```python
def multi_step_evaluation(initial_prompt):
    conversation = [{"role": "user", "parts": [{"text": initial_prompt}]}]

    max_iterations = 5
    for i in range(max_iterations):
        response = call_gemini_api(conversation)

        if has_function_call(response):
            # Execute function and add response to conversation
            function_response = handle_function_call(response)
            conversation.append({"role": "function", "parts": [function_response]})

            # Continue conversation
            continue_response = call_gemini_api(conversation)
            conversation.append({"role": "model", "parts": continue_response['parts']})

            # Check if task is complete
            if is_task_complete(continue_response):
                break
        else:
            # No function call, task complete
            conversation.append({"role": "model", "parts": response['parts']})
            break

    return conversation
```

### Evaluation-Specific Tools

#### Mathematical Calculator
```json
{
  "name": "calculate",
  "description": "Perform mathematical calculations",
  "parameters": {
    "type": "object",
    "properties": {
      "expression": {
        "type": "string",
        "description": "Mathematical expression to evaluate"
      },
      "precision": {
        "type": "integer",
        "description": "Number of decimal places in result"
      }
    },
    "required": ["expression"]
  }
}
```

#### Data Validator
```json
{
  "name": "validate_output",
  "description": "Validate model output against expected format",
  "parameters": {
    "type": "object",
    "properties": {
      "output": {"type": "string"},
      "expected_format": {
        "type": "string",
        "enum": ["json", "csv", "xml", "yaml"]
      },
      "schema": {"type": "object"}
    },
    "required": ["output", "expected_format"]
  }
}
```

## Error Handling & Rate Limiting

Robust error handling and rate limiting strategies for evaluation scenarios.

### Common Error Types

#### API Errors
```python
import time
import random
from typing import Dict, Any

class GeminiAPIError(Exception):
    def __init__(self, status_code: int, message: str, error_type: str = None):
        self.status_code = status_code
        self.message = message
        self.error_type = error_type
        super().__init__(f"HTTP {status_code}: {message}")

def handle_api_response(response):
    if response.status_code == 200:
        return response.json()

    error_data = response.json() if response.content else {}
    error_message = error_data.get('error', {}).get('message', 'Unknown error')
    error_type = error_data.get('error', {}).get('code', 'UNKNOWN')

    if response.status_code == 400:
        raise GeminiAPIError(400, error_message, "INVALID_REQUEST")
    elif response.status_code == 401:
        raise GeminiAPIError(401, "Invalid API key", "AUTHENTICATION_ERROR")
    elif response.status_code == 403:
        raise GeminiAPIError(403, "Permission denied", "PERMISSION_DENIED")
    elif response.status_code == 429:
        raise GeminiAPIError(429, "Rate limit exceeded", "RATE_LIMIT_EXCEEDED")
    elif response.status_code == 500:
        raise GeminiAPIError(500, "Internal server error", "INTERNAL_ERROR")
    else:
        raise GeminiAPIError(response.status_code, error_message, error_type)
```

### Rate Limiting Strategies

#### Exponential Backoff
```python
def exponential_backoff(func, max_retries=5, base_delay=1):
    for attempt in range(max_retries):
        try:
            return func()
        except GeminiAPIError as e:
            if e.status_code == 429:  # Rate limit
                if attempt == max_retries - 1:
                    raise

                delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                print(f"Rate limited. Retrying in {delay:.2f} seconds...")
                time.sleep(delay)
            else:
                raise

    raise Exception(f"Failed after {max_retries} attempts")
```

#### Request Queue Management
```python
import asyncio
from asyncio import Semaphore
import aiohttp

class RateLimitedClient:
    def __init__(self, max_concurrent=10, requests_per_minute=60):
        self.semaphore = Semaphore(max_concurrent)
        self.requests_per_minute = requests_per_minute
        self.request_times = []

    async def make_request(self, payload):
        async with self.semaphore:
            # Rate limiting logic
            now = time.time()
            self.request_times = [t for t in self.request_times if now - t < 60]

            if len(self.request_times) >= self.requests_per_minute:
                sleep_time = 60 - (now - self.request_times[0])
                await asyncio.sleep(sleep_time)

            self.request_times.append(now)

            # Make actual request
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
                    json=payload,
                    headers={"x-goog-api-key": os.getenv("GOOGLE_API_KEY")}
                ) as response:
                    return await response.json()
```

### Batch Processing with Error Recovery

#### Resilient Batch Processor
```python
class ResilientBatchProcessor:
    def __init__(self, batch_size=10, max_retries=3):
        self.batch_size = batch_size
        self.max_retries = max_retries
        self.failed_items = []
        self.client = RateLimitedClient()

    async def process_batch(self, items):
        results = []

        for i in range(0, len(items), self.batch_size):
            batch = items[i:i + self.batch_size]
            batch_results = await self._process_single_batch(batch)
            results.extend(batch_results)

        return results

    async def _process_single_batch(self, batch):
        tasks = []
        for item in batch:
            task = self._process_item_with_retry(item)
            tasks.append(task)

        return await asyncio.gather(*tasks, return_exceptions=True)

    async def _process_item_with_retry(self, item):
        for attempt in range(self.max_retries):
            try:
                return await self.client.make_request(item)
            except Exception as e:
                if attempt == self.max_retries - 1:
                    self.failed_items.append({"item": item, "error": str(e)})
                    return {"error": str(e)}

                await asyncio.sleep(2 ** attempt)

# Usage
processor = ResilientBatchProcessor()
evaluation_items = [create_evaluation_payload(prompt) for prompt in prompts]
results = await processor.process_batch(evaluation_items)
```

## Code Execution

Gemini models support built-in code execution for dynamic computation and verification.

### Enabling Code Execution
```json
{
  "tools": [
    {
      "codeExecution": {}
    }
  ],
  "contents": [
    {
      "parts": [
        {
          "text": "Calculate the factorial of 10 and show your work"
        }
      ]
    }
  ]
}
```

### Code Execution Examples

#### Mathematical Computations
```python
def test_code_execution():
    payload = {
        "tools": [{"codeExecution": {}}],
        "contents": [
            {
                "parts": [
                    {
                        "text": "Write Python code to solve this problem: Find all prime numbers up to 100 and calculate their sum"
                    }
                ]
            }
        ]
    }

    response = call_gemini_api(payload)

    # Check if code was executed
    for candidate in response.get('candidates', []):
        for part in candidate.get('content', {}).get('parts', []):
            if 'executableCode' in part:
                print("Code executed:", part['executableCode']['code'])
            if 'codeExecutionResult' in part:
                print("Result:", part['codeExecutionResult']['output'])

# Example response might include:
# {
#   "executableCode": {
#     "language": "PYTHON",
#     "code": "def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nprimes = [n for n in range(2, 101) if is_prime(n)]\nprint(f'Primes: {primes}')\nprint(f'Sum: {sum(primes)}')"
#   },
#   "codeExecutionResult": {
#     "outcome": "OUTCOME_OK",
#     "output": "Primes: [2, 3, 5, 7, ...]\nSum: 1060"
#   }
# }
```

#### Data Analysis
```python
def evaluate_data_analysis():
    payload = {
        "tools": [{"codeExecution": {}}],
        "contents": [
            {
                "parts": [
                    {
                        "text": """
                        Given this dataset: [1, 5, 3, 9, 2, 8, 4, 7, 6]

                        1. Calculate mean, median, and standard deviation
                        2. Identify outliers using IQR method
                        3. Create a histogram visualization
                        """
                    }
                ]
            }
        ]
    }

    return call_gemini_api(payload)
```

### Code Execution Security

#### Safe Execution Environment
- Code runs in a sandboxed environment
- No access to external networks
- Limited execution time (30 seconds max)
- No file system access
- Memory limits enforced

#### Best Practices
```python
def safe_code_execution_prompt():
    return {
        "systemInstruction": {
            "parts": [
                {
                    "text": """
                    When writing code:
                    1. Keep code concise and focused on the problem
                    2. Include appropriate error handling
                    3. Add comments explaining key steps
                    4. Print intermediate results for verification
                    5. Avoid infinite loops or excessive memory usage
                    """
                }
            ]
        },
        "tools": [{"codeExecution": {}}]
    }
```

## Search Integration

Integrate Google Search for real-time information and fact-checking.

### Basic Search Configuration
```json
{
  "tools": [
    {
      "googleSearchRetrieval": {
        "dynamicRetrievalConfig": {
          "mode": "MODE_DYNAMIC",
          "dynamicThreshold": 0.7
        }
      }
    }
  ]
}
```

### Search Modes

#### Dynamic Mode (Recommended)
```json
{
  "googleSearchRetrieval": {
    "dynamicRetrievalConfig": {
      "mode": "MODE_DYNAMIC",
      "dynamicThreshold": 0.5
    }
  }
}
```

#### Always Search Mode
```json
{
  "googleSearchRetrieval": {
    "dynamicRetrievalConfig": {
      "mode": "MODE_UNSPECIFIED"
    }
  }
}
```

### Search Integration Examples

#### Fact-Checking Evaluation
```python
def fact_checking_evaluation():
    payload = {
        "tools": [
            {
                "googleSearchRetrieval": {
                    "dynamicRetrievalConfig": {
                        "mode": "MODE_DYNAMIC",
                        "dynamicThreshold": 0.8
                    }
                }
            }
        ],
        "contents": [
            {
                "parts": [
                    {
                        "text": "What is the current population of Tokyo? Provide the most recent data available."
                    }
                ]
            }
        ]
    }

    return call_gemini_api(payload)

# Response will include grounding metadata
# {
#   "groundingMetadata": {
#     "webSearchQueries": ["Tokyo population 2024"],
#     "searchEntryPoints": [...],
#     "groundingSupports": [...]
#   }
# }
```

#### Current Events Evaluation
```python
def current_events_test():
    payload = {
        "tools": [{"googleSearchRetrieval": {"dynamicRetrievalConfig": {"mode": "MODE_DYNAMIC"}}}],
        "contents": [
            {
                "parts": [
                    {
                        "text": "What are the latest developments in AI research this month? Summarize the key findings."
                    }
                ]
            }
        ]
    }

    response = call_gemini_api(payload)

    # Extract grounding information
    grounding = response.get('candidates', [{}])[0].get('groundingMetadata', {})
    search_queries = grounding.get('webSearchQueries', [])

    return {
        "response": response,
        "search_queries_used": search_queries,
        "has_grounding": len(search_queries) > 0
    }
```

## Best Practices for Evaluation

### Evaluation Framework Integration

#### Prompt Engineering for Evaluation
```python
def create_evaluation_prompt(task_type, content):
    base_instructions = {
        "mathematical": "Solve step by step. Show all work. Provide final answer in format: ANSWER: [value]",
        "coding": "Write clean, commented code. Include test cases. Explain your approach.",
        "analysis": "Provide detailed analysis. Support claims with evidence. Structure your response clearly.",
        "creative": "Be creative but relevant. Maintain consistency. Provide reasoning for choices."
    }

    system_instruction = {
        "parts": [
            {
                "text": f"{base_instructions.get(task_type, 'Provide a clear, accurate response.')} Always cite sources when making factual claims."
            }
        ]
    }

    return {
        "systemInstruction": system_instruction,
        "contents": [{"parts": [{"text": content}]}]
    }
```

#### Multi-Modal Evaluation Setup
```python
def multimodal_evaluation_config():
    return {
        "generationConfig": {
            "temperature": 0.3,  # Balanced for accuracy and creativity
            "maxOutputTokens": 2048,
            "topP": 0.8
        },
        "safetySettings": [
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE"  # For research purposes
            }
        ],
        "tools": [
            {"codeExecution": {}},
            {
                "googleSearchRetrieval": {
                    "dynamicRetrievalConfig": {
                        "mode": "MODE_DYNAMIC",
                        "dynamicThreshold": 0.7
                    }
                }
            }
        ]
    }
```

#### Response Validation
```python
def validate_evaluation_response(response, expected_format=None):
    validation_results = {
        "has_content": False,
        "has_function_calls": False,
        "has_code_execution": False,
        "has_grounding": False,
        "safety_ratings": [],
        "token_usage": {}
    }

    if 'candidates' in response and response['candidates']:
        candidate = response['candidates'][0]

        # Check content
        if 'content' in candidate and 'parts' in candidate['content']:
            validation_results["has_content"] = True

            for part in candidate['content']['parts']:
                if 'functionCall' in part:
                    validation_results["has_function_calls"] = True
                if 'executableCode' in part or 'codeExecutionResult' in part:
                    validation_results["has_code_execution"] = True

        # Check grounding
        if 'groundingMetadata' in candidate:
            validation_results["has_grounding"] = True

        # Check safety ratings
        if 'safetyRatings' in candidate:
            validation_results["safety_ratings"] = candidate['safetyRatings']

    # Check token usage
    if 'usageMetadata' in response:
        validation_results["token_usage"] = response['usageMetadata']

    return validation_results
```

### Performance Monitoring

#### Latency Tracking
```python
import time
from contextlib import contextmanager

@contextmanager
def track_api_call():
    start_time = time.time()
    try:
        yield
    finally:
        end_time = time.time()
        latency = end_time - start_time
        print(f"API call took {latency:.2f} seconds")

# Usage
with track_api_call():
    response = call_gemini_api(payload)
```

#### Cost Monitoring
```python
def calculate_cost(usage_metadata, model_name):
    # Pricing per 1M tokens (example rates)
    pricing = {
        "gemini-2.5-pro": {"input": 1.25, "output": 5.00},
        "gemini-2.5-flash": {"input": 0.075, "output": 0.30},
        "gemini-2.5-flash-lite": {"input": 0.075, "output": 0.30}
    }

    if model_name not in pricing:
        return {"error": "Unknown model"}

    input_tokens = usage_metadata.get('promptTokenCount', 0)
    output_tokens = usage_metadata.get('candidatesTokenCount', 0)

    input_cost = (input_tokens / 1_000_000) * pricing[model_name]["input"]
    output_cost = (output_tokens / 1_000_000) * pricing[model_name]["output"]

    return {
        "input_cost": input_cost,
        "output_cost": output_cost,
        "total_cost": input_cost + output_cost,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens
    }
```

## Next Steps

- [Code Examples](../../examples/README.md)
- [Promptfoo Integration](../../integrations/promptfoo/README.md)
- [Weights & Biases Integration](../../integrations/wandb/README.md)
- [Model Documentation](../models/README.md)