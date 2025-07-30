import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, Code, MessageSquare, PenTool, FileText } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  isAnswered: boolean;
  feedback?: { isCorrect: boolean; feedback: string; score: number };
}

const typeIcons = {
  'multiple-choice': CheckCircle,
  'coding': Code,
  'short-answer': MessageSquare,
  'essay': PenTool
};

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onAnswer, 
  isAnswered, 
  feedback 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  
  const Icon = typeIcons[question.type];
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSubmit = () => {
    const answer = question.type === 'multiple-choice' ? selectedAnswer : textAnswer;
    if (answer.trim()) {
      onAnswer(answer);
    }
  };

  const isSubmitDisabled = question.type === 'multiple-choice' 
    ? !selectedAnswer 
    : !textAnswer.trim();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 capitalize">
              {question.type.replace('-', ' ')}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
          {question.question}
        </h3>
      </div>
      
      <div className="p-6">
        {question.type === 'multiple-choice' && question.options && (
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${isAnswered ? 'cursor-not-allowed opacity-75' : ''}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isAnswered}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedAnswer === option ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {selectedAnswer === option && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {(question.type === 'short-answer' || question.type === 'essay') && (
          <div className="mb-6">
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={isAnswered}
              placeholder="Type your answer here..."
              rows={question.type === 'essay' ? 6 : 3}
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Minimum 10 characters</span>
              <span>{textAnswer.length} characters</span>
            </div>
          </div>
        )}

        {question.type === 'coding' && (
          <div className="mb-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={isAnswered}
                placeholder="// Write your code here..."
                rows={8}
                className="w-full bg-transparent text-green-400 font-mono text-sm focus:outline-none resize-none disabled:cursor-not-allowed"
                style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
              />
            </div>
          </div>
        )}

        {!isAnswered && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        )}

        {feedback && (
          <div className={`mt-6 p-4 rounded-lg border-l-4 ${
            feedback.isCorrect 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {feedback.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                feedback.isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                feedback.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}>
                {feedback.score}%
              </span>
            </div>
            <p className={`text-sm ${
              feedback.isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {feedback.feedback}
            </p>
            {question.explanation && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;