import os
import requests
from typing import Literal

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

Provider = Literal["openai", "groq", "deepseek"]


# -----------------------------
# OpenAI (default)
# -----------------------------
def call_openai(prompt: str) -> str:
    url = "https://api.openai.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
    }

    data = {
        "model": "gpt-4.1-mini",  # default: cheap, accurate
        "messages": [{"role": "user", "content": prompt}],
    }

    res = requests.post(url, headers=headers, json=data)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]


# -----------------------------
# Groq Llama-3 (Free, ultra fast)
# -----------------------------
def call_groq(prompt: str) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }

    data = {
        "model": "llama3-70b-8192",
        "messages": [{"role": "user", "content": prompt}],
    }

    res = requests.post(url, headers=headers, json=data)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]


# -----------------------------
# DeepSeek (Cheap, great for reasoning)
# -----------------------------
def call_deepseek(prompt: str) -> str:
    url = "https://api.deepseek.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
    }

    data = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": prompt}],
    }

    res = requests.post(url, headers=headers, json=data)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]


# -----------------------------
# Main routing function
# -----------------------------
def run_llm(provider: Provider, prompt: str) -> str:
    if provider == "openai":
        return call_openai(prompt)
    elif provider == "groq":
        return call_groq(prompt)
    elif provider == "deepseek":
        return call_deepseek(prompt)
    else:
        raise ValueError(f"Unknown provider {provider}")
