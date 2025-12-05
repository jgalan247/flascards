"""
Email service using Resend
"""
import resend
from django.conf import settings


def send_verification_email(teacher):
    """Send email verification link to new teacher"""
    if not settings.RESEND_API_KEY:
        print("Warning: RESEND_API_KEY not set, skipping email")
        return False

    resend.api_key = settings.RESEND_API_KEY

    verification_url = f"{settings.FRONTEND_URL}/verify/{teacher.verification_token}"

    try:
        resend.Emails.send({
            "from": settings.EMAIL_FROM,
            "to": teacher.email,
            "subject": "Verify your Flashcard Generator account",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Welcome to Flashcard Generator!</h2>
                <p>Hi {teacher.name},</p>
                <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}"
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: white;
                              padding: 14px 30px;
                              text-decoration: none;
                              border-radius: 8px;
                              font-weight: bold;">
                        Verify Email
                    </a>
                </p>
                <p>Or copy this link: <a href="{verification_url}">{verification_url}</a></p>
                <p style="color: #666; font-size: 14px;">
                    If you didn't create an account, you can ignore this email.
                </p>
            </div>
            """
        })
        return True
    except Exception as e:
        print(f"Error sending verification email: {e}")
        return False


def send_password_reset_email(teacher):
    """Send password reset link"""
    if not settings.RESEND_API_KEY:
        print("Warning: RESEND_API_KEY not set, skipping email")
        return False

    resend.api_key = settings.RESEND_API_KEY

    reset_url = f"{settings.FRONTEND_URL}/reset-password/{teacher.reset_token}"

    try:
        resend.Emails.send({
            "from": settings.EMAIL_FROM,
            "to": teacher.email,
            "subject": "Reset your Flashcard Generator password",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Password Reset Request</h2>
                <p>Hi {teacher.name},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}"
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: white;
                              padding: 14px 30px;
                              text-decoration: none;
                              border-radius: 8px;
                              font-weight: bold;">
                        Reset Password
                    </a>
                </p>
                <p>Or copy this link: <a href="{reset_url}">{reset_url}</a></p>
                <p style="color: #666; font-size: 14px;">
                    This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.
                </p>
            </div>
            """
        })
        return True
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False
