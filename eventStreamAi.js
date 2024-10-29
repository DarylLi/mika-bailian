const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const app = express();

const openApiKey = "sk-425621c1b3934ac68bd5e313c5c48f5e";
let streamInfos = [];
let responseInstance = null;
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});
app.get("/*.js", (req, res) => {
  res.sendFile(__dirname + `/dist/${req.url}`);
});
app.get("/*.css", (req, res) => {
  res.sendFile(__dirname + `/dist/${req.url}`);
});
app.get("/*.svg", (req, res) => {
  res.sendFile(__dirname + `/dist/${req.url}`);
});

const getSteamOpenAiQuest = async (quest, response) => {
  const openai = new OpenAI({
    // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
    apiKey: openApiKey, //process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });

  const completion = await openai.chat.completions.create({
    model: "qwen-plus",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: quest || "你是谁？" },
    ],
    stream: true,
  });

  for await (const chunk of completion) {
    streamInfos.push(chunk);
    const data = `data: ${JSON.stringify(chunk)}\n\n`;
    response.write(data);
  }
};

app.get("/getAIInfo", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream;charset=UTF-8");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Cache-Control", "no-cache");
  try {
    responseInstance = res;
    getSteamOpenAiQuest(req?.query?.msg, responseInstance);
    req.on("close", () => {
      console.log(` Connection closed`);
      res.end();
    });
    // res.status(200).send({ code: 200, data: result, msg: "success" });
  } catch (error) {
    res.status(200).send({ code: 200, data: {}, msg: "fail" });
  }
});

app.listen(1919, () => {
  console.log("server listening at 1919");
});
