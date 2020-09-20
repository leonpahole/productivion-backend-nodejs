import Email from "email-templates";
import { logger } from "../logger";
import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

const email = new Email({
  message: {
    from: process.env.MAIL_FROM,
  },
  send: true,
  transport: nodemailerMailgun,
});

type EmailTemplates = {
  welcome: {
    link: string;
    name: string;
  };
  resetPassword: {
    link: string;
    name: string;
    expiryTimeHours: number;
  };
};

type TemplateType = keyof EmailTemplates;

type EmailTemplate<T extends TemplateType> = {
  template: T;
  locals: EmailTemplates[T];
  message: {
    to: string;
  };
};

export const sendForgotPasswordMail = async (
  to: string,
  params: EmailTemplates["resetPassword"]
): Promise<boolean> => {
  const myEmail: EmailTemplate<"resetPassword"> = {
    template: "resetPassword",
    message: {
      to,
    },
    locals: params,
  };

  return await sendMail(myEmail);
};

export const sendWelcomeMail = async (
  to: string,
  params: EmailTemplates["welcome"]
): Promise<boolean> => {
  const myEmail: EmailTemplate<"welcome"> = {
    template: "welcome",
    message: {
      to,
    },
    locals: params,
  };

  return await sendMail(myEmail);
};

const sendMail = async (mail: Email.EmailOptions): Promise<boolean> => {
  try {
    await email.send(mail);
  } catch (e) {
    logger.error("Send mail error");
    logger.error(e);
    return false;
  }

  return true;
};
