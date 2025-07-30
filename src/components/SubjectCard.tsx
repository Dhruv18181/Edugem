import React from 'react';
import { Link } from 'react-router-dom';
import { Subject, UserProgress } from '../types';
import { Code, History, Layers, FileCode, Globe, Code2, Coffee, Hash, Shield, Zap, Server, Database, Layout, Palette, Calculator, Atom, FlaskRound as Flask, Dna, BookOpen, Brain, TrendingUp, ChevronRight, Trophy, Clock } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  progress?: UserProgress;
}

const iconMap = {
  'Code': Code,
  'Code2': Code2,
  'Coffee': Coffee,
  'Hash': Hash,
  'Shield': Shield,
  'Zap': Zap,
  'Server': Server,
  'Database': Database,
  'Layout': Layout,
  'Palette': Palette,
  'Calculator': Calculator,
  'Atom': Atom,
  'Flask': Flask,
  'Dna': Dna,
  'BookOpen': BookOpen,
  'Brain': Brain,
  'TrendingUp': TrendingUp,
  'History': History,
  'Layers': Layers,
  'FileCode': FileCode,
  'Globe': Globe
};

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, progress }) => {
  const Icon = iconMap[subject.icon as keyof typeof iconMap] || Code;
  const completionRate = progress ? (progress.completedQuestions / subject.totalLessons) * 100 : 0;
  const averageScore = progress?.sessionScores.length 
    ? progress.sessionScores.reduce((a, b) => a + b, 0) / progress.sessionScores.length 
    : 0;

  return (
    <Link to={`/learn/${subject.id}`} className="block group">
      <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 ${subject.color} overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${subject.color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
              <Icon className={`h-6 w-6 ${subject.color.replace('border-l-', 'text-').replace('-500', '-600')}`} />
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {subject.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {subject.description}
          </p>
          
          {progress ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-900">{Math.round(completionRate)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${subject.color.replace('border-l-', 'bg-')}`}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-600">{Math.round(averageScore)}% avg</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600 capitalize">{progress.currentDifficulty}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Start Learning</span>
              <span>{subject.totalLessons} lessons</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SubjectCard;