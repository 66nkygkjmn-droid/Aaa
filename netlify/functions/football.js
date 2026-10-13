
exports.handler = async (event) => {
  const apiKey = process.env.APISPORTS_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Chýba API kľúč v Netlify."
      })
    };
  }

  const params = event.queryStringParameters || {};
  const action = params.action || "fixtures";
  const allowed = ["fixtures", "teams", "leagues"];

  if (!allowed.includes(action)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Neplatná požiadavka." })
    };
  }

  const query = new URLSearchParams();

  if (action === "fixtures") {
    if (params.date) query.set("date", params.date);
    if (params.league) query.set("league", params.league);
    if (params.season) query.set("season", params.season);
    if (params.team) query.set("team", params.team);
    if (params.last) query.set("last", params.last);
    if (params.next) query.set("next", params.next);
  }

  if (action === "teams") {
    if (params.search) query.set("search", params.search);
    if (params.id) query.set("id", params.id);
  }

  if (action === "leagues") {
    if (params.search) query.set("search", params.search);
    if (params.id) query.set("id", params.id);
    if (params.season) query.set("season", params.season);
  }

  if (query.toString().length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Zadaj parametre vyhľadávania."
      })
    };
  }

  const url =
    "https://v3.football.api-sports.io/" +
    action + "?" + query.toString();

  try {
    const response = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey
      }
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
        error: "Nepodarilo sa načítať futbalové údaje."
      })
    };
  }
};
