import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to, otp, subject = "Your OTP Code") => {
  const mailOptions = {
    from: `"StackOverflow Clone" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #f48024;">StackOverflow Clone</h2>
        <p>Your OTP code is:</p>
        <div style="font-size: 36px; font-weight: bold; color: #f48024; letter-spacing: 8px; padding: 16px; background: #f9f9f9; border-radius: 8px; text-align: center;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const sendInvoiceEmail = async (to, invoiceData) => {
  const { planName, amount, currency, paymentId, userName, validUntil } = invoiceData;
  const mailOptions = {
    from: `"StackOverflow Clone" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Invoice - ${planName} Subscription`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #f48024;">Payment Invoice</h2>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Thank you for subscribing! Here are your payment details:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr style="background: #f48024; color: white;">
            <th style="padding: 10px; text-align: left;">Description</th>
            <th style="padding: 10px; text-align: right;">Details</th>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">Plan</td>
            <td style="padding: 10px; text-align: right;">${planName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">Amount</td>
            <td style="padding: 10px; text-align: right;">${currency} ${amount}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">Payment ID</td>
            <td style="padding: 10px; text-align: right;">${paymentId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">Valid Until</td>
            <td style="padding: 10px; text-align: right;">${new Date(validUntil).toLocaleDateString("en-IN")}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #666; font-size: 13px;">Thank you for being a valued member of our community!</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (to, newPassword, userName) => {
  const mailOptions = {
    from: `"StackOverflow Clone" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your New Password - StackOverflow Clone",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #f48024;">Password Reset</h2>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Your password has been reset. Your new password is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 4px; padding: 16px; background: #f9f9f9; border-radius: 8px; text-align: center;">
          ${newPassword}
        </div>
        <p style="color: #e53e3e; font-size: 14px;"><strong>Please change this password after logging in.</strong></p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
