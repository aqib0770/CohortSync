import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

export const sendMail = (email, token, purpose) => {
  let emailText = undefined;
  let emailSubject = undefined;
  if (purpose === "verify".toLowerCase()) {
    emailText = `Click on the following link to verify ${process.env.URL}/api/v1/user/verify/${token}`;
    emailSubject = "Verification Email";
  } else if (purpose === "resetPassword".toLowerCase()) {
    emailText = `Click on the following link to reset Password ${process.env.URL}/api/v1/user/resetpassword/${token}`;
    emailSubject = "Reset Password";
  } else if (purpose === "showPassword".toLowerCase()) {
    emailText = `Your password: ${token}`;
    emailSubject = "View password";
  }
  const mailTransportConfig = {
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  };
  console.log({ emailText, emailSubject });
  const transporter = nodemailer.createTransport(mailTransportConfig);
  const mailOptions = {
    from: process.env.MAILTRAP_USERNAME,
    to: email,
    subject: emailSubject,
    text: emailText,
  };
  transporter.sendMail(mailOptions);
};
