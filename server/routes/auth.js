const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
let User = require('../models/user.model');
const sendEmail = require('../utils/email');

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role, branch, section, year, programType } = req.body;

    // Validate name
    if (!name) {
        return res.status(400).json('Error: Name is required');
    }

    // Validate email domain
    if (role === 'student' && !email.endsWith('@student.nitw.ac.in')) {
        return res.status(400).json('Error: Invalid email domain for student');
    }
    if (role === 'professor' && !email.endsWith('@nitw.ac.in')) {
        return res.status(400).json('Error: Invalid email domain for professor');
    }
    if (role === 'admin') {
        return res.status(400).json('Error: Cannot register as admin');
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json('Error: User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            branch: role === 'student' ? branch : undefined,
            section: role === 'student' ? section : undefined,
            year: role === 'student' ? year : undefined,
            programType: role === 'student' ? programType : undefined,
            isVerified: role === 'admin' ? true : false,
            emailVerificationToken: role === 'admin' ? undefined : verificationToken,
        });

        await newUser.save();

        if (role !== 'admin') {
            const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
            const verifyURL = `${appBaseUrl}/verify-email?token=${verificationToken}`;
            const { templates } = require('../utils/email');
            const html = templates.verification({ name, verifyURL });
            await sendEmail({ email, subject: 'Verify your email', message: `Verify: ${verifyURL}`, html });
        }

        res.json('Registration successful. Please verify your email.');

    } catch (err) {
        console.error(err);
        res.status(400).json('Error: ' + err);
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Special case for admin login
        if (email === 'bharathclone0@gmail.com' && role === 'admin') {
            let user = await User.findOne({ email });
            
            const adminPassword = '1234';
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            if (!user) {
                // Create admin user if it doesn't exist
                user = new User({
                    name: 'Admin', // Default name for admin
                    email,
                    password: hashedPassword,
                    role: 'admin'
                });
                await user.save();
            } else {
                // If user exists, ensure the password and name are correct
                user.password = hashedPassword;
                user.name = 'Admin'; // Ensure name is set
                await user.save();
            }

            // Now compare with the provided password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json('Error: Invalid credentials');
            }

            const payload = { user: { id: user.id, role: user.role, name: user.name, email: user.email } };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
                if (err) throw err;
                return res.json({ token });
            });
            return; // End execution here for admin
        }

        // Regular user login
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json('Error: Invalid credentials');
        }

        if (user.role === 'admin') {
            return res.status(400).json('Error: Invalid credentials');
        }

        if (!user.isVerified) {
            return res.status(400).json('Please verify your email to log in.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json('Error: Invalid credentials');
        }

        if (user.role !== role) {
            return res.status(400).json(`Error: You are not registered as a ${role}`);
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                name: user.name
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});

// Verify Email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).send('Verification token is missing.');
    }

    try {
        const user = await User.findOne({ emailVerificationToken: token });

        if (!user) {
            return res.status(400).send('Invalid or expired token.');
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined; // Clear the token
        await user.save();

        res.send('Email successfully verified! You can now log in.');

    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).send('Server error during email verification.');
    }
});

module.exports = router;
