const nodemailer = require('nodemailer');

// Send OTP via Email
const sendOTP = async (email, otp) => {
    try {
        // Create Transporter
        // Note: For Gmail, user needs 'App Password', regular password won't work with 2FA
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email Configuration
        const mailOptions = {
            from: process.env.EMAIL_USER,
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
        console.log(`[EMAIL SERVICE] Email sent: ${info.response}`);
        return true;
    } catch (error) {
        console.error('[EMAIL SERVICE] Error sending email:', error);
        // Fallback to console log if email fails (for development safety)
        console.log('--------------------------------------------------');
        console.log(`[EMAIL SERVICE] FALLBACK: OTP for ${email} is ${otp}`);
        console.log('--------------------------------------------------');
        return false;
    }
};

module.exports = { sendOTP };
