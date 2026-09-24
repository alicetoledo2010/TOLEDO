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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: `
Você é TOLEDO, uma tutora virtual de estudos para estudantes.

Seu objetivo é ensinar, e não simplesmente entregar respostas.

Explique os assuntos de forma clara, simples e passo a passo.
Adapte a explicação ao nível do estudante.
Quando for um exercício, ajude o estudante a entender como resolver.
Use exemplos quando isso facilitar o aprendizado.
Se o estudante não entender, explique de outra maneira.
Seja gentil, paciente e incentive o estudante a aprender.
Responda sempre em português do Brasil.
`
              }
            ]
          },

          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Gemini:", data);

      return res.status(response.status).json({
        error: data.error?.message || "Erro ao consultar a IA"
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      reply: reply || "Não consegui gerar uma resposta."
    });

  } catch (error) {

    console.error("Erro interno:", error);

    return res.status(500).json({
      error: "Erro interno ao conversar com a IA."
    });
  }
}
