import nodemailer from "nodemailer";

type NewOrderEmailData = {
  sector: string;
  problemType: string;
  description: string;
  priority: string;
  requesterName: string;
};

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Configuração de e-mail ausente: ${name}`);
  }

  return value;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSmtpPort() {
  const rawPort = process.env.SMTP_PORT?.trim() || "587";
  const port = Number.parseInt(rawPort, 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Configuração de e-mail inválida: SMTP_PORT=${rawPort}`);
  }

  return port;
}

export async function sendNewOrderEmail(data: NewOrderEmailData) {
  console.log("--- INICIANDO ENVIO DE E-MAIL ---");
  console.log("Destinatário:", process.env.EMAIL_TO);

  const host = requireEnv("SMTP_HOST");
  const user = requireEnv("SMTP_USER");
  const pass = requireEnv("SMTP_PASS");
  const to = requireEnv("EMAIL_TO");
  const port = getSmtpPort();
  const secure = process.env.SMTP_SECURE?.trim().toLowerCase() === "true";
  const from = process.env.EMAIL_FROM?.trim() || `"Manutenção MaxPaper" <${user}>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },

    tls: {
      rejectUnauthorized: false,
    }
  ,

  

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  const safeData: NewOrderEmailData = {
    sector: escapeHtml(data.sector),
    problemType: escapeHtml(data.problemType),
    description: escapeHtml(data.description).replace(/\n/g, "<br>"),
    priority: escapeHtml(data.priority),
    requesterName: escapeHtml(data.requesterName),
  };

  const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
            <h2 style="color: #059669;">Nova Solicitação de Manutenção</h2>
            <hr>
            <p><strong>Equipamento / Setor:</strong> ${safeData.sector}</p>
            <p><strong>Tipo de problema:</strong> ${safeData.problemType}</p>
            <p><strong>Prioridade:</strong> ${safeData.priority}</p>
            <p><strong>Solicitante:</strong> ${safeData.requesterName}</p>
            <p><strong>Descrição:</strong></p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 5px;">
                  ${safeData.description}
            </div>
            <hr>
            <p style="font-size: 12px; color: #666;">Este é um e-mail automático enviado pelo Sistema de Manutenção MaxPaper.</p>
      </div>
  `;

  try {
    await transporter.verify();
console.log("SMTP OK");
    const info = await transporter.sendMail({
      from,
      to,
      subject: `Nova Solicitação - ${data.sector} - ${data.priority}`,
      html: html,
    });

    console.log("E-MAIL ENVIADO COM SUCESSO! ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("ERRO DETALHADO AO ENVIAR E-MAIL:", error);
    throw error;
  }
} // <--- Esta chave final estava faltando!
