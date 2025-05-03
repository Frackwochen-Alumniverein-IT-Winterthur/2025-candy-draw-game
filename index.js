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
  players: {},
  candy: {
    snickers: 20,
    kitkat: 20,
    mars: 20
  },
};

//  GET-Requests bearbeiten
//
app.get("/api/spin/:id", function (req, res, next) {
  var id = req.params.id;
  var playerStruct = data.players.id;



  if (result) res.send(result);
  else next();
});

app.get("/api/candies", function (req, res, next) {
  res.send(data.candy);
});

app.get("/api/symboles", function (req, res, next) {
  res.send({ symboles: data.symbols });
});

//  POST-Request bearbeiten
//
app.post("/api/register", function (req, res, next) {
  let id = guidGenerator();
  playerStruct = {
    nWins: 0,
  }
  data.players[id] = playerStruct;
  res.send({ id });
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
