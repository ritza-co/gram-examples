/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Push Decision API",
    description: "A simple API to help decide when it's appropriate to push code",
    version: "1.0.0"
  },
  servers: [
    {
      url: "https://canpushtoprod.<your-subdomain>.workers.dev",
      description: "Production server"
    }
  ],
  paths: {
        "/can-i-push-to-prod": {
    get: {
      summary: "Check if it's safe to push to production",
      description: "Returns yes for Monday-Thursday, no for Friday-Sunday",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    answer: {
                      type: "string",
                      enum: ["yes", "no"]
                    },
                    reason: {
                      type: "string"
                    },
                    day: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/vibe-check": {
      get: {
        summary: "Random vibe check for pushing to GitHub",
        description: "Returns a random yes/no answer for whether it's appropriate to push right now",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    answer: {
                      type: "string",
                      enum: ["yes", "no"]
                    },
                    vibe: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/index": {
      get: {
        summary: "API index",
        description: "Returns information about all available endpoints",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string"
                    },
                    endpoints: {
                      type: "object"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/openapi.json": {
      get: {
        summary: "OpenAPI specification",
        description: "Returns the OpenAPI specification for this API",
        responses: {
          "200": {
            description: "OpenAPI specification",
            content: {
              "application/json": {
                schema: {
                  type: "object"
                }
              }
            }
          }
        }
      }
    }
  }
};

const vibes = [
  "The stars are aligned ✨",
  "Mercury is in retrograde, maybe not 🪐",
  "The code gods smile upon you 😊",
  "Your git history looks chaotic 🌪️",
  "Perfect timing! 🎯",
  "The servers are feeling moody 😤",
  "Deploy with confidence! 💪",
  "Maybe wait for coffee first ☕",
  "The CI/CD pipeline whispers 'yes' 🤖",
  "Your tests are crying 😢"
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Route handling
    switch (path) {
      case '/can-i-push-to-prod':
        return handleProdPushCheck(corsHeaders);
      
      case '/vibe-check':
        return handleVibeCheck(corsHeaders);
      
      case '/index':
        return handleIndex(corsHeaders);
      
      case '/openapi.json':
        return handleOpenApiSpec(corsHeaders);
      
      case '/':
        return handleRoot(corsHeaders);
      
      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
    }
  },
};

function handleProdPushCheck(corsHeaders) {
const now = new Date();
const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const currentDay = dayNames[dayOfWeek];

// Safe to deploy Monday (1) through Thursday (4)
const isSafeDay = dayOfWeek >= 1 && dayOfWeek <= 4;
const answer = isSafeDay ? 'yes' : 'no';

let reason;
if (isSafeDay) {
  reason = `It's ${currentDay}! Safe to deploy to production 🚀`;
} else if (dayOfWeek === 5) {
  reason = 'It\'s Friday! Don\'t deploy before the weekend 🙅‍♂️';
} else if (dayOfWeek === 0 || dayOfWeek === 6) {
  reason = `It's ${currentDay}! Weekend deployments are risky 🛑`;
}

return new Response(JSON.stringify({
  answer,
  reason,
  day: currentDay
}), {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders
  }
});
}

function handleVibeCheck(corsHeaders) {
  const randomAnswer = Math.random() < 0.5 ? 'yes' : 'no';
  const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];

  return new Response(JSON.stringify({
    answer: randomAnswer,
    vibe: randomVibe
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

function handleIndex(corsHeaders) {
  const indexMessage = {
    message: "Push Decision API - Index 📋",
    description: "A simple API to help decide when it's appropriate to push code",
    version: "1.0.0",
    endpoints: {
      "/": "Root endpoint with welcome message",
      "/index": "This index endpoint with API information",
      "/can-i-push-to-prod": "Check if it's safe to push to production (Friday check)",
      "/vibe-check": "Random vibe check for pushing to GitHub",
      "/openapi.json": "OpenAPI specification for this API"
    },
    usage: {
      "Production check": "GET /can-i-push-to-prod",
      "Vibe check": "GET /vibe-check",
      "API docs": "GET /openapi.json"
    }
  };

  return new Response(JSON.stringify(indexMessage, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

function handleOpenApiSpec(corsHeaders) {
  return new Response(JSON.stringify(openApiSpec, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

function handleRoot(corsHeaders) {
  const welcomeMessage = {
    message: "Welcome to the Push Decision API! 🚀",
    endpoints: {
      "/can-i-push-to-prod": "Check if it's safe to push to production (Friday check)",
      "/vibe-check": "Random vibe check for pushing to GitHub",
      "/openapi.json": "OpenAPI specification for this API"
    }
  };

  return new Response(JSON.stringify(welcomeMessage, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}