# Contributing to Gemini APIs Documentation 

Thank you for your interest in improving the Gemini APIs evaluation documentation! This project aims to provide comprehensive, practical guidance for evaluating Gemini models using various frameworks and tools.

##  Table of Contents

1. [How to Contribute](#how-to-contribute)
2. [Documentation Standards](#documentation-standards)
3. [Code Examples Guidelines](#code-examples-guidelines)
4. [Testing Requirements](#testing-requirements)
5. [Submitting Changes](#submitting-changes)

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Documentation improvements**: Fixing typos, clarifying explanations, adding examples
- **New code examples**: Adding examples in different languages or frameworks
- **Integration guides**: New evaluation platform integrations
- **Best practices**: Sharing your evaluation strategies and lessons learned
- **Bug fixes**: Correcting errors in code examples or documentation
- **Feature requests**: Suggesting new sections or improvements

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-improvement`
3. **Make your changes**
4. **Test your changes** (see [Testing Requirements](#testing-requirements))
5. **Submit a pull request**

## Documentation Standards

### Writing Style

- **Clear and concise**: Write for developers who want to get things done quickly
- **Practical focus**: Always include working code examples
- **Beginner-friendly**: Assume basic knowledge but explain complex concepts
- **Consistent terminology**: Use the same terms throughout the documentation


#### Markdown Standards

1. **Use consistent heading hierarchy**:
   ```markdown
   # Main Title (H1)
   ## Section (H2)
   ### Subsection (H3)
   #### Detail (H4)
   ```

2. **Include table of contents** for documents longer than 500 words:
   ```markdown
   ##  Table of Contents
   1. [Section 1](#section-1)
   2. [Section 2](#section-2)
   ```

3. **Use code blocks with language specification**:
   ```markdown
   ```python
   # Python code here
   ```

   ```javascript
   // JavaScript code here
   ```
   ```

4. **Include practical examples** in every section:
   ```markdown
   ### Configuration Example
   ```yaml
   # Example configuration
   providers:
     - google:gemini-2.5-pro
   ```
   ```

### Content Requirements

#### Every documentation section should include:

1. **Clear purpose statement**: What this section covers and why it's useful
2. **Prerequisites**: What users need before starting
3. **Step-by-step instructions**: Concrete, actionable steps
4. **Working code examples**: Complete, runnable examples
5. **Common issues**: Troubleshooting section with solutions
6. **Next steps**: Links to related documentation

#### Code Examples Requirements

1. **Complete and runnable**: Users should be able to copy-paste and run
2. **Well-commented**: Explain what each section does
3. **Error handling**: Include appropriate error handling
4. **Best practices**: Demonstrate good coding practices
5. **Multiple scenarios**: Cover common use cases

## Code Examples Guidelines

### Python Examples

```python
#!/usr/bin/env python3
"""
Brief description of what this example demonstrates

This module shows how to [specific functionality].
Suitable for [target audience/use case].
"""

import os
import requests
from typing import List, Dict, Any

class ExampleClass:
    """
    Brief class description

    Args:
        api_key: Google API key for Gemini access
        model: Model name to use (default: gemini-2.5-pro)
    """

    def __init__(self, api_key: str, model: str = "gemini-2.5-pro"):
        self.api_key = api_key
        self.model = model

    def example_method(self, prompt: str) -> Dict[str, Any]:
        """
        Brief method description

        Args:
            prompt: Text prompt to evaluate

        Returns:
            Dictionary containing response and metadata

        Raises:
            ValueError: If prompt is empty
            RuntimeError: If API call fails
        """
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty")

        try:
            # Implementation here
            pass
        except Exception as e:
            raise RuntimeError(f"API call failed: {e}")

# Example usage
if __name__ == "__main__":
    # Get API key from environment
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Please set the GOOGLE_API_KEY environment variable")
        exit(1)

    # Example usage
    evaluator = ExampleClass(api_key)
    result = evaluator.example_method("Example prompt")
    print(result)
```

### JavaScript Examples

```javascript
#!/usr/bin/env node

/**
 * Brief description of what this example demonstrates
 *
 * This module shows how to [specific functionality].
 * Suitable for [target audience/use case].
 */

const fetch = require('node-fetch');

class ExampleClass {
    /**
     * Brief class description
     *
     * @param {string} apiKey - Google API key for Gemini access
     * @param {string} model - Model name to use
     */
    constructor(apiKey, model = 'gemini-2.5-pro') {
        this.apiKey = apiKey;
        this.model = model;
    }

    /**
     * Brief method description
     *
     * @param {string} prompt - Text prompt to evaluate
     * @returns {Promise<Object>} Response and metadata
     * @throws {Error} If prompt is empty or API call fails
     */
    async exampleMethod(prompt) {
        if (!prompt.trim()) {
            throw new Error('Prompt cannot be empty');
        }

        try {
            // Implementation here
        } catch (error) {
            throw new Error(`API call failed: ${error.message}`);
        }
    }
}

// Example usage
async function main() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('Please set the GOOGLE_API_KEY environment variable');
        process.exit(1);
    }

    const evaluator = new ExampleClass(apiKey);
    const result = await evaluator.exampleMethod('Example prompt');
    console.log(result);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ExampleClass;
```

### Configuration File Examples

#### YAML Configuration
```yaml
# Brief description of what this configuration does
description: "Example configuration for [specific use case]"

# Required settings
providers:
  - id: gemini-2.5-pro
    config:
      apiKey: ${GOOGLE_API_KEY}
      temperature: 0.7

# Optional settings with explanations
optional_settings:
  timeout: 30000  # Request timeout in milliseconds
  retries: 3      # Number of retry attempts
```

## Testing Requirements

### Before Submitting

1. **Test all code examples**:
   ```bash
   # Python examples
   cd examples/python
   python basic_evaluation.py

   # JavaScript examples
   cd examples/javascript
   node basic_evaluation.js
   ```

2. **Verify links work**:
   ```bash
   # Check internal links
   grep -r "\[.*\](.*)" docs/ | grep -v "http"
   ```

3. **Spell check**:
   ```bash
   # Use aspell or similar
   aspell check README.md
   ```

4. **Validate YAML/JSON**:
   ```bash
   # Check YAML syntax
   python -c "import yaml; yaml.safe_load(open('config.yaml'))"

   # Check JSON syntax
   python -c "import json; json.load(open('config.json'))"
   ```

### Testing Checklist

- [ ] All code examples run without errors
- [ ] Environment variables are properly documented
- [ ] Error handling works as expected
- [ ] Links point to correct locations
- [ ] Code follows style guidelines
- [ ] Documentation is clear and concise

## Submitting Changes

### Pull Request Guidelines

1. **Clear title**: Describe what your PR does
   -  "Add TypeScript example for function calling"
   -  "Update files"

2. **Detailed description**:
   ```markdown
   ## Changes Made
   - Added TypeScript example for function calling evaluation
   - Updated README with new example links
   - Fixed typo in configuration documentation

   ## Testing
   - [x] Tested TypeScript example with Node.js 18
   - [x] Verified all links work correctly
   - [x] Ran spell check on new content

   ## Related Issues
   Closes #123
   ```

3. **Small, focused changes**: One improvement per PR
4. **Update relevant documentation**: If you change code, update docs
5. **Add yourself to contributors**: Update CONTRIBUTORS.md if it exists

### Review Process

1. **Automated checks**: CI will run basic tests
2. **Maintainer review**: A maintainer will review your changes
3. **Feedback incorporation**: Address any requested changes
4. **Merge**: Once approved, your changes will be merged

### Code Review Criteria

Reviewers will check for:

- **Accuracy**: Information is correct and up-to-date
- **Completeness**: Examples are complete and runnable
- **Clarity**: Documentation is easy to understand
- **Consistency**: Follows existing patterns and style
- **Value**: Adds meaningful value to users

## Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md** file (if maintained)
- **Release notes** for significant contributions
- **GitHub contributors** page

## Questions?

- **Documentation questions**: Open an issue with the "documentation" label
- **Code questions**: Open an issue with the "code" label
- **General questions**: Start a discussion in the repository

Thank you for helping make Gemini API evaluation more accessible to everyone! 