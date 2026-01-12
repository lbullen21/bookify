import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, userProfile } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create context-aware prompt with user's music profile
    const prompt = `You are a book recommendation expert helping a music lover find their perfect next read.

User's Music Profile:
${
  userProfile
    ? `
- Top Artists: ${userProfile.topArtists?.map((a: { name: string }) => a.name).join(', ') || 'Not available'}
- Recent Listening: ${
        userProfile.recentTracks
          ?.map(
            (t: {
              track: { name: string; artists: Array<{ name: string }> };
            }) => `${t.track.name} by ${t.track.artists[0].name}`
          )
          .slice(0, 3)
          .join(', ') || 'Not available'
      }
- Music Genres: ${userProfile.genres?.join(', ') || 'Various'}
`
    : 'Profile not available yet - please connect your Spotify account first.'
}

User Question: "${message}"

Please provide personalized book recommendations that connect to their musical taste. If they haven't connected Spotify yet, encourage them to do so for better recommendations. Be conversational, enthusiastic, and specific about why certain books would appeal to their musical preferences.

Keep responses under 150 words and include at least 5 specific book suggestions when possible. Book recommendations should vary widely based on the user's music profile.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return NextResponse.json(
        {
          error:
            "Sorry, I'm having trouble connecting to the recommendation engine. Please try again!",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        {
          error:
            "I couldn't generate a response. Please try rephrasing your question!",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again!' },
      { status: 500 }
    );
  }
}
