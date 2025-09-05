import { GoogleGenerativeAI } from '@google/generative-ai';
import { Flashcard, FlashcardSet, CustomUpload } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.warn('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export class FlashcardService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  private checkApiKey(): boolean {
    return !!(apiKey && apiKey !== 'your_gemini_api_key_here');
  }

  async generateFlashcards(
    subject: string,
    topics: string[],
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    count: number = 20
  ): Promise<Flashcard[]> {
    if (!this.checkApiKey()) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file with a valid Google Gemini API key.');
    }

    const topicsText = topics.join(', ');
    const prompt = `Generate ${count} educational flashcards for ${subject} focusing on these topics: ${topicsText}.
    
    Create flashcards at ${difficulty} level with the following requirements:
    - Each flashcard should have a clear, concise front (question/term) and back (answer/definition)
    - Include a mix of definitions, concepts, examples, and practice questions
    - Cover key learning objectives for each topic
    - Ensure content is accurate and educational
    - Add relevant tags for categorization
    
    Return a JSON array with this exact structure:
    [{
      "front": "Question or term to learn",
      "back": "Answer, definition, or explanation",
      "difficulty": "${difficulty}",
      "topic": "specific topic from the list",
      "tags": ["tag1", "tag2", "tag3"]
    }]
    
    Make sure the JSON is valid and properly formatted.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const flashcardsData = JSON.parse(jsonMatch[0]);
        
        return flashcardsData.map((card: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          front: card.front,
          back: card.back,
          difficulty: card.difficulty || difficulty,
          subject,
          topic: card.topic || topics[0],
          tags: card.tags || [],
          createdAt: new Date(),
          reviewCount: 0,
          correctCount: 0,
          confidence: 'low' as const
        }));
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return this.getFallbackFlashcards(subject, topics, difficulty);
    }
  }

  async processCustomUpload(file: File): Promise<{ content: string; topics: string[] }> {
    if (!this.checkApiKey()) {
      throw new Error('Gemini API key is not configured.');
    }

    try {
      let extractedText = '';
      
      if (file.type.startsWith('image/')) {
        extractedText = await this.extractTextFromImage(file);
      } else if (file.type === 'application/pdf') {
        extractedText = await this.extractTextFromPDF(file);
      } else if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else {
        throw new Error('Unsupported file type. Please upload JPG, PNG, PDF, or TXT files.');
      }

      // Extract topics using Gemini
      const topicsPrompt = `Analyze this educational content and extract the main topics and subjects covered:

${extractedText}

Return a JSON object with this structure:
{
  "topics": ["topic1", "topic2", "topic3"],
  "subject": "main subject area",
  "summary": "brief summary of the content"
}`;

      const result = await this.model.generateContent(topicsPrompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          content: extractedText,
          topics: analysis.topics || []
        };
      }
      
      return {
        content: extractedText,
        topics: ['General Topic']
      };
    } catch (error) {
      console.error('Error processing upload:', error);
      throw error;
    }
  }

  private async extractTextFromImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = (e.target?.result as string).split(',')[1];
          
          const prompt = "Extract all text content from this image. Return only the text, maintaining the original structure and formatting.";
          
          const result = await this.model.generateContent([
            prompt,
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type
              }
            }
          ]);
          
          const response = await result.response;
          resolve(response.text());
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    // For PDF processing, we'll use a simple text extraction
    // In a real implementation, you might want to use a PDF parsing library
    const text = await file.text();
    return text;
  }

  async generateFlashcardsFromContent(
    content: string,
    topics: string[],
    subject: string = 'Custom Subject',
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    count: number = 15
  ): Promise<Flashcard[]> {
    if (!this.checkApiKey()) {
      throw new Error('Gemini API key is not configured.');
    }

    const prompt = `Based on this educational content, generate ${count} flashcards focusing on the topics: ${topics.join(', ')}.

Content:
${content}

Create flashcards at ${difficulty} level with:
- Clear questions/terms on the front
- Comprehensive answers/definitions on the back
- Focus on key concepts from the provided content
- Include examples where relevant

Return a JSON array with this structure:
[{
  "front": "Question or term",
  "back": "Answer or definition",
  "difficulty": "${difficulty}",
  "topic": "relevant topic",
  "tags": ["tag1", "tag2"]
}]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const flashcardsData = JSON.parse(jsonMatch[0]);
        
        return flashcardsData.map((card: any, index: number) => ({
          id: `custom-${Date.now()}-${index}`,
          front: card.front,
          back: card.back,
          difficulty: card.difficulty || difficulty,
          subject,
          topic: card.topic || topics[0] || 'General',
          tags: card.tags || [],
          createdAt: new Date(),
          reviewCount: 0,
          correctCount: 0,
          confidence: 'low' as const
        }));
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating flashcards from content:', error);
      return this.getFallbackFlashcards(subject, topics, difficulty);
    }
  }

  private getFallbackFlashcards(
    subject: string,
    topics: string[],
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Flashcard[] {
    const fallbackCards = [
      {
        front: `What is the main focus of ${topics[0] || subject}?`,
        back: `${topics[0] || subject} focuses on fundamental concepts and practical applications in the field.`,
        topic: topics[0] || 'General'
      },
      {
        front: `Define a key concept in ${subject}`,
        back: `A key concept involves understanding the core principles and their real-world applications.`,
        topic: topics[0] || 'General'
      }
    ];

    return fallbackCards.map((card, index) => ({
      id: `fallback-${Date.now()}-${index}`,
      front: card.front,
      back: card.back,
      difficulty,
      subject,
      topic: card.topic,
      tags: [subject.toLowerCase(), difficulty],
      createdAt: new Date(),
      reviewCount: 0,
      correctCount: 0,
      confidence: 'low' as const
    }));
  }
}

export const flashcardService = new FlashcardService();