require('./bootstrap');

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var playerXPosition = 55;
var playerYPosition = 150;
var playerColor
var xPlayerSpeed = 2;
var yPlayerSpeed = 2;
var networkXPosition = 70;
var networkYPosition = 170;
var networkColor = '#ff0000';
var xNetworkSpeed = 2;
var yNetworkSpeed = 2;

var shapeRadius = 10;

var torch = false;
var lighting = 50;

// x1, y1, x2, y2
var wallArray = [[50, 50, 60, 100], [60, 50, 100, 60], [120, 150, 130, 220]];

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight" || e.key == "d") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft" || e.key == "a") {
        leftPressed = true;
    }
    else if(e.key == "Up" || e.key == "ArrowUp" || e.key == "w") {
        upPressed = true;
    }
    else if(e.key == "Down" || e.key == "ArrowDown" || e.key == "s") {
        downPressed = true;
    }
    else if(e.key == "x"){
        torch = !torch;
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight" || e.key == "d") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft" || e.key == "a") {
        leftPressed = false;
    }
    else if(e.key == "Up" || e.key == "ArrowUp" || e.key == "w") {
        upPressed = false;
    }
    else if(e.key == "Down" || e.key == "ArrowDown" || e.key == "s") {
        downPressed = false;
    }
}

function movePlayer() {

    // right / left
    if(rightPressed) {
        playerXPosition += xPlayerSpeed;
        wallCollision(RIGHT);
    }    
    if(leftPressed){
        playerXPosition -= xPlayerSpeed;
        wallCollision(LEFT);
    }
    // up / down
    if(upPressed) {
        playerYPosition -= yPlayerSpeed;
        wallCollision(UP);
    }
    if(downPressed) {
        playerYPosition += yPlayerSpeed;
        wallCollision(DOWN);
    }

    // collision detection end of map
    if(playerXPosition < 0 + shapeRadius){
        playerXPosition = 0 + shapeRadius;
    }
    else if (playerXPosition > canvas.width - shapeRadius){
        playerXPosition = canvas.width - shapeRadius;
    }

    if(playerYPosition < 0 + shapeRadius){
        playerYPosition = 0 + shapeRadius;
    }
    else if (playerYPosition > canvas.height - shapeRadius){
        playerYPosition = canvas.height - shapeRadius;
    }

}

function wallCollision(pressed) {
    wallArray.forEach(function(wall) {
        //console.log(playerXPosition, playerYPosition, pressed);
        if(pressed == UP) {
            if(playerXPosition + shapeRadius >= wall[0] && playerXPosition - shapeRadius <= wall[2]){
                if(playerYPosition - shapeRadius + yPlayerSpeed >= wall[3] && playerYPosition - shapeRadius <= wall[3]){
                    playerYPosition = playerYPosition + yPlayerSpeed;
                }
            }
        }    
        if(pressed == DOWN){
            if(playerXPosition + shapeRadius >= wall[0] && playerXPosition - shapeRadius <= wall[2]){
                if(playerYPosition + shapeRadius - yPlayerSpeed <= wall[1] && playerYPosition + shapeRadius >= wall[1]){
                    playerYPosition = playerYPosition - yPlayerSpeed;
                }
            }
        }    
        if(pressed == LEFT) {
            if(playerYPosition + shapeRadius >= wall[1] && playerYPosition - shapeRadius <= wall[3]){
                if(playerXPosition - shapeRadius + xPlayerSpeed >= wall[2] && playerXPosition - shapeRadius <= wall[2]){
                    playerXPosition = playerXPosition + xPlayerSpeed;
                }
            }
        }
        if(pressed == RIGHT) {
            if(playerYPosition + shapeRadius >= wall[1] && playerYPosition - shapeRadius <= wall[3]){
                if(playerXPosition + shapeRadius - xPlayerSpeed <= wall[0] && playerXPosition + shapeRadius >= wall[0]){
                    playerXPosition = playerXPosition - xPlayerSpeed;
                }
            }
        }
    });
}

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(playerXPosition, playerYPosition, shapeRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}
function setPlayerNetwork(networkXPositionNew,networkYPositionNew, networkColorNew) {
	networkXPosition = networkXPositionNew;
	networkYPosition = networkYPositionNew;
	networkColor = networkColorNew;
}

function drawPlayerNetwork() {
    ctx.beginPath();
    ctx.arc(networkXPosition, networkYPosition, shapeRadius, 0, Math.PI*2);
    ctx.fillStyle = networkColor;
    ctx.fill();
    ctx.closePath();
}

function drawPlayerFieldOfView(){
    ctx.beginPath();
    ctx.fillStyle = "#383838"
    if(torch && lighting < 100){
        lighting += 1;
    }
    else if(!torch && lighting > 50) {
        lighting -= 1;
    }
    ctx.arc(playerXPosition, playerYPosition, lighting, 0, Math.PI*2);
    ctx.rect(canvas.width, 0, -canvas.width, canvas.height);
    ctx.fill();
    ctx.closePath();
}

function drawWalls() {
    wallArray.forEach(function(wall) {
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.rect(wall[0], wall[1], wall[2] - wall[0], wall[3] - wall[1]);
        ctx.fill();
        ctx.closePath();
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawPlayer();
	drawPlayerNetwork();
    drawWalls();
    drawPlayerFieldOfView();
    movePlayer();    
}

setInterval(draw, 10);

function startsocket() {
	socket = io.connect('ws://localhost:8010', { reconnect: true, transports: ['websocket', 'polling'], forceNew: true });
	socket.on('connect', function (data) {
		socket.emit('go', {}/*{ hash: document.head.querySelector('meta[name="hash"]').content, user_id: document.head.querySelector('meta[name="user_id"]').content }*/);
	});

	socket.on('lsgame', function (data) {
		const json = JSON.parse(data);
		if(json.type == "move")
		{
			setPlayerNetwork(json.networkXPosition, json.networkYPosition, json.networkColor);
			console.log(json);
		}
		console.log(data);
	});

	socket.on('debug', function (data) {
		console.log(data);
	});
}

window.addEventListener('load', startsocket);