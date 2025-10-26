# Configuration Options 

Comprehensive guide to all Gemini API configuration parameters, their purposes, and best practices for evaluation scenarios.

##  Table of Contents

1. [Generation Configuration](#generation-configuration)
2. [Safety Settings](#safety-settings)
3. [Tool Configuration](#tool-configuration)
4. [System Instructions](#system-instructions)
5. [Response Configuration](#response-configuration)
6. [Best Practices](#best-practices)
7. [Evaluation-Specific Settings](#evaluation-specific-settings)

## Generation Configuration

### temperature
**Type**: `float` (0.0 - 2.0)
**Default**: `1.0`
**Purpose**: Controls randomness in the model's output

#### Usage Guidelines
- **0.0 - 0.3**: Deterministic, consistent outputs (ideal for evaluation)
- **0.4 - 0.7**: Balanced creativity and consistency
- **0.8 - 1.2**: More creative and varied outputs
- **1.3 - 2.0**: Highly creative, potentially unpredictable

#### Examples
```json
{
  "generationConfig": {
    "temperature": 0.1
  }
}
```

**Effect on Output**:
```python
# Low temperature (0.1) - Consistent
"The capital of France is Paris."

# High temperature (1.5) - Varied
"The capital of France is Paris, the magnificent City of Light!"
```

### topP
**Type**: `float` (0.0 - 1.0)
**Default**: `0.95`
**Purpose**: Nucleus sampling - considers only top P probability mass

#### Usage Guidelines
- **0.1 - 0.5**: Conservative, focused responses
- **0.6 - 0.9**: Balanced variety
- **0.9 - 1.0**: Maximum diversity

#### Examples
```json
{
  "generationConfig": {
    "topP": 0.8,
    "temperature": 0.7
  }
}
```

### topK
**Type**: `integer`
**Default**: `40`
**Purpose**: Limits consideration to top K most likely tokens

#### Usage Guidelines
- **1 - 10**: Very focused responses
- **20 - 40**: Balanced selection (recommended)
- **40+**: More diverse vocabulary

```json
{
  "generationConfig": {
    "topK": 20
  }
}
```

### maxOutputTokens
**Type**: `integer`
**Default**: Model-dependent
**Purpose**: Maximum tokens in the response

#### Model Limits
- **Gemini 2.5 Pro**: Up to 8,192 tokens
- **Gemini 2.5 Flash**: Up to 8,192 tokens
- **Gemini 2.0 Flash**: Up to 8,192 tokens

```json
{
  "generationConfig": {
    "maxOutputTokens": 1024
  }
}
```

### candidateCount
**Type**: `integer` (1-8)
**Default**: `1`
**Purpose**: Number of response candidates to generate

** Note**: Only `candidateCount: 1` is currently supported

```json
{
  "generationConfig": {
    "candidateCount": 1
  }
}
```

### stopSequences
**Type**: `array of strings`
**Purpose**: Custom stop sequences to end generation

#### Examples
```json
{
  "generationConfig": {
    "stopSequences": ["END", "\\n\\n", "---"]
  }
}
```

**Use Cases**:
- Structured output generation
- Preventing over-generation
- Format control in evaluations

### responseMimeType
**Type**: `string`
**Default**: `"text/plain"`
**Options**: `"text/plain"`, `"application/json"`

#### JSON Mode Example
```json
{
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "object",
      "properties": {
        "answer": {"type": "string"},
        "confidence": {"type": "number"}
      }
    }
  }
}
```

## Safety Settings

Control harmful content filtering across different categories.

### Safety Categories
- `HARM_CATEGORY_HARASSMENT`
- `HARM_CATEGORY_HATE_SPEECH`
- `HARM_CATEGORY_SEXUALLY_EXPLICIT`
- `HARM_CATEGORY_DANGEROUS_CONTENT`
- `HARM_CATEGORY_CIVIC_INTEGRITY`

### Safety Thresholds
- `BLOCK_NONE`: No filtering
- `BLOCK_ONLY_HIGH`: Block high-risk content
- `BLOCK_MEDIUM_AND_ABOVE`: Block medium+ risk content
- `BLOCK_LOW_AND_ABOVE`: Block low+ risk content (most restrictive)

#### Complete Safety Configuration
```json
{
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_CIVIC_INTEGRITY",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}
```

#### Evaluation-Friendly Safety Settings
```json
{
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_NONE"
    },
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "BLOCK_NONE"
    },
    {
      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "threshold": "BLOCK_NONE"
    },
    {
      "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
      "threshold": "BLOCK_NONE"
    }
  ]
}
```

** Safety Considerations**: Use `BLOCK_NONE` only for research/evaluation purposes in controlled environments.

## Tool Configuration

Configure function calling and tool use capabilities.

### Function Declarations
```json
{
  "tools": [
    {
      "function_declarations": [
        {
          "name": "get_current_weather",
          "description": "Get the current weather in a given location",
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
                "description": "Temperature unit"
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

### Tool Configuration Options
```json
{
  "toolConfig": {
    "functionCallingConfig": {
      "mode": "AUTO",
      "allowedFunctionNames": ["get_current_weather"]
    }
  }
}
```

**Function Calling Modes**:
- `AUTO`: Model decides when to call functions
- `ANY`: Model must call at least one function
- `NONE`: Disable function calling

### Code Execution Tool
```json
{
  "tools": [
    {
      "codeExecution": {}
    }
  ]
}
```

### Google Search Tool
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

## System Instructions

Configure system-level behavior and constraints.

### Basic System Instruction
```json
{
  "systemInstruction": {
    "parts": [
      {
        "text": "You are a helpful assistant that provides accurate and concise answers. Always cite sources when making factual claims."
      }
    ]
  }
}
```

### Evaluation-Specific Instructions
```json
{
  "systemInstruction": {
    "parts": [
      {
        "text": "You are being evaluated on your ability to solve mathematical problems. Show your work step by step. Provide your final answer in the format: ANSWER: [number]"
      }
    ]
  }
}
```

### Structured Output Instructions
```json
{
  "systemInstruction": {
    "parts": [
      {
        "text": "Always respond in valid JSON format with the following structure: {\"reasoning\": \"your reasoning here\", \"answer\": \"your answer here\", \"confidence\": confidence_score_0_to_1}"
      }
    ]
  }
}
```

## Response Configuration

### Response Schema (JSON Mode)
```json
{
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "object",
      "properties": {
        "task_completed": {
          "type": "boolean",
          "description": "Whether the task was completed successfully"
        },
        "result": {
          "type": "string",
          "description": "The main result or answer"
        },
        "steps": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Steps taken to reach the result"
        },
        "confidence_score": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Confidence in the result"
        }
      },
      "required": ["task_completed", "result"]
    }
  }
}
```

## Best Practices

### For Deterministic Evaluation
```json
{
  "generationConfig": {
    "temperature": 0.0,
    "topP": 1.0,
    "topK": 1,
    "maxOutputTokens": 1024
  }
}
```

### For Creative Evaluation
```json
{
  "generationConfig": {
    "temperature": 0.8,
    "topP": 0.9,
    "topK": 40,
    "maxOutputTokens": 2048
  }
}
```

### For Balanced Evaluation
```json
{
  "generationConfig": {
    "temperature": 0.4,
    "topP": 0.8,
    "topK": 20,
    "maxOutputTokens": 1024
  }
}
```

### For Function Calling Evaluation
```json
{
  "generationConfig": {
    "temperature": 0.2,
    "maxOutputTokens": 1024
  },
  "toolConfig": {
    "functionCallingConfig": {
      "mode": "AUTO"
    }
  }
}
```

## Evaluation-Specific Settings

### A/B Testing Configuration
```python
# Configuration A: Conservative
config_a = {
    "generationConfig": {
        "temperature": 0.1,
        "topP": 0.8,
        "maxOutputTokens": 512
    }
}

# Configuration B: Creative
config_b = {
    "generationConfig": {
        "temperature": 0.9,
        "topP": 0.95,
        "maxOutputTokens": 1024
    }
}
```

### Benchmark-Specific Settings

#### Mathematical Reasoning
```json
{
  "generationConfig": {
    "temperature": 0.0,
    "maxOutputTokens": 1024
  },
  "systemInstruction": {
    "parts": [
      {
        "text": "Solve step by step. Show all work. Format final answer as: FINAL ANSWER: [value]"
      }
    ]
  }
}
```

#### Code Generation
```json
{
  "generationConfig": {
    "temperature": 0.2,
    "maxOutputTokens": 2048,
    "stopSequences": ["```", "END_CODE"]
  },
  "systemInstruction": {
    "parts": [
      {
        "text": "Generate clean, well-commented code. Include error handling where appropriate."
      }
    ]
  }
}
```

#### Multimodal Analysis
```json
{
  "generationConfig": {
    "temperature": 0.3,
    "maxOutputTokens": 1024
  },
  "systemInstruction": {
    "parts": [
      {
        "text": "Analyze all provided content thoroughly. Describe what you see, then provide your analysis."
      }
    ]
  }
}
```

## Parameter Interaction Effects

### Temperature vs TopP
```python
# High temperature + Low topP = Consistent but varied vocabulary
{"temperature": 1.0, "topP": 0.5}

# Low temperature + High topP = Focused but exploring possibilities
{"temperature": 0.3, "topP": 0.9}

# High temperature + High topP = Maximum creativity and diversity
{"temperature": 1.2, "topP": 0.95}
```

### Response Length Control
```json
{
  "generationConfig": {
    "maxOutputTokens": 100,
    "stopSequences": [".", "!", "?"]
  },
  "systemInstruction": {
    "parts": [
      {
        "text": "Provide brief, one-sentence answers."
      }
    ]
  }
}
```

## Configuration Validation

### Required Fields
```json
{
  "contents": [{"parts": [{"text": "prompt"}]}]
}
```

### Optional but Recommended for Evaluation
```json
{
  "generationConfig": {
    "temperature": 0.0,
    "maxOutputTokens": 1024
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
      "threshold": "BLOCK_NONE"
    }
  ]
}
```

## Next Steps

- [Environment Setup](../environment/README.md)
- [Advanced Features](../advanced-features/README.md)
- [Code Examples](../../examples/README.md)
- [Promptfoo Integration](../../integrations/promptfoo/README.md)