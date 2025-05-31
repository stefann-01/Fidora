from dotenv import load_dotenv
load_dotenv()

import os
import openai
from typing import Optional
import json

class EvidenceAnalyzer:
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Evidence Analyzer with OpenAI API key.
        
        Args:
            api_key: OpenAI API key. If None, will try to get from environment variable.
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key not found. Please set OPENAI_API_KEY environment variable or pass it directly.")
        
        self.client = openai.OpenAI(api_key=self.api_key)
    
    def analyze_evidence_relevance(self, evidence: str, statement: str, claimed_side: bool) -> dict:
        """
        Analyze whether the evidence supports, opposes, is unrelated to, or is not evidence for the statement.
        
        Args:
            evidence: The evidence text (may contain links that the AI can search)
            statement: The statement to evaluate
            claimed_side: True if evidence claims to support the statement, False if it claims to oppose
            
        Returns:
            Dictionary with analysis results including quality score for SUPPORT/OPPOSE cases
        """
        
        prompt = f"""
You are an expert fact-checker and evidence analyst with web search capabilities. Your task is to determine whether the provided evidence actually supports, opposes, is unrelated to, or is not evidence for the given statement.

STATEMENT: "{statement}"

EVIDENCE: "{evidence}"

CLAIMED POSITION: The evidence claims to {"SUPPORT" if claimed_side else "OPPOSE"} the statement.

Please analyze the evidence, reason about it and determine:

1. ACTUAL RELATIONSHIP: Does the evidence actually:
   - SUPPORT the statement (provides facts/data that confirm it)
   - OPPOSE the statement (provides facts/data that contradict it)  
   - UNRELATED (content is about a completely different topic and has no connection to the statement)
   - NOT_EVIDENCE (personal opinion without supporting materials, unsupported claims, or statements without evidence)

2. CONFIDENCE: How confident are you in this assessment? (from 0 to 1)

3. QUALITY SCORE: If the relationship is SUPPORT or OPPOSE, rate the overall quality of the evidence (from 0 to 1) based on:
   - CREDIBILITY: How reliable and trustworthy is the source/information?
   - USEFULNESS: How relevant and applicable is the evidence to the statement?
   - HELPFULNESS: How valuable is this evidence for understanding the topic?
   
   Consider factors like:
   - Source authority and expertise
   - Recency and relevance of information
   - Strength of the supporting data/facts
   - Clarity and specificity of the evidence
   - Whether it addresses core aspects of the statement
   
   Set to null if relationship is UNRELATED or NOT_EVIDENCE.

4. REASONING: Briefly explain your analysis.

Instructions:
- Evidence can be only text, or text with supporting material in form of links/URLs etc.
- If the evidence contains links/URLs, do search and analyze the actual content of those links.
- CONSIDER BOTH the text of the evidence and linked content, if at least one of them support or oppose the statement, then the evidence is relevant. If they are contradicting each other, then choose the one in which the evidence is more confident. For example if the evidence claims that the statement is false, but the linked content is not related, it is still relevant evidence claiming that the statement is false. Also, if the text is not relevant but the linked content is, then the evidence is relevant. 
- DO CHECK THE LINKED CONTENT even if the text is clearly relevant! For example, do not make a conclusion only based on the text or the website type, even if you can.
- DO NOT ONLY ASSUME what the linked content is about, but actually visit the page and assess. If it is not clear from the page, take the best guess with lower confidence.
- DO NOT consider the credibility of the source for relationship determination, just the content of the evidence! However, DO consider credibility for the quality score.
- If evidence is related to the statement topic and provide valuable information, but you cannot make a clear conclusion about support/oppose, then choose between SUPPORT or OPPOSE with very low confidence (<0.5).

UNRELATED:
- Use this only if the evidence is about a completely different topic with no connection to the statement at all (e.g., statement about vaccines, evidence about cooking recipes).

NOT_EVIDENCE:
- Use this for personal opinions without supporting materials, unsupported claims, or vague statements. Examples:
  * "I believe the statement is false"
  * "It has been shown" (without citing what or where)
  * "It is a fact" (without providing the actual facts)
  * "Everyone knows that..."
  * Pure personal anecdotes without broader relevance
- DO NOT use NOT_EVIDENCE if evidance points to the resources or mention it, than it is an evidence, no matter if it is not providing sepcific details! For example: "it has been shown that this is true, see the article from New York Times on the 1st of January 2021." - this is an SUPPORT evidence.
- Personal experience that can bring value to the discussion is still considered evidence, not NOT_EVIDENCE.

HOW TO GIVE CONFIDENCE:
- The confidence is used to show how confident you are in the category. If you choose:
UNRELATED: give how confident you are the evidence is not related to the statement.
NOT_EVIDENCE: give how confident you are that the evidence is not providing any evidence for the statement.
SUPPORT or OPPOSE: give how confident you are that the evidence supports or opposes the statement based on the sentiment.
- Give high confidence 0.9+ if the relationship is clearly stated in the evidence.
- Give high confidence 0.7-0.8 if you are fairly certain about the relationship and the opinion is stated in the evidence. If you have to assume the opinion, this is not high confidence.
- Give medium confidence 0.3-0.6 if you are not certain about the relationship. For example, if the evidence is about a study, but you cannot understand the study and can only assume what it is about. For example, if you believe something only because the linked website typically has certain information, this is not certain enough!
- Give very low confidence 0.0-0.3 if you are not certain at all about the relationship.
- "it is reasonable to assume" is low confidence!
- If the evidence is only a link, give maximum 0.7 confidence.

HOW TO GIVE QUALITY SCORE:
- Only provide quality score for SUPPORT or OPPOSE relationships
- 0.8-1.0: High quality - Expert sources, peer-reviewed studies, official statistics, clear data with proper methodology
- 0.6-0.8: Good quality - Reputable news sources, well-documented reports, clear logical arguments with some supporting data
- 0.4-0.6: Moderate quality - General sources, some supporting information, reasonable arguments but limited depth
- 0.2-0.4: Low quality - Weak sources, limited supporting information, unclear or poorly presented arguments
- 0.0-0.2: Very low quality - Unreliable sources, no supporting data, misleading or biased presentation

Respond in this exact JSON format:
{{
    "reasoning": "Brief explanation of your analysis",
    "predicted_relationship": "SUPPORT|OPPOSE|UNRELATED|NOT_EVIDENCE",
    "confidence": 0-1,
    "quality_score": 0-1 or null
}}
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert fact-checker with web search capabilities. When you encounter URLs in evidence, search and analyze their content. In any case, analyse the text of the evidence itself. Respond only with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1000,
                response_format={"type": "json_object"}  # This forces JSON output
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Try to parse JSON response
            try:
                result = json.loads(result_text)
                
                # Validate that required keys exist
                required_keys = ["predicted_relationship", "confidence", "reasoning", "quality_score"]
                if not all(key in result for key in required_keys):
                    raise ValueError(f"Missing required keys in response. Expected: {required_keys}, Got: {list(result.keys())}")
                
                # Validate predicted_relationship value
                valid_relationships = ["SUPPORT", "OPPOSE", "UNRELATED", "NOT_EVIDENCE"]
                if result["predicted_relationship"] not in valid_relationships:
                    raise ValueError(f"Invalid predicted_relationship: {result['predicted_relationship']}. Must be one of: {valid_relationships}")
                
                # Validate confidence is a number between 0 and 1
                try:
                    confidence = float(result["confidence"])
                    if not (0 <= confidence <= 1):
                        raise ValueError(f"Confidence must be between 0 and 1, got: {confidence}")
                    result["confidence"] = confidence
                except (ValueError, TypeError) as e:
                    raise ValueError(f"Invalid confidence value: {result['confidence']}. Must be a number between 0 and 1")
                
                # Validate quality_score
                if result["quality_score"] is not None:
                    try:
                        quality_score = float(result["quality_score"])
                        if not (0 <= quality_score <= 1):
                            raise ValueError(f"Quality score must be between 0 and 1, got: {quality_score}")
                        result["quality_score"] = quality_score
                    except (ValueError, TypeError) as e:
                        raise ValueError(f"Invalid quality_score value: {result['quality_score']}. Must be a number between 0 and 1 or null")
                
                # Check that quality_score is only set for SUPPORT/OPPOSE
                if result["predicted_relationship"] in ["SUPPORT", "OPPOSE"] and result["quality_score"] is None:
                    print("Warning: Quality score should be provided for SUPPORT/OPPOSE relationships")
                elif result["predicted_relationship"] in ["UNRELATED", "NOT_EVIDENCE"] and result["quality_score"] is not None:
                    print("Warning: Quality score should be null for UNRELATED/NOT_EVIDENCE relationships")
                    result["quality_score"] = None
                
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print(f"Raw response: {result_text}")
                result = {
                    "predicted_relationship": "NOT_EVIDENCE",
                    "confidence": 0,
                    "quality_score": None,
                    "reasoning": f"Failed to parse AI response as JSON: {str(e)}"
                }
            except ValueError as e:
                print(f"Validation error: {e}")
                print(f"Raw response: {result_text}")
                result = {
                    "predicted_relationship": "NOT_EVIDENCE",
                    "confidence": 0,
                    "quality_score": None,
                    "reasoning": f"Invalid response format: {str(e)}"
                }
            
            # Add metadata
            result["evidence"] = evidence
            result["statement"] = statement
            result["claimed_side"] = claimed_side
            
            return result
            
        except openai.APIError as e:
            print(f"OpenAI API error: {e}")
            return {
                "predicted_relationship": "NOT_EVIDENCE",
                "confidence": 0,
                "quality_score": None,
                "reasoning": f"OpenAI API error: {str(e)}",
                "evidence": evidence,
                "statement": statement,
                "claimed_side": claimed_side
            }
        except openai.RateLimitError as e:
            print(f"OpenAI rate limit exceeded: {e}")
            return {
                "predicted_relationship": "NOT_EVIDENCE",
                "confidence": 0,
                "quality_score": None,
                "reasoning": f"Rate limit exceeded: {str(e)}",
                "evidence": evidence,
                "statement": statement,
                "claimed_side": claimed_side
            }
        except openai.AuthenticationError as e:
            print(f"OpenAI authentication error: {e}")
            return {
                "predicted_relationship": "NOT_EVIDENCE",
                "confidence": 0,
                "quality_score": None,
                "reasoning": f"Authentication error: {str(e)}",
                "evidence": evidence,
                "statement": statement,
                "claimed_side": claimed_side
            }
        except Exception as e:
            print(f"Unexpected error: {e}")
            return {
                "predicted_relationship": "NOT_EVIDENCE",
                "confidence": 0,
                "quality_score": None,
                "reasoning": f"Unexpected error during analysis: {str(e)}",
                "evidence": evidence,
                "statement": statement,
                "claimed_side": claimed_side
            }
    
    def batch_analyze(self, evidence_list: list[dict]) -> list[dict]:
        """
        Analyze multiple pieces of evidence.
        
        Args:
            evidence_list: List of dictionaries with keys: 'evidence', 'statement', 'claimed_side'
            
        Returns:
            List of analysis results
        """
        results = []
        for item in evidence_list:
            result = self.analyze_evidence_relevance(
                evidence=item['evidence'],
                statement=item['statement'],
                claimed_side=item['claimed_side']
            )
            results.append(result)
        return results

# Convenience function for quick analysis
def analyze_evidence(evidence: str, statement: str, claimed_side: bool, api_key: Optional[str] = None) -> dict:
    """
    Quick function to analyze a single piece of evidence.
    
    Args:
        evidence: The evidence text (may contain links that AI can search)
        statement: The statement to evaluate
        claimed_side: True if evidence claims to support, False if it claims to oppose
        api_key: OpenAI API key (optional, will use env var if not provided)
        
    Returns:
        Dictionary with analysis results
    """
    analyzer = EvidenceAnalyzer(api_key)
    return analyzer.analyze_evidence_relevance(evidence, statement, claimed_side)


# Example usage
if __name__ == "__main__":
    # Example usage
    analyzer = EvidenceAnalyzer()
    
    # Test case with NOT_EVIDENCE
    evidence = "covid vaccines killed so many people, see https://pmc.ncbi.nlm.nih.gov/articles/PMC8875435/"
    statement = "Covid vaccines are safe and effective"
    claimed_side = False  # Evidence claims to oppose the statement
    
    result = analyzer.analyze_evidence_relevance(evidence, statement, claimed_side)
    print(f"Analysis Result: {result}")
