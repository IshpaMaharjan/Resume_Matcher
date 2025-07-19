import React, { useState } from 'react';
import { Upload, FileText, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Resume } from '../types';
import { processDocxFile } from '../utils/fileProcessor';

interface ResumeInputProps {
  resumes: Resume[];
  onResumesChange: (resumes: Resume[]) => void;
}

export function ResumeInput({ resumes, onResumesChange }: ResumeInputProps) {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTextResume = () => {
    const newResume: Resume = {
      id: Date.now().toString(),
      content: '',
      title: `Resume ${resumes.length + 1}`,
      source: 'text'
    };
    onResumesChange([...resumes, newResume]);
  };

  const updateResume = (id: string, updates: Partial<Resume>) => {
    onResumesChange(resumes.map(resume => 
      resume.id === id ? { ...resume, ...updates } : resume
    ));
  };

  const removeResume = (id: string) => {
    onResumesChange(resumes.filter(resume => resume.id !== id));
  };

  const handleFileUpload = async (files: FileList) => {
    setProcessing(true);
    setError(null);

    try {
      const newResumes: Resume[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.name.endsWith('.docx')) {
          setError(`${file.name} is not a valid .docx file`);
          continue;
        }

        try {
          const content = await processDocxFile(file);
          const newResume: Resume = {
            id: Date.now().toString() + i,
            content,
            title: file.name.replace('.docx', ''),
            source: 'file',
            fileName: file.name
          };
          newResumes.push(newResume);
        } catch (err) {
          setError(`Failed to process ${file.name}`);
        }
      }

      onResumesChange([...resumes, ...newResumes]);
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Resumes</h2>
            <p className="text-sm text-gray-600">Add resumes to match against the job</p>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 mb-4 transition-all duration-200 ${
          dragOver 
            ? 'border-purple-400 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Drop .docx files here or click to upload
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Supports Microsoft Word (.docx) files
          </p>
          <input
            type="file"
            accept=".docx"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="resume-upload"
            disabled={processing}
          />
          <label
            htmlFor="resume-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {processing ? 'Processing...' : 'Choose Files'}
          </label>
        </div>
      </div>

      {/* Text Input Button */}
      <button
        onClick={addTextResume}
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mb-4"
      >
        <Plus className="w-4 h-4" />
        Add Resume as Text
      </button>

      {/* Resume List */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {resumes.map((resume) => (
          <div key={resume.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={resume.title}
                onChange={(e) => updateResume(resume.id, { title: e.target.value })}
                className="font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 focus:px-2 focus:py-1 focus:rounded"
              />
              <button
                onClick={() => removeResume(resume.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {resume.source === 'file' ? (
              <div className="text-xs text-gray-600 mb-2">
                📄 {resume.fileName} • {resume.content.length} characters
              </div>
            ) : (
              <textarea
                value={resume.content}
                onChange={(e) => updateResume(resume.id, { content: e.target.value })}
                placeholder="Paste resume content here..."
                className="w-full h-24 p-2 text-xs border border-gray-200 rounded resize-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}