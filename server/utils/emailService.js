const nodemailer = require('nodemailer');
const fs = require('fs');

const logToFile = (msg) => {
    const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
    try {
        fs.appendFileSync('email_debug.log', logMsg);
    } catch (e) {
        // ignore
    }
};

// Create Reusable Transporter with Pooling
// Supports: Gmail (local), SendGrid, Resend, or any SMTP service
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: (process.env.SMTP_PORT == 465) || true, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    logger: true,
    debug: true,
    tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
    }
});

// Verify connection configuration (non-blocking, won't fail startup)
transporter.verify(function (error, success) {
    if (error) {
        const msg = `[EMAIL SERVICE] Connection Error (non-critical): ${error.message || error}`;
        console.log(msg);
        logToFile(msg);
        console.log('[EMAIL SERVICE] Note: This may not affect actual email sending, will retry on send');
    } else {
        const msg = '[EMAIL SERVICE] Server is ready to take our messages';
        console.log(msg);
        logToFile(msg);
    }
});

// Send OTP via Email
const sendOTP = async (email, otp) => {
    // Check if email is configured (production mode)
    const isEmailConfigured = (process.env.SMTP_PASS || process.env.EMAIL_PASS) && (process.env.EMAIL_USER || process.env.SMTP_USER);

    // If not configured, use development fallback
    if (!isEmailConfigured) {
        console.log('--------------------------------------------------');
        console.log('[EMAIL SERVICE] Development Mode - Email not configured');
        console.log(`[EMAIL SERVICE] OTP for ${email} is: ${otp}`);
        console.log('--------------------------------------------------');
        logToFile(`DEV MODE: OTP for ${email} is ${otp}`);
        return true; // Return true in development to allow signup to proceed
    }

    // Production mode: attempt to send email
    try {
        logToFile(`Attempting to send OTP to ${email}`);
        logToFile(`DEBUG MODE: The OTP is ${otp}`); // Added for debugging

        // Email Configuration
        const mailOptions = {
            from: process.env.SENDER_EMAIL || (process.env.SMTP_USER === 'resend' ? 'AIMS Support <onboarding@resend.dev>' : '"AIMS Support" <noreply@aims.edu>'),
            to: email,
            subject: 'AIMS Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #6366f1; text-align: center;">AIMS Verification</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">Please use the following OTP to verify your registration:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
                        <h1 style="margin: 0; color: #111827; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; text-align: center;">This OTP is valid for 10 minutes.</p>
                </div>
            `
        };

        // Send Email
        const info = await transporter.sendMail(mailOptions);
        const successMsg = `[EMAIL SERVICE] Email sent: ${info.response}`;
        console.log(successMsg);
        logToFile(successMsg);
        return true;
    } catch (error) {
        const errorMsg = `[EMAIL SERVICE] Error sending email: ${error}`;
        console.error(errorMsg);
        logToFile(errorMsg);

        // Fallback to console log if email fails (for development safety)
        console.log('--------------------------------------------------');
        console.log(`[EMAIL SERVICE] FALLBACK: OTP for ${email} is ${otp}`);
        console.log('--------------------------------------------------');

        logToFile(`FALLBACK OTP: ${otp}`);
        return false; // Return false in production if email fails
    }
};

module.exports = { sendOTP };
