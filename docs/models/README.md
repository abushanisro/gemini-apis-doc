# Gemini Models Documentation 

This document provides comprehensive information about all supported Gemini models, their capabilities, limitations, and use cases for evaluation purposes.

##  Table of Contents

1. [Gemini 2.5 Models](#gemini-25-models)
2. [Gemini 2.0 Models](#gemini-20-models)
3. [Model Comparison](#model-comparison)
4. [Model Selection Guide](#model-selection-guide)
5. [Input/Output Formats](#inputoutput-formats)
6. [Deprecation Notice](#deprecation-notice)

## Gemini 2.5 Models

### google:gemini-2.5-pro

**Status**:  Stable (Latest)
**Context Window**: 2M tokens
**Capabilities**: Multimodal (text, images, video, audio), adaptive thinking

#### Key Features
- Most powerful Gemini model with adaptive thinking capabilities
- Supports complex reasoning and problem-solving tasks
- Multimodal input support including native audio generation
- Advanced tool use and function calling
- Superior performance on complex analytical tasks

#### Use Cases
- Complex reasoning and analysis
- Advanced code generation and debugging
- Multimodal content analysis
- Research and academic applications
- High-stakes decision-making tasks

#### Limitations
- Higher latency compared to Flash models
- Higher cost per token
- May be overkill for simple tasks

### google:gemini-2.5-flash

**Status**:  Stable
**Context Window**: 1M tokens
**Capabilities**: Multimodal, fast inference, balanced performance

#### Key Features
- First stable 2.5 Flash model
- Optimized for speed and efficiency
- Strong multimodal capabilities
- Good balance of performance and cost

#### Use Cases
- Real-time applications
- Batch processing
- Content generation
- General-purpose AI tasks

### google:gemini-2.5-flash-lite

**Status**:  Stable
**Context Window**: 1M tokens
**Capabilities**: Fast, low-cost, high-performance

#### Key Features
- Most cost-effective Gemini 2.5 model
- Optimized for high-throughput scenarios
- Maintains good performance at reduced cost
- Suitable for production deployments

#### Use Cases
- Large-scale evaluation runs
- Cost-sensitive applications
- High-volume processing
- Development and testing

## Gemini 2.0 Models

### google:gemini-2.0-flash

**Status**:  Experimental → Stable
**Context Window**: 1M tokens
**Capabilities**: Next-gen features, superior speed, native tool use

#### Key Features
- Next-generation multimodal capabilities
- Native tool use and function calling
- 1M token context window
- Improved speed and efficiency
- Enhanced reasoning capabilities

#### Use Cases
- Tool-augmented workflows
- Function calling applications
- Multimodal analysis
- Agent-based systems

### google:gemini-2.0-flash-lite

**Status**:  Available
**Context Window**: 1M tokens
**Capabilities**: Cost-efficient version of 2.0 Flash

#### Key Features
- Cost-optimized variant of 2.0 Flash
- Maintains core capabilities at lower cost
- Good for evaluation and testing
- Suitable for high-volume applications

#### Use Cases
- Evaluation benchmarks
- Prototype development
- Cost-conscious deployments
- Comparative analysis

### google:gemini-2.0-flash-thinking-exp

**Status**:  Experimental
**Context Window**: 1M tokens
**Capabilities**: Optimized for complex reasoning and problem-solving

#### Key Features
- Specialized for reasoning tasks
- Enhanced problem-solving capabilities
- Experimental features and optimizations
- Advanced analytical thinking

#### Use Cases
- Complex reasoning evaluation
- Mathematical problem solving
- Logical analysis tasks
- Research applications

## Model Comparison

| Model | Context | Speed | Cost | Reasoning | Multimodal | Tool Use | Status |
|-------|---------|-------|------|-----------|------------|----------|---------|
| gemini-2.5-pro | 2M | Medium | High | Excellent | Excellent | Excellent | Stable |
| gemini-2.5-flash | 1M | Fast | Medium | Very Good | Excellent | Very Good | Stable |
| gemini-2.5-flash-lite | 1M | Very Fast | Low | Good | Very Good | Good | Stable |
| gemini-2.0-flash | 1M | Fast | Medium | Very Good | Excellent | Excellent | Stable |
| gemini-2.0-flash-lite | 1M | Very Fast | Low | Good | Very Good | Good | Available |
| gemini-2.0-flash-thinking-exp | 1M | Medium | Medium | Excellent | Very Good | Good | Experimental |

## Model Selection Guide

### For Evaluation Frameworks

#### High-Accuracy Benchmarks
- **Primary**: `google:gemini-2.5-pro`
- **Alternative**: `google:gemini-2.0-flash-thinking-exp`

#### Speed Benchmarks
- **Primary**: `google:gemini-2.5-flash-lite`
- **Alternative**: `google:gemini-2.0-flash-lite`

#### Balanced Evaluation
- **Primary**: `google:gemini-2.5-flash`
- **Alternative**: `google:gemini-2.0-flash`

#### Cost-Effective Testing
- **Primary**: `google:gemini-2.5-flash-lite`
- **Alternative**: `google:gemini-2.0-flash-lite`

### For Specific Capabilities

#### Multimodal Tasks
```
Recommended Order:
1. google:gemini-2.5-pro
2. google:gemini-2.5-flash
3. google:gemini-2.0-flash
```

#### Tool Use / Function Calling
```
Recommended Order:
1. google:gemini-2.5-pro
2. google:gemini-2.0-flash
3. google:gemini-2.5-flash
```

#### Complex Reasoning
```
Recommended Order:
1. google:gemini-2.5-pro
2. google:gemini-2.0-flash-thinking-exp
3. google:gemini-2.5-flash
```

## Input/Output Formats

### Text Input
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Your prompt here"
        }
      ]
    }
  ]
}
```

### Multimodal Input (Text + Image)
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Describe this image:"
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

### Function Calling Format
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "What's the weather like?"
        }
      ]
    }
  ],
  "tools": [
    {
      "function_declarations": [
        {
          "name": "get_weather",
          "description": "Get current weather",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {
                "type": "string",
                "description": "Location to get weather for"
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

### Output Format
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Response text here"
          }
        ]
      },
      "finishReason": "STOP",
      "safetyRatings": [...],
      "citationMetadata": {...}
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 10,
    "candidatesTokenCount": 20,
    "totalTokenCount": 30
  }
}
```

## Special Tokens and Formatting

### System Instructions
Use the `systemInstruction` field for system-level prompts:
```json
{
  "systemInstruction": {
    "parts": [
      {
        "text": "You are a helpful assistant specialized in data analysis."
      }
    ]
  },
  "contents": [...]
}
```

### Multi-turn Conversations
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{"text": "Hello"}]
    },
    {
      "role": "model",
      "parts": [{"text": "Hi there!"}]
    },
    {
      "role": "user",
      "parts": [{"text": "How are you?"}]
    }
  ]
}
```

## Deprecation Notice

 **Important Deprecation Updates**

### Deprecated Models (Retired)
- All Gemini 1.0 models - **RETIRED**
- All Gemini 1.5 models - **RETIRED**
- `google:gemini-1.5-pro` - **RETIRED**
- `google:gemini-1.5-flash` - **RETIRED**

### Upcoming Deprecations
- `gemini-2.0-flash-live-001` - Deprecation: December 09, 2025
- `gemini-live-2.5-flash-preview` - Deprecation: December 09, 2025

### Migration Recommendations
If using deprecated models, migrate to:
- From `gemini-1.5-pro` → `google:gemini-2.5-pro`
- From `gemini-1.5-flash` → `google:gemini-2.5-flash`
- From any 1.0/1.5 model → `google:gemini-2.5-flash-lite` (cost-effective option)

## Next Steps

- [Configuration Options](../configuration/README.md)
- [Environment Setup](../environment/README.md)
- [Code Examples](../../examples/README.md)
- [Promptfoo Integration](../../integrations/promptfoo/README.md)