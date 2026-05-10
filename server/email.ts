import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type NewOrderEmailData = {
  sector: string;
  problemType: string;
  description: string;
  priority: string;
  requesterName: string;
};

export async function sendNewOrderEmail(
  data: NewOrderEmailData
) {
  try {
    const response = await resend.emails.send({
      from: "Sistema MaxPaper <onboarding@resend.dev>",
      to: "maxpaper02@gmail.com",

      subject: `Nova Solicitação - ${data.sector}`,

      html: `
        <h2>Nova Solicitação de Manutenção</h2>

        <p><strong>Setor:</strong> ${data.sector}</p>

        <p><strong>Problema:</strong> ${data.problemType}</p>

        <p><strong>Prioridade:</strong> ${data.priority}</p>

        <p><strong>Solicitante:</strong> ${data.requesterName}</p>

        <p><strong>Descrição:</strong></p>

        <div style="padding:12px;background:#f3f4f6;border-radius:8px;">
          ${data.description}
        </div>
      `,
    });

    console.log("EMAIL ENVIADO:", response);

    return response;
  } catch (error) {
    console.error("ERRO RESEND:", error);
    throw error;
  }
}