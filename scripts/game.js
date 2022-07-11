"use-strict";

class Player {
  constructor(name) {
    this.name = name;
    this.score = 0;
  }
  addPoints(points) {
    this.score += points;
  }
}

class Corona {
  constructor(id) {
    this.id = id;
    this.value = 10;
    this.$dom = undefined;
  }
}

const gameObject = {
  title: "bust-a-corona",
  players: [],
  coronas: [],
  difficulty: {
    easy: 30000,
    medium: 20000,
    hard: 7000,
  },
  activePlayer: 0,
  isRunning: false,
  loopId: null,
  loopDuration: 1000,
  totalTime: 20000,
  timeRemaining: 20000,
  screens: {
    splash: $(".splash-screen"),
    game: $(".game-screen"),
    gameOver: $(".game-over-screen"),
  },
  elements: {
    progressBar: $("#progress-bar"),
    gameContainer: $(".game-container"),
    difficultySelect: $("#difficulty"),
    playerNameInput: $("input#player-name"),
    howToPlayButton: $("#how-to-play"),
    addPlayerButton: $("#add-player"),
    playGameButton: $("#play-game"),
    playersJoined: $("#players-joined"),
    displayName: $(".the-name"),
    playerScore: $(".player-score"),
    coronaVirus: $(".corona"),
    vaccine: $(".vaccine"),
    nextPlayerModal: new bootstrap.Modal(
      document.getElementById("nextPlayerModal")
    ),
    nextRoundButton: $("#nextRoundButton"),
    modalExit: $("nextPlayerModal"),
    restartGameButton: $("#restart"),
    quitGameButtons: $(".quit"),
    leaderboard: $("#leaderboard"),
    winner: $("#victorious-player"),
    popSound: $(".pop-sound")
  },
  currentScreen: $(".splash-screen"),
  switchScreen: function (newScreen) {
    gameObject.currentScreen = $(newScreen);
    $(".screen").hide();
    switch (newScreen) {
      case ".splash-screen":
        // gameObject.elements.timer.hide();
        gameObject.elements.vaccine.hide();
        gameObject.elements.progressBar.hide();
        gameObject.elements.gameContainer.addClass("splashbg");
        break;
      case ".game-screen":
        gameObject.elements.gameContainer.removeClass("splashbg");
        gameObject.elements.vaccine.show();
        gameObject.elements.progressBar.show();
        // gameObject.elements.timer.show();
        break;
      case ".game-over-screen":
        gameObject.elements.vaccine.hide();
        gameObject.elements.progressBar.hide();
        break;
      default:
        break;
    }
    gameObject.currentScreen.show();
  },
  registerEventListeners: function () {
    gameObject.elements.addPlayerButton.on("click", gameObject.addPlayer);

    $(document).on("keydown", gameObject.keyHandler);

    gameObject.elements.playGameButton.on("click", gameObject.playGame);

    gameObject.elements.nextRoundButton.on("click", gameObject.startRound);

    gameObject.elements.modalExit.on("click", gameObject.startRound);

    gameObject.elements.restartGameButton.on("click", gameObject.restartGame);

    gameObject.elements.quitGameButtons.on("click", gameObject.quitGame);
  },

  playGame: function () {
    // find out the difficulty value of the difficulty selector

    // depending on the value, change totalTime and timeRemaining to match

    const diffValue = gameObject.elements.difficultySelect.val();
    // 'easy' 'medium' 'hard'

    gameObject.totalTime = gameObject.difficulty[diffValue];
    gameObject.timeRemaining = gameObject.difficulty[diffValue];

    gameObject.switchScreen(".game-screen");
    gameObject.startRound();
  },

  restartGame: function () {
    // reset player scores to 0
    gameObject.players = gameObject.players.map((player) => {
      return { name: player.name, score: 0 };
    });
    // change activeplayer to 0 (player 1)
    gameObject.activePlayer = 0;

    gameObject.updateScoreBoard();
    gameObject.switchScreen(".game-screen");
    gameObject.startRound();
  },

  endGame: function () {

    // will detect 1 of 3 possible ending game states:
    // 1. 'normal victory' - where either 1 player has a score, or has a higher score than other players
    // 2. tie game
    // 3. no score

    // figure out who won

    let gameEndType = ""

    // Detecting Normal Victory
    let winningPlayer = "";
    gameObject.players.forEach((player) => {
      // Set up the loop, by assigning player 1 by default
      if (!winningPlayer) {
        winningPlayer = player;
      }
      // compare them to winningPlayer
      if (winningPlayer.score < player.score) {
        // this players score is higher than the previous players
        winningPlayer = player;
      }
    });
    gameEndType = "normal"

    // Detecting a tie
    if (gameObject.players.length > 1) {
      const allScoresEqual = (player) => player.score === gameObject.players[0]
      const tieGame = gameObject.players.every(allScoresEqual)
      if (tieGame) {
        gameEndType = "tie"
      }
    }

    // Detecting no score
    const allScoresZero = (player) => player.score === 0
    const noScoreGame = gameObject.players.every(allScoresZero)
    if (noScoreGame) {
      gameEndType = "no-score"
    }
    
 
    switch (gameEndType) {
      case "tie": //display message if the game is a tie 
        gameObject.elements.winner.text("Everyone's a winner!");
        break;

      case "no-score": //display message if player's score = zero
        gameObject.elements.winner.text("You didn't pop any coronas!");
        break;
    
      default: //display message for declared winner
      gameObject.elements.winner.text(`${winningPlayer.name} WINS! SCORE: ${winningPlayer.score}`);
      break;
    }



    // switch to the game over screen
    gameObject.switchScreen(".game-over-screen");
  },

  quitGame: function () {
    gameObject.players = [];
    gameObject.activePlayer = 0;
    gameObject.elements.playersJoined.html("");
    $("#play-game").addClass("hide");
    $("#players").addClass("hide");
    gameObject.switchScreen(".splash-screen");
  },

  startRound: function () {
    gameObject.updateInterface();
    let timeToStart = 3;
    const countDownDom = $(`<h5 class="countdown">${timeToStart}</h5>`);
    // gameObject.elements.countdownContainer.append(countDownDom)
    gameObject.elements.gameContainer.append(countDownDom);
    const countDownInterval = setInterval(() => {
      timeToStart -= 1;
      countDownDom.text(timeToStart);
      if (timeToStart === 0) {
        countDownDom.text("Go!");
        clearInterval(countDownInterval);
        const timeoutId = setTimeout(() => {
          gameObject.spawnCoronas();
          countDownDom.remove();
          clearTimeout(timeoutId);
          // gameObject.isRunning = true;
          gameObject.startTimer();
          console.log("starting timer");
        }, 500);
      }
    }, 750);
  },

  keyHandler: function (event) {
    switch (event.originalEvent.code) {
      case "Enter":
        if (gameObject.currentScreen.attr("class") === "splash-screen screen") {
          gameObject.addPlayer();
        }
        break;
      default:
        break;
    }
  },

  addPlayer: function () {
    if (
      gameObject.elements.playerNameInput.val() === "" ||
      gameObject.players.length === 4
    ) {
      return;
    }
    const newPlayer = new Player(gameObject.elements.playerNameInput.val());
    gameObject.players.push(newPlayer);
    gameObject.elements.playersJoined.append(
      "<li>" + gameObject.elements.playerNameInput.val() + "</li>"
    );
    gameObject.elements.playerNameInput.val("");

    document.getElementById("play-game").disabled = false;
    $("#play-game").removeClass("hide");
    $("#players").removeClass("hide");

    gameObject.updateScoreBoard();
  },

  handleCoronaClick: function (event, clickedCorona) {
    gameObject.elements.popSound[0].pause()
    // gameObject.elements.popSound[0].currentTime = 0.3;
    // event.preventDefault();
    if (!gameObject.isRunning) {
      return;
    }
    const activePlayer = gameObject.players[gameObject.activePlayer];
    activePlayer.score += clickedCorona.value;
    gameObject.updateScoreBoard();
    clickedCorona.$dom.hide();
    gameObject.elements.popSound[0].play()
    // gameObject.coronas = gameObject.coronas.filter(corona => corona.id !== clickedCorona.id)
    setTimeout(function () {
      gameObject.respawnCorona(clickedCorona);
    }, 750);
  },

  respawnCorona: function (coronaEl) {
    coronaEl.$dom.show();
    coronaEl.value = Math.floor(Math.random() * 26);
  },

  spawnCoronas: function () {
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const coronasToSpawn = 28;

    const possiblePoints = [
      1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10,
      25, 25, 25, 25, 25, 25,
    ];

    const spawnDelay = [100, 200, 300]

    for (let index = 0; index < coronasToSpawn; index++) {
      const newCorona = new Corona(index);
      const coronaDomString = $(
        `<img draggable="false" style="grid-area: cell-${index}" src="./images/corona-01.svg" alt="corona" id="corona-${index}" class="corona">`
      );
      newCorona.$dom = coronaDomString;
      const randomPointsIndex = getRandomInt(0, possiblePoints.length - 1);
      const randomPointsValue = possiblePoints[randomPointsIndex];
      newCorona.value = randomPointsValue;
      possiblePoints.splice(randomPointsIndex, 1);
      gameObject.coronas.push(newCorona);
      newCorona.$dom.on("click", (event) => this.handleCoronaClick(event, newCorona));
      const spawnDelayIndex = getRandomInt(0, spawnDelay.length -1)
      const spawnDelayValue = spawnDelay[spawnDelayIndex]
      setTimeout(() => {
        gameObject.screens.game.append(newCorona.$dom);
      }, spawnDelayValue);
    }
  },

  resetGame() {
    gameObject.isRunning = false;
    clearInterval(gameObject.loopId);
    gameObject.loopId = null;
    gameObject.timeRemaining = gameObject.totalTime;
    // Removing all coronas from the DOM
    gameObject.coronas.forEach((corona) => {
      corona.$dom.remove();
    });
    // reset coronas in gameObject to an empty array [] (deleting them)
    gameObject.coronas = [];
    gameObject.updateInterface();
  },

  updateClock() {
    const newMinutes = Math.floor(
      (gameObject.timeRemaining / (1000 * 60)) % 60
    );
    const newSeconds = Math.floor((gameObject.timeRemaining / 1000) % 60);
    const newTenths = Math.floor((gameObject.timeRemaining % 1000) / 100);
  },

  updateProgressBar() {
    gameObject.elements.progressBar.addClass("bg-info");
    gameObject.elements.progressBar.removeClass("bg-success");
    gameObject.elements.progressBar.removeClass("bg-warning");
    gameObject.elements.progressBar.removeClass("bg-danger");
    const percentComplete =
      (gameObject.timeRemaining / gameObject.totalTime) * 100;
    gameObject.elements.progressBar.css("width", `${percentComplete}%`);
    if (gameObject.isRunning) {
      if (percentComplete > 50) {
        gameObject.elements.progressBar.addClass("bg-success");
      }
      if (percentComplete <= 50) {
        gameObject.elements.progressBar.addClass("bg-warning");
      }
      if (percentComplete <= 25) {
        gameObject.elements.progressBar.addClass("bg-danger");
      }
    } else {
      gameObject.elements.progressBar.addClass("bg-info");
    }
  },

  updateScoreBoard() {
    // Updates the players score and name
    const activePlayer = gameObject.players[gameObject.activePlayer];
    gameObject.elements.playerScore.text(activePlayer.score);
    gameObject.elements.displayName.text(activePlayer.name);
  },

  nextPlayer() {
    // changes the active player, and toggles the next player modal
    gameObject.activePlayer += 1;
    gameObject.elements.nextPlayerModal.show();
  },

  //updates players name, score and vaccine/progress bar
  updateInterface() {
    gameObject.updateScoreBoard();
    gameObject.updateClock();
    gameObject.updateProgressBar();
  },

  timerLoop() {
    console.log("time loop");
    gameObject.timeRemaining -= gameObject.loopDuration;
    if (gameObject.timeRemaining <= 0) {
      // end of round
      gameObject.resetGame();
      if (gameObject.activePlayer + 1 < gameObject.players.length) {
        // do more players still have to play ?
        gameObject.nextPlayer();
      } else if (gameObject.activePlayer + 1 === gameObject.players.length) {
        // all players have played
        gameObject.endGame();
      }
    }
    gameObject.updateInterface();
  },

  startTimer() {
    if (gameObject.isRunning) {
      console.log("game already running");
      return;
    } else {
      console.log("starting");
      gameObject.isRunning = true;
      gameObject.loopId = setInterval(
        gameObject.timerLoop,
        gameObject.loopDuration
      );
    }
  },

  pauseTimer() {
    gameObject.isRunning = false;
    clearInterval(gameObject.loopId);
    gameObject.loopId = null;
    gameObject.updateClock();
    gameObject.updateProgressBar();
  },

  intervalLoop(duration) {
    game.loop = setInterval(game.intervalFunction, duration);
  },
  //------TIMER END------//

  // resetGameBoard method
};

gameObject.registerEventListeners();
gameObject.switchScreen(".splash-screen");
gameObject.updateClock();
