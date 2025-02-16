import nodemailer, { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Attachment[];
}

export interface Attachment {
  filename: string;
  path: string;
}

export class EmailService {
  private transporter: Transporter;

  constructor(
    // mailerService: string,
    mailerEmail: string,
    mailerSecretKey: string,
    private readonly postToProvider: boolean
  ) {
    this.transporter = nodemailer.createTransport({
      // service: mailerService,
      host: 'mail.dgdevperu.com', // Reemplaza con el servidor SMTP
      port: 465, // Cambia al puerto 465
      secure: true,
      auth: {
        user: mailerEmail,
        pass: mailerSecretKey,
      },
    });
  }

  async sendEmail(options: SendMailOptions): Promise<boolean> {
    const { to, subject, html, attachments = [] } = options;

    try {
      //codigo para no enviar correo en producccion
      if (!this.postToProvider) return true;

      const sendInformation = await this.transporter.sendMail({
        to,
        subject,
        html,
        attachments,
      });

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }
}
