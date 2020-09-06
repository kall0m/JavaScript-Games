const W_KEY = 87;
const S_KEY = 83;

const CANVAS = pongCanvas.getContext("2d");
const CANVAS_WIDTH = pongCanvas.width;
const CANVAS_HEIGHT = pongCanvas.height;
const CANVAS_X = 0;
const CANVAS_Y = 0;

var wPressed = false;
var sPressed = false;

document.onkeydown = function (e) {
    setKeyPressed(e.keyCode, true);
};

document.onkeyup = function (e) {
    setKeyPressed(e.keyCode, false);
};

function setKeyPressed(keyPressed, isPressed) {
    switch (keyPressed) {
        case W_KEY:
            wPressed = isPressed;
            break;
        case S_KEY:
            sPressed = isPressed;
            break;
        default:
            break;
    }
}

class Asset {
    constructor(x, y, dx, dy, color) {
        this._x = x;
        this._y = y;
        this._dx = dx;
        this._dy = dy;
        this._context = null;
        this._color = color;
    }

    get x() {
        return this._x;
    }

    set x(x) {
        this._x = x;
    }

    get y() {
        return this._y;
    }

    set y(y) {
        this._y = y;
    }

    get dx() {
        return this._dx;
    }

    set dx(dx) {
        this._dx = dx;
    }

    get dy() {
        return this._dy;
    }

    set dy(dy) {
        this._dy = dy;
    }

    get context() {
        return this._context;
    }

    set context(context) {
        this._context = context;
    }

    get color() {
        return this._color;
    }

    set color(color) {
        this._color = color;
    }

    draw() {}

    moveUp() {
        this._y -= this._dy; //move asset up by decrementing the y coordinate with dy
    }

    moveDown() {
        this._y += this._dy; //move asset down by incrementing the y coordinate with dy
    }

    moveLeft() {
        this._x -= this._dx; //move asset left by decrementing the x coordinate with dx
    }

    moveRight() {
        this._x += this._dx; //move asset right by incrementing the x coordinate with dx
    }

    reverseHorizontalDirection() {
        this._dx = -this._dx;
    }

    reverseVerticalDirection() {
        this._dy = -this._dy;
    }

    move() {
        //move asset by incrementing the x & y coordinate with dx & dy

        this.moveRight();
        this.moveDown();
    }
}

class Paddle extends Asset {
    constructor(x, y, dx, dy, width, height, color) {
        super(x, y, dx, dy, color);
        this._width = width;
        this._height = height;
    }

    get width() {
        return this._width;
    }

    set width(width) {
        this._width = width;
    }

    get height() {
        return this._height;
    }

    set height(height) {
        this._height = height;
    }

    //draw a paddle with its given x & y coordinates and width & height on the canvas
    draw() {
        this._context.beginPath();
        this._context.rect(this._x, this._y, this._width, this._height);
        this._context.stroke();
        this._context.closePath();
    }
}

class Ball extends Asset {
    constructor(x, y, dx, dy, radius, startAngle, endAngle, color) {
        super(x, y, dx, dy, color);
        this._radius = radius;
        this._startAngle = startAngle;
        this._endAngle = endAngle;
    }

    get radius() {
        return this._radius;
    }

    set radius(radius) {
        this._radius = radius;
    }

    get startAngle() {
        return this._startAngle;
    }

    set startAngle(startAngle) {
        this._startAngle = startAngle;
    }

    get endAngle() {
        return this._endAngle;
    }

    set endAngle(endAngle) {
        this._endAngle = endAngle;
    }

    //draw a circle with its given radius and x & y coordinates on the canvas and fill it with its given color
    draw() {
        this._context.beginPath();
        this._context.fillStyle = this._color;
        this._context.arc(
            this._x,
            this._y,
            this._radius,
            this._startAngle,
            this._endAngle,
            this._anticlockwise
        );
        this._context.fill();
        this._context.closePath();
    }
}

class Pong {
    constructor(context, paddle1, paddle2, ball) {
        this._context = context;

        this._paddle1 = paddle1;
        this._paddle1.context = context;

        this._paddle2 = paddle2;
        this._paddle2.context = context;

        this._ball = ball;
        this._ball.context = context;

        this._score = 0;
        this._ballInterval = null;
    }

    get context() {
        return this._context;
    }

    set context(context) {
        this._context = context;
    }

    get paddle1() {
        return this._paddle1;
    }

    set paddle1(paddle1) {
        this._paddle1 = paddle1;
    }

    get paddle2() {
        return this._paddle2;
    }

    set paddle2(paddle2) {
        this._paddle2 = paddle2;
    }

    get ball() {
        return this._ball;
    }

    set ball(ball) {
        this._ball = ball;
    }

    get score() {
        return this._score;
    }

    set score(score) {
        this._score = score;
    }

    get ballInterval() {
        return this._ballInterval;
    }

    set ballInterval(ballInterval) {
        this._ballInterval = ballInterval;
    }

    draw() {
        this.clearCanvas();

        this._ball.draw(); //draw the new ball with new position
        this._paddle1.draw();

        this.detectCollision();

        this.movePaddles();

        this._ball.move();
    }

    detectCollision() {
        //if the ball hits the paddle or the ball reaches the right border of the canvas,
        //the ball bounces off
        if (
            (this._ball.y > this._paddle1.y &&
                this._ball.y < this._paddle1.y + this._paddle1.height &&
                this._ball.x + this._ball.dx - this._ball.radius <
                    this._paddle1.x + this._paddle1.width) ||
            this._ball.x + this._ball.dx > CANVAS_WIDTH - this._ball.radius
        ) {
            //reverse the direction so that it bounces off the surface
            this._ball.reverseHorizontalDirection();
        } else if (this._ball.x < this._ball.radius) {
            //else, -1 score point
            this.endGame();
        }

        //if the ball (the center of the ball and its radius) reaches the top or bottom border of the canvas,
        //reverse the direction so that it bounce off the border
        if (
            this._ball.y + this._ball.dy < this._ball.radius ||
            this._ball.y + this._ball.dy > CANVAS_HEIGHT - this._ball.radius
        ) {
            this._ball.reverseVerticalDirection();
        }
    }

    movePaddles() {
        if (wPressed) {
            //check if the paddle has reached the top of the canvas
            if (this._paddle1.y > CANVAS_Y) {
                this._paddle1.moveUp();
            }
        } else if (sPressed) {
            //check if the paddle has reached the bottom of the canvas
            if (this._paddle1.y + this._paddle1.height < CANVAS_HEIGHT) {
                this._paddle1.moveDown();
            }
        }
    }

    endGame() {
        alert("GAME OVER");
        document.location.reload();
        clearInterval(this._ballInterval); // Needed for Chrome to end game
    }

    clearCanvas() {
        this._context.clearRect(
            CANVAS_X,
            CANVAS_Y,
            CANVAS_WIDTH,
            CANVAS_HEIGHT
        );
    }
}

// initialization function where all game assets are created and added to the game
function init() {
    var paddle1 = new Paddle(0, 0, 5, 5, 20, 100);
    var ball = new Ball(100, 200, 5, 5, 20, 0, Math.PI * 2, "#000000");
    var game = new Pong(CANVAS, paddle1, paddle1, ball);

    var interval = setInterval(function () {
        game.draw();
    }, 10);

    game.ballInterval = interval;
}

// Explanation of the logic of the code's structure:
// the object moves by going from one position to another depending on what the speed is
// the game defines the rules and how that object would be limited
