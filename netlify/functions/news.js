
exports.handler = async () => {
  const feeds = [
    {
      name: "NPR",
      perspective: "center",
      url: "https://feeds.npr.org/1001/rss.xml"
    },
    {
      name: "BBC News",
      perspective: "center",
      url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml"
    },
    {
      name: "New York Times",
      perspective: "left",
      url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml"
    },
    {
      name: "Fox News",
      perspective: "right",
      url: "https://feeds.foxnews.com/foxnews/politics"
    },
    {
      name: "CBS News",
      perspective: "center",
      url: "https://www.cbsnews.com/latest/rss/politics"
    }
  ];

  function decode(text = "") {
    return text
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, (_, n) =>
        String.fromCharCode(Number(n))
      )
      .trim();
  }

  function getTag(xml, tag) {
    const match = xml.match(
      new RegExp(
        `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`,
        "i"
      )
    );
    return match ? decode(match[1]) : "";
  }

  async function fetchFeed(feed) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          "User-Agent": "TheDivide/1.0"
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) return [];

      const xml = await response.text();

      const items = xml.match(
        /<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi
      ) || [];

      return items.map(item => {
        const title = getTag(item, "title");
        const description = getTag(item, "description");
        const pubDate = getTag(item, "pubDate");

        let link = getTag(item, "link");

        if (!link) {
          const match = item.match(
            /<link[^>]*href=["']([^"']+)["']/i
          );
          if (match) link = match[1];
        }

        return {
          title,
          description,
          link,
          source: feed.name,
          perspective: feed.perspective,
          date: pubDate
        };
      }).filter(article => article.title && article.link);

    } catch (error) {
      console.error(feed.name, error.message);
      return [];
    }
  }

  try {
    const results = await Promise.all(
      feeds.map(fetchFeed)
    );

    const articles = results
      .flat()
      .sort((a, b) =>
        new Date(b.date || 0) - new Date(a.date || 0)
      );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300"
      },
      body: JSON.stringify({
        articles,
        count: articles.length
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
