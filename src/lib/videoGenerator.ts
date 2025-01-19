import { getRandomTheme } from './themes';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const SLIDE_DURATION = 5000; // 5 seconds per slide

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  return canvas;
}

async function createSlide(text: string): Promise<HTMLCanvasElement> {
  const canvas = createCanvas();
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const theme = getRandomTheme();

  // Set background
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, theme.background.gradient.from);
  gradient.addColorStop(1, theme.background.gradient.to);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Add decorative elements
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(40, 40);
  ctx.lineTo(CANVAS_WIDTH - 40, 40);
  ctx.stroke();

  // Add text
  ctx.fillStyle = theme.text.body;
  ctx.font = 'bold 36px system-ui';
  
  const words = text.split(' ');
  let line = '';
  let y = 120;
  const lineHeight = 48;
  const maxWidth = CANVAS_WIDTH - 80;

  for (let word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth) {
      ctx.fillText(line, 40, y);
      line = word + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 40, y);

  return canvas;
}

export async function generateVideo(script: string, audioUrl: string): Promise<string> {
  try {
    if (!script || !audioUrl) {
      throw new Error('Script and audio URL are required');
    }

    // Split script into slides
    const slides = script.match(/.{1,200}(?:\s|$)/g) || [script];
    const slideCanvases = await Promise.all(slides.map(createSlide));
    
    if (slideCanvases.length === 0) {
      throw new Error('Failed to create slides');
    }
    
    // Create audio element
    const audio = new Audio(audioUrl);
    await new Promise((resolve, reject) => {
      audio.onloadeddata = resolve;
      audio.onerror = () => reject(new Error('Failed to load audio'));
      audio.load();
    });
    
    // Create a MediaRecorder to capture the canvas
    const stream = slideCanvases[0].captureStream(30); // 30fps
    
    // Add audio track to stream
    const audioCtx = new AudioContext();
    const audioSource = audioCtx.createMediaElementSource(audio);
    const audioDestination = audioCtx.createMediaStreamDestination();
    audioSource.connect(audioDestination);
    stream.addTrack(audioDestination.stream.getAudioTracks()[0]);

    // Check if MediaRecorder supports webm with vp9
    if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      throw new Error('Your browser does not support VP9 video encoding');
    }

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000 // 5Mbps
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      let animationTimeout: number;

      const cleanup = () => {
        if (animationTimeout) {
          clearTimeout(animationTimeout);
        }
        audio.pause();
        stream.getTracks().forEach(track => track.stop());
        audioCtx.close();
      };

      mediaRecorder.onstop = () => {
        cleanup();
        if (chunks.length === 0) {
          reject(new Error('No video data was recorded'));
          return;
        }
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(URL.createObjectURL(blob));
      };

      mediaRecorder.onerror = (event) => {
        cleanup();
        reject(new Error(`MediaRecorder error: ${event.error.message}`));
      };

      // Start recording
      try {
        mediaRecorder.start();
        audio.play().catch(error => {
          cleanup();
          reject(new Error(`Failed to play audio: ${error.message}`));
        });

        // Animate through slides
        let currentSlide = 0;
        const ctx = slideCanvases[0].getContext('2d');
        
        if (!ctx) {
          cleanup();
          reject(new Error('Failed to get canvas context'));
          return;
        }

        function updateSlide() {
          if (currentSlide >= slideCanvases.length) {
            mediaRecorder.stop();
            return;
          }

          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.drawImage(slideCanvases[currentSlide], 0, 0);
          currentSlide++;

          animationTimeout = setTimeout(updateSlide, SLIDE_DURATION);
        }

        updateSlide();
      } catch (error) {
        cleanup();
        reject(error instanceof Error ? error : new Error('Failed to start video generation'));
      }
    });
  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate video');
  }
}