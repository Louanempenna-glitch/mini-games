const canvas = document.getElementById("footballCanvas");

if (canvas) {
  const ctx = canvas.getContext("2d");

  canvas.width = 900;
  canvas.height = 500;
  canvas.style.border = "2px solid white";
  canvas.style.backgroundColor = "#1f7a3a";

  let score = 0;
  let shots = 0;
  let timeLeft = 30;
  let gameOver = false;
  let lastTime = Date.now();
  let message = "";
  let messageTimer = 0;

  let ball = {
    x: 150,
    y: 250,
    radius: 18,
    vx: 0,
    vy: 0
  };

  let mouse = {
    x: ball.x,
    y: ball.y
  };

  const goal = {
    x: 750,
    y: 180,
    width: 90,
    height: 140
  };

  // 🧤 Gardien horizontal
  const keeper = {
  x: goal.x - 25,
  y: goal.y,
  width: 20,
  height: 60,
  speed: 2.5,
  direction: 1
};

  const replayButton = {
    x: 350,
    y: 300,
    width: 200,
    height: 60
  };

  function resetBall() {
    ball.x = 150;
    ball.y = 250;
    ball.vx = 0;
    ball.vy = 0;
  }

  function restartGame() {
    score = 0;
    shots = 0;
    timeLeft = 30;
    gameOver = false;
    lastTime = Date.now();
    message = "";
    messageTimer = 0;
    resetBall();
  }

  function drawField() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();
  }

  function drawGoal() {
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.strokeRect(goal.x, goal.y, goal.width, goal.height);

    // lucarne +2
    ctx.fillStyle = "rgba(255,255,0,0.35)";
    ctx.fillRect(goal.x, goal.y, 30, 40);

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 3;
    ctx.strokeRect(goal.x, goal.y, 30, 40);
  }

  function drawKeeper() {
    ctx.fillStyle = "#1e40ff";
    ctx.fillRect(keeper.x, keeper.y, keeper.width, keeper.height);
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  function drawAimLine() {
    if (gameOver) return;

    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawStats() {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Score : " + score, 20, 40);
    ctx.fillText("Tirs : " + shots, 20, 70);

    ctx.fillStyle = timeLeft <= 5 ? "red" : "white";
    ctx.fillText("Temps : " + Math.ceil(timeLeft), 720, 40);
  }

  function drawMessage() {
    if (messageTimer <= 0) return;

    ctx.fillStyle = "yellow";
    ctx.font = "40px Arial";
    ctx.fillText(message, 300, 100);
  }

  function drawGameOver() {
    if (!gameOver) return;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(200, 120, 500, 260);

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Fin du match", 300, 200);

    ctx.fillText("Score : " + score, 360, 250);

    ctx.fillStyle = "#4a7bd1";
    ctx.fillRect(replayButton.x, replayButton.y, replayButton.width, replayButton.height);

    ctx.fillStyle = "white";
    ctx.fillText("Rejouer", replayButton.x + 40, replayButton.y + 40);
  }

  function updateTimer() {
    const now = Date.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    if (!gameOver) {
      timeLeft -= delta;
      if (timeLeft <= 0) {
        timeLeft = 0;
        gameOver = true;
      }
    }
  }

  // 🧤 déplacement gauche droite
  function updateKeeper() {
  // déplacement vertical
  keeper.y += keeper.speed * keeper.direction;

  // limite haut du but
  if (keeper.y <= goal.y) {
    keeper.direction = 1;
  }

  // limite bas du but
  if (keeper.y >= goal.y + goal.height - keeper.height) {
    keeper.direction = -1;
  }
}

  function checkKeeperCollision() {
    if (
      ball.x + ball.radius > keeper.x &&
      ball.x - ball.radius < keeper.x + keeper.width &&
      ball.y + ball.radius > keeper.y &&
      ball.y - ball.radius < keeper.y + keeper.height
    ) {
      ball.vx *= -0.9;
      message = "ARRÊT !";
      messageTimer = 40;
    }
  }

  function checkGoal() {
    const entre =
      ball.x + ball.radius >= goal.x &&
      ball.vx > 0;

    const dedans =
      ball.y > goal.y &&
      ball.y < goal.y + goal.height;

    if (entre && dedans) {
      if (ball.y < goal.y + 40) {
        score += 2;
        message = "LUCARNE +2 🔥";
      } else {
        score += 1;
        message = "BUT ⚽";
      }

      messageTimer = 60;
      resetBall();
    }
  }

  function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    ball.vx *= 0.98;
    ball.vy *= 0.98;
  }

  function update() {
    updateTimer();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawField();
    drawGoal();

    if (!gameOver) {
      updateKeeper();
      updateBall();
      checkKeeperCollision();
      checkGoal();
    }

    drawAimLine();
    drawKeeper();
    drawBall();
    drawStats();
    drawMessage();
    drawGameOver();

    if (messageTimer > 0) messageTimer--;

    requestAnimationFrame(update);
  }

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (gameOver) {
      if (
        x > replayButton.x &&
        x < replayButton.x + replayButton.width &&
        y > replayButton.y &&
        y < replayButton.y + replayButton.height
      ) {
        restartGame();
      }
      return;
    }

    ball.vx = (x - ball.x) * 0.05;
    ball.vy = (y - ball.y) * 0.05;

    shots++;
  });

  update();
}