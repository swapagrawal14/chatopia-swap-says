
const GEMINI_API_KEY = 'AIzaSyAu0V1NHchkv1rKKnaOr2BS39rhi-TcPGU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateGeminiResponse(message: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: message }]
        }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response:', data);
    
    // Extract the response text from the API response
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text || "I couldn't generate a response.";
    }
    
    return "Sorry, I couldn't process that request.";
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return "There was an error connecting to the AI service. Please try again later.";
  }
}
