import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { record } = await req.json()
    const email = record.email

    // Call Resend to send welcome email
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'MuscFit <onboarding@resend.dev>', // Replace this with your verified Resend email/domain later
        to: [email],
        subject: 'Welcome to MuscFit - Early Access Confirmed!',
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; color: #111;">
            <h2>Forge Your Peak</h2>
            <p>Thank you for subscribing to MuscFit early access! You have been successfully added to our launch list.</p>
            <p>Stay tuned for our premium activewear drop and launch day privileges.</p>
            <br />
            <p>Best regards,<br />The MuscFit Team</p>
          </div>
        `,
      }),
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 400,
    })
  }
})
