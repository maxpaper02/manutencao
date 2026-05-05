import nodemailer from "nodemailer";

export async function sendNewOrderEmail(data: {
        sector: string;
        problemType: string;
        description: string;
        priority: string;
        requesterName: string;
}) {
        console.log("--- INICIANDO ENVIO DE E-MAIL ---");
        console.log("Destinatário:", process.env.EMAIL_TO);

  const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
            },
  });

  const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
            <h2 style="color: #059669;">Nova Solicitação de Manutenção</h2>
                  <hr>
                        <p><strong>Equipamento / Setor:</strong> ${data.sector}</p>
                              <p><strong>Tipo de problema:</strong> ${data.problemType}</p>
                                    <p><strong>Prioridade:</strong> ${data.priority}</p>
                                          <p><strong>Solicitante:</strong> ${data.requesterName}</p>
                                                <p><strong>Descrição:</strong></p>
                                                      <div style="background: #f3f4f6; padding: 15px; border-radius: 5px;">
                                                              ${data.description.replace(/\n/g, "<br>")}
                                                                    </div>
                                                                          <hr>
                                                                                <p style="font-size: 12px; color: #666;">Este é um e-mail automático enviado pelo Sistema de Manutenção MaxPaper.</p>
                                                                                    </div>
                                                                                      `;

  try {
            const info = await transporter.sendMail({
                        from: \`"Manutenção MaxPaper" <\${process.env.SMTP_USER}>\`,
                              to: process.env.EMAIL_TO,
                                    subject: \`🛠️ Nova Solicitação - \${data.sector} - \${data.priority}\`,
                                          html,
                                              });
                                                  console.log("E-MAIL ENVIADO COM SUCESSO! ID:", info.messageId);
                                                      return info;
                                                        } catch (error) {
                                                            console.error("ERRO DETALHADO AO ENVIAR E-MAIL:", error);
                                                                throw error;
                                                                  }
                                                                  }

                                                                  
