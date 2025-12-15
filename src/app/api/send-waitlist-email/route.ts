import { NextResponse } from "next/server";
import { sendWaitListEmail } from "@/lib/brevo";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, userName, userId } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        console.log("Sending welcome email to:", email);

        const result = await sendWaitListEmail(email);
        console.log("Email result: ", JSON.stringify(result));

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, messageId: result.messageId },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Unknown server error" },
            { status: 500 }
        );
    }
}

// usage example: nextJS
// const email = "";
// const userName = "";

// await fetch("/api/send-welcome-email", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, userName }),
// });