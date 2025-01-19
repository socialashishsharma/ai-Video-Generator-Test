import React, { useState } from 'react';
import { Video, BookOpen, Download } from 'lucide-react';
import { VideoGenerator } from './components/VideoGenerator';
import { ContentInput } from './components/ContentInput';
import { generateVideo } from './lib/videoGenerator';
import { generateScript } from './lib/aiScript';
import { generateVoiceover } from './lib/voiceover';

function App() {
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('Please enter some content or upload a file first.');
      return;
    }

    setGenerating(true);
    setError(null);
    
    try {
      // Generate script using Cohere
      const script = await generateScript(content);
      if (!script) {
        throw new Error('Failed to generate script');
      }
      
      // Generate voiceover using ElevenLabs
      const audioUrl = await generateVoiceover(script);
      if (!audioUrl) {
        throw new Error('Failed to generate voiceover');
      }
      
      // Generate video with script and audio
      const url = await generateVideo(script, audioUrl);
      if (!url) {
        throw new Error('Failed to generate video');
      }
      
      setVideoUrl(url);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate video. Please try again.';
      setError(errorMessage);
      console.error('Video generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI EduVideo Generator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h2 className="flex items-center text-lg font-semibold text-blue-900 mb-2">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Input Educational Content
                </h2>
                <p className="text-blue-700 text-sm">
                  Upload a PDF/TXT file or paste your educational content. Our AI will generate a script
                  and create an engaging video with voiceover.
                </p>
              </div>
              
              <ContentInput 
                value={content}
                onChange={(newContent) => {
                  setContent(newContent);
                  setError(null);
                }}
                onGenerate={handleGenerate}
                disabled={generating}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h2 className="flex items-center text-lg font-semibold text-green-900 mb-2">
                  <Video className="h-5 w-5 mr-2" />
                  AI Generated Video
                </h2>
                <p className="text-green-700 text-sm">
                  Your AI-generated educational video will appear here, complete with
                  script, voiceover, and dynamic visuals.
                </p>
              </div>

              <VideoGenerator 
                generating={generating}
                videoUrl={videoUrl}
              />

              {videoUrl && (
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => window.open(videoUrl, '_blank')}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Video
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;