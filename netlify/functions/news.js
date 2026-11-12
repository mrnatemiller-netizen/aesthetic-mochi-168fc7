
exports.handler = async () => {
  const feeds = [
    "https://feeds.npr.org/1001/rss.xml",
    "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
    "https://feeds.foxnews.com/foxnews/politics",
    "https://www.cbsnews.com/latest/rss/politics"
  ];

  try {
    const results = await Promise.all(
      feeds.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) return "";

        return await response.text();
      })
    );

    const articles = results.flatMap((xml) => {
      const items = xml.match(/<item[\s\S]*?<\/item>/g) || [];

      return items.map((item) => {
        const get = (tag) =>
          item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
            ?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";

        return {
          title: get("title"),
          link: get("link"),
          source: get("source"),
          description: get("description"),
          published: get("pubDate")
        };
      });
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(articles)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

