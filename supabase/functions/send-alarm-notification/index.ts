import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlarmNotificationRequest {
  alarmId: string;
  profileId: string;
  title: string;
  description?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { alarmId, profileId, title, description }: AlarmNotificationRequest = await req.json();

    console.log(`Processing alarm notification for alarm: ${alarmId}, profile: ${profileId}`);

    // Get profile email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", profileId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error("Could not fetch profile information");
    }

    if (!profile?.email) {
      console.log("No email found for profile, skipping email notification");
      return new Response(
        JSON.stringify({ success: true, message: "No email configured for this profile" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending email to: ${profile.email}`);

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "ProCura <onboarding@resend.dev>",
      to: [profile.email],
      subject: `🔔 Alarma: ${title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #0c3a5e 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .alarm-title { font-size: 20px; color: #0c3a5e; margin-bottom: 10px; }
            .alarm-description { color: #666; font-size: 16px; line-height: 1.6; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Alarma de ProCura</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${profile.name || "Usuario"}</strong>,</p>
              <p>Tienes una alarma programada:</p>
              <h2 class="alarm-title">${title}</h2>
              ${description ? `<p class="alarm-description">${description}</p>` : ""}
              <p style="margin-top: 20px;">No olvides atender esta alarma importante.</p>
            </div>
            <div class="footer">
              <p>Este es un correo automático de ProCura - App de Salud Familiar</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Update alarm last_triggered_at
    const { error: updateError } = await supabase
      .from("alarms")
      .update({ last_triggered_at: new Date().toISOString() })
      .eq("id", alarmId);

    if (updateError) {
      console.error("Error updating alarm:", updateError);
    }

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-alarm-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
