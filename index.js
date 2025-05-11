/**
 *  Webservice mit Express
 *  WBE-Praktikum
 */
import express, { static as expressStatic, json } from "express";
var app = express();

//  Fehlerobjekt anlegen
//
function error(status, msg) {
  var err = new Error(msg);
  err.status = status;
  return err;
}

//  Zufällige ID erzeugen, Quelle:
//  https://stackoverflow.com/questions/6860853/generate-random-string-for-div-id#6860916
//
function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

//  Statische Dateien im Verzeichnis public
app.use(expressStatic("public"));

//  API-Key überprüfen
//
app.use("/api", function (req, res, next) {
  var key = req.query["api-key"];

  // Key fehlt
  if (!key) {
    return next(error(400, "api key required"));
  }
  // Key falsch
  if (!~apiKeys.indexOf(key)) {
    return next(error(401, "invalid api key"));
  }
  // korrekter Key
  req.key = key;
  next();
});

//  JSON-Daten akzeptieren
app.use(json());

//  gültige API-Keys
var apiKeys = ["candy"];

//  unsere tolle in-memory Datenbank :)
var data = {
  symbols: ["/imgs/1.png", "🍒", "🔔", "🍋", "🍉",
    "/imgs/3.png", "⭐", "7️⃣", "🍊", "/imgs/2.png", "🍓", "🍈", "🍍"],
  nonWinners: ["🍒", "🔔", "🍋", "🍉", "⭐", "7️⃣", "🍊", "🍓", "🍈", "🍍"],
  baseWinRate: 15,
  players: {},
  candy: {
    snickers: {
      name: "snickers",
      quantity: 8,
      symbol: "/imgs/1.png"
    },
    mars: {
      name: "mars",
      quantity: 8,
      symbol: "/imgs/2.png"
    },
    kitkat: {
      name: "kitkat",
      quantity: 8,
      symbol: "/imgs/3.png"
    },
  },
};

//  GET-Requests bearbeiten
//
app.get("/api/candies", function (req, res, next) {
  res.send(data.candy);
});

app.get("/api/players", function (req, res, next) {
  res.send({ players: data.players });
});

app.get("/api/symbols", function (req, res, next) {
  res.send({ symbols: data.symbols });
});


//  POST-Request bearbeiten
//
app.post("/api/spin", function (req, res, next) {
  let result = [];
  let id = req.body.id;
  let playerStruct = data.players[id];

  // lose return
  let loseIdxs = []
  while (loseIdxs.length < 3) {
    var randomIdx = Math.floor(Math.random() * data.nonWinners.length);
    if (loseIdxs.indexOf(randomIdx) == -1) {
      loseIdxs.push(randomIdx);
    }
  }
  // candies
  let candies = [];
  Object.entries(data.candy).forEach(
    ([key, value]) => candies.push(value)
  );
  candies.sort((a, b) => b.quantity - a.quantity);
  let candiesLeft = candies.reduce(
    (acc, curr) => acc || curr.quantity > 0, false)

  let winRate = Math.pow(0.5, playerStruct.nWins) * data.baseWinRate;
  let draw = Math.floor(Math.random() * (100 - 1 + 1) + 1);

  if (draw < winRate && candiesLeft) {
    result = Array(3).fill(candies[0].symbol);
    data.candy[candies[0].name].quantity -= 1;
    data.players[id].nWins += 1;
  } else {
    loseIdxs.forEach(element => {
      result.push(data.nonWinners[element]);
    });
  }

  res.send(result);
});

app.post("/api/register", function (req, res, next) {
  let id = guidGenerator();
  var playerStruct = {
    nWins: 0,
  }
  data.players[id] = playerStruct;
  res.send({ id });
});

app.post("/api/confirm", function (req, res, next) {
  let reqID = req.body.id;
  var playerStruct = data.players[reqID];
  if (!playerStruct) {
    playerStruct = {
      nWins: 0,
    }
    data.players[reqID] = playerStruct;
  }
  res.send({ reqID });
});


//  Middleware mit vier Argumenten wird zur Fehlerbehandlung verwendet
//
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({ error: err.message });
});

//  Catch-all: wenn keine vorangehende Middleware geantwortet hat, wird
//  hier ein 404 (not found) erzeugt
//
app.use(function (req, res) {
  res.status(404);
  res.send({ error: "not found" });
});

app.listen(3000);
console.log("Express started on port 3000");
