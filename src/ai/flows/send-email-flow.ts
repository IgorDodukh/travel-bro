'use server';

/**
 * @fileOverview A flow for sending a contact email via Brevo SMTP.
 * - sendEmail: Sends an email with the provided details.
 * - SendEmailInput: The input schema for the sendEmail flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendEmailInputSchema = z.object({
    name: z.string().describe('The name of the person sending the message.'),
    email: z.string().email().describe('The email address of the sender.'),
    message: z.string().describe('The content of the message.'),
});

export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

// Environment variables validation
const BREVO_SMTP_SERVER = 'smtp-relay.brevo.com';
const BREVO_SMTP_PORT = 587;
const BREVO_SMTP_USER = process.env.BREVO_SMTP_USER; // Your Brevo login email
const BREVO_SMTP_PASS = process.env.BREVO_SMTP_PASS; // Your Brevo SMTP password
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER; // Verified sender email
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'info@dodukh.com';

// Create reusable transporter object using Brevo SMTP
const createTransporter = () => {
    if (!BREVO_SMTP_USER || !BREVO_SMTP_PASS) {
        throw new Error('Missing Brevo SMTP credentials. Please set BREVO_SMTP_USER and BREVO_SMTP_PASS environment variables.');
    }

    return nodemailer.createTransport({
        host: BREVO_SMTP_SERVER,
        port: BREVO_SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: BREVO_SMTP_USER,
            pass: BREVO_SMTP_PASS,
        },
        tls: {
            ciphers: 'SSLv3',
        },
    });
};

// HTML email template
const createEmailTemplate = (name: string, email: string, message: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PlaPlan - New Contact Form Submission</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .content {
          background-color: #ffffff;
          padding: 20px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }
        .field {
          margin-bottom: 15px;
        }
        .label {
          font-weight: bold;
          color: #495057;
        }
        .value {
          margin-top: 5px;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        .message-content {
          white-space: pre-line;
          line-height: 1.5;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 12px;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>PlaPlan - New Contact Form Submission</h2>
        <p>You have received a new message through your website contact form.</p>
      </div>
      
      <div class="content">
        <div class="field">
          <div class="label">From:</div>
          <div class="value">${name}</div>
        </div>
        
        <div class="field">
          <div class="label">Email:</div>
          <div class="value">
            <a href="mailto:${email}">${email}</a>
          </div>
        </div>
        
        <div class="field">
          <div class="label">Message:</div>
          <div class="value message-content">${message}</div>
        </div>
      </div>
      
      <div class="footer">
        <p>This email was sent from your website contact form.</p>
        <p>Reply directly to this email to respond to ${name}.</p>
      </div>
    </body>
    </html>
  `;
};

// Plain text version for better compatibility
const createTextTemplate = (name: string, email: string, message: string) => {
    return `
PlaPlan - New Contact Form Submission
==========================

From: ${name}
Email: ${email}

Message:
--------
${message}

---
This email was sent from your website contact form.
Reply directly to this email to respond to ${name}.
  `.trim();
};

// This is an exported wrapper function that can be called from server actions.
export async function sendEmail(input: SendEmailInput): Promise<void> {
    return sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
    {
        name: 'sendEmailFlow',
        inputSchema: SendEmailInputSchema,
        outputSchema: z.void(),
    },
    async (input) => {
        try {
            console.log('--- Sending Contact Form Email ---');
            console.log(`From: ${input.name} <${input.email}>`);
            console.log(`To: ${CONTACT_EMAIL}`);

            // Create transporter
            const transporter = createTransporter();

            // Verify connection configuration
            await transporter.verify();
            console.log('SMTP connection verified successfully');

            // Setup email data
            const mailOptions = {
                from: `"${input.name}" <${CONTACT_EMAIL}>`, // Use your verified Brevo sender
                to: CONTACT_EMAIL, // Your contact email
                replyTo: input.email, // User can reply directly to the sender
                subject: `PlaPlan - New Contact Form Submission from ${input.name}`,
                text: createTextTemplate(input.name, input.email, input.message),
                html: createEmailTemplate(input.name, input.email, input.message),
            };

            // Send email
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

            // Optional: Send auto-reply to the user
            const autoReplyOptions = {
                from: `"Dodukh Team" <${CONTACT_EMAIL}>`,
                to: input.email,
                subject: 'Thank you for contacting us!',
                text: `Hi ${input.name},\n\nThank you for reaching out to us. We have received your message and will get back to you as soon as possible.\n\nBest regards,\nThe Undergrid Team`,
                html: `
          <p>Hi ${input.name},</p>
          <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
          <p>Best regards,<br>The Dodukh Team</p>
        `,
            };

            await transporter.sendMail(autoReplyOptions);
            console.log('Auto-reply sent successfully');
            console.log('----------------------------------');

        } catch (error) {
            console.error('Error sending email:', error);

            // Log specific error details for debugging
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }

            // Re-throw the error so it can be handled by the calling code
            throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
);