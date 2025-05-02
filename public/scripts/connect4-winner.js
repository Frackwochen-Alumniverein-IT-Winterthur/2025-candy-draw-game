export default function connect4Winner(player, board) {
  for (let y = 0; y < board[0].length; y++) {
    for (let x = 0; x < board.length; x++) {
      if (
        testRow(player, board, x, y) |
        testColumn(player, board, x, y) |
        testDiagonal1(player, board, x, y) |
        testDiagonal2(player, board, x, y)
      )
        return player;
    }
  }
  return null;
}

function testRow(player, board, x, y) {
  for (let i = 0; i < 4; i++) {
    if (board[x][y + i] !== player) {
      return false;
    }
  }
  return true;
}

function testColumn(player, board, x, y) {
  for (let i = 0; i < 4; i++) {
    if (board.length <= x + i) {
      return false;
    }
    if (board[x + i][y] !== player) {
      return false;
    }
  }
  return true;
}

function testDiagonal1(player, board, x, y) {
  for (let i = 0; i < 4; i++) {
    if (board.length <= x + i) {
      return false;
    }
    if (board[x + i][y + i] !== player) {
      return false;
    }
  }
  return true;
}

function testDiagonal2(player, board, x, y) {
  for (let i = 0; i < 4; i++) {
    if (board.length <= x + i) {
      return false;
    }
    if (board[x + i][y - i] !== player) {
      return false;
    }
  }
  return true;
}
