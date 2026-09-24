export default async function handler(req, res) {
  const allowedOrigin = "https://alicetoledo2010.github.io";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Mensagem não enviada"
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.6",
        instructions: `
Você é TOLEDO, uma tutora virtual de estudos para estudantes.

Seu objetivo é ensinar, e não apenas entregar respostas.

Explique os assuntos de forma clara, simples e passo a passo.
Adapte a explicação ao nível do estudante.
Quando for um exercício, ajude o estudante a entender como resolver.
Use exemplos quando isso facilitar o aprendizado.
Se o estudante não entender, explique de outra maneira.
Não invente informações.
Se não tiver certeza de algo, diga isso claramente.
Seja gentil, paciente e incentive o estudante a aprender.
Responda em português do Brasil.
        `,
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Erro ao consultar a IA"
      });
    }

    return res.status(200).json({
      reply: data.output_text || "Não consegui gerar uma resposta."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro interno ao conversar com a IA."
    });
  }
}
