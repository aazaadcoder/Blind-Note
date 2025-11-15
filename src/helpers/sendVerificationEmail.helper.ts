import { ApiResponse } from './../types/ApiResponse.types';
import { resend } from "@/lib/resend.lib";
import VerificationEmail from "../../emails/VerificationEmail";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verfiyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: "Blind Messages Verification code",
            react: VerificationEmail({ username, otp: verfiyCode }),
        })
        return {
            success: true,
            message: "Verification Email Sent Successfully",
        }
    } catch (emailError) {
        console.error("Error sending verfication Email.", email);
        return { success: false, message: "Failed to send verification email." }
    }
}