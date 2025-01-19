import React from 'react';
import { Loader2 } from 'lucide-react';

interface VideoGeneratorProps {
  generating: boolean;
  videoUrl: string | null;
}

export function VideoGenerator({ generating, videoUrl }: VideoGeneratorProps) {
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="mt-2 text-sm text-gray-500">Generating your educational video...</p>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-sm text-gray-500">Your video preview will appear here</p>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <video
        className="w-full h-full"
        controls
        src={videoUrl}
      />
    </div>
  );
}