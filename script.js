const canvas = document.getElementById("gameCanvas");

if (canvas) {
  const ctx = canvas.getContext("2d");

  canvas.width = 900;
  canvas.height = 550;
  canvas.style.border = "2px solid white";
  canvas.style.backgroundColor = "#222";

  let score = 0;
  let shots = 0;
  let swishes = 0;
  let timeLeft = 30;
  let gameOver = false;
  let lastTime = Date.now();
  let lastShotHitRim = false;

  let mouse = { x: 0, y: 0 };

  const replayButton = {
    x: 350,
    y: 320,
    width: 200,
    height: 65
  };

  let ball = {
    x: 140,
    y: 460,
    radius: 18,
    vx: 0,
    vy: 0
  };

  const hoop = {
    backboardX: 760,
    backboardY: 140,
    backboardWidth: 16,
    backboardHeight: 120,
    rimY: 245,
    leftRimX: 670,
    rightRimX: 740,
    rimRadius: 10
  };

  let messageText = "";
  let messageTimer = 0;

  function resetBall() {
    ball.x = 140;
    ball.y = 460;
    ball.vx = 0;
    ball.vy = 0;
    lastShotHitRim = false;
  }

  function restartGame() {
    score = 0;
    shots = 0;
    swishes = 0;
    timeLeft = 30;
    gameOver = false;
    lastTime = Date.now();
    messageText = "";
    messageTimer = 0;
    resetBall();
  }

  function drawCourt() {
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, 478);
    ctx.lineTo(canvas.width, 478);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(180, 478, 70, Math.PI, 2 * Math.PI);
    ctx.stroke();
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "orange";
    ctx.fill();

    ctx.strokeStyle = "#7a3d00";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ball.x - ball.radius, ball.y);
    ctx.lineTo(ball.x + ball.radius, ball.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y - ball.radius);
    ctx.lineTo(ball.x, ball.y + ball.radius);
    ctx.stroke();
  }

  function drawHoop() {
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(
      hoop.backboardX,
      hoop.backboardY,
      hoop.backboardWidth,
      hoop.backboardHeight
    );

    ctx.strokeStyle = "#cc3333";
    ctx.lineWidth = 4;
    ctx.strokeRect(728, 195, 38, 48);

    ctx.strokeStyle = "#999";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(758, 238);
    ctx.lineTo(740, 243);
    ctx.stroke();

    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hoop.leftRimX, hoop.rimY);
    ctx.lineTo(hoop.rightRimX, hoop.rimY);
    ctx.stroke();

    ctx.strokeStyle = "#dddddd";
    ctx.lineWidth = 2;

    for (let i = 0; i <= 6; i++) {
      const x = hoop.leftRimX + i * 12;
      ctx.beginPath();
      ctx.moveTo(x, hoop.rimY);
      ctx.lineTo(685 + i * 7, hoop.rimY + 38);
      ctx.stroke();
    }
  }

  function drawAimLine() {
    if (gameOver) return;

    const dx = mouse.x - ball.x;
    const dy = mouse.y - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) return;

    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawStats() {
    ctx.fillStyle = "white";

    ctx.font = "28px Arial";
    ctx.fillText("Score : " + score, 20, 35);

    ctx.font = "20px Arial";
    ctx.fillText("Tirs : " + shots, 20, 65);
    ctx.fillText("Swish : " + swishes, 20, 90);

    ctx.fillStyle = timeLeft <= 5 ? "red" : "white";
    ctx.font = "28px Arial";
    ctx.fillText("Temps : " + Math.ceil(timeLeft) + "s", 20, 125);
  }

  function drawMessage() {
    if (messageTimer <= 0) return;

    ctx.fillStyle = "rgba(255, 215, 0, 0.95)";
    ctx.font = "bold 48px Arial";
    ctx.fillText(messageText, 340, 90);
  }

  function drawGameOver() {
    if (!gameOver) return;

    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(200, 140, 500, 280);

    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.fillText("Temps écoulé !", 255, 220);

    ctx.font = "28px Arial";
    ctx.fillText("Score : " + score, 370, 270);
    ctx.fillText("Tirs : " + shots, 385, 305);
    ctx.fillText("Swish : " + swishes, 370, 340);

    ctx.fillStyle = "#4a7bd1";
    ctx.fillRect(
      replayButton.x,
      replayButton.y,
      replayButton.width,
      replayButton.height
    );

    ctx.fillStyle = "white";
    ctx.font = "bold 26px Arial";
    ctx.fillText("Rejouer", replayButton.x + 48, replayButton.y + 42);
  }

  function circleCollision(cx, cy, radius) {
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ball.radius + radius) {
      lastShotHitRim = true;

      const angle = Math.atan2(dy, dx);
      const overlap = ball.radius + radius - distance;

      ball.x += Math.cos(angle) * overlap;
      ball.y += Math.sin(angle) * overlap;

      const bounce = 0.5;
      ball.vx = Math.cos(angle) * 5 * bounce;
      ball.vy = Math.sin(angle) * 5 * bounce;
    }
  }

  function checkBackboardCollision() {
    const ballRight = ball.x + ball.radius;
    const ballLeft = ball.x - ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;

    const boardLeft = hoop.backboardX;
    const boardRight = hoop.backboardX + hoop.backboardWidth;
    const boardTop = hoop.backboardY;
    const boardBottom = hoop.backboardY + hoop.backboardHeight;

    if (
      ballRight > boardLeft &&
      ballLeft < boardRight &&
      ballBottom > boardTop &&
      ballTop < boardBottom
    ) {
      if (ball.x < hoop.backboardX + hoop.backboardWidth / 2) {
        ball.x = boardLeft - ball.radius;
      } else {
        ball.x = boardRight + ball.radius;
      }

      ball.vx *= -0.8;
      lastShotHitRim = true;
    }
  }

  function checkScore() {
    return (
      ball.x > hoop.leftRimX + 5 &&
      ball.x < hoop.rightRimX - 5 &&
      ball.y > hoop.rimY &&
      ball.y < hoop.rimY + 30 &&
      ball.vy > 0
    );
  }

  function handleScore() {
    score++;

    if (!lastShotHitRim) {
      swishes++;
      messageText = "SWISH!";
    } else {
      messageText = "PANIER!";
    }

    messageTimer = 60;
    resetBall();
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

  function update() {
    updateTimer();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCourt();

    if (!gameOver) {
      ball.vy += 0.28;

      ball.x += ball.vx;
      ball.y += ball.vy;

      ball.vx *= 0.995;

      if (ball.y > 460) {
        ball.y = 460;
        ball.vy = 0;
        ball.vx *= 0.85;
      }

      if (ball.x < ball.radius) {
        ball.x = ball.radius;
        ball.vx *= -0.7;
      }

      if (ball.x > canvas.width - ball.radius) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -0.7;
      }

      checkBackboardCollision();
      circleCollision(hoop.leftRimX, hoop.rimY, hoop.rimRadius);
      circleCollision(hoop.rightRimX, hoop.rimY, hoop.rimRadius);

      if (checkScore()) {
        handleScore();
      }
    }

    if (messageTimer > 0) {
      messageTimer--;
    }

    drawAimLine();
    drawHoop();
    drawBall();
    drawStats();
    drawMessage();
    drawGameOver();

    requestAnimationFrame(update);
  }

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (gameOver) {
      const insideReplayButton =
        clickX >= replayButton.x &&
        clickX <= replayButton.x + replayButton.width &&
        clickY >= replayButton.y &&
        clickY <= replayButton.y + replayButton.height;

      if (insideReplayButton) {
        restartGame();
      }

      return;
    }

    let dx = clickX - ball.x;
    let dy = clickY - ball.y;

    if (dx > 220) dx = 220;
    if (dx < -220) dx = -220;

    if (dy > -80) dy = -80;
    if (dy < -260) dy = -260;

    ball.vx = dx * 0.035;
    ball.vy = dy * 0.045;

    shots++;
    lastShotHitRim = false;
  });

  update();
}