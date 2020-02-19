let myGameArea = {
  canvas: document.createElement("canvas"),
  frames: 0,
  start: function() {
    this.canvas.width = 1280;
    this.canvas.height = 800;
    this.backgroundColor = "#ddd";
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[1]);
  },

  draw: function() {
    const ctx = this.context;
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop: function() {
    clearInterval(this.interval);
  }
};

class Ball {
  constructor(x, y, width, height, radius, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = radius;
    this.speedX = 2;
    this.speedY = -2;
    this.context = myGameArea.context;
    this.interval = setInterval(this.draw, 10);
  }

  draw = () => {
    myGameArea.clear();
    myGameArea.draw();
    let player = new Player(515, 770, 250, 30, "blue");
    player.draw();
    const ctx = this.context;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    this.y += this.speedY;
    this.x += this.speedX;
  };
}

class Player {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.context = myGameArea.context;
  }

  draw = () => {
    const ctx = this.context;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
}
update = () => {
  myGameArea.start();
  let ball = new Ball(640, 700, 50, 50, 25, "blue");
  ball.draw();
};
update();
