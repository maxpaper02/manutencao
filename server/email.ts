import nodemailer from "nodemailer";

export async function sendNewOrderEmail(data: {
  sector: string;
  problemType: string;
  description: string;
  priority: string;
  requesterName: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Nova Solicitação de Manutenção</h2>
      <p><strong>Equipamento / Setor:</strong> ${data.sector}</p>
      <p><strong>Tipo de problema:</strong> ${data.problemType}</p>
      <p><strong>Prioridade:</strong> ${data.priority}</p>
      <p><strong>Solicitante:</strong> ${data.requesterName}</p>
      <p><strong>Descrição:</strong><br>${data.description}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `Nova Solicitação - ${data.sector} - ${data.priority}`,
    html,
  });
}