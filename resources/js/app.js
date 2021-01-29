require('./bootstrap');

var socket;
const gameid = window.location.href.split("/")[4];
const playerColor = "#" + window.location.href.split("/")[5];

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var playerXPosition = 55;
var playerYPosition = 150;
var xPlayerSpeed = 6;
var yPlayerSpeed = 6;
var networkXPosition = 70;
var networkYPosition = 170;
var networkColor = '#ff0000';
var xNetworkSpeed = 2;
var yNetworkSpeed = 2;

var shapeRadius = 10;

var torch = false;
var lighting = 50;

// x1, y1, x2, y2
var wallArray = [[50, 50, 60, 100, "#000000"], [60, 50, 160, 60, "#000000"], 
                [120, 150, 130, 220, "#000000"], [130, 150, 170, 160, "#0000FF"], [170, 150, 180, 190, "#000000"],
                [450, 130, 520, 140, "#000000"], [450, 140, 460, 230, "#000000"], [460, 220, 500, 230, "#000000"], [490, 230, 500, 300, "#000000"],
                [290, 50, 300, 170, "#000000"], [300, 160, 330, 170, "#FF0000"], [330, 160, 340, 330, "#000000"]];

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

    if(rightPressed || leftPressed || upPressed || downPressed){
        socket.emit("ls:gamelobby", {"t": "m", "X": playerXPosition, "Y": playerYPosition, "C": playerColor});
    }
    
}

function wallCollision(pressed) {
    wallArray.forEach(function(wall) {
        if(wall[4] == playerColor){
          return;
        }

        if(pressed == UP) {
            if(playerXPosition + shapeRadius >= wall[0] && playerXPosition - shapeRadius <= wall[2]){
                if(playerYPosition - shapeRadius + yPlayerSpeed >= wall[3] && playerYPosition - shapeRadius <= wall[3]){
                    playerYPosition = wall[3] + shapeRadius + 1;
                }
            }
        }    
        if(pressed == DOWN){
            if(playerXPosition + shapeRadius >= wall[0] && playerXPosition - shapeRadius <= wall[2]){
                if(playerYPosition + shapeRadius - yPlayerSpeed <= wall[1] && playerYPosition + shapeRadius >= wall[1]){
                    playerYPosition = wall[1] - shapeRadius - 1;
                }
            }
        }    
        if(pressed == LEFT) {
            if(playerYPosition + shapeRadius >= wall[1] && playerYPosition - shapeRadius <= wall[3]){
                if(playerXPosition - shapeRadius + xPlayerSpeed >= wall[2] && playerXPosition - shapeRadius <= wall[2]){
                    playerXPosition = wall[2] + shapeRadius + 1;
                }
            }
        }
        if(pressed == RIGHT) {
            if(playerYPosition + shapeRadius >= wall[1] && playerYPosition - shapeRadius <= wall[3]){
                if(playerXPosition + shapeRadius - xPlayerSpeed <= wall[0] && playerXPosition + shapeRadius >= wall[0]){
                    playerXPosition = wall[0] - shapeRadius - 1;
                }
            }
        }
    });
}

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(playerXPosition, playerYPosition, shapeRadius, 0, Math.PI*2);
    ctx.fillStyle = playerColor;
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
    ctx.fillStyle = "#383838";
    if(torch && lighting < 200){
        lighting += 3;
    }
    else if(!torch && lighting > 50) {
        lighting -= 3;
    }
    ctx.arc(playerXPosition, playerYPosition, lighting, 0, Math.PI*2);
    ctx.rect(canvas.width, 0, -canvas.width, canvas.height);
    ctx.fill();
    ctx.closePath();
}

function drawWalls() {
    wallArray.forEach(function(wall) {
        ctx.beginPath();
        ctx.fillStyle = wall[4];
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

setInterval(draw, 33);

function startsocket() {
	socket = io.connect('ws://192.168.0.12:8010', { reconnect: true, transports: ['websocket', 'polling'], forceNew: true });
	socket.on('connect', function (data) {
		socket.emit('go', { color: document.head.querySelector('meta[name="color"]').content, gameid: gameid });
	});

	socket.on('ls:gamelobby', function (data) {
		const json = JSON.parse(data);
		if(json.t == "m")
		{
			setPlayerNetwork(json.X, json.Y, json.C);
			//console.log(json);
		}
	});

	socket.on('debug', function (data) {
		console.log(data);
	});
}

window.addEventListener('load', startsocket);