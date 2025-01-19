// const ELEVEN_LABS_API_KEY = 'sk_25ca5c3c76245154b84e1d9b4e5037f9a0b582358238c56f';
const ELEVEN_LABS_API_KEY = 'sk_a7d238721b359dae5746d4c585167571f1ca4a933a0d1374';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Default voice ID - Rachel (you can change this to any other voice ID)

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

interface ElevenLabsRequest {
  text: string;
  voice_settings: VoiceSettings;
}

export async function generateVoiceover(script: string): Promise<string> {
  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
    
    const requestData: ElevenLabsRequest = {
      text: script,
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `ElevenLabs API error: ${response.status} ${response.statusText}` +
        (errorData ? ` - ${JSON.stringify(errorData)}` : '')
      );
    }

    const audioBlob = await response.blob();
    if (audioBlob.size === 0) {
      throw new Error('Received empty audio response');
    }

    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error generating voiceover:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate voiceover');
  }
}