import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { google } from "googleapis";
import dayjs from "dayjs";
const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY,
});
const app = express();
const PORT = process.env.NODE_ENV || 8000;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const scopes = ["https://www.googleapis.com/auth/calendar"];

app.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
  const code = req.query.code;

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  res.send({ msg: "You have successfully logged in" });
});

app.get("/schedule_event", async (req, res) => {
  console.log(oauth2Client.credentials.access_token);
  const startDateTime = dayjs(new Date()).add(1, "day").add(1, "hour");
  const endDateTime = startDateTime.add(1, "hour");

  await calendar.events.insert({
    calendarId: "primary",
    auth: oauth2Client,
    requestBody: {
      summary: "this is test event",
      description: "some events,....",
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Europe/London",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Europe/London",
      },
    },
  });
  res.send({
    msg: "Done",
  });
});

app.listen(PORT, () => {
  console.log("Serever started on port", PORT);
});
