import axios from "axios";

export async function sendWelcomeEmail(to: string, name?: string) {
    try {
        const res = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "Ihor from PlaPlan",
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
                        <center style="margin: 28px 0;">
                          <a href="https://plaplan.io"
                             style="font-size:16px; padding:12px 20px; background:#000; color:#fff;
                                    border-radius:28px; text-decoration:none;">
                            Start Planning
                          </a>
                        </center>

                        <!-- Founder block -->
                        <table role="presentation" width="100%" style="margin-top:32px; border-top:1px solid #E5E7EB; padding-top:20px;">
                        <tr>
                            <td width="58" valign="middle">
                            <img 
                                src="https://plaplan.io/assets/founders/ihor.jpeg" 
                                width="52"
                                height="52"
                                style="border-radius:50%; display:block; border:2px solid #F3F4F6;"
                                alt="Ihor"
                            />
                            </td>
                            <td valign="middle">
                            <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">Ihor Dodukh</p>
                            <p style="margin:4px 0 0 0; font-size:14px; color:#6B7280;">Founder @ PlaPlan</p>
                            <p style="margin:6px 0 0 0; font-size:13px; color:#9CA3AF; font-style:italic;">Building tools for travelers, one trip at a time ✈️</p>
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

export async function sendWaitListEmail(to: string) {
    try {
        const res = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "Ihor from PlaPlan",
                    email: "info@plaplan.io",
                },
                to: [
                    {
                        email: to,
                    },
                ],
                subject: "You're on the list!",
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
                    
                    <!-- Hero Badge -->
                    <tr>
                    <td align="center" style="padding:40px 40px 20px 40px;">
                        <div style="display:inline-block; background:linear-gradient(135deg, #10B981 0%, #059669 100%); color:#ffffff; padding:8px 20px; border-radius:50px; font-size:13px; font-weight:600; letter-spacing:0.5px;">
                        ✓ YOU'RE ON THE LIST
                        </div>
                    </td>
                    </tr>

                    <!-- Logo -->
                    <tr>
                    <td align="center" style="padding:0 0 32px 0;">
                        <img 
                        src="https://plaplan.io/assets/logo-transparent.png" 
                        alt="PlaPlan" 
                        width="140" 
                        style="display:block; width:140px; max-width:70%; height:auto;"
                        />
                    </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                    <td style="padding:0 40px 40px 40px;">
                    
                        <p style="margin:0 0 18px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        Hey there 👋
                        </p>

                        <p style="margin:0 0 18px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        Thanks for joining the waitlist! You're now one of <strong>200+ travelers</strong> eagerly waiting for PlaPlan on Android and Web.
                        </p>

                        <p style="margin:0 0 18px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        I'm personally reading every signup, and honestly, each one makes my day. Knowing that people are excited about what we're building keeps the whole team motivated.
                        </p>

                        <!-- What to Expect Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:26px 0; background:#F9FAFB; border-left:4px solid #10B981; border-radius:8px;">
                        <tr>
                            <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px 0; font-size:15px; font-weight:700; color:#111827;">
                                What happens next?
                            </p>
                            <p style="margin:0 0 8px 0; font-size:14px; line-height:1.6; color:#4B5563;">
                                📱 We're working hard on the Android app<br/>
                                🌐 Web version is in active development<br/>
                                📧 You'll get an email <strong>only</strong> when we launch
                            </p>
                            </td>
                        </tr>
                        </table>

                        <p style="margin:0 0 18px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        <strong>A quick promise:</strong> I won't spam you with marketing emails or weekly newsletters. You'll hear from me exactly <em>twice</em>:
                        </p>

                        <p style="margin:0 0 26px 0; font-size:15px; line-height:1.8; color:#6B7280; padding-left:20px; border-left:3px solid #E5E7EB;">
                        1️⃣ When the Android app launches<br/>
                        2️⃣ When the Web app goes live
                        </p>

                        <p style="margin:0 0 18px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        That's it. No fluff, no hype—just a heads-up when you can actually start using PlaPlan on your preferred device.
                        </p>

                        <p style="margin:0 0 26px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        In the meantime, if you have an iPhone or iPad, you can already start planning trips today:
                        </p>

                        <!-- iOS Download Button -->
                        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px 0;">
                        <tr>
                            <td align="center">
                            <a href="https://apps.apple.com/app/apple-store/id6751006510?pt=128059857&ct=waitlist_email&mt=8" style="display:inline-block;">
                                <img 
                                src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" 
                                alt="Download on the App Store" 
                                width="150"
                                style="display:block; height:auto;"
                                />
                            </a>
                            </td>
                        </tr>
                        </table>

                        <p style="margin:0 0 26px 0; font-size:16px; line-height:1.6; color:#4B5563;">
                        Got questions? Suggestions? Just reply to this email—I read and respond to every single one personally.
                        </p>

                        <!-- Founder Signature -->
                        <table role="presentation" width="100%" style="margin-top:32px; border-top:1px solid #E5E7EB; padding-top:24px;">
                        <tr>
                            <td width="58" valign="middle">
                            <img 
                                src="https://plaplan.io/assets/founders/ihor.jpeg" 
                                width="52"
                                height="52"
                                style="border-radius:50%; display:block; border:2px solid #F3F4F6;"
                                alt="Ihor"
                            />
                            </td>
                            <td valign="middle">
                            <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">Ihor Dodukh</p>
                            <p style="margin:4px 0 0 0; font-size:14px; color:#6B7280;">Founder @ PlaPlan</p>
                            <p style="margin:6px 0 0 0; font-size:13px; color:#9CA3AF; font-style:italic;">Building tools for travelers, one trip at a time ✈️</p>
                            </td>
                        </tr>
                        </table>

                    </td>
                    </tr>

                </table>

                <!-- Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px;">
                    <tr>
                    <td align="center" style="font-size:12px; color:#9CA3AF; padding:10px 40px 40px 40px; line-height:1.6;">
                        You're receiving this because you joined the PlaPlan waitlist.<br/>
                        Don't worry - this isn't a newsletter. You'll only hear from us when we launch.<br/><br/>
                        © 2025 PlaPlan. All rights reserved.<br/>
                        <a href="https://plaplan.io/privacy" style="color:#9CA3AF; text-decoration:none;">Privacy</a> • 
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