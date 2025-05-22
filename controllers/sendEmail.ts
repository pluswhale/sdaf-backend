import nodemailer from 'nodemailer';
import { Response, Request } from 'express';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'egorchiktop228@gmail.com',
        pass: 'artem1mybestfriend1',
    },
});

transporter.verify((error: any) => {
    if (error) {
        console.error('Ошибка подключения к почтовому серверу:', error);
    } else {
        console.log('Сервер готов к отправке писем');
    }
});

export const sendEmail = async (req: Request, res: Response): Promise<any> => {
    try {
        const { to, subject, text } = req.body;

        if (!to || !subject || !text) {
            return res.status(400).json({ error: 'Необходимо указать to, subject и text' });
        }

        const mailOptions = {
            from: `SDAF" <egoraksevic@gmail.com>`,
            to,
            subject,
            text,
            html: text,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Письмо отправлено: %s', info.messageId);
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
        res.status(500).json({ error: 'Не удалось отправить письмо' });
    }
};
