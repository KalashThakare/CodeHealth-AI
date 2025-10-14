from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import os
from together import Together
from anthropic import Anthropic
from openai import OpenAI
from ..schemas.llmSchema import LLMSettings
import httpx
from fastapi import HTTPException

llm = LLMSettings()

together_client = Together(api_key=llm.together_api_key)
gemini_api_key = llm.gemini_api_key 
GEMINI_MODEL = "gemini-2.0-flash-lite"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1/models/{GEMINI_MODEL}:generateContent"
# anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
# openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# async def call_llm_claude(prompt: str, max_tokens: int = 4000) -> str:
#     """Call Claude API with the given prompt"""
#     try:
#         message = anthropic_client.messages.create(
#             model="claude-sonnet-4-20250514",  # or claude-opus-4-20250514 for better quality
#             max_tokens=max_tokens,
#             temperature=0.3,  # Lower temperature for more consistent analysis
#             messages=[
#                 {
#                     "role": "user",
#                     "content": prompt
#                 }
#             ]
#         )
#         return message.content[0].text
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"LLM API error: {str(e)}")

async def call_llm_openai(prompt: str, max_tokens: int = 4000) -> str:
    """Alternative: Call OpenAI API with the given prompt"""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",  # or gpt-4o for latest
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior software engineer and architect specializing in code quality analysis and refactoring."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM API error: {str(e)}")

import json

async def parse_llm_response(response: str) -> Dict[str, Any]:
    """Parse LLM response and extract JSON"""
    try:
        # Try to find JSON in the response
        start_idx = response.find('{')
        end_idx = response.rfind('}') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response[start_idx:end_idx]
            return json.loads(json_str)
        else:
            # If no JSON found, return as plain text
            return {"rawResponse": response}
    except json.JSONDecodeError:
        return {"rawResponse": response}


async def call_llm_together(prompt: str, max_tokens: int = 4000) -> str:
    """Call Together AI API with the given prompt"""
    try:
        response = together_client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",  # strong model for reasoning and summaries
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior software engineer specializing in repository health, code metrics, and technical debt analysis."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Together AI API error: {str(e)}")
    
async def call_llm_claude(prompt: str, max_tokens: int = 4000) -> str:
    """
    Call Gemini 1.5 Flash API asynchronously with the given prompt.
    Returns the model's text output.
    """
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": max_tokens
        }
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={gemini_api_key}",
                headers=headers,
                json=payload
            )
            data = response.json()

            if "error" in data:
                err = data["error"]
                raise HTTPException(status_code=response.status_code, detail=f"Gemini API error: {err.get('message')}")

        # --- Handle missing candidates (no output) ---
            if "candidates" not in data or not data["candidates"]:
                raise HTTPException(status_code=500, detail=f"Gemini API returned unexpected response: {data}")

        # --- Extract generated text ---
            return data["candidates"][0]["content"]["parts"][0].get("text", "").strip()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")
