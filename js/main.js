var canvas;
var canvasCtx;

//initiate player 1
var player1X = 100;
var player1Y = 200;
var player1YSpeed = 6;

//initiate player 2
var player2X;
var player2Y = 200;
var player2YSpeed = 6;

//keys object
var keys = {w: false, s: false, i:false, k:false};
var bullets = [];
var bullet;
var bulletSpeed = 10;

//health and state object
var healths = {left: 1, right: 1, maxHealth: 1};
var wonRounds = {left: 0, right: 0};

var showingWinScreen = false;
var gameStarted = false;

window.onload = function(){
    canvas = document.querySelector('#canvas');
    canvasCtx = canvas.getContext('2d');

    //set player 2 width dynamically according to the canvas width
    player2X = canvas.width-100;

    document.addEventListener('keydown', function(e){
        switch(e.key){
            case "w":
                keys.w = true;
                break;
            case "s":
                keys.s = true;
                break;
            case "i":
                keys.i = true;
                break;
            case "k":
                keys.k = true;
                break;
            case "d":
                //create a new bullet object and add it to the bullets array
                if(gameStarted){
                    bullet = new Bullet(player1X+15, player1Y-25, 1, Math.floor(Math.random()*6));
                    bullets.push(bullet);
                }
                break;
            case "j":
                if(gameStarted){
                    bullet = new Bullet(player2X-15, player2Y-25, 2, Math.floor(Math.random()*6));
                    bullets.push(bullet);
                }
                break;
        }
        e.preventDefault();
    });

    document.addEventListener('keyup', function(e){
        switch(e.key){
            case "w":
                keys.w = false;
                break;
            case "s":
                keys.s = false;
                break;
            case "i":
                keys.i = false;
                break;
            case "k":
                keys.k = false;
                break;
        }
        e.preventDefault();
    });

    document.querySelector('#startGame').addEventListener('mousedown', function(e){
        gameStarted = true;
        if(showingWinScreen){
            if(wonRounds.left>=3 || wonRounds.right>=3){
                wonRounds.left = 0;
                wonRounds.right = 0;
            }
            showingWinScreen = false;
            healths.left = healths.maxHealth;
            healths.right = healths.maxHealth;
            bullets.splice(0, bullets.length);
            loop();
        }
    });

    //update everything every frame
    loop();
}

function gameController(){
    //initiate the canvas
    canvasCtx.fillStyle = "black";
    canvasCtx.fillRect(0,0, canvas.width, canvas.height);

    //if the tournament has just begun
    if(wonRounds.left==0 && wonRounds.right==0){
        document.querySelector('#player1Score').innerHTML=0;
        document.querySelector('#player2Score').innerHTML=0;
    }    

    canvasCtx.fillStyle = "white";
    canvasCtx.font = "20px Arial";

    //if either of the players died, end the game
    if(healths.left <= 0){
        showingWinScreen = true;
        wonRounds.right++;
        document.querySelector('#player2Score').innerHTML=wonRounds.right;
        if(wonRounds.right>=3){
            //if the other player won the tournament after this player died
            canvasCtx.fillText("Player 2 won the tournament!",(canvas.width/2)-150, 200);
        }else{
            canvasCtx.fillText("Player 2 won the game! Click on start game to continue.", (canvas.width/2)-250, 200);
        }
        return;
    }else if(healths.right <= 0){
        showingWinScreen = true;
        wonRounds.left++;
        document.querySelector('#player1Score').innerHTML=wonRounds.left;
        if(wonRounds.left>=3){
            canvasCtx.fillText("Player 1 won the tournament!",(canvas.width/2)-150, 200);
        }else{
            canvasCtx.fillText("Player 1 won the game! Click on start game to continue.", (canvas.width/2)-250, 200);
        }
        return;
    }

    //don't render or move anything until the game has begun 
    if(!showingWinScreen && gameStarted){
        drawEverything();
        moveEverything();
        shootAndDelete();
    }else{
        canvasCtx.fillText("Click on Start Game to begin.", (canvas.width/2)-150, 200);
    }
}

function drawEverything(){
    //create player 1
    canvasCtx.fillStyle = "white";
    canvasCtx.beginPath();
    canvasCtx.arc(player1X, player1Y, 20, Math.PI*2, 0, false);
    canvasCtx.fill();

    //player 1 hands
    canvasCtx.fillStyle = "silver";
    canvasCtx.fillRect(player1X, player1Y-30, 40, 10);

    //create player 2
    canvasCtx.fillStyle = "white";
    canvasCtx.beginPath();
    canvasCtx.arc(player2X, player2Y, 20, Math.PI*2, 0, false);
    canvasCtx.fill();

    //player 2 hands
    canvasCtx.fillStyle = "silver";
    canvasCtx.fillRect(player2X, player2Y-30, -40, 10);

    //score system
    canvasCtx.font = "20px Arial";
    canvasCtx.fillText(healths.left, 10, 25);
    canvasCtx.fillText(healths.right, canvas.width-40, 25);
}

function moveEverything(){
    //handle both players' movements
    if(keys.w) player1Y-=player1YSpeed;
    if(keys.s) player1Y+=player1YSpeed;
    if(keys.i) player2Y-=player2YSpeed;
    if(keys.k) player2Y+=player2YSpeed;

    //don't let the players move outside the canvas
    if(player1Y <= 0){
        player1Y+=12;
    }else if(player1Y >= canvas.height){
        player1Y-=12;
    }
    if(player2Y <= 0){
        player2Y+=12;
    }else if(player2Y >= canvas.height){
        player2Y-=12;
    }
}

function shootAndDelete(){
    bullets.forEach((currentBullet, index, object)=>{
        //destroying bullets on going off the screen
        if(currentBullet.x >= canvas.width || currentBullet.x <= 0){
            object.splice(index, 1);
        }

        //health and state management
        if((currentBullet.y >= player2Y-25 && currentBullet.y <= player2Y+25) && currentBullet.x >= player2X){
            healths.right-=currentBullet.power;
            object.splice(index, 1);
        }else if((currentBullet.y >= player1Y-25 && currentBullet.y <= player1Y+25) && currentBullet.x <= player1X){
            healths.left-=currentBullet.power;
            object.splice(index, 1);
        }

        canvasCtx.fillStyle = "red";
        canvasCtx.beginPath();

        //determine whether it's coming from the left or the right player and move accordingly
        if(currentBullet.from == 1){
            canvasCtx.arc(currentBullet.x+(index*12), currentBullet.y, 5, Math.PI*2, 0, false);
            currentBullet.x+=bulletSpeed;
        }else{
            canvasCtx.arc(currentBullet.x-(index*12), currentBullet.y, 5, Math.PI*2, 0, false);
            currentBullet.x-=bulletSpeed;
        }

        canvasCtx.fill();
    });
}

function loop(){
    gameController();
    if(!showingWinScreen) window.requestAnimationFrame(loop);
}

class Bullet {
    constructor(x, y, from, power) {
      this.x = x;
      this.y = y;
      this.from = from;
      this.power = power;
    }
}