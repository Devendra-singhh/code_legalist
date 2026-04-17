# legal_ner.py (Mock Version)
import logging

logger = logging.getLogger(__name__)

def load_model():
    """Mock load_model (torch/transformers skipped)"""
    logger.info("Using mock NER model (local model skipped)")
    return None, None

def extract_ner_entities(text, model, tokenizer):
    """Mock extract_ner_entities (returns empty list)"""
    # In a real environment, this would use BERT to extract legal entities.
    # For now, we return an empty list so the system falls back to the LLM.
    logger.info("Mock NER extraction called")
    return []