const nodemailer = require('nodemailer');

async function createTransport() {
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  // Fallback: ethereal test account for dev
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

module.exports = async function sendEmail({ email, subject, message, html }) {
  const transporter = await createTransport();
  const from = process.env.EMAIL_FROM || 'EduSpace Scheduler <no-reply@eduspace.local>';
  const info = await transporter.sendMail({ from, to: email, subject, text: message, html });
  if (!process.env.EMAIL_HOST) {
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return true;
};

// Simple email templates
const shell = (content) => `
  <div style="background:#f6f8fb;padding:24px">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden">
      <div style="background:linear-gradient(90deg,#2e6ff2,#5b8cff);padding:16px 20px;color:#fff">
        <div style="font-weight:700;font-size:18px;letter-spacing:0.3px">EduSpace Scheduler</div>
        <div style="opacity:0.9;font-size:12px">Smarter room and exam management</div>
      </div>
      <div style="padding:20px 22px;color:#222;font-family:Arial,Helvetica,sans-serif;line-height:1.6">
        ${content}
      </div>
      <div style="padding:14px 20px;background:#fafbff;border-top:1px solid #eef2ff;color:#6b7280;font-size:12px;text-align:center">
        © ${new Date().getFullYear()} EduSpace • This is an automated message
      </div>
    </div>
  </div>
`;

module.exports.templates = {
  verification: ({ name, verifyURL }) => shell(`
      <h2 style="margin:0 0 6px">Welcome to EduSpace, ${name}!</h2>
      <p>Please verify your email to activate your account.</p>
      <p style="margin:18px 0">
        <a href="${verifyURL}" style="background:#2e6ff2;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">Verify Email</a>
      </p>
      <p style="font-size:12px;color:#6b7280">If the button doesn't work, copy this URL:</p>
      <p style="word-break:break-all"><a href="${verifyURL}">${verifyURL}</a></p>
  `),
  professorBooking: ({ professorName, description, subject, department, roomNumber, dateText, timeText, sectionsText, yearsText }) => shell(`
      <h2 style="margin:0 0 6px">Booking Confirmation</h2>
      <p>Hi ${professorName}, your booking has been created with the details below.</p>
      <table style="width:100%;border-collapse:collapse" cellpadding="0" cellspacing="0">
        <tbody>
          <tr><td style="padding:6px 0;width:160px;color:#6b7280">Subject</td><td style="padding:6px 0">${subject || 'N/A'}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Description</td><td style="padding:6px 0">${description}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Department</td><td style="padding:6px 0">${department}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Room</td><td style="padding:6px 0">${roomNumber}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Date</td><td style="padding:6px 0">${dateText}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Time</td><td style="padding:6px 0">${timeText}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Sections</td><td style="padding:6px 0">${sectionsText}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Years</td><td style="padding:6px 0">${yearsText}</td></tr>
        </tbody>
      </table>
  `),
  studentBooking: ({ studentName, description, subject, department, roomNumber, dateText, timeText, sectionsText, yearsText }) => shell(`
      <h2 style="margin:0 0 6px">Exam/Booking Scheduled</h2>
      <p>Hi ${studentName}, an exam/booking has been scheduled that matches your cohort.</p>
      <table style="width:100%;border-collapse:collapse" cellpadding="0" cellspacing="0">
        <tbody>
          <tr><td style="padding:6px 0;width:160px;color:#6b7280">Subject</td><td style="padding:6px 0">${subject || 'N/A'}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Description</td><td style="padding:6px 0">${description}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Department</td><td style="padding:6px 0">${department}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Room</td><td style="padding:6px 0">${roomNumber}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Date</td><td style="padding:6px 0">${dateText}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Time</td><td style="padding:6px 0">${timeText}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Sections</td><td style="padding:6px 0">${sectionsText}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Years</td><td style="padding:6px 0">${yearsText}</td></tr>
        </tbody>
      </table>
  `),
};
