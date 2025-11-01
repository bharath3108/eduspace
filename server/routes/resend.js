const router = require('express').Router();
const User = require('../models/user.model');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

// Route to resend verification email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send('User with this email does not exist.');
        }

        if (user.isVerified) {
            return res.status(400).send('This account has already been verified.');
        }

        // Create a new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = verificationToken;
        await user.save();

        // Send the email
        const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
        const verifyURL = `${appBaseUrl}/verify-email?token=${verificationToken}`;
        const message = `Please click on this link to verify your email address: ${verifyURL}`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <div style="background: #0a192f; padding: 20px; border-radius: 10px; color: white; margin-bottom: 20px;">
                    <h1 style="margin: 0; color: #64ffda;">EduSpace</h1>
                    <p style="margin: 5px 0 0 0;">Email Verification</p>
                </div>
                <p>Hello,</p>
                <p>Thank you for registering with EduSpace. Please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyURL}" 
                       style="background: #64ffda; 
                              color: #0a192f; 
                              padding: 12px 30px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              font-weight: bold;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #666; font-size: 0.9em;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 0.9em; word-break: break-all;">${verifyURL}</p>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: 'EduSpace - Verify Your Email',
            message,
            html
        });

        res.status(200).send('A new verification email has been sent.');

    } catch (error) {
        console.error(error);
        res.status(500).send('Error resending verification email.');
    }
});

module.exports = router;
