import React, { useState } from 'react';
import { Search, Zap, FileSearch, AlertCircle } from 'lucide-react';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ResumeInput } from './components/ResumeInput';
import { MatchResults } from './components/MatchResults';
import { Resume, MatchResult } from './types';
import { extractKeywords, calculateMatchScore } from './utils/textProcessor';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindMatches = async () => {
    setError(null);
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    const validResumes = resumes.filter(resume => resume.content.trim());
    if (validResumes.length === 0) {
      setError('Please add at least one resume with content');
      return;
    }

    setIsProcessing(true);

    try {
      // Small delay to show processing state
      await new Promise(resolve => setTimeout(resolve, 500));

      const jobKeywords = extractKeywords(jobDescription);
      
      const matchResults: MatchResult[] = validResumes.map(resume => {
        const matchData = calculateMatchScore(jobKeywords, resume.content);
        return {
          resume,
          ...matchData
        };
      });

      // Sort by score (descending)
      matchResults.sort((a, b) => b.score - a.score);
      
      setResults(matchResults);
    } catch (err) {
      setError('An error occurred while processing. Please try again.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setJobDescription('');
    setResumes([]);
    setResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <FileSearch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Resume Matcher</h1>
                <p className="text-sm text-gray-600">Find the perfect candidate with AI-powered matching</p>
              </div>
            </div>
            
            <button
              onClick={resetAll}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Reset All
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Input Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
          />
          <ResumeInput
            resumes={resumes}
            onResumesChange={setResumes}
          />
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleFindMatches}
            disabled={isProcessing || !jobDescription.trim() || resumes.filter(r => r.content.trim()).length === 0}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Resumes...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Find Best Match
                <Zap className="w-4 h-4" />
              </>
            )}
          </button>
          
          {!isProcessing && (
            <p className="text-sm text-gray-600 mt-2">
              {!jobDescription.trim() 
                ? 'Enter a job description to get started'
                : resumes.filter(r => r.content.trim()).length === 0
                ? 'Add at least one resume to continue'
                : `Ready to analyze ${resumes.filter(r => r.content.trim()).length} resume${resumes.filter(r => r.content.trim()).length !== 1 ? 's' : ''}`
              }
            </p>
          )}
        </div>

        {/* Results Section */}
        <MatchResults results={results} jobDescription={jobDescription} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Resume Matcher • Built for efficient talent screening and candidate evaluation</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;