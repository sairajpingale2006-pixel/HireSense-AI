import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-gateway-authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  questions: string[];
  answers: string[];
  scores: {
    confidence: number;
    communication: number;
    bodyLanguage: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questions, answers, scores }: RequestBody = await req.json();

    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      throw new Error('INTEGRATIONS_API_KEY not configured');
    }

    const prompt = `You are an expert HR interviewer. Analyze this interview performance and provide actionable feedback.

Interview Data:
${questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || 'No answer'}`).join('\n\n')}

Scores:
- Confidence: ${scores.confidence}%
- Communication: ${scores.communication}%
- Body Language: ${scores.bodyLanguage}%

Generate exactly 5 specific, actionable feedback points in JSON array format. Each should be a short sentence (max 15 words).
Example: ["Maintain steady eye contact throughout", "Reduce filler words like 'um' and 'uh'", "Speak at a consistent pace"]

Return ONLY the JSON array, no additional text.`;

    const apiUrl = 'https://app-agqhhh62e60x-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    // Parse SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                fullText += parsed.candidates[0].content.parts[0].text;
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    }

    // Extract JSON array
    const jsonMatch = fullText.match(/\[[\s\S]*\]/);
    let feedback: string[] = [];
    
    if (jsonMatch) {
      feedback = JSON.parse(jsonMatch[0]);
    } else {
      feedback = [
        "Maintain steady eye contact",
        "Reduce filler words",
        "Speak clearly and confidently",
        "Provide structured answers",
        "Show enthusiasm for the role"
      ];
    }

    return new Response(
      JSON.stringify({ feedback: feedback.slice(0, 5) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
