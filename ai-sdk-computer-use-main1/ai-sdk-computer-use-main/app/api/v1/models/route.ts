export async function GET() {
  const models = {
    object: "list",
    data: [
      {
        id: "claude-3-7-sonnet-20250219",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "anthropic",
        permission: [],
        root: "claude-3-7-sonnet-20250219",
        parent: null
      }
    ]
  };

  return new Response(JSON.stringify(models), {
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
