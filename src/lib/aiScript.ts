import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: 'eAWHog9tjHhFJYa0631hfKnoRLgSdaX6IeAj7Vvw',
});

export async function generateScript(content: string): Promise<string> {
  try {
    const enhancedPrompt = `Transform the following educational content into a clear, structured video script. Focus on creating concise, visually descriptive segments that can be directly translated into video slides. Each segment should be self-contained and avoid dialogue or narration markers.

Content to transform:
${content}

Guidelines:
- Break content into clear, distinct segments
- Each segment should be 1-2 sentences (max 200 characters)
- Focus on key concepts and visual descriptions
- Avoid dialogue markers (e.g., no "Now we'll see..." or "Let's look at...")
- Use present tense and active voice
- Include clear transitions between main points
- Maintain a professional, educational tone

Example format:
The structure of a DNA molecule consists of a double helix.
Nucleotide base pairs connect the two strands through hydrogen bonds.
The sugar-phosphate backbone runs along the outside of the molecule.`;

    const response = await cohere.generate({
      prompt: enhancedPrompt,
      maxTokens: 500,
      temperature: 0.7,
      k: 0,
      stopSequences: [],
      returnLikelihoods: 'NONE'
    });

    // Clean up the generated text to remove any potential dialogue markers
    let script = response.generations[0].text
      .replace(/^(Now|Let's|We will|Let us|Here we|As we can see).+?\./gm, '') // Remove common dialogue starters
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();

    return script;
  } catch (error) {
    console.error('Error generating script:', error);
    throw new Error('Failed to generate script');
  }
}