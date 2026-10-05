import type { APIRoute } from "astro";

export const prerender = false;

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
}

export const POST: APIRoute = async ({ request }) => {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const message = payload.message?.trim();

  if (!name || !email || !message) {
    return json({ error: "All fields are required" }, 422);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Invalid email address" }, 422);
  }

  if (message.length > 5000) {
    return json({ error: "Message is too long" }, 422);
  }

  return json({ message: "Message received. I will get back to you soon." }, 200);
};

function json(body: Record<string, string>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
