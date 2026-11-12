
exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "POST required" })
    };
  }

  try {
    const key = process.env.OPENAI_API_KEY;

    if (!key) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "AI key not configured" })
      };
    }

    const input = JSON.parse(event.body || "{}");
    const action = input.action || "summarize";
    const articles = input.articles || [input.article || {}];

    const prompt = action === "compare"
      ? `Compare these news perspectives fairly.
         Explain shared facts, differences in framing,
         and what evidence readers should examine.
         Do not invent facts.
         Articles: ${JSON.stringify(articles)}`
      : `Summarize this news headline and source metadata.
         Clearly distinguish known facts from inference.
         Do not invent article details.
         Article: ${JSON.stringify(articles[0])}`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content: "You are a neutral news analysis assistant."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.3
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data.error?.message || "AI request failed"
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        result: data.choices?.[0]?.message?.content || ""
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
