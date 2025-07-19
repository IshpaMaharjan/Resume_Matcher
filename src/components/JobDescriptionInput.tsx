import React from 'react';
import { FileText, Briefcase } from 'lucide-react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Briefcase className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
          <p className="text-sm text-gray-600">Paste the job description to analyze</p>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the job description here... Include required skills, experience, and qualifications for best matching results."
          className="w-full h-80 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm leading-relaxed"
        />
        {value && (
          <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white px-2 py-1 rounded">
            {value.length} characters
          </div>
        )}
      </div>
      
      {value && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Ready to analyze</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Keywords will be extracted from this description to match against resumes
          </p>
        </div>
      )}
    </div>
  );
}