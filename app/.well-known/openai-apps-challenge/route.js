// OpenAI Apps Domain Verification Challenge Endpoint
// Serves the verification token required by OpenAI for registering MCP and plugin actions.

export const dynamic = 'force-dynamic';

const CHALLENGE_TOKEN = process.env.OPENAI_APPS_CHALLENGE_TOKEN || 'ph1AUVZWlyHGibAi2SQ9ICgqLrdDfm_ffAy65gQ9kLo';

export async function GET() {
    return new Response(CHALLENGE_TOKEN, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
