import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

const BASE_PROMPT = `Persona
Act as Vinshard, a knowledgeable business mentor specializing in creating impactful
and monetizable content-based and service-oriented business strategies, particularly
within coaching, mentoring, teaching, and training sectors.
Context
My aim is to initiate a side hustle that demands no more than 10 hours per week of my
time, focusing on generating significant value through content and services. This
business should address unignorable, uncommon problems that are easily monetizable.
It should not only meet a primary financial objective but also serve a secondary goal,
which is defined below.
Task
Step 1: Identify a list of problems that my ideal customer (as defined below) has, based
on these questions. Make sure you answer each question with multiple bullets in great
detail:
- The Pushes
- What are they afraid of?
- What frustrates them?
- What is a problem they face daily?
- What stops them from being happy?
- Where does their life fall apart?
- What are their biggest complaints?
- The Pulls
- What do they want?
- What do they aspire to be?
- What are the goals they have for themselves?
- What values & ideas are important for them?
- What do they desire?
Step 2: Based on the answers you have identified, give me a table of 10 rows with the
following columns:
1. The Idea: Identify and list a business opportunity, focusing on areas where my skills,
background and expertise can offer substantial value to my ideal customer. All
opportunities must be focused on addressing the needs, wants, desires, pains and
frustrations of my ideal customer
2. Opportunity: Tell me which opportunity the business idea is designed to capitalize on
3. Customer Pain Rating: For each idea, provide the intensity and urgency of the
problem for the target customer(1-10 scale).
4. Ease of Solution: For each idea, provide the feasibility of delivering the solution within
the time and resource constraints(1-10 scale).
6. Monetization Potential: For each idea, provide the capacity of the idea to generate
revenue(1-10 scale).
7 . Monetization Strategies: For each idea, provide at least 3 common and 3 uncommon
or unique monetization strategies I can use to monetize this idea, considering the
constraint that all business activities must fit within a 10-hour weekly schedule. Do not
repeat ideas in the table. The strategies could include one-time payments, recurring
revenue models, digital products, services, and content. Feel free to include other ideas
as well.
8. Growth Loops: For each idea, provide 3 specific, uncommon and little known
marketing and growth tactics that I can implement to drive consistent customer
acquisition on autopilot. Avoid run of the mill strategies. Leverage content, SEO, email
marketing, referrals, partnerships, and other scalable channels while fitting within the
10-hour per week time constraint.
9. Differentiators: For each idea, provide 3 specific and compelling differentiators that
set the offering apart based on my unique skills, background, secondary goal, and ideal
customer. These should highlight my competitive advantages and value propositions
10. Competitive Advantage: For each idea, give me 3 specific and compelling
competitive advantages that I would have over the competition that would compel my
ideal customer to choose me over the rest.
Rules:
1. You must give me 10 ideas.
2. You must answer each question in detail.
3. You must make sure each bullet in your answer and each entry in the table you make
has at least 10 words.
4. The ideas can be content and service-based businesses. Include nocode and
software solutions as well.
5. All proposed business ideas must be actionable within a solo-operated, 10-hour
weekly commitment.
6. Business ideas should offer clear, direct paths to monetization.
7 . Provide a detailed evaluation table for each idea, with scores for pain point intensity,
ease of solution, and monetization potential.
Customization Parameters:
`;

export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);
            console.log('Incoming request:', {
                method: request.method,
                url: url.toString(),
                pathname: url.pathname
            });

            // Handle API requests first
            if (url.pathname.startsWith('/api/')) {
                console.log('Routing to API handler');
                return handleApiRequest(request, env);
            }

            // Then try to serve static assets
            console.log('Serving static asset');
            return await getAssetFromKV({
                request,
                waitUntil: ctx.waitUntil.bind(ctx),
                env,
            });
        } catch (error) {
            console.error('Main handler error:', error);
            return new Response(`Error: ${error.message}`, { status: 500 });
        }
    }
};

async function handleApiRequest(request, env) {
    const url = new URL(request.url);
    console.log('API Request received:', {
        method: request.method,
        path: url.pathname,
        headers: Object.fromEntries(request.headers)
    });

    // Handle CORS preflight requests FIRST
    if (request.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            }
        });
    }

    // Then handle the actual request
    if (url.pathname === '/api/chat' && request.method === 'POST') {
        console.log('Handling POST request to /api/chat');
        try {
            const body = await request.json();
            console.log('Request body:', body);
            const { inputs } = body;

            // Make request to OpenAI
            console.log('Making request to OpenAI API');
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "user",
                        content: `${BASE_PROMPT}\n${Object.entries(inputs || {})
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n')}`
                    }]
                })
            });

            console.log('OpenAI API response status:', response.status);
            const data = await response.json();
            console.log('OpenAI API response data:', data);

            return new Response(JSON.stringify({ message: data.choices[0].message.content }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        } catch (error) {
            console.error('Error in handleApiRequest:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }

    console.log('Request did not match any handlers');
    return new Response('Not Found', { status: 404 });
} 