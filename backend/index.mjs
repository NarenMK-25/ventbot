import { GoogleGenAI } from "@google/genai";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand
} from "@aws-sdk/lib-dynamodb";


const REGION = process.env.AWS_REGION;

const TABLE_NAME = "VentBotSessions";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is missing");
}


const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});


const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: REGION
  })
);


const SYSTEM_PROMPT = `
You are VentBot, a creative companion for IT employees having a rough day.

Classify the user's message into exactly one of these modes:

1. "jargon"
The user has pasted corporate jargon, workplace communication,
meeting notes, an email, or corporate-speak that should be translated.

2. "vent"
The user is expressing their own frustration, stress, annoyance,
anger, disappointment, or difficult work experience.

For JARGON mode:
- Explain the real meaning simply.
- Explain it as if speaking to a 5-year-old.
- Give a funny pirate version.

For VENT mode:
- Respond with genuine empathy first.
- Then provide a short funny reframe when appropriate.
- Never make the empathy itself into a joke.

Safety:
- Set concern_flag to true only if the message suggests something
  substantially heavier than ordinary workplace stress, such as
  severe hopelessness, despair, or self-harm references.
- If concern_flag is true, do not make jokes.
- In that case, use the offer field to gently encourage reaching out
  to trusted people or appropriate professional support.

moodScore must be an integer from 1 to 10.
`;


const responseSchema = {
  type: "object",
  properties: {
    mode: {
      type: "string",
      enum: ["vent", "jargon"]
    },

    real_meaning: {
      type: "string"
    },

    five_year_old: {
      type: "string"
    },

    pirate: {
      type: "string"
    },

    empathy: {
      type: "string"
    },

    offer: {
      type: "string"
    },

    moodScore: {
      type: "integer"
    },

    concern_flag: {
      type: "boolean"
    }
  },

  required: [
    "mode",
    "moodScore"
  ]
};


export const handler = async (event) => {

  try {

    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body;

    const sessionId = body?.sessionId;

    const text = body?.text;


    if (!sessionId || !text) {

      return {
        statusCode: 400,

        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },

        body: JSON.stringify({
          error: "sessionId and text are required"
        })
      };

    }


    const prompt = `
${SYSTEM_PROMPT}

USER MESSAGE:
${text}
`;


    const response =
      await ai.models.generateContent({

        model: GEMINI_MODEL,

        contents: prompt,

        config: {
          responseMimeType: "application/json",
          responseSchema
        }

      });


    const parsed =
      JSON.parse(response.text);


    await ddb.send(
      new PutCommand({

        TableName: TABLE_NAME,

        Item: {

          sessionId,

          timestamp: Date.now(),

          mode: parsed.mode,

          inputText: text,

          moodScore:
            Number.isInteger(parsed.moodScore)
              ? parsed.moodScore
              : null,

          response:
            JSON.stringify(parsed)

        }

      })
    );


    return {

      statusCode: 200,

      headers: {

        "Content-Type":
          "application/json",

        "Access-Control-Allow-Origin":
          "*",

        "Access-Control-Allow-Headers":
          "Content-Type",

        "Access-Control-Allow-Methods":
          "POST,OPTIONS"

      },

      body:
        JSON.stringify(parsed)

    };


  } catch (error) {

    console.error(
      "VentBot Gemini error:",
      error
    );


    return {

      statusCode: 500,

      headers: {

        "Content-Type":
          "application/json",

        "Access-Control-Allow-Origin":
          "*"

      },

      body:
        JSON.stringify({

          error:
            "Something went wrong while processing your message."

        })

    };

  }

};