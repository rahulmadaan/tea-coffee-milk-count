const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const fs = require("fs");
const ENCODING = "utf8";

const reader = fileName => fs.readFileSync(fileName, ENCODING);

const PASSWORD = reader("./private/.password.txt").trim();
const TOKEN = reader("./private/.token.txt").trim();

const app = express();

const counts = {
  tea: 0,
  coffee: 0,
  milk: 0,
  none: 0
};

const candidates = [];

interactWithUser = function(channelId) {
  const url = `https://slack.com/api/chat.postMessage?token=${TOKEN}&channel=${channelId}&text=hellohhhhhhhh&as_user=true&blocks=%5B%20%09%7B%20%09%09%22type%22%3A%20%22section%22%2C%20%09%09%22text%22%3A%20%7B%20%09%09%09%22type%22%3A%20%22mrkdwn%22%2C%20%09%09%09%22text%22%3A%20%22Tea%20Coffee%20Milk%20preference%20Please.%22%20%09%09%7D%20%09%7D%2C%20%09%7B%20%09%09%22type%22%3A%20%22actions%22%2C%20%09%09%22elements%22%3A%20%5B%20%09%09%09%7B%20%09%09%09%09%22type%22%3A%20%22button%22%2C%20%09%09%09%09%22text%22%3A%20%7B%20%09%09%09%09%09%22type%22%3A%20%22plain_text%22%2C%20%09%09%09%09%09%22text%22%3A%20%22Tea%22%2C%20%09%09%09%09%09%22emoji%22%3A%20true%20%09%09%09%09%7D%2C%20%09%09%09%09%22value%22%3A%20%22tea%22%20%09%09%09%7D%2C%20%09%09%09%7B%20%09%09%09%09%22type%22%3A%20%22button%22%2C%20%09%09%09%09%22text%22%3A%20%7B%20%09%09%09%09%09%22type%22%3A%20%22plain_text%22%2C%20%09%09%09%09%09%22text%22%3A%20%22Coffee%22%2C%20%09%09%09%09%09%22emoji%22%3A%20true%20%09%09%09%09%7D%2C%20%09%09%09%09%22value%22%3A%20%22coffee%22%20%09%09%09%7D%2C%20%09%09%09%7B%20%09%09%09%09%22type%22%3A%20%22button%22%2C%20%09%09%09%09%22text%22%3A%20%7B%20%09%09%09%09%09%22type%22%3A%20%22plain_text%22%2C%20%09%09%09%09%09%22text%22%3A%20%22Milk%22%2C%20%09%09%09%09%09%22emoji%22%3A%20true%20%09%09%09%09%7D%2C%20%09%09%09%09%22value%22%3A%20%22milk%22%20%09%09%09%7D%2C%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%20%09%09%09%09%22type%22%3A%20%22button%22%2C%20%09%09%09%09%22text%22%3A%20%7B%20%09%09%09%09%09%22type%22%3A%20%22plain_text%22%2C%20%09%09%09%09%09%22text%22%3A%20%22None%22%2C%20%09%09%09%09%09%22emoji%22%3A%20true%20%09%09%09%09%7D%2C%20%09%09%09%09%22value%22%3A%20%22none%22%20%09%09%09%7D%20%09%09%5D%20%09%7D%20%5D&link_names=hello&username=rahul&pretty=1`;
  request(url, (err, response, body) => {
    if (err) console.log(err);
    removeMessage(channelId, JSON.parse(body).ts);
  });
};

const removeMessage = function(channelId, timestamp) {
  setTimeout(() => {
    const url = `https://slack.com/api/chat.delete?token=${TOKEN}&channel=${channelId}&ts=${timestamp}&pretty=1`;
    request(url, (err, response, body) => {
      if (err) console.log(err);
    });
  }, 1500000);
};

const createNewForm = function(req, res) {
  const channelId = req.body.channel_id;
  interactWithUser(channelId);
  res.end();
};

const getTotal = function(req, res) {
  let result = "";
  const choices = Object.keys(counts);
  const total = Object.values(counts).reduce((a, b) => a + b);
  choices.forEach(
    choice => (result += `${choice} count is ${counts[choice]}\n`)
  );
  result += `\nTOTAL  ───>   ${total}`;
  res.send(result);
  res.end();
};

const getCount = function(req, res) {
  const argv = req.body.text;
  if (argv == "total") return getTotal(req, res);
  if (argv == PASSWORD) return createNewForm(req, res);
  res.send("Enter valid keyword!!!");
  res.end();
};

const buttonHandler = function(req, res) {
  const buttonPressed = JSON.parse(req.body.payload);
  const userId = buttonPressed.user.username;
  const choice = buttonPressed.actions[0].value;
  if (!candidates.includes(userId)) {
    candidates.push(userId);
    counts[choice]++;
  }
  res.end();
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post("/button", buttonHandler);
app.post("/", getCount);

module.exports = app;
