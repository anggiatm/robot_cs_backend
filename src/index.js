const util = require("util");
const fs = require("fs");
const dialogflow = require("@google-cloud/dialogflow");
const cors = require("cors");

const tenantQuery = require("./queries/tenants");
const productQuery = require("./queries/products");
const qaQuery = require("./queries/question_answer");

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);

const PROJECTID = CREDENTIALS.project_id;

const CONFIGURATION = {
  credentials: {
    private_key: CREDENTIALS["private_key"],
    client_email: CREDENTIALS["client_email"],
  },
};

const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);

const detectIntenText = async (languageCode, queryText, sessionId) => {
  let sessionPath = sessionClient.projectAgentSessionPath(PROJECTID, sessionId);

  let request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: queryText,
        languageCode: languageCode,
      },
    },
    outputAudioConfig: {
      audioEncoding: "OUTPUT_AUDIO_ENCODING_LINEAR_16",
    },
  };

  const responses = await sessionClient.detectIntent(request);
  // streamingDetectIntent
  console.log(responses);

  const result = responses[0].queryResult;
  const audioFile = responses[0].outputAudio;
  util.promisify(fs.writeFile)("./audio.wav", audioFile, "binary");

  return {
    text: result.fulfillmentText,
    audio: audioFile,
    responseFromDialogFlow: responses,
  };
};

let inputAudio = fs.readFileSync("./recording.mp3");
const detectIntenAudio = async (languageCode, queryAudio, sessionId) => {
  let sessionPath = sessionClient.projectAgentSessionPath(PROJECTID, sessionId);

  let request = {
    session: sessionPath,
    queryInput: {
      audioConfig: {
        audioEncoding: "LINEAR16",
        sampleRateHertz: 44100,
        languageCode: languageCode,
      },
    },
    inputAudio: inputAudio,
    outputAudioConfig: {
      audioEncoding: "OUTPUT_AUDIO_ENCODING_LINEAR_16",
    },
  };

  const responses = await sessionClient.detectIntent(request);
  // streamingDetectIntent
  console.log(responses);

  const result = responses[0].queryResult;
  const audioFile = responses[0].outputAudio;
  util.promisify(fs.writeFile)("./audio.wav", audioFile, "binary");

  console.log(result);

  return {
    text: result.fulfillmentText,
    audio: audioFile,
  };
};

const webApp = express();

webApp.use(
  express.urlencoded({
    extended: true,
  })
);

webApp.use(cors());

const PORT = process.env.PORT || 5000;

// TENANTS API
webApp.get("/tenants", tenantQuery.getAll);
webApp.get("/tenant/:id", tenantQuery.getById);
webApp.post("/tenant", tenantQuery.create);
webApp.put("/tenant/:id", tenantQuery.update);
webApp.delete("/tenant/:id", tenantQuery.remove);

// PRODUCTS API
webApp.get("/products", productQuery.getAll);
webApp.get("/product/:id", productQuery.getById);
webApp.post("/product", productQuery.create);
webApp.put("/product/:id", productQuery.update);
webApp.delete("/product/:id", productQuery.remove);

// QUESTION ANSWER RECORD API
webApp.get("/qa", qaQuery.getAll);
webApp.post("/qa", qaQuery.create);

webApp.get("/", (req, res) => {
  res.send("Hello World");
});

webApp.post("/dialogflow-audio", async (req, res) => {
  // res.send(JSON.parse(req));
  let languageCode = req.body.languageCode;
  let sessionId = req.body.sessionId;
  let queryAudio = req.body.queryAudio;
  // console.log(util.inspect(req));

  let responseData = await detectIntenAudio(
    languageCode,
    queryAudio,
    sessionId
  );
  res.send(responseData);
});

webApp.post("/dialogflow-text", async (req, res) => {
  // console.log((req.body))
  let languageCode = req.body.languageCode;
  let queryText = req.body.queryText;
  let sessionId = req.body.sessionId;

  let responseData = await detectIntenText(languageCode, queryText, sessionId);
  res.send(responseData);
});

webApp.post("/gpt", (req, res) => {
  const userInput = req.body.queryText;

  console.log(userInput);

  // axios
  //   .post(
  //     "https://api.openai.com/v1/engines/davinci/completions",
  //     {
  //       prompt: userInput,
  //       engine: "davinci",
  //       max_tokens: 2048,
  //     },
  //     {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer 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`,
  //       },
  //     }
  //   )
  //   .then((response) => {
  //     const GPTResponse = response.data.choices[0].text;
  //     // Send the response from GPT back to Dialogflow
  //     res.json({ fulfillmentText: GPTResponse });
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     res.json({ fulfillmentText: "Error Occured" });
  //   });
});
webApp.listen(PORT, () => {
  console.log(`Server is up and running at ${PORT}`);
});
