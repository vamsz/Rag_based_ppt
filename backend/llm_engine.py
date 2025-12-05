import os
import json
import logging
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMEngine:
    def __init__(self):
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            logger.warning("OPENROUTER_API_KEY not found in environment variables.")
        
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        self.model = "z-ai/glm-4.5-air:free"

    def generate_presentation_structure(self, topic: str, context: str) -> list:
        """
        Generates a presentation structure (JSON) based on topic and context.
        
        Args:
            topic: The presentation topic.
            context: RAG context retrieved from the knowledge base.
            
        Returns:
            list: A list of slide dictionaries.
        """
        prompt = f"""
You are a presentation architect. Create a structured PowerPoint presentation on the topic: "{topic}".
Use the following context to inform the content:
{context}

Requirements:
1. Output strictly valid JSON.
2. Structure: A list of objects, where each object represents a slide.
3. Each slide object must have:
   - "type": "Title" (for the first slide) or "Content" (for others).
   - "title": The slide headline.
   - "content": Bullet points or short paragraphs.
4. Create at least 5 slides.
5. Do not include markdown formatting (like ```json). Just the raw JSON array.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
            )
            
            content = response.choices[0].message.content.strip()
            
            # Clean up if the model wraps in markdown code blocks despite instructions
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            slides_data = json.loads(content)
            return slides_data
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error: {e}. Content: {content}")
            # Fallback/Retry logic could go here
            return []
        except Exception as e:
            logger.error(f"LLM Error: {e}")
            return []

