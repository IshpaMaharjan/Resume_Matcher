import React from 'react';
import { Trophy, Download, Star, Target, Award, GraduationCap, Briefcase } from 'lucide-react';
import { MatchResult } from '../types';
import { generateCSV, downloadFile } from '../utils/fileProcessor';

interface MatchResultsProps {
  results: MatchResult[];
  jobDescription: string;
}

export function MatchResults({ results, jobDescription }: MatchResultsProps) {
  const handleExportCSV = () => {
    const csvContent = generateCSV(results);
    downloadFile(csvContent, 'resume-match-results.csv', 'text/csv');
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Award className="w-5 h-5 text-gray-400" />;
      case 2: return <Star className="w-5 h-5 text-amber-600" />;
      default: return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
        <p className="text-gray-600">
          Add a job description and resumes, then click "Find Best Match" to see results.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Trophy className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Match Results</h2>
            <p className="text-sm text-gray-600">Ranked by relevance to job description</p>
          </div>
        </div>
        
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={result.resume.id}
            className={`p-5 rounded-xl border-2 transition-all duration-200 ${
              index === 0 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getRankIcon(index)}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    #{index + 1} {result.resume.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {result.resume.source === 'file' ? '📄 ' + (result.resume.fileName || 'File') : '📝 Text Input'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}>
                  {result.percentage}%
                </div>
                <div className="text-xs text-gray-500">
                  Score: {result.score.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Score Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Match Strength</span>
                <span className="text-sm text-gray-600">{result.matchedKeywords.length} keywords matched</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(result.percentage)}`}
                  style={{ width: `${Math.min(result.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-lg font-semibold text-blue-600">{result.breakdown.skills}</div>
                <div className="text-xs text-blue-700">Skills</div>
              </div>
              
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-lg font-semibold text-purple-600">{result.breakdown.experience}</div>
                <div className="text-xs text-purple-700">Experience</div>
              </div>
              
              <div className="text-center p-2 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-lg font-semibold text-indigo-600">{result.breakdown.education}</div>
                <div className="text-xs text-indigo-700">Education</div>
              </div>
              
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-lg font-semibold text-gray-600">{result.breakdown.general}</div>
                <div className="text-xs text-gray-700">General</div>
              </div>
            </div>

            {/* Matched Keywords */}
            {result.matchedKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Matched Keywords:</h4>
                <div className="flex flex-wrap gap-1">
                  {result.matchedKeywords.slice(0, 15).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                  {result.matchedKeywords.length > 15 && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      +{result.matchedKeywords.length - 15} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}