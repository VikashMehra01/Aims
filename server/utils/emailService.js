const nodemailer = require('nodemailer');
const fs = require('fs');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const canUseBrevo = () => Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);

const sendBrevoEmail = async ({ toEmail, subject, html }) => {
    const senderName = process.env.BREVO_SENDER_NAME || 'AIMS Support';
    const payload = {
        sender: { name: senderName, email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: toEmail }],
        subject,
        htmlContent: html
    };

    const res = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        throw new Error(`Brevo API failed (${res.status}): ${bodyText}`);
    }
};

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
let transporter;

const getSmtpTransporter = () => {
    if (transporter) return transporter;

    const smtpPort = parseInt(process.env.SMTP_PORT) || 465;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for 587/others
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

    // Avoid noisy timeouts on hosts that block outbound SMTP.
    // Enable only when you explicitly want to test SMTP connectivity.
    if (process.env.SMTP_VERIFY_ON_STARTUP === 'true' && !canUseBrevo()) {
        transporter.verify(function (error) {
            if (error) {
                const msg = `[EMAIL SERVICE] SMTP verify failed (non-critical): ${error.message || error}`;
                console.log(msg);
                logToFile(msg);
            } else {
                const msg = '[EMAIL SERVICE] SMTP verify ok';
                console.log(msg);
                logToFile(msg);
            }
        });
    }

    return transporter;
};

// Send OTP via Email
const sendOTP = async (email, otp) => {
    // Check if email is configured (production mode)
    const isEmailConfigured = canUseBrevo() || ((process.env.SMTP_PASS || process.env.EMAIL_PASS) && (process.env.EMAIL_USER || process.env.SMTP_USER));

    // If not configured, use development fallback
    if (!isEmailConfigured) {
        console.log('--------------------------------------------------');
        console.log('[EMAIL SERVICE] Development Mode - Email not configured');
        console.log(`[EMAIL SERVICE] OTP for ${email} is: ${otp}`);
        console.log('--------------------------------------------------');
        logToFile(`DEV MODE: OTP for ${email} is ${otp}`);
        return true;
    }

    const otpHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #6366f1; text-align: center;">AIMS Verification</h2>
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">Please use the following OTP to verify your registration:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
                <h1 style="margin: 0; color: #111827; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #6b7280; text-align: center;">This OTP is valid for 10 minutes.</p>
        </div>
    `;

    // Prefer Brevo HTTPS API on free hosting (no SMTP port blocking)
    if (canUseBrevo()) {
        try {
            logToFile(`Attempting to send OTP to ${email} via Brevo API`);
            logToFile(`DEBUG MODE: The OTP is ${otp}`);
            await sendBrevoEmail({
                toEmail: email,
                subject: 'AIMS Verification OTP',
                html: otpHtml
            });
            const successMsg = '[EMAIL SERVICE] Email sent via Brevo API';
            console.log(successMsg);
            logToFile(successMsg);
            return true;
        } catch (error) {
            console.error(`[EMAIL SERVICE] Brevo API Error: ${error.message}`);
            logToFile(`Brevo API Error: ${error.message}`);
            // Fall through to SMTP fallback
        }
    }

    // Fallback to SMTP (for Gmail or other providers)
    try {
        logToFile(`Attempting to send OTP to ${email} via SMTP`);
        logToFile(`DEBUG MODE: The OTP is ${otp}`);

        // Email Configuration
        const mailOptions = {
            from: process.env.SENDER_EMAIL || '"AIMS Support" <noreply@aims.edu>',
            to: email,
            subject: 'AIMS Verification OTP',
            html: otpHtml
        };

        // Send Email
        const info = await getSmtpTransporter().sendMail(mailOptions);
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
