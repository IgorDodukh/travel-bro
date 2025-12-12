import axios from "axios";

export async function sendWelcomeEmail(to: string, name?: string) {
    try {
        const res = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "PlaPlan",
                    email: "info@plaplan.io",
                },
                to: [
                    {
                        email: to,
                    },
                ],
                subject: "Welcome to PlaPlan",
                htmlContent: `
        <!DOCTYPE html>
        <html lang="en" style="margin:0; padding:0;">
        <body style="margin:0; padding:0; background-color:#F3F4F6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:#1F2937;">
            
            <!-- Spacer -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr><td height="40"></td></tr>
            </table>

            <!-- Email Container -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td align="center">
                
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.06);">
                    
                    <!-- Logo -->
                    <tr>
                    <td align="center" style="padding:32px 0 0 0;">
                        <img 
                        src="https://plaplan.io/assets/logo-transparent.png" 
                        alt="PlaPlan" 
                        width="160" 
                        style="display:block; width:160px; max-width:80%; height:auto;"
                        />
                    </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                    <td style="padding:40px 40px;">
                    
                        <p style="margin:0 0 18px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        Hi Traveler 👋,
                        </p>

                        <p style="margin:0 0 18px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        Thanks for joining <strong>PlaPlan</strong> - I’m really glad you’re here.
                        </p>

                        <p style="margin:0 0 18px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        I created this app because planning a trip should feel exciting, not stressful. Whether you're exploring Madeira or chasing the northern lights in Lapland, PlaPlan helps you get straight to the good parts.
                        </p>

                        <p style="margin:0 0 26px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        We're a small and passionate team, and every traveler means a lot to us.  
                        If you ever have ideas or feedback, just reply - I read every message myself.
                        </p>

                        <!-- CTA Button -->
                        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                        <tr>
                            <td align="center" bgcolor="#FF4300" style="border-radius:50px;">
                            <a 
                                href="https://plaplan.io"
                                style="display:inline-block; padding:12px 26px; font-size:16px; color:#ffffff; text-decoration:none; font-weight:600; border-radius:50px;"
                            >
                                Start Planning →
                            </a>
                            </td>
                        </tr>
                        </table>

                        <!-- Founder block -->
                        <table role="presentation" width="100%" style="margin-top:32px; border-top:1px solid #E5E7EB; padding-top:20px;">
                        <tr>
                            <td width="58" valign="middle">
                            <img 
                                src="https://plaplan.io/assets/founders/ihor.jpeg" 
                                width="48"
                                height="48"
                                style="border-radius:50%; display:block;"
                                alt="Founder"
                            />
                            </td>
                            <td valign="middle">
                            <p style="margin:0; font-size:15px; font-weight:700; color:#111827;">Ihor Dodukh</p>
                            <p style="margin:4px 0 0 0; font-size:14px; color:#6B7280;">Founder @ PlaPlan.io</p>
                            </td>
                        </tr>
                        </table>

                    </td>
                    </tr>

                </table>

                <!-- Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px;">
                    <tr>
                    <td align="center" style="font-size:12px; color:#9CA3AF; padding:10px;">
                        © 2025 PlaPlan. All rights reserved.<br/>
                        <a href="https://plaplan.io/privacy" style="color:#9CA3AF; text-decoration:none;">Privacy Policy</a> •
                        <a href="https://plaplan.io/terms" style="color:#9CA3AF; text-decoration:none;">Terms</a>
                    </td>
                    </tr>
                </table>

                </td>
            </tr>
            </table>

        </body>
        </html>

        `,
            },
            {
                headers: {
                    accept: "application/json",
                    "api-key": process.env.BREVO_API_KEY!,
                    "content-type": "application/json",
                },
            }
        );

        return res.data;
    } catch (err: any) {
        console.error("Brevo send email error:", err.response?.data || err);
        throw err;
    }
}