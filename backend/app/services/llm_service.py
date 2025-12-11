import os
import time
from typing import Literal
from openai import OpenAI

Provider = Literal["openai", "groq", "deepseek"]

# Client configurations for each provider
PROVIDERS = {
    "openai": {
        "api_key_env": "OPENAI_API_KEY",
        "base_url": None,
        "model": "gpt-4.1-mini",
    },
    "groq": {
        "api_key_env": "GROQ_API_KEY",
        "base_url": "https://api.groq.com/openai/v1",
        "model": "llama-3.3-70b-versatile",
    },
    "deepseek": {
        "api_key_env": "DEEPSEEK_API_KEY",
        "base_url": "https://api.deepseek.com/v1",
        "model": "deepseek-chat",
    },
}


def get_client(provider: Provider) -> OpenAI:
    """Get OpenAI-compatible client for the specified provider."""
    config = PROVIDERS[provider]
    api_key = os.environ.get(config["api_key_env"])
    
    if not api_key:
        raise ValueError(f"Missing API key: {config['api_key_env']}")
    
    if config["base_url"]:
        return OpenAI(api_key=api_key, base_url=config["base_url"])
    return OpenAI(api_key=api_key)


def generate_rag_answer(
    query: str,
    context_chunks: list[str],
    provider: Provider = "openai"
) -> tuple[str, float]:
    """Generate answer using retrieved context."""
    start = time.time()
    
    context_text = "\n\n---\n\n".join(context_chunks)
    
    prompt = f"""
You are an expert backend engineer helping another engineer understand and navigate a codebase.

You are given:
1) A natural-language question.
2) Documentation or source snippets retrieved from the user’s repository.

Your job:
- Use the retrieved snippets AS MUCH AS POSSIBLE.
- Always provide a clear, correct, and complete answer, similar in depth to what a senior engineer would write.
- Do NOT stop just because the context is partial; fill gaps with your own knowledge when needed.
- Ground statements in the snippets when possible.
- When using knowledge that is not directly in the snippets, mark it inline as:
  (general knowledge — not in retrieved docs)

FORMAT REQUIREMENTS
-------------------
Write plain text, NOT markdown headings. Do not use '#' or '###' at the start of lines.

Organize your answer into three numbered sections exactly like this:

1. Complete Answer (Docs + General Knowledge):
   Give a thorough explanation that would be genuinely useful to an engineer. dont state obvious thigns and steps, just give desired information:
   - Use the retrieved snippets as some evidence to help if useful, but do not mention them if not main.
   - Synthesize and explain, not just re-quote.
   - Add missing pieces with general knowledge when the docs are incomplete.
   - Aim for several well-developed paragraphs where appropriate, and examples and code if necessary.

2. Coverage Summary:
   In 1–3 sentences, briefly say whether the retrieved context fully, partially, or barely covers the question.

3. Helpful Files to Review:
   List 2–5 of the most relevant retrieved files and why each is useful, in short bullet-style lines.

# Context:
# {context_text}

# Question: {query}

# Answer:
"""

#     prompt = f"""You are a helpful assistant answering questions about a codebase/documentation.

# Use ONLY the context below to answer the question. If the context doesn't contain enough information, say so.

# Context:
# {context_text}

# Question: {query}

# Answer:"""

    client = get_client(provider)
    model = PROVIDERS[provider]["model"]
    
    completion = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    
    answer = completion.choices[0].message.content
    latency_ms = (time.time() - start) * 1000.0
    return answer, latency_ms


def generate_raw_answer(query: str, provider: Provider = "openai") -> tuple[str, float]:
    """Generate answer without any context (raw LLM)."""
    start = time.time()
    
    client = get_client(provider)
    model = PROVIDERS[provider]["model"]
    
    completion = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": query}],
        temperature=0.2,
    )
    
    answer = completion.choices[0].message.content
    latency_ms = (time.time() - start) * 1000.0
    return answer, latency_ms
    