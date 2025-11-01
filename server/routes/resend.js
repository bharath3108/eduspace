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

        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            message,
        });

        res.status(200).send('A new verification email has been sent.');

    } catch (error) {
        console.error(error);
        res.status(500).send('Error resending verification email.');
    }
});

module.exports = router;
