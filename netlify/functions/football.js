
exports.handler = async (event) => {
  const apiKey = process.env.APISPORTS_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Chýba API kľúč v Netlify." })
    };
  }

  const p = event.queryStringParameters || {};
  const action = p.action || "fixtures";

  const endpoints = {
    teams: "teams",
    leagues: "leagues",
    fixtures: "fixtures",
    headtohead: "fixtures/headtohead",
    statistics: "fixtures/statistics"
  };

  if (!endpoints[action]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Neplatná akcia." })
    };
  }

  const q = new URLSearchParams();

  const allowedParams = {
    teams: ["search", "id"],
    leagues: ["search", "id", "season"],
    fixtures: ["date", "league", "season", "team", "last", "next"],
    headtohead: ["h2h", "last"],
    statistics: ["fixture", "team"]
  };

  for (const key of allowedParams[action]) {
    if (p[key]) q.set(key, p[key]);
  }

  if (!q.toString()) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Chýbajú parametre." })
    };
  }

  try {
    const url = "https://v3.football.api-sports.io/" +
      endpoints[action] + "?" + q.toString();

    const response = await fetch(url, {
      headers: { "x-apisports-key": apiKey }
    });

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "Nepodarilo sa načítať údaje."
      })
    };
  }
};
