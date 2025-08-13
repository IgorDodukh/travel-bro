"use server";

import { sendEmail, type SendEmailInput } from "@/ai/flows/send-email-flow";

type ServerActionResult = { success: true } | { success: false, error: string };

export async function sendContactEmail(data: SendEmailInput): Promise<ServerActionResult> {
    try {
        // In a real app, you would have an email sending service integrated here.
        // For this demo, the flow will just log the email content.
        await sendEmail(data);
        return { success: true };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown server error occurred.";
        return { success: false, error: `Failed to send email: ${errorMessage}` };
    }
}