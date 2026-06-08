const functions = require("firebase-functions");
const {google} = require("googleapis");

const sheets = google.sheets("v4");

exports.getDashboardData = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: "1T0vCitXPX5-E6GnVD4MThfzB-DdHcpVqcUgVZHPuPEE",
      range: "Dashboard Data!A:B",
    });

    res.json(response.data.values);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});
