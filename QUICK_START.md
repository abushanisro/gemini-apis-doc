# Quick Start Guide

Get up and running with Gemini API evaluation in 5 minutes.

## Prerequisites

- Python 3.8+ or Node.js 16+
- Google API key ([Get one here](https://aistudio.google.com/))

## Option 1: Python Quick Start

### 1. Set up environment
```bash
# Set your API key
export GOOGLE_API_KEY="your_api_key_here"

# Install dependencies (optional, uses only built-in libraries)
pip install requests
```

### 2. Basic evaluation
```python
import os
import requests
import json

def quick_evaluate(prompt, model="gemini-2.5-flash"):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024}
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": os.getenv("GOOGLE_API_KEY")
    }

    response = requests.post(url, headers=headers, json=payload)
    result = response.json()

    return result["candidates"][0]["content"]["parts"][0]["text"]

# Test it out
response = quick_evaluate("Explain machine learning in one paragraph")
print(response)
```

### 3. Run the complete example
```bash
cd examples/python
python basic_evaluation.py
```

## Option 2: JavaScript Quick Start

### 1. Set up environment
```bash
# Set your API key
export GOOGLE_API_KEY="your_api_key_here"

# Install dependencies
npm install node-fetch
```

### 2. Basic evaluation
```javascript
const fetch = require('node-fetch');

async function quickEvaluate(prompt, model = 'gemini-2.5-flash') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GOOGLE_API_KEY
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}

// Test it out
quickEvaluate("Explain machine learning in one paragraph")
    .then(response => console.log(response))
    .catch(console.error);
```

### 3. Run the complete example
```bash
cd examples/javascript
node basic_evaluation.js
```

## Option 3: Evaluation Frameworks

### Promptfoo Setup
```bash
# Install promptfoo
npm install -g promptfoo

# Create config file
cat > promptfooconfig.yaml << EOF
providers:
  - google:gemini-2.5-pro
  - google:gemini-2.5-flash

prompts:
  - "Explain {{topic}} in simple terms"

tests:
  - vars:
      topic: "quantum computing"
    assert:
      - type: contains
        value: "quantum"
EOF

# Run evaluation
promptfoo eval
promptfoo view
```

### Weights & Biases Setup
```bash
# Install wandb
pip install wandb

# Login to wandb
wandb login

# Run evaluation with tracking
python -c "
import wandb
import os
import requests

wandb.init(project='gemini-quick-start')

# Your evaluation code here
response = requests.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    headers={'x-goog-api-key': os.getenv('GOOGLE_API_KEY'), 'Content-Type': 'application/json'},
    json={'contents': [{'parts': [{'text': 'Hello, Gemini!'}]}]}
)

wandb.log({'response_length': len(response.json()['candidates'][0]['content']['parts'][0]['text'])})
wandb.finish()
"
```

## Testing Your Setup

### 1. Environment Test
```bash
# Test API key
curl -H "x-goog-api-key: $GOOGLE_API_KEY" \
     "https://generativelanguage.googleapis.com/v1beta/models"
```

### 2. Model Test
```bash
# Test model access
curl -H "Content-Type: application/json" \
     -H "x-goog-api-key: $GOOGLE_API_KEY" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
```

## Common Issues

### Authentication Error
```bash
# Error: 401 Unauthorized
# Solution: Check your API key
echo $GOOGLE_API_KEY  # Should show your key
```

### Model Not Found Error
```bash
# Error: Model not found
# Solution: Use correct model names
#  Correct: gemini-2.5-pro, gemini-2.5-flash
#  Incorrect: gemini-pro, gpt-4
```

### Rate Limiting
```bash
# Error: 429 Too Many Requests
# Solution: Add delays between requests
sleep 1  # Add 1 second delay
```

## Next Steps

1. **Read the full documentation**: [README.md](README.md)
2. **Explore models**: [Model Documentation](docs/models/README.md)
3. **Advanced features**: [Advanced Features](docs/advanced-features/README.md)
4. **Code examples**: [Examples](examples/README.md)
5. **Evaluation frameworks**: [Promptfoo](integrations/promptfoo/README.md) | [WandB](integrations/wandb/README.md)

## Support

- [Full Documentation](README.md)
- [GitHub Issues](https://github.com/your-repo/gemini-apis-doc/issues)
- [Google AI Documentation](https://ai.google.dev/gemini-api/docs)

Happy evaluating! 