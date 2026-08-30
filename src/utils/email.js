// const sgMail = require("@sendgrid/mail");
// const { config } = require("../config");
// const logger = require("../config/logger");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const minutes = Math.floor((config.OTP_TTL || 300000) / 60000);

// async function sendOtpEmail(email, otp) {
//   const msg = {
//     to: email,
//     from: config.EMAIL_FROM, // Must be a verified sender in SendGrid
//     subject: "Your OTP Verification Code",
//     text: `Your OTP is ${otp}. It is valid for ${minutes} minutes.`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
//         <h2>Email Verification</h2>
//         <p>Your One-Time Password (OTP) is:</p>

//         <div style="
//           font-size: 32px;
//           font-weight: bold;
//           letter-spacing: 8px;
//           background: #f5f5f5;
//           padding: 16px;
//           text-align: center;
//           border-radius: 6px;">
//           ${otp}
//         </div>

//         <p>This OTP is valid for <strong>${minutes} minutes</strong>.</p>

//         <p>If you didn't request this OTP, please ignore this email.</p>

//         <hr>

//         <p style="font-size:12px;color:#888;">
//           This is an automated email. Please do not reply.
//         </p>
//       </div>
//     `,
//   };

//   try {
//     await sgMail.send(msg);
//     logger.info(`OTP email sent successfully to ${email}`);
//     return true;
//   } catch (error) {
//     logger.error(`Failed to send OTP email: ${error.message}`);

//     if (error.response) {
//       logger.error(JSON.stringify(error.response.body));
//     }

//     throw error;
//   }
// }

// module.exports = {
//   sendOtpEmail,
// };


const nodemailer = require("nodemailer");
const { config } = require("../config");
const logger = require("../config/logger");

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false, // false for port 587, true for port 465
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

const minutes = config.OTP_TTL || 5;

async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: config.SMTP_FROM,
    to: email,
    subject: "Your OTP Verification Code",
    text: `Your OTP is ${otp}. It is valid for ${minutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Email Verification</h2>

        <p>Your One-Time Password (OTP) is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          background: #f5f5f5;
          padding: 16px;
          text-align: center;
          border-radius: 6px;">
          ${otp}
        </div>

        <p>
          This OTP is valid for <strong>${minutes} minute${minutes > 1 ? "s" : ""}</strong>.
        </p>

        <p>If you didn't request this OTP, please ignore this email.</p>

        <hr>

        <p style="font-size:12px;color:#888;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send OTP email: ${error.message}`);

    if (error.response) {
      logger.error(JSON.stringify(error.response));
    }

    throw error;
  }
}



async function sendEmailVerifiedMail(email) {
  const mailOptions = {
    from: config.SMTP_FROM,
    to: email,
    subject: "Your Email Has Been Verified",

    text: `
Your email address has been successfully verified.

You can now use your account normally.

If you did not perform this verification, please contact support.
    `.trim(),

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 20px;
        color: #333;
      ">

        <div style="
          text-align: center;
          margin-bottom: 25px;
        ">
          <div style="
            display: inline-block;
            width: 60px;
            height: 60px;
            line-height: 60px;
            background: #28a745;
            color: white;
            border-radius: 50%;
            font-size: 32px;
          ">
            ✓
          </div>
        </div>

        <h2 style="text-align: center;">
          Email Verified Successfully
        </h2>

        <p>
          Your email address
          <strong>${email}</strong>
          has been successfully verified.
        </p>

        <p>
          Your account is now ready to use.
        </p>

        <div style="
          background: #f0fff4;
          border: 1px solid #b7ebc6;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          color: #155724;
        ">
          ✓ Your email address is verified.
        </div>

        <p>
          If you did not perform this verification, please contact our
          support team immediately.
        </p>

        <hr>

        <p style="font-size: 12px; color: #888; text-align: center;">
          This is an automated email. Please do not reply.
        </p>

      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    logger.info(`Email verification confirmation sent to ${email}`);

    return true;
  } catch (error) {
    logger.error(
      `Failed to send email verification confirmation to ${email}: ${error.message}`
    );

    if (error.response) {
      logger.error(JSON.stringify(error.response));
    }

    throw error;
  }
}
module.exports = {
  sendOtpEmail,
  sendEmailVerifiedMail
};