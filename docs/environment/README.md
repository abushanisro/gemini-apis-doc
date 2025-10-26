# Environment Setup Guide 

Comprehensive guide for setting up environment variables and authentication for Gemini API evaluation across different platforms and environments.

##  Table of Contents

1. [Authentication Methods](#authentication-methods)
2. [Environment Variables](#environment-variables)
3. [Local Development Setup](#local-development-setup)
4. [Cloud Deployment](#cloud-deployment)
5. [Security Best Practices](#security-best-practices)
6. [Platform-Specific Setup](#platform-specific-setup)
7. [Troubleshooting](#troubleshooting)

## Authentication Methods

Gemini API supports multiple authentication methods depending on your use case and deployment environment.

### Google AI Studio API Key
**Best for**: Development, testing, evaluation frameworks
**Supports**: Gemini models via Google AI Studio

### Google Cloud Service Account
**Best for**: Production, cloud deployments, enterprise
**Supports**: All Gemini models via Vertex AI

### Application Default Credentials (ADC)
**Best for**: Google Cloud environments, CI/CD pipelines
**Supports**: Automatic credential discovery

## Environment Variables

### Primary Variables

#### GOOGLE_API_KEY
**Purpose**: Google AI Studio API authentication
**Required for**: Direct Gemini API access
**Format**: String (API key)

```bash
export GOOGLE_API_KEY="your_api_key_here"
```

#### GOOGLE_APPLICATION_CREDENTIALS
**Purpose**: Service account key file path
**Required for**: Vertex AI access
**Format**: File path to JSON key file

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

#### GOOGLE_CLOUD_PROJECT
**Purpose**: Google Cloud project ID
**Required for**: Vertex AI API calls
**Format**: String (project ID)

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

### Optional Variables

#### GOOGLE_CLOUD_REGION
**Purpose**: Specify Google Cloud region
**Default**: `us-central1`
**Format**: String (region)

```bash
export GOOGLE_CLOUD_REGION="us-central1"
```

#### GEMINI_API_ENDPOINT
**Purpose**: Custom API endpoint
**Default**: `https://generativelanguage.googleapis.com`
**Format**: URL

```bash
export GEMINI_API_ENDPOINT="https://generativelanguage.googleapis.com"
```

#### GEMINI_MODEL_VERSION
**Purpose**: Default model version
**Default**: Latest stable
**Format**: String

```bash
export GEMINI_MODEL_VERSION="google:gemini-2.5-pro"
```

## Local Development Setup

### Method 1: Google AI Studio API Key

#### Step 1: Obtain API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to "Get API Key"
4. Create a new API key or use existing one
5. Copy the API key

#### Step 2: Set Environment Variable

**Linux/macOS**:
```bash
# Temporary (current session)
export GOOGLE_API_KEY="your_api_key_here"

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export GOOGLE_API_KEY="your_api_key_here"' >> ~/.bashrc
source ~/.bashrc
```

**Windows (PowerShell)**:
```powershell
# Temporary (current session)
$env:GOOGLE_API_KEY="your_api_key_here"

# Permanent (system-wide)
[Environment]::SetEnvironmentVariable("GOOGLE_API_KEY", "your_api_key_here", "User")
```

**Windows (Command Prompt)**:
```cmd
# Temporary (current session)
set GOOGLE_API_KEY=your_api_key_here

# Permanent (system-wide)
setx GOOGLE_API_KEY "your_api_key_here"
```

#### Step 3: Verify Setup
```bash
# Test with curl
curl -H "Content-Type: application/json" \\
     -H "x-goog-api-key: $GOOGLE_API_KEY" \\
     -d '{
       "contents": [
         {
           "parts": [
             {"text": "Hello, world!"}
           ]
         }
       ]
     }' \\
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
```

### Method 2: Service Account (Vertex AI)

#### Step 1: Create Service Account
```bash
# Install Google Cloud CLI if not already installed
# https://cloud.google.com/sdk/docs/install

# Authenticate with Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create service account
gcloud iam service-accounts create gemini-evaluator \\
    --display-name="Gemini Evaluator" \\
    --description="Service account for Gemini API evaluation"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \\
    --member="serviceAccount:gemini-evaluator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
    --role="roles/aiplatform.user"

# Create and download key file
gcloud iam service-accounts keys create ~/gemini-key.json \\
    --iam-account=gemini-evaluator@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### Step 2: Set Environment Variables
```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/gemini-key.json"
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export GOOGLE_CLOUD_REGION="us-central1"
```

#### Step 3: Verify Setup
```python
from google.cloud import aiplatform

# Initialize Vertex AI
aiplatform.init(
    project="YOUR_PROJECT_ID",
    location="us-central1"
)

# Test connection
print("Vertex AI initialized successfully!")
```

## Cloud Deployment

### Google Cloud Run

#### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Service account key will be mounted as volume
ENV GOOGLE_APPLICATION_CREDENTIALS="/etc/gcp/service-account-key.json"

CMD ["python", "app.py"]
```

#### Deploy with Service Account
```bash
# Deploy to Cloud Run with service account
gcloud run deploy gemini-evaluator \\
    --image gcr.io/YOUR_PROJECT_ID/gemini-evaluator \\
    --service-account gemini-evaluator@YOUR_PROJECT_ID.iam.gserviceaccount.com \\
    --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID \\
    --region us-central1
```

### AWS Deployment

#### Using AWS Secrets Manager
```python
import boto3
import json

def get_google_credentials():
    session = boto3.Session()
    client = session.client('secretsmanager')

    secret_value = client.get_secret_value(SecretId='gemini-api-key')
    secret = json.loads(secret_value['SecretString'])

    return secret['GOOGLE_API_KEY']

# Set environment variable
import os
os.environ['GOOGLE_API_KEY'] = get_google_credentials()
```

#### ECS Task Definition
```json
{
  "family": "gemini-evaluator",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ECSTaskRole",
  "containerDefinitions": [
    {
      "name": "gemini-app",
      "image": "your-image:latest",
      "secrets": [
        {
          "name": "GOOGLE_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:gemini-api-key"
        }
      ]
    }
  ]
}
```

### Azure Deployment

#### Using Azure Key Vault
```python
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential()
client = SecretClient(vault_url="https://your-vault.vault.azure.net/", credential=credential)

secret = client.get_secret("gemini-api-key")
os.environ['GOOGLE_API_KEY'] = secret.value
```

## Security Best Practices

###  API Key Security

#### DO's 
- Store API keys in environment variables
- Use secret management services in production
- Rotate keys regularly
- Limit API key permissions
- Monitor API key usage
- Use different keys for different environments

#### DON'Ts 
- Never commit API keys to version control
- Don't hardcode keys in source code
- Don't share keys via insecure channels
- Don't use production keys for development
- Don't store keys in plain text files

### Environment-Specific Keys

#### Development
```bash
# Use restricted development key
export GOOGLE_API_KEY="AIza...dev_key_here"
export GEMINI_ENVIRONMENT="development"
```

#### Staging
```bash
# Use staging key with monitoring
export GOOGLE_API_KEY="AIza...staging_key_here"
export GEMINI_ENVIRONMENT="staging"
```

#### Production
```bash
# Use production key with full monitoring
export GOOGLE_API_KEY="AIza...prod_key_here"
export GEMINI_ENVIRONMENT="production"
```

### Key Rotation Strategy

#### Automated Rotation Script
```bash
#!/bin/bash

# rotate_gemini_keys.sh
echo "Starting key rotation..."

# Generate new key
NEW_KEY=$(gcloud auth application-default print-access-token)

# Update secret manager
gcloud secrets versions add gemini-api-key --data-file=- <<< "$NEW_KEY"

# Restart services
kubectl rollout restart deployment gemini-evaluator

echo "Key rotation completed"
```

### Monitoring and Auditing

#### Environment Variable Validation
```python
import os

def validate_environment():
    required_vars = ['GOOGLE_API_KEY']
    optional_vars = {
        'GOOGLE_CLOUD_PROJECT': None,
        'GOOGLE_CLOUD_REGION': 'us-central1',
        'GEMINI_ENVIRONMENT': 'development'
    }

    # Check required variables
    for var in required_vars:
        if not os.getenv(var):
            raise ValueError(f"Required environment variable {var} not set")

    # Set defaults for optional variables
    for var, default in optional_vars.items():
        if not os.getenv(var) and default:
            os.environ[var] = default

    return True

# Usage
validate_environment()
```

## Platform-Specific Setup

### Promptfoo Integration

#### Configuration File (promptfooconfig.yaml)
```yaml
providers:
  - id: google:gemini-2.5-pro
    config:
      apiKey: ${GOOGLE_API_KEY}
      temperature: 0.7
      maxOutputTokens: 1024

  - id: vertex:gemini-2.5-pro
    config:
      projectId: ${GOOGLE_CLOUD_PROJECT}
      region: ${GOOGLE_CLOUD_REGION}

tests:
  - vars:
      task: "Solve this math problem"
    assert:
      - type: contains
        value: "answer"
```

#### Environment Setup
```bash
# For Google AI Studio
export GOOGLE_API_KEY="your_key_here"

# For Vertex AI
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Run evaluation
npx promptfoo eval
```

### Weights & Biases Integration

#### WandB Configuration
```python
import wandb
import os

# Initialize wandb
wandb.init(
    project="gemini-evaluation",
    config={
        "model": "gemini-2.5-pro",
        "temperature": 0.7,
        "api_key_hash": hash(os.getenv('GOOGLE_API_KEY'))  # Don't log actual key
    }
)

# Log API configuration (without sensitive data)
wandb.config.update({
    "google_cloud_project": os.getenv('GOOGLE_CLOUD_PROJECT'),
    "google_cloud_region": os.getenv('GOOGLE_CLOUD_REGION'),
    "environment": os.getenv('GEMINI_ENVIRONMENT', 'development')
})
```

### Jupyter Notebook Setup

#### Cell 1: Environment Setup
```python
import os
import getpass

# Secure API key input
if 'GOOGLE_API_KEY' not in os.environ:
    os.environ['GOOGLE_API_KEY'] = getpass.getpass('Enter your Google API key: ')

# Verify setup
print(" Environment configured successfully")
print(f" Environment: {os.getenv('GEMINI_ENVIRONMENT', 'development')}")
print(f" Project: {os.getenv('GOOGLE_CLOUD_PROJECT', 'Not set')}")
```

#### Cell 2: Test Connection
```python
import requests

def test_gemini_connection():
    headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': os.getenv('GOOGLE_API_KEY')
    }

    data = {
        "contents": [
            {"parts": [{"text": "Hello, Gemini!"}]}
        ]
    }

    response = requests.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        headers=headers,
        json=data
    )

    if response.status_code == 200:
        print(" Connection successful!")
        return True
    else:
        print(f" Connection failed: {response.status_code}")
        print(response.text)
        return False

test_gemini_connection()
```

## Troubleshooting

### Common Issues

#### Issue: "API key not found"
```bash
# Check if variable is set
echo $GOOGLE_API_KEY

# If empty, set it
export GOOGLE_API_KEY="your_key_here"

# Verify it's working
curl -H "x-goog-api-key: $GOOGLE_API_KEY" \\
     "https://generativelanguage.googleapis.com/v1beta/models"
```

#### Issue: "Permission denied"
```bash
# Check service account permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID \\
    --flatten="bindings[].members" \\
    --filter="bindings.members:serviceAccount:gemini-evaluator@YOUR_PROJECT_ID.iam.gserviceaccount.com"

# Add missing role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \\
    --member="serviceAccount:gemini-evaluator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
    --role="roles/aiplatform.user"
```

#### Issue: "Quota exceeded"
```bash
# Check quota usage
gcloud logging read "resource.type=consumed_api AND \\
    protoPayload.serviceName=generativelanguage.googleapis.com" \\
    --limit=10 --format="table(timestamp, protoPayload.methodName)"

# Monitor current usage
gcloud services quota describe \\
    --service=generativelanguage.googleapis.com \\
    --project=YOUR_PROJECT_ID
```

### Debug Commands

#### Environment Validation
```bash
#!/bin/bash

echo " Environment Validation"
echo "========================"

# Check required variables
echo " Checking environment variables..."
for var in "GOOGLE_API_KEY" "GOOGLE_CLOUD_PROJECT"; do
    if [ -n "${!var}" ]; then
        echo " $var: Set (${#!var} characters)"
    else
        echo " $var: Not set"
    fi
done

# Test API connectivity
echo "Testing API connectivity..."
if command -v curl &> /dev/null; then
    response=$(curl -s -o /dev/null -w "%{http_code}" \\
        -H "x-goog-api-key: $GOOGLE_API_KEY" \\
        "https://generativelanguage.googleapis.com/v1beta/models")

    if [ "$response" = "200" ]; then
        echo " API connection: Working"
    else
        echo " API connection: Failed (HTTP $response)"
    fi
else
    echo "  curl not available, skipping API test"
fi

echo " Validation complete"
```

### Environment-Specific Testing

#### Development Environment Test
```python
def test_development_setup():
    import os
    import requests

    # Required for development
    assert os.getenv('GOOGLE_API_KEY'), "GOOGLE_API_KEY required for development"

    # Test basic API call
    response = requests.get(
        'https://generativelanguage.googleapis.com/v1beta/models',
        headers={'x-goog-api-key': os.getenv('GOOGLE_API_KEY')}
    )

    assert response.status_code == 200, f"API test failed: {response.status_code}"
    print(" Development environment ready")

if __name__ == "__main__":
    test_development_setup()
```

#### Production Environment Test
```python
def test_production_setup():
    import os
    from google.cloud import aiplatform

    # Required for production
    assert os.getenv('GOOGLE_APPLICATION_CREDENTIALS'), "Service account credentials required"
    assert os.getenv('GOOGLE_CLOUD_PROJECT'), "Project ID required"

    # Test Vertex AI connection
    aiplatform.init(
        project=os.getenv('GOOGLE_CLOUD_PROJECT'),
        location=os.getenv('GOOGLE_CLOUD_REGION', 'us-central1')
    )

    print(" Production environment ready")

if __name__ == "__main__":
    test_production_setup()
```

## Next Steps

- [Advanced Features](../advanced-features/README.md)
- [Code Examples](../../examples/README.md)
- [Promptfoo Integration](../../integrations/promptfoo/README.md)
- [Weights & Biases Integration](../../integrations/wandb/README.md)