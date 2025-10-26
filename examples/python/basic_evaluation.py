#!/usr/bin/env python3
"""
Basic Gemini API Evaluation Examples in Python

This module provides simple examples for evaluating Gemini models
using Python. Suitable for beginners and quick testing.
"""

import os
import json
import time
import base64
import requests
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from pathlib import Path


@dataclass
class EvaluationResult:
    """Data class for storing evaluation results"""
    prompt: str
    response: str
    model: str
    usage: Dict[str, Any]
    timestamp: str
    latency_ms: int
    error: Optional[str] = None


class BasicGeminiEvaluator:
    """Simple Gemini API evaluator for basic text generation tasks"""

    def __init__(self, api_key: str, model: str = "gemini-2.5-pro"):
        """
        Initialize the evaluator

        Args:
            api_key: Google API key for Gemini
            model: Model name to use for evaluation
        """
        self.api_key = api_key
        self.model = model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.results: List[EvaluationResult] = []

    def evaluate_text(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1024
    ) -> EvaluationResult:
        """
        Evaluate a single text prompt

        Args:
            prompt: Text prompt to evaluate
            temperature: Sampling temperature (0.0 to 2.0)
            max_tokens: Maximum tokens in response

        Returns:
            EvaluationResult object with response and metadata
        """
        start_time = time.time()

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "topP": 0.9
            }
        }

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }

        try:
            response = requests.post(
                f"{self.base_url}/{self.model}:generateContent",
                headers=headers,
                json=payload,
                timeout=30
            )

            latency_ms = int((time.time() - start_time) * 1000)

            if response.status_code != 200:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                result = EvaluationResult(
                    prompt=prompt,
                    response="",
                    model=self.model,
                    usage={},
                    timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                    latency_ms=latency_ms,
                    error=error_msg
                )
                self.results.append(result)
                return result

            response_data = response.json()

            # Extract response text
            response_text = ""
            if "candidates" in response_data and response_data["candidates"]:
                candidate = response_data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    response_text = candidate["content"]["parts"][0].get("text", "")

            result = EvaluationResult(
                prompt=prompt,
                response=response_text,
                model=self.model,
                usage=response_data.get("usageMetadata", {}),
                timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                latency_ms=latency_ms
            )

            self.results.append(result)
            return result

        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            result = EvaluationResult(
                prompt=prompt,
                response="",
                model=self.model,
                usage={},
                timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                latency_ms=latency_ms,
                error=str(e)
            )
            self.results.append(result)
            return result

    def batch_evaluate(
        self,
        prompts: List[str],
        temperature: float = 0.7,
        max_tokens: int = 1024,
        delay_seconds: float = 1.0
    ) -> List[EvaluationResult]:
        """
        Evaluate multiple prompts with rate limiting

        Args:
            prompts: List of text prompts to evaluate
            temperature: Sampling temperature
            max_tokens: Maximum tokens per response
            delay_seconds: Delay between requests for rate limiting

        Returns:
            List of EvaluationResult objects
        """
        results = []

        for i, prompt in enumerate(prompts):
            print(f"Evaluating prompt {i+1}/{len(prompts)}: {prompt[:50]}...")

            result = self.evaluate_text(prompt, temperature, max_tokens)
            results.append(result)

            if result.error:
                print(f"  Error: {result.error}")
            else:
                print(f"  Success: {len(result.response)} chars, {result.latency_ms}ms")

            # Rate limiting delay (except for last request)
            if i < len(prompts) - 1:
                time.sleep(delay_seconds)

        return results

    def evaluate_image(
        self,
        prompt: str,
        image_path: str,
        temperature: float = 0.3
    ) -> EvaluationResult:
        """
        Evaluate a prompt with an image

        Args:
            prompt: Text prompt describing the task
            image_path: Path to image file
            temperature: Sampling temperature

        Returns:
            EvaluationResult object with response and metadata
        """
        start_time = time.time()

        try:
            # Read and encode image
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')

            # Detect MIME type
            image_path_obj = Path(image_path)
            extension = image_path_obj.suffix.lower()
            mime_types = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp',
                '.gif': 'image/gif'
            }
            mime_type = mime_types.get(extension, 'image/jpeg')

            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": image_data
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": temperature,
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
                json=payload,
                timeout=60
            )

            latency_ms = int((time.time() - start_time) * 1000)

            if response.status_code != 200:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                result = EvaluationResult(
                    prompt=f"[IMAGE] {prompt}",
                    response="",
                    model=self.model,
                    usage={},
                    timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                    latency_ms=latency_ms,
                    error=error_msg
                )
                self.results.append(result)
                return result

            response_data = response.json()
            response_text = ""

            if "candidates" in response_data and response_data["candidates"]:
                candidate = response_data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    response_text = candidate["content"]["parts"][0].get("text", "")

            result = EvaluationResult(
                prompt=f"[IMAGE] {prompt}",
                response=response_text,
                model=self.model,
                usage=response_data.get("usageMetadata", {}),
                timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                latency_ms=latency_ms
            )

            self.results.append(result)
            return result

        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            result = EvaluationResult(
                prompt=f"[IMAGE] {prompt}",
                response="",
                model=self.model,
                usage={},
                timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                latency_ms=latency_ms,
                error=str(e)
            )
            self.results.append(result)
            return result

    def get_statistics(self) -> Dict[str, Any]:
        """
        Calculate basic statistics from evaluation results

        Returns:
            Dictionary with evaluation statistics
        """
        if not self.results:
            return {"message": "No evaluations performed yet"}

        successful = [r for r in self.results if not r.error]
        failed = [r for r in self.results if r.error]

        total_tokens = sum(
            r.usage.get("totalTokenCount", 0) for r in successful
        )

        average_latency = sum(r.latency_ms for r in self.results) / len(self.results)

        return {
            "total_evaluations": len(self.results),
            "successful": len(successful),
            "failed": len(failed),
            "success_rate": len(successful) / len(self.results) * 100,
            "average_latency_ms": round(average_latency, 2),
            "total_tokens_used": total_tokens,
            "average_response_length": round(
                sum(len(r.response) for r in successful) / len(successful)
                if successful else 0, 2
            )
        }

    def save_results(self, filename: str = "evaluation_results.json") -> None:
        """
        Save evaluation results to a JSON file

        Args:
            filename: Output filename
        """
        data = {
            "metadata": {
                "model": self.model,
                "total_evaluations": len(self.results),
                "generated_at": time.strftime("%Y-%m-%d %H:%M:%S")
            },
            "statistics": self.get_statistics(),
            "results": [asdict(result) for result in self.results]
        }

        with open(filename, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"Results saved to {filename}")

    def print_summary(self) -> None:
        """Print a summary of evaluation results"""
        stats = self.get_statistics()

        print("\\n" + "="*50)
        print("EVALUATION SUMMARY")
        print("="*50)

        for key, value in stats.items():
            if key == "success_rate":
                print(f"{key.replace('_', ' ').title()}: {value:.1f}%")
            elif isinstance(value, float):
                print(f"{key.replace('_', ' ').title()}: {value:.2f}")
            else:
                print(f"{key.replace('_', ' ').title()}: {value}")

        print("\\n" + "-"*50)
        print("RECENT RESULTS:")
        print("-"*50)

        # Show last 3 results
        for result in self.results[-3:]:
            status = "ERROR" if result.error else "SUCCESS"
            print(f"{status} | {result.prompt[:40]}...")
            if result.error:
                print(f"         Error: {result.error}")
            else:
                print(f"         Response: {result.response[:60]}...")
            print(f"         Latency: {result.latency_ms}ms")
            print()


def main():
    """
    Example usage of the BasicGeminiEvaluator
    """
    # Get API key from environment
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Please set the GOOGLE_API_KEY environment variable")
        return

    # Initialize evaluator
    evaluator = BasicGeminiEvaluator(api_key, "gemini-2.5-flash")

    print("Starting basic Gemini evaluation examples...")

    # Example 1: Single text evaluation
    print("\\n1. Single text evaluation:")
    result = evaluator.evaluate_text(
        "Explain machine learning in one paragraph",
        temperature=0.3
    )
    print(f"Response: {result.response[:100]}...")

    # Example 2: Batch evaluation
    print("\\n2. Batch evaluation:")
    prompts = [
        "What is Python?",
        "Explain quantum computing briefly",
        "Write a haiku about technology",
        "List 3 benefits of renewable energy"
    ]

    batch_results = evaluator.batch_evaluate(prompts, temperature=0.5)

    # Example 3: Image evaluation (if image file exists)
    image_path = "sample_image.jpg"
    if os.path.exists(image_path):
        print("\\n3. Image evaluation:")
        image_result = evaluator.evaluate_image(
            "Describe what you see in this image",
            image_path
        )
        print(f"Image analysis: {image_result.response[:100]}...")
    else:
        print("\\n3. Skipping image evaluation (no sample_image.jpg found)")

    # Show summary
    evaluator.print_summary()

    # Save results
    evaluator.save_results("basic_evaluation_results.json")


if __name__ == "__main__":
    main()