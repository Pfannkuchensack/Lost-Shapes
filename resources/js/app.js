const { default: axios } = require('axios');

require('./bootstrap');

var socket;
const gameid = window.location.href.split("/")[4];
var playerColor = '#120000';
var networkColor = '#000012';
if(window.location.href.split("/")[5] == 1)
{
	playerColor = "#0000ff";
	networkColor = '#ff0000';
}
else
{
	playerColor = '#ff0000';
	networkColor = '#0000ff';
}

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var playerXPosition = 20;
var playerYPosition = 20;
var xPlayerSpeed = 6;
var yPlayerSpeed = 6;
var networkXPosition = 70;
var networkYPosition = 170;

var shapeRadius = 10;

var torch = false;
var lighting = 50;
var wallArray = [];
var buttonArray = [];

window.axios.get("/map/map_001").then(({ data }) => {
	wallArray = data.walls;
	buttonArray = data.buttons;
});

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
        buttonCollision(RIGHT);
        wallCollision(RIGHT);
    }    
    if(leftPressed){
        playerXPosition -= xPlayerSpeed;
        buttonCollision(LEFT);
        wallCollision(LEFT);
    }
    // up / down
    if(upPressed) {
        playerYPosition -= yPlayerSpeed;
        buttonCollision(UP);
        wallCollision(UP);
    }
    if(downPressed) {
        playerYPosition += yPlayerSpeed;
        buttonCollision(DOWN);
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
        if(wall[4].toLowerCase() == playerColor.toLowerCase()){
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

function buttonCollision(pressed) {
    buttonArray.forEach(function(button, index) {

        if(pressed == UP) {
            if(playerXPosition + shapeRadius >= button[0] && playerXPosition - shapeRadius <= button[2]){
                if(playerYPosition - shapeRadius + yPlayerSpeed >= button[3] && playerYPosition - shapeRadius <= button[3]){
                    setWall(button[4], index);
                }
            }
        }    
        else if(pressed == DOWN){
            if(playerXPosition + shapeRadius >= button[0] && playerXPosition - shapeRadius <= button[2]){
                if(playerYPosition + shapeRadius - yPlayerSpeed <= button[1] && playerYPosition + shapeRadius >= button[1]){
                    setWall(button[4], index);
                }
            }
        }    
        else if(pressed == LEFT) {
            if(playerYPosition + shapeRadius >= button[1] && playerYPosition - shapeRadius <= button[3]){
                if(playerXPosition - shapeRadius + xPlayerSpeed >= button[2] && playerXPosition - shapeRadius <= button[2]){
                    setWall(button[4], index);
                }
            }
        }
        else if(pressed == RIGHT) {
            if(playerYPosition + shapeRadius >= button[1] && playerYPosition - shapeRadius <= button[3]){
                if(playerXPosition + shapeRadius - xPlayerSpeed <= button[0] && playerXPosition + shapeRadius >= button[0]){
                    setWall(button[4], index);
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

function setPlayerNetwork(networkXPositionNew,networkYPositionNew) {
	networkXPosition = networkXPositionNew;
	networkYPosition = networkYPositionNew;
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
    ctx.globalCompositionOperation = 'xor';
    if(torch && lighting < 200){
        lighting += 3;
    }
    else if(!torch && lighting > 50) {
        lighting -= 3;
    }
    ctx.arc(playerXPosition, playerYPosition, lighting, 0, Math.PI * 2);
    ctx.fillStyle = "#383838";
    ctx.rect(canvas.width, 0, -canvas.width, canvas.height);
    ctx.fill();
    ctx.closePath();
}

function setWall(wallid, buttonid)
{
	wallArray[wallid][4] = networkColor;
	delete buttonArray[buttonid];
	socket.emit("ls:gamelobby", {"t": "w", "w": wallid, "b": buttonid, 'C': playerColor});
}

function setWallNetwork(wallid, buttonid)
{
	wallArray[wallid][4] = playerColor;
	delete buttonArray[buttonid];
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

function drawButtons() {
    buttonArray.forEach(function(button) {
        ctx.beginPath();
        ctx.fillStyle = "#39ad59";
        ctx.rect(button[0], button[1], button[2] - button[0], button[3] - button[1]);
        ctx.fill();
        ctx.closePath();
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWalls();
    drawButtons();
	drawPlayerNetwork();
	drawPlayer();
    //drawPlayerFieldOfView();
    movePlayer();    
}

setInterval(draw, 33);

function startsocket() {
	socket = io.connect('ws://localhost:8010', { reconnect: true, transports: ['websocket', 'polling'], forceNew: true });
	socket.on('connect', function (data) {
		socket.emit('go', { color: playerColor, gameid: gameid });
	});

	socket.on('ls:gamelobby', function (data) {
		const json = JSON.parse(data);
		if(json.t == "m")
		{
			setPlayerNetwork(json.X, json.Y);
		}
		if(json.t == "w")
		{
			setWallNetwork(json.w, json.b);
		}
	});

	socket.on('debug', function (data) {
		console.log(data);
	});
}

window.addEventListener('load', startsocket);