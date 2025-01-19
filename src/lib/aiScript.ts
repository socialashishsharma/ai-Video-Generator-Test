import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: 'eAWHog9tjHhFJYa0631hfKnoRLgSdaX6IeAj7Vvw',
});

export async function generateScript(content: string): Promise<string> {
  try {
    const prompt = `Create a professional educational video script from this content. Present the information in clear, concise segments that flow naturally. Each segment should be a complete thought that can stand alone as a slide.

Content:
${content}

Requirements:
- Present key points in a logical sequence
- Each segment should be 1-2 sentences
- Use clear, professional language
- Focus on explaining concepts clearly
- Maintain an educational tone
- Include smooth transitions between ideas

Format each segment as a complete statement that can be presented visually.`;

    const response = await cohere.generate({
      prompt,
      maxTokens: 500,
      temperature: 0.7,
      k: 0,
      stopSequences: [],
      returnLikelihoods: 'NONE'
    });

    // Clean and format the response
    const script = response.generations[0].text
      .split(/\n+/)
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0)
      .map(segment => segment
        .replace(/^[-*•]/g, '')
        .replace(/^(Step|First|Second|Third|Next|Finally|Then)[:\s]*/i, '')
        .trim()
      )
      .join('\n\n');

    return script;
  } catch (error) {
    console.error('Error generating script:', error);
    throw new Error('Failed to generate script');
  }
}