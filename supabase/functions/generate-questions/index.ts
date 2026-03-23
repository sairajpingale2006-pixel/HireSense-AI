import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-gateway-authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  branch: string;
  resumeText?: string;
  previousAnswers?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { branch, resumeText, previousAnswers = [] }: RequestBody = await req.json();

    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      throw new Error('INTEGRATIONS_API_KEY not configured');
    }

    // Build context for AI
    let systemPrompt = `You are an expert HR interviewer conducting a technical interview for a ${branch} student. Generate 5 interview questions that are:
1. Progressive in difficulty (start easy, get harder)
2. Mix of behavioral and technical questions
3. Relevant to ${branch} domain
4. Professional and clear

Format: Return ONLY a JSON array of question strings, no additional text.`;

    if (resumeText) {
      systemPrompt += `\n\nCandidate's Resume Summary:\n${resumeText.substring(0, 500)}\n\nGenerate questions based on their skills and experience.`;
    }

    if (previousAnswers.length > 0) {
      systemPrompt += `\n\nPrevious answers: ${previousAnswers.join('; ')}\n\nGenerate follow-up questions based on their responses.`;
    }

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
            parts: [{ text: systemPrompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
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

    // Extract JSON array from response
    const jsonMatch = fullText.match(/\[[\s\S]*\]/);
    let questions: string[] = [];
    
    if (jsonMatch) {
      questions = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback: split by newlines
      questions = fullText.split('\n').filter(q => q.trim().length > 10).slice(0, 5);
    }

    return new Response(
      JSON.stringify({ questions }),
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
