const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const $score = document.getElementById('score');

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BOX_SIZE = 40;
let score = 0;

const MOVES = {
  DOWN: 'ArrowDown',
  RIGHT: 'ArrowRight',
  ROTATE: 'ArrowUp',
  LEFT: 'ArrowLeft',
};

const COLOURS = ['#69F', '#0F0', '#CCC', '#F21'];
const SHAPES = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 1, 1],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
];

canvas.width = BOARD_WIDTH * BOX_SIZE;
canvas.height = BOARD_HEIGHT * BOX_SIZE;
context.scale(BOX_SIZE, BOX_SIZE);

let board = createNewBoard();
let currentPiece = createNewPiece();

let dropTime = 0;
let lastDropTime = 0;
const SECOND_TO_MILLISECONDS = 1000;

function update(time = 0) {
  draw();
  if (checkGameOver()) {
    alert(`Game over! ${score}`);
    resetValues();
  }

  const deltaTime = time - lastDropTime;
  lastDropTime = time;
  dropTime += deltaTime;

  if (dropTime > SECOND_TO_MILLISECONDS) {
    downPiece();
    dropTime = 0;
  }
  
  window.requestAnimationFrame(update);
}

function resetValues() {
  board = createNewBoard();
  score = 0;
}

function draw() {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const value = board[y][x];
      if (value === 0) {
        context.fillStyle = '#000';
      }

      if (value === 1) {
        context.fillStyle = 'orange';
      }
      context.fillRect(x, y, 1, 1);
    }
  }

  
  for(let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x] !== 1) continue;
      
      context.fillStyle = currentPiece.color;
      context.fillRect(currentPiece.position.x + x, currentPiece.position.y + y, 1, 1);
    }
  }
}

function deleteRow(y) {
  board[y] = board[y].map(() => 0);
  updateScore();
  
  for (let row = y; row >= 0; row--) {
    board[row+1] = [...board[row]];
  }
}

function updateScore() {
  score += 10;
  $score.innerText = score;
}

function downPiece() {
  const isOnTopLimit = currentPiece.position.y + currentPiece.shape.length >= BOARD_HEIGHT;

  if (isOnTopLimit || checkColission(MOVES.DOWN)) {
    addThePieceToTheBoard();

    for (let y = board.length - 1; y >= 0; y--) {
      if (board[y].every(x => x === 1)) {
        deleteRow(y);
        y = board.length;
      }
    }

    currentPiece = createNewPiece();

    return;
  }

  currentPiece.position.y++;
}

function moveRight() {

  const value = currentPiece.position.x + currentPiece.shape[0].length 
  if (value >= BOARD_WIDTH || checkColission(MOVES.RIGHT)) return;
  currentPiece.position.x++;
}

function moveLeft() {
  if (currentPiece.position.x <= 0 || checkColission(MOVES.LEFT)) return;
  currentPiece.position.x--;
}

function rotate() {
  const canRotate = currentPiece.shape.length + currentPiece.position.x <= BOARD_WIDTH;

  if (!canRotate) return;

  const rotated = [];

  for (let x = 0; x < currentPiece.shape[0].length; x++) {
    const row = [];

    for (let y = currentPiece.shape.length - 1; y >= 0; y--) {
      row.push(currentPiece.shape[y][x]);
    }

    rotated.push(row);
  }

  const previousShape = currentPiece.shape;
  currentPiece.shape = rotated;

  if (checkColission()) {
    currentPiece.shape = previousShape;
  }
}

function userController($event) {
  const { key } = $event;

  if (key === MOVES.DOWN) {
    downPiece();
  }

  if (key === MOVES.RIGHT) {
    moveRight();
  }

  if (key === MOVES.LEFT) {
    moveLeft();
  }

  if (key === MOVES.ROTATE) {
    rotate();
  }
}

function checkColission(direction) {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      const pieceBoxValue = currentPiece.shape[y][x];
      let boardValue;

      if (direction === MOVES.DOWN) {
        boardValue = board[y + currentPiece.position.y + 1][x + currentPiece.position.x]
      }
      if (direction === MOVES.RIGHT) {
        boardValue = board[y + currentPiece.position.y][x + currentPiece.position.x + 1]
      }
      if (direction === MOVES.LEFT) {
        boardValue = board[y + currentPiece.position.y][x + currentPiece.position.x - 1]
      }

      if (!direction) {
        boardValue = board[y + currentPiece.position.y][x + currentPiece.position.x];
      }

      if (boardValue === 1 && pieceBoxValue === 1) {
        return true;
      }
    }
  }
}

function addThePieceToTheBoard() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x] === 1) {
        board[y + currentPiece.position.y][x + currentPiece.position.x] = 1;
      }
    }
  }
}

function createNewPiece() {
  return {
    position: {
      x: Math.floor(Math.random() * (BOARD_WIDTH / 2)),
      y: 0,
    },
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLOURS[Math.floor(Math.random() * COLOURS.length)]
  };
}

function createNewBoard() {
  return Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
}

function checkGameOver() {
  return board[0].includes(1);
}

update();
document.addEventListener('keydown', userController);
