import { createElement, render, useState, useEffect } from "../lib/suiweb.js";
import connect4Winner from "./connect4-winner.js";

let eventHandler = null;
let stateSeq = [];
const SERVICE = "http://localhost:3000/api/data/c4state?api-key=c4game";
const defaultState = {
  board: [
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
  ],
  next: Math.random() < 0.5 ? "r" : "b",
  winner: null,
};

function App() {
  const [state, setState] = useState("c4", "state", defaultState);

  function checkWinner(player, board) {
    const winner = connect4Winner(player, board);
    if (winner) {
      setState((prevState) => ({ ...prevState, winner }));
    }
  }

  function undo() {
    setState(() => stateSeq.pop());
  }

  function handleTurn(e) {
    if (!state.winner) {
      const boardElement = document.querySelector(".board");
      const clickedChild = e.target;
      const childIndex = Array.from(boardElement.children).indexOf(
        clickedChild
      );
      const col = childIndex % 7;

      let firstFreeRow = 5;

      for (let i = 0; i < 6; i++) {
        if (state.board[i][col] !== "") {
          firstFreeRow = i - 1;
          break;
        }
      }
      if (firstFreeRow >= 0) {
        stateSeq.push(state);
        const newBoard = JSON.parse(JSON.stringify(state.board));
        newBoard[firstFreeRow][col] = state.next;

        checkWinner(state.next, newBoard);
        setState((prevState) => ({
          ...prevState,
          board: newBoard,
          next: prevState.next === "r" ? "b" : "r",
        }));
      }
    }
  }

  function loadStateLocal() {
    const localState = JSON.parse(localStorage.getItem("state"));
    setState(() => localState);
    stateSeq = JSON.parse(localStorage.getItem("stateSeq"));
  }

  function saveStateLocal() {
    localStorage.setItem("state", JSON.stringify(state));
    localStorage.setItem("stateSeq", JSON.stringify(stateSeq));
  }

  function loadStateServer() {
    fetch(SERVICE, {
      method: "GET",
      headers: { "Content-type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setState(() => data.state);
          stateSeq = data.stateSeq;
        }
      });
  }

  function saveStateServer() {
    fetch(SERVICE, {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ state, stateSeq }),
    });
  }

  function newGame() {
    setState(() => {
      return {
        ...defaultState,
        next: Math.random() < 0.5 ? "r" : "b",
      };
    });
    stateSeq = [];
  }

  function clickEventHandler(e) {
    if (e.target.id === "undo") {
      undo();
    }
    if (e.target.id === "newGame") {
      newGame();
    }
    if (e.target.id === "saveLocal") {
      saveStateLocal();
    }
    if (e.target.id === "loadLocal") {
      loadStateLocal();
    }
    if (e.target.id === "loadServer") {
      loadStateServer();
    }
    if (e.target.id === "saveServer") {
      saveStateServer();
    }
    if (e.target.className === "field") {
      handleTurn(e);
    }
  }

  useEffect(() => {
    if (eventHandler) {
      document.body.removeEventListener("click", eventHandler);
    }
    eventHandler = clickEventHandler;
    document.body.addEventListener("click", eventHandler);
  }, []);

  return createElement("div", null, [
    createElement(Board, { board: state.board }),
    createElement("div", { className: "info" }),
    createElement(
      "div",
      { className: "controls" },
      createElement(
        "div",
        null,
        createElement(
          "button",
          { id: "loadLocal", className: "button-pretty" },
          "Load Local"
        ),
        createElement(
          "button",
          { id: "saveLocal", className: "button-pretty" },
          "Save Local"
        )
      ),
      createElement(
        "div",
        null,
        createElement(
          "button",
          { id: "loadServer", className: "button-pretty" },
          "Load Server"
        ),
        createElement(
          "button",
          { id: "saveServer", className: "button-pretty" },
          "Save Server"
        )
      ),
      createElement(
        "div",
        null,
        createElement(
          "button",
          { id: "newGame", className: "button-pretty" },
          "New Game"
        ),
        createElement(
          "button",
          { id: "undo", className: "button-pretty" },
          "Undo"
        )
      )
    ),
    createElement(
      "div",
      { className: "announcement" },
      createElement(Announcement, {
        winner: state.winner,
        next: state.next,
      })
    ),
  ]);
}

function Board({ board }) {
  let flatBoard = [].concat(...board);
  let fields = flatBoard.map((player) => [Field, { player }]);
  return ["div", { className: "board" }, ...fields];
}

function Field({ player }) {
  const struct = ["div", { className: "field" }];
  switch (player) {
    case "r":
      struct.push(["div", { className: "piece red" }]);
      break;
    case "b":
      struct.push(["div", { className: "piece blue" }]);
      break;
    default:
      break;
  }
  return struct;
}

function Announcement({ winner, next }) {
  const struct = [
    "div",
    { className: "billboard" },
    ["h1", { className: "billboard" }, ""],
  ];
  switch (winner) {
    case "r":
      struct[2][2] = ["span", { className: "red" }, "Red "];
      struct[2].push("Player wins!");
      struct.push(["div", { className: "firework" }]);
      struct.push(["div", { className: "firework" }]);
      struct.push(["div", { className: "firework" }]);
      return struct;
    case "b":
      struct[2][2] = ["span", { className: "blue" }, "Blue "];
      struct[2].push("Player wins!");
      struct.push(["div", { className: "firework" }]);
      struct.push(["div", { className: "firework" }]);
      struct.push(["div", { className: "firework" }]);
      return struct;
    default:
      const nextPlayer = next === "r" ? "Red" : "Blue";
      const nextClass = next === "r" ? "red" : "blue";
      struct[2][2] = "Next Player: ";
      struct[2][3] = ["span", { className: nextClass }, nextPlayer];
      return struct;
  }
}

const container = document.getElementById("app");
render(createElement(App), container);
