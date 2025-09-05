import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question, AssessmentResult } from '../types';
import { serperService } from './serperService';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.warn('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  private checkApiKey(): boolean {
    return !!(apiKey && apiKey !== 'your_gemini_api_key_here');
  }

  async generateQuestions(
    subject: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    count: number = 5
  ): Promise<Question[]> {
    const prompt = `Generate ${count} educational questions for ${subject} at ${difficulty} level. 
    Include a mix of multiple-choice, short-answer, and coding questions (if applicable to the subject).
    Return a JSON array with this structure:
    [{
      "id": "unique-id",
      "subject": "${subject}",
      "type": "multiple-choice|short-answer|coding|essay",
      "difficulty": "${difficulty}",
      "question": "The question text",
      "options": ["option1", "option2", "option3", "option4"] // only for multiple-choice
      "correctAnswer": "correct answer",
      "explanation": "detailed explanation"
    }]`;

    try {
      if (!this.checkApiKey()) {
        throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file with a valid Google Gemini API key.');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.getFallbackQuestions(subject, difficulty);
    }
  }

  async evaluateAnswer(
    question: Question,
    userAnswer: string
  ): Promise<{ isCorrect: boolean; feedback: string; score: number }> {
    const prompt = `Evaluate this answer for an educational question:
    
    Question: ${question.question}
    Correct Answer: ${question.correctAnswer}
    User Answer: ${userAnswer}
    Subject: ${question.subject}
    Difficulty: ${question.difficulty}
    
    Provide evaluation in JSON format:
    {
      "isCorrect": boolean,
      "feedback": "detailed feedback explaining why the answer is correct/incorrect",
      "score": number (0-100)
    }`;

    try {
      if (!this.checkApiKey()) {
        throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file with a valid Google Gemini API key.');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error evaluating answer:', error);
      return {
        isCorrect: userAnswer.toLowerCase().includes(question.correctAnswer?.toLowerCase() || ''),
        feedback: 'Unable to provide detailed feedback at this time.',
        score: 50
      };
    }
  }

  async generateAssessment(
    subject: string,
    scores: number[],
    difficulty: string
  ): Promise<AssessmentResult> {
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const prompt = `Generate an educational assessment report:
    
    Subject: ${subject}
    Recent Scores: ${scores.join(', ')}
    Average Score: ${averageScore.toFixed(1)}%
    Difficulty Level: ${difficulty}
    
    Provide assessment in JSON format:
    {
      "score": ${averageScore},
      "totalQuestions": ${scores.length},
      "difficulty": "${difficulty}",
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
      "strengths": ["strength1", "strength2"],
      "improvements": ["area1", "area2", "area3"]
    }`;

    try {
      if (!this.checkApiKey()) {
        throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file with a valid Google Gemini API key.');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating assessment:', error);
      return {
        score: averageScore,
        totalQuestions: scores.length,
        difficulty,
        recommendations: ['Continue practicing regularly', 'Focus on understanding concepts'],
        strengths: ['Good progress shown'],
        improvements: ['Review incorrect answers', 'Practice more challenging problems']
      };
    }
  }

  async chatWithAI(message: string, imageData?: string): Promise<string> {
    try {
      if (!this.checkApiKey()) {
        return 'Please configure your Gemini API key in the .env file to use the AI chat feature. Set VITE_GEMINI_API_KEY with a valid Google Gemini API key.';
      }

      // Check if this is a web search request
      const isWebSearchRequest = message.toLowerCase().includes('search') || 
                                message.toLowerCase().includes('latest') ||
                                message.toLowerCase().includes('current') ||
                                message.toLowerCase().includes('news') ||
                                message.toLowerCase().includes('recent');

      if (isWebSearchRequest && !imageData) {
        try {
          const searchResults = await serperService.searchWithVideos(message);
          if (searchResults.web.length > 0 || searchResults.videos.length > 0) {
            let searchContext = `Based on current web search results for "${message}":\n\n`;
            
            if (searchResults.web.length > 0) {
              searchContext += '**Web Results:**\n';
              searchResults.web.slice(0, 5).forEach((result, index) => {
                searchContext += `${index + 1}. [${result.title}](${result.link})\n   ${result.snippet}\n\n`;
              });
            }
            
            if (searchResults.videos.length > 0) {
              searchContext += '**YouTube Videos:**\n';
              searchResults.videos.slice(0, 3).forEach((video, index) => {
                searchContext += `${index + 1}. [${video.title}](${video.link}) (${video.duration})\n   Channel: ${video.channel}\n   ${video.snippet}\n\n`;
              });
            }
            
            searchContext += `\nPlease provide a concise, focused answer based on these search results. Include the most relevant links. Keep it brief unless the user specifically asks for detailed information.`;
            
            const result = await this.model.generateContent(searchContext);
            return result.response.text();
          }
        } catch (searchError) {
          console.error('Web search failed, falling back to regular chat:', searchError);
        }
      }

      // Check if user is asking for detailed/comprehensive response
      const wantsDetailed = message.toLowerCase().includes('detailed') || 
                           message.toLowerCase().includes('comprehensive') || 
                           message.toLowerCase().includes('explain in detail') ||
                           message.toLowerCase().includes('elaborate') ||
                           message.toLowerCase().includes('in depth') ||
                           message.toLowerCase().includes('thoroughly') ||
                           message.toLowerCase().includes('step by step');

      let prompt = wantsDetailed 
        ? `You are an educational AI assistant. Provide a comprehensive, detailed explanation for: ${message}. Include examples, step-by-step breakdowns, and thorough explanations.`
        : `You are an educational AI assistant. Provide a concise, clear, and direct answer to: ${message}. Keep it brief and to the point unless the question specifically requires detailed explanation.`;
      
      if (imageData) {
        const imageResult = await this.model.generateContent([
          prompt + " The student has uploaded an image. Please analyze it and provide helpful educational guidance.",
          {
            inlineData: {
              data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
              mimeType: "image/jpeg"
            }
          }
        ]);
        return imageResult.response.text();
      } else {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      }
    } catch (error) {
      console.error('Error in chat:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        return 'Please configure your Gemini API key in the .env file to use the AI chat feature. Set VITE_GEMINI_API_KEY with a valid Google Gemini API key.';
      }
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    }
  }

  private getFallbackQuestions(subject: string, difficulty: string): Question[] {
    const fallbackQuestions: Record<string, Question[]> = {
      'React Development': [
        {
          id: '1',
          subject: 'React Development',
          type: 'multiple-choice',
          difficulty: difficulty as any,
          question: 'What is the purpose of the useState hook in React?',
          options: ['To manage component state', 'To handle side effects', 'To create refs', 'To optimize performance'],
          correctAnswer: 'To manage component state',
          explanation: 'useState is a React hook that allows you to add state to functional components.'
        }
      ],
      'TypeScript': [
        {
          id: '2',
          subject: 'TypeScript',
          type: 'short-answer',
          difficulty: difficulty as any,
          question: 'What is the difference between interface and type in TypeScript?',
          correctAnswer: 'Interfaces are extendable and can be merged, while types are more flexible but cannot be reopened.',
          explanation: 'Both define object shapes, but interfaces support declaration merging and inheritance.'
        }
      ]
    };

    return fallbackQuestions[subject] || [];
  }
}

export const geminiService = new GeminiService();