import nodemailer from 'nodemailer';

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;

const nodemailerConfig = {
  host: 'smtp.ukr.net',
  port: 465,
  secure: true,
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = (data) => {
  const email = { ...data, from: SENDER_EMAIL };
  return transport.sendMail(email);
};

export default sendEmail;
