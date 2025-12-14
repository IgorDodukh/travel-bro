import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
    try {
        const { email, device } = await request.json();

        if (!email || !isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if already exists
        const waitlistRef = collection(db, 'androidWaitlist');
        const q = query(waitlistRef, where('email', '==', normalizedEmail));
        const existingDocs = await getDocs(q);

        if (!existingDocs.empty) {
            return NextResponse.json({
                message: 'You are already on the waitlist!',
                alreadyExists: true
            });
        }

        // Add to waitlist
        await addDoc(waitlistRef, {
            email: normalizedEmail,
            createdAt: serverTimestamp(),
            notified: false,
            source: 'landing_page',
            device: device
        });

        return NextResponse.json({
            message: 'Successfully joined the waitlist!',
            success: true
        });

    } catch (error) {
        console.error('Waitlist error:', error);
        return NextResponse.json(
            { error: 'Failed to join waitlist' },
            { status: 500 }
        );
    }
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
