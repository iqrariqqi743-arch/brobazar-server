import http from "http";
import nodemailer from "nodemailer";

// config the SMTP transport

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

/// SEND EMAIL
async function sendEmail(to, subject, text, html) {
  try {
    const info = await transport.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("error sending email" + error);
    return { success: false, error: error.message };
  }
}

export { sendEmail };
