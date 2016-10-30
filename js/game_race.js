var targetFPS = 60, delta, delta2, currentTime, oldTime = 0, gameState = 0, gameOver = !1, socket, port;
Number.prototype.round = function(a) {
    return +this.toFixed(a)
}
;
CanvasRenderingContext2D.prototype.roundRect = function(a, b, c, d, e) {
    c < 2 * e && (e = c / 2);
    d < 2 * e && (e = d / 2);
    this.beginPath();
    this.moveTo(a + e, b);
    this.arcTo(a + c, b, a + c, b + d, e);
    this.arcTo(a + c, b + d, a, b + d, e);
    this.arcTo(a, b + d, a, b, e);
    this.arcTo(a, b, a + c, b, e);
    this.closePath();
    return this
}
;
var MathPI = Math.PI
  , MathCOS = Math.cos
  , MathSIN = Math.sin
  , MathABS = Math.abs
  , MathPOW = Math.pow
  , MathSQRT = Math.sqrt
  , MathMIN = Math.min
  , MathMAX = Math.max
  , MathATAN2 = Math.atan2
  , mainCanvas = document.getElementById("mainCanvas")
  , mainContext = mainCanvas.getContext("2d")
  , gameTitle = document.getElementById("gameTitle")
  , instructionsText = document.getElementById("instructionsText")
  , gameUiContainer = document.getElementById("gameUiContainer")
  , userInfoContainer = document.getElementById("userInfoContainer")
  , loadingContainer = document.getElementById("loadingContainer")
  , enterGameButton = document.getElementById("enterGameButton")
  , userNameInput = document.getElementById("userNameInput")
  , menuContainer = document.getElementById("menuContainer")
  , darkener = document.getElementById("darkener")
  , linksContainer = document.getElementById("linksContainer")
  , infoContainerM = document.getElementById("infoContainerM")
  , leaderboardList = document.getElementById("leaderboardList")
  , boostDisplay = document.getElementById("boostDisplay")
  , lapsDisplay = document.getElementById("lapsDisplay")
  , endBoardContainer = document.getElementById("endBoardContainer")
  , endBoardTable = document.getElementById("endBoardTable")
  , endBoardTimer = document.getElementById("endBoardTimer")
  , followText = document.getElementById("followText")
  , lobbyKey = document.getElementById("lobbyKey")
  , lobbyKeyText = document.getElementById("lobbyKeyText")
  , chatbox = document.getElementById("chatbox");
chatbox.style.display = "block";
var chatInput = document.getElementById("chatInput")
  , chatList = document.getElementById("chatList")
  , modeSelector = document.getElementById("modeSelector")
  , modeListView = document.getElementById("modeListView")
  , instructionsIndex = 0
  , instructionsSpeed = 5500
  , insturctionsCountdown = 0
  , instructionsList = ["move your mouse to control your vehicle and click to use your boost", "crashing into walls will deal damage your vehicle", "if your vehicle is destroyed, you have to start over again", "press Enter to toggle the chat and press C to hide or show the chat", "listening to eurobeat improves your ability to play this game"]
  , instructionsIndex = UTILS.randInt(0, instructionsList.length - 1)
  , randomLoadingTexts = ["starting engines...", "prepare to drive...", "pumping gas...", "buckle up...", "playing eurobeat..."];
function addChatItem(a, b, c) {
    hook_addChatItem(a, b, c);
    var d = document.createElement("li");
    c ? (d.className = "sysMsg",
    d.innerHTML = b) : d.innerHTML = "[" + a + "] <span class='grayMsg'>" + b + "</span>";
    for (; 120 < chatList.clientHeight; )
        chatList.removeChild(chatList.childNodes[0]);
    chatList.appendChild(d)
}
var hasStorage = false;
if (hasStorage) {
    var cid = localStorage.getItem("sckt");
    cid || (cid = UTILS.getUniqueID(),
    localStorage.setItem("sckt", cid))
}
var partyKey = null , player = null , modeIndex = 0, modeList, gameObjects = [], map = null , currentMode = null , target = [0, 0, 0, 0], viewMult = 1, maxScreenWidth = 1920, maxScreenHeight = 1080, originalScreenWidth = maxScreenWidth, originalScreenHeight = maxScreenHeight, screenWidth, screenHeight;
function getURLParam(a, b) {
    b || (b = location.href);
    a = a.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var c = (new RegExp("[\\?&]" + a + "=([^&#]*)")).exec(b);
    return null == c ? null : c[1]
}
var lobbyURLIP = getURLParam("l"), lobbyRoomID;
if (lobbyURLIP) {
    var tmpL = lobbyURLIP.split("-")
      , lobbyURLIP = tmpL[0];
    lobbyRoomID = tmpL[1]
}
window.onload = function() {
    enterGameButton.onclick = function() {
        enterGame()
    }
    ;
    console.log("lobby URL IP: " + lobbyURLIP);
    $.get("http://race.driftin.io/getIP", {
        sip: lobbyURLIP
    }, function(a) {
        port = a.port;
        console.log("server IP: " + a.ip);
        console.log("server port: " + a.port);
        socket || (socket = io.connect("http://" + a.ip + ":" + a.port, {
            "connect timeout": 3E3,
            reconnection: !0,
            query: "cid=" + cid + "&rmid=" + lobbyRoomID
        }),
        setupSocket())
    })
}
;
mainCanvas.addEventListener("mousemove", gameInput, !1);
mainCanvas.addEventListener("mousedown", mouseDown, !1);
mainCanvas.addEventListener("mouseup", mouseUp, !1);
var mouseX, mouseY, forceTarget = !0;
function gameInput(a) {
    a.preventDefault();
    a.stopPropagation();
    mouseX = a.clientX;
    mouseY = a.clientY;
    sendTarget(forceTarget);
    forceTarget = !1
}
function mouseDown(a) {
    a.preventDefault();
    a.stopPropagation();
    target[2] = 1;
    sendTarget(!0);
    document.activeElement.blur();
    mainCanvas.focus()
}
function mouseUp(a) {
    a.preventDefault();
    a.stopPropagation();
    target[2] = 0;
    sendTarget(!0)
}
window.onkeyup = function(a) {
    a = a.keyCode ? a.keyCode : a.which;
    socket && (userNameInput === document.activeElement ? 13 == a && (userNameInput.blur(),
    enterGame()) : chatInput === document.activeElement ? 13 == a && (chatInput.blur(),
    mainCanvas.focus(),
    socket.emit("c", chatInput.value),
    chatInput.value = "") : player && !player.dead && (67 == a && (chatbox.style.display = "block" == chatbox.style.display ? "none" : "block"),
    13 == a ? chatInput.focus() : 81 == a && (target[3] = target[3] ? 0 : 1,
    sendTarget(!0))))
}
;
function setupSocket() {
    socket.on("connect_error", function() {
        lobbyURLIP ? kickPlayer("Connection failed. Please check your lobby ID.") : kickPlayer("Connection failed. Please check your internet connection.")
    });
    socket.on("disconnect", function(a) {
        kickPlayer("Disconnected.");
        console.log("Send this to the dev: " + a)
    });
    socket.on("error", function(a) {
        kickPlayer("Disconnected. The server may have updated.");
        console.log("Send this to the dev: " + a)
    });
    socket.on("kick", function(a) {
        kickPlayer(a)
    });
    socket.on("v", function(a, b, c) {
        viewMult != c && (viewMult = c,
        maxScreenWidth = a * c,
        maxScreenHeight = b * c,
        resize())
    });
    socket.on("mds", function(a, b) {
        modeList = a;
        modeSelector.innerHTML = a[b].name + "  <i style='vertical-align: middle;' class='material-icons'>&#xE5C5;</i>";
        modeIndex = b
    });
    socket.on("c", function(a, b, c) {
        addChatItem(a, b, c)
    });
    socket.on("gd", function(a, b) {
        map = a;
        currentMode = b;
        document.getElementById("notifDisplay").style.display = "inline-block"
    });
    socket.on("spawn", function(a, b) {
        objectExists(a) ? updateOrPushObject(a) : gameObjects.push(a);
        b && (player = a,
        gameState = 1,
        toggleMenuUI(!1),
        toggleGameUI(!0),
        mainCanvas.focus());
        hook_socket_callback_spawn(a, b);
    });
    socket.on("lk", function(a) {
        partyKey = a
    });
    socket.on("d", function(a) {
        a = getPlayerIndexById(a);
        null != a && gameObjects.splice(a, 1)
    });
    socket.on("0", getLeaderboardData);
    socket.on("1", updateObjectData);
    socket.on("2", function(a, b) {
        screenShake(a, b)
    });
    socket.on("3", function(a, b, c, d) {
        var e = getPlayerIndex(a);
        null != e && (gameObjects[e].health = b,
        c && (gameObjects[e].maxHealth = c),
        0 >= gameObjects[e].health && gameObjects[e].visible && (gameObjects[e].dead = !0,
        gameObjects[e].deathScaleMult = 1,
        gameObjects[e].deathAlpha = 1),
        d && (gameObjects[e].hitFlash = d));
        player && a == player.sid && (player.health = b,
        player.dead = 0 >= b,
        player.dead && (hideMainMenuText(),
        leaveGame()))
    });
    socket.on("4", updateFuelDisplay);
    socket.on("5", function(a) {
        null != a && (lapsDisplay.innerHTML = currentMode.objName + " " + a + "/" + currentMode.pointsToWin,
        currentMode.recTime && addLapInfo(a, 0),
        1 < a && currentMode.scrText && showNotification(currentMode.scrText))
    });
    socket.on("6", updateLapInfo);
    socket.on("7", function(a, b, c) {
        a = getPlayerIndex(a);
        null != a && (gameObjects[a][b] = c);
        hook_socket_callback_7(a, b, c);
    });
    socket.on("8", function(a) {
        gameOver = !0;
        bestTime = null ;
        initBest = !1;
        toggleGameUI(!1);
        toggleMenuUI(!1);
        darkener.style.display = "block";
        showEndBoard(a)
    });
    socket.on("9", function(a) {
        endBoardTimer.innerHTML = "Next Race " + a
    });
    socket.on("n", function(a) {
        showNotification(a)
    })
}
var updateObjectData = function(a, b) {
    if (a)
        a.visible = !0,
        updateOrPushObject(a),
        hook_updateObjectData_condition_a(a),
        delete a;
    else if (b) {
        for (var c = 0; c < gameObjects.length; ++c)
            gameObjects[c].visible || (gameObjects[c].forcePos = 1),
            gameObjects[c].visible = !1;
        for (c = 0; c < b.length; ) {
            var d = getPlayerIndex(b[c]);
            null != d && (gameObjects[d].x = b[c + 1],
            gameObjects[d].y = b[c + 2],
            gameObjects[d].dir = b[c + 3] || gameObjects[d].dir,
            gameObjects[d].visible = !0);
            hook_updateObjectData_condition_b_loop(gameObjects[d]);
            c += 4
        }
        delete b
    }
}
  , getLeaderboardData = function(a) {
    for (var b = "", c = 1, d = 0; d < a.length; )
        b += "<div class='leaderboardItem'><div style='display:inline-block;float:left;' class='whiteText'>" + c + ".</div> <div class='" + (player && a[d] == player.sid ? "leaderYou" : "leader " + a[d + 1]) + "'>" + a[d + 2] + "</div><div class='leaderboardLapsNum'>" + a[d + 3] + "</div></div>",
        d += 4,
        c++;
    leaderboardList.innerHTML = b;
    delete a
}
  , updateFuelDisplay = function(a) {
    boostDisplay.innerHTML = a + " Boost"
}
;
function loadPartyKey() {
    partyKey && (window.history.pushState("", "Driftin.io", "/?l=" + partyKey),
    lobbyKeyText.innerHTML = "send the url above to a friend",
    lobbyKey.className = "deadLink")
}
function enterGame() {
    socket && (gameOver = !1,
    showMainMenuText(randomLoadingTexts[UTILS.randInt(0, randomLoadingTexts.length - 1)]),
    socket.emit("respawn", {
        name: bot_name
    }),
    mainCanvas.focus())
}
function castVote(a) {
    socket.emit("cv", a)
}
function leaveGame() {
    gameState = 0;
    initBest = !1;
    notifDisplay && notifDisplay.html("");
    $("#abilityCooldown").css("height", "100%");
    toggleGameUI(!1);
    toggleMenuUI(!0);
    endBoardContainer.style.display = "none"
    hook_leaveGame();
}
var maxFlashAlpha = .3
  , playerCanvas = document.createElement("canvas")
  , playerCanvasScale = 150;
playerCanvas.width = playerCanvas.height = playerCanvasScale;
var playerContext = playerCanvas.getContext("2d");
playerContext.translate(playerCanvas.width / 2, playerCanvas.height / 2);
playerContext.lineJoin = "round";
var updateGameLoop = function(a) {
    if (player) {
        updateScreenShake();
        for (var b, c = 0; c < gameObjects.length; ++c)
            if (b = gameObjects[c],
            b.visible && !b.dead)
                if (b.forcePos || void 0 == b.localX || void 0 == b.localY)
                    b.localX = b.x,
                    b.localY = b.y,
                    b.forcePos = 0;
                else {
                    var d = b.x - b.localX;
                    b.localX += d * a * .01;
                    d = b.y - b.localY;
                    b.localY += d * a * .01
                }
        b = gameObjects[getPlayerIndex(player.sid)];
        var e, f;
        b && (e = b.localX,
        f = b.localY);
        d = (e || 0) - maxScreenWidth / 2 - screenSkX;
        f = (f || 0) - maxScreenHeight / 2 - screenSkY;
        map && (mainContext.lineWidth = 2 * map.tracksidePadding,
        mainContext.fillStyle = map.wallColor,
        mainContext.strokeStyle = "#ea6363",
        mainContext.lineJoin = "miter",
        mainContext.fillRect(0, 0, maxScreenWidth, maxScreenHeight),
        mainContext.fillStyle = map.backgroundColor,
        mainContext.beginPath(),
        mainContext.arc(-d, -f, map.heightH, 0, 2 * Math.PI),
        mainContext.closePath(),
        mainContext.fill(),
        mainContext.beginPath(),
        mainContext.arc(-d, -f, map.heightH - map.tracksidePadding, 0, 2 * Math.PI),
        mainContext.closePath(),
        mainContext.stroke(),
        map.trackWidth && (mainContext.fillStyle = "#ea6363",
        mainContext.beginPath(),
        mainContext.arc(-d, -f, map.innerHeightH + 2 * map.tracksidePadding, 0, 2 * Math.PI),
        mainContext.closePath(),
        mainContext.fill(),
        mainContext.fillStyle = map.wallColor,
        mainContext.beginPath(),
        mainContext.arc(-d, -f, map.innerHeightH, 0, 2 * Math.PI),
        mainContext.closePath(),
        mainContext.fill()),
        mainContext.strokeStyle = "#fff",
        mainContext.setLineDash([100, 100]),
        mainContext.beginPath(),
        mainContext.arc(-d, -f, map.innerHeightH + map.tracksidePadding, 0, 2 * Math.PI),
        mainContext.closePath(),
        mainContext.stroke(),
        mainContext.beginPath(),
        mainContext.arc(-d, -f, map.heightH - map.tracksidePadding, 0, 2 * Math.PI),
        mainContext.closePath(),
        mainContext.stroke(),
        mainContext.setLineDash([]),
        mainContext.fillStyle = map.lineColor,
        mainContext.strokeStyle = map.lineColor,
        map.startLine && mainContext.fillRect(-(map.startLineWidth / 2) - d, map.height / 2 - map.trackWidth - f + 2 * map.tracksidePadding, map.startLineWidth, map.trackWidth - 4 * map.tracksidePadding));
        for (c = 0; c < gameObjects.length; ++c)
            if (b = gameObjects[c],
            b.visible && !b.dead || b.deathAlpha) {
                e = b.localX - d;
                var h = b.localY - f, g = 0, k;
                b.deathAlpha && b.dead ? (b.deathScaleMult += a / 50,
                g = b.deathScaleMult,
                b.deathAlpha -= a / 300,
                0 >= b.deathAlpha && (b.deathAlpha = 0),
                k = b.deathAlpha) : k = 1;
                g += 2.25 * b.scale;
                playerContext.lineWidth = 11;
                playerContext.clearRect(-(playerCanvasScale / 2), -(playerCanvasScale / 2), playerCanvasScale, playerCanvasScale);
                renderPlayer(playerContext, g, .8, b.classIndex, b.special);
                g /= 1.8;
                !gameOver && 0 < b.hitFlash && (b.hitFlash -= .001 * a,
                0 >= b.hitFlash && (b.hitFlash = 0),
                playerContext.globalCompositeOperation = "source-atop",
                playerContext.fillStyle = "rgba(255, 255, 255, " + b.hitFlash + ")",
                playerContext.fillRect(-playerCanvas.width / 2, -playerCanvas.height / 2, playerCanvas.width, playerCanvas.height),
                playerContext.globalCompositeOperation = "source-over");
                mainContext.save();
                mainContext.globalAlpha = k;
                mainContext.translate(e, h);
                mainContext.rotate((b.sid == player.sid ? target[0] : b.dir) + MathPI / 2);
                mainContext.drawImage(playerCanvas, -(playerCanvasScale / 2), -(playerCanvasScale / 2));
                mainContext.restore();
                b.isPlayer && b.name && !gameOver && (mainContext.font = "36px regularF",
                mainContext.textAlign = "center",
                mainContext.strokeStyle = "#5f5f5f",
                mainContext.lineWidth = 6,
                380 > mainContext.measureText(b.name).width && (mainContext.strokeText(b.name, e, h - g - 25),
                mainContext.fillStyle = "#ffffff",
                mainContext.fillText(b.name, e, h - g - 25)));
                if (!gameOver && b.isPlayer && b.id == player.id) {
                    k = b.health / b.maxHealth;
                    var l = 80 * k
                      , m = 80 / 9;
                    mainContext.fillStyle = "#5f5f5f";
                    mainContext.roundRect(e - 40 - 3, h + g + 25 - 3, 86, m + 6, 6).fill();
                    mainContext.fillStyle = .35 < k ? "#78d545" : "#d55d45";
                    mainContext.roundRect(e - l / 2, h + g + 25, l, m, 6).fill()
                }
            }
        updateAnimTexts(a);
        delete b
    }
}
;
function renderPlayer(a, b, c, d, e, f) {
    a.fillStyle = "#a95ad6";
    a.strokeStyle = "#c26afa";
    a.lineWidth *= 2;
    a.beginPath();
    a.moveTo(0, -2 * b / 3);
    a.lineTo(-b / 2 * c, b / 3);
    a.lineTo(b / 2 * c, b / 3);
    a.lineTo(0, -2 * b / 3);
    a.closePath();
    a.stroke();
    a.fill()
}
function updateMenuLoop(a) {
    1 != gameState && (insturctionsCountdown -= a,
    0 >= insturctionsCountdown && (insturctionsCountdown = instructionsSpeed,
    instructionsText.innerHTML = instructionsList[instructionsIndex],
    instructionsIndex++,
    instructionsIndex >= instructionsList.length && (instructionsIndex = 0)))
}
var sendFrequency = 1E3 / 24
  , lastSent = 0;
var sendTarget = override_sendTarget;
var maxNotifs = 2
  , bestTime = null
  , initBest = !1
  , lastTime = 0
  , notifDisplay = $("#notifDisplay");
function addLapInfo(a, b) {
    if (!initBest) {
        initBest = !0;
        var c = $("<div/>").addClass("notificationWrapper")
          , d = $("<span/>").addClass("notificationText").html("Best <span class='greyMenuText'>" + UTILS.getTimeString(bestTime || b) + "</span>");
        d.attr("id", "lapInfoBest");
        d.appendTo(c);
        c.appendTo(notifDisplay)
    } else if (!bestTime || lastTime < bestTime)
        bestTime = lastTime,
        $("#lapInfoBest").html("Best <span class='greyMenuText'>" + UTILS.getTimeString(bestTime) + "</span>");
    var e = notifDisplay.children().length
      , c = $("<div/>").addClass("notificationWrapper")
      , d = $("<span/>").addClass("notificationText").html("Lap " + a + " <span class='greyMenuText'>" + UTILS.getTimeString(b) + "</span>");
    e >= maxNotifs && notifDisplay.children().eq(1).remove();
    d.attr("id", "lapInfo" + a);
    d.appendTo(c);
    c.appendTo(notifDisplay);
    c.animate({
        "font-size": "28px"
    }, 100).animate({
        "font-size": "20px"
    }, 100)
}
function updateLapInfo(a, b) {
    currentMode.recTime && ($("#lapInfo" + a).html("Lap " + a + " <span class='greyMenuText'>" + UTILS.getTimeString(b) + "</span>"),
    bestTime || $("#lapInfoBest").html("Best <span class='greyMenuText'>" + UTILS.getTimeString(b) + "</span>"),
    lastTime = b)
}
for (var animTexts = [], animTextIndex = 0, i = 0; 20 > i; ++i)
    animTexts.push(new animText);
function updateAnimTexts(a) {
    mainContext.textAlign = "center";
    mainContext.strokeStyle = "#5f5f5f";
    mainContext.fillStyle = "#ffffff";
    mainContext.lineWidth = 7;
    for (var b = 0; b < animTexts.length; ++b)
        animTexts[b].update(a);
    mainContext.globalAlpha = 1
}
function animText() {
    this.fadeSpeed = this.fadeDelay = this.scalePlus = this.maxScale = this.minScale = this.scale = this.alpha = this.y = this.x = 0;
    this.text = "";
    this.active = !1;
    this.update = function(a) {
        this.active && (this.scale += this.scalePlus * a,
        this.scale >= this.maxScale ? (this.scalePlus *= -1,
        this.scale = this.maxScale) : this.scale <= this.minScale && (this.scalePlus = 0,
        this.scale = this.minScale),
        this.fadeDelay -= a,
        0 >= this.fadeDelay && (this.alpha -= this.fadeSpeed * a,
        0 >= this.alpha && (this.alpha = 0,
        this.active = !1)),
        this.active && (mainContext.globalAlpha = this.alpha,
        mainContext.font = this.scale * viewMult + "px regularF",
        mainContext.strokeText(this.text, this.x, this.y),
        mainContext.fillText(this.text, this.x, this.y)))
    }
    ;
    this.show = function(a, b, c, d, e, f) {
        this.x = a;
        this.y = b;
        this.minScale = this.scale = d;
        this.maxScale = 1.35 * d;
        this.scalePlus = f;
        this.text = c || "";
        this.alpha = 1;
        this.fadeDelay = e || 0;
        this.fadeSpeed = .003;
        this.active = !0
    }
}
function showAnimText(a, b, c, d, e, f, h) {
    if (!gameOver) {
        var g = animTexts[animTextIndex];
        g.show(a, b, c, d, e, h);
        g.type = f;
        animTextIndex++;
        animTextIndex >= animTexts.length && (animTextIndex = 0)
    }
}
function showNotification(a) {
    for (var b = 0; b < animTexts.length; ++b)
        "notif" == animTexts[b].type && (animTexts[b].active = !1);
    showAnimText(maxScreenWidth / 2, maxScreenHeight / 1.3, a, 46, 1E3, "notif", .19)
}
function showBigNotification(a) {
    for (var b = 0; b < animTexts.length; ++b)
        "bNotif" == animTexts[b].type && (animTexts[b].active = !1);
    showAnimText(maxScreenWidth / 2, maxScreenHeight / 3, a, 130, 1E3, "bNotif", .26)
}
var screenSkX = 0
  , screenShackeScale = 0
  , screenSkY = 0
  , screenSkRed = .5
  , screenSkDir = 0;
function screenShake(a, b) {
    screenShackeScale < a && (screenShackeScale = a,
    screenSkDir = b)
}
function updateScreenShake(a) {
    0 < screenShackeScale && (screenSkX = screenShackeScale * MathCOS(screenSkDir),
    screenSkY = screenShackeScale * MathSIN(screenSkDir),
    screenShackeScale *= screenSkRed,
    .1 >= screenShackeScale && (screenShackeScale = 0))
}
var kickReason = null ;
function kickPlayer(a) {
    leaveGame();
    kickReason || (kickReason = a);
    showMainMenuText(kickReason);
    socket.close();
    hook_kickPlayer(a);
}
function updateOrPushObject(a) {
    var b = getPlayerIndex(a.sid);
    null != b ? gameObjects[b] = a : gameObjects.push(a)
}
function objectExists(a) {
    for (var b = 0; b < gameObjects.length; ++b)
        if (gameObjects[b].sid == a.sid)
            return !0;
    return !1
}
function getPlayerIndex(a) {
    for (var b = 0; b < gameObjects.length; ++b)
        if (gameObjects[b].sid == a)
            return b;
    return null
}
function getPlayerIndexById(a) {
    for (var b = 0; b < gameObjects.length; ++b)
        if (gameObjects[b].id == a)
            return b;
    return null
}
function showMainMenuText(a) {
    userInfoContainer.style.display = "none";
    loadingContainer.style.display = "block";
    loadingContainer.innerHTML = a
}
function hideMainMenuText() {
    userInfoContainer.style.display = "block";
    loadingContainer.style.display = "none"
}
function toggleGameUI(a) {
    gameUiContainer.style.display = a ? "block" : "none"
}
function toggleMenuUI(a) {
    a ? (menuContainer.style.display = "flex",
    darkener.style.display = "block",
    linksContainer.style.display = "block",
    infoContainerM.style.display = "block",
    endBoardContainer.style.display = "none",
    userNameInput.focus(),
    target[2] = 0) : (menuContainer.style.display = "none",
    darkener.style.display = "none",
    linksContainer.style.display = "none",
    infoContainerM.style.display = "none")
}
var tmpPlayer;
function showEndBoard(a) {
    endBoardContainer.style.display = "flex";
    endBoardTable.innerHTML = "";
    var b;
    if (currentMode.recTime) {
        b = "<tr><th>Player</th><th>Best Time</th><th>Total Time</th><th>Deaths</th><th>" + currentMode.objName + "</th></tr>";
        for (var c = 0; c < a.length; ++c)
            tmpPlayer = a[c],
            b += "<tr><td style=" + (player && tmpPlayer.id == player.id ? "color:#fff" : "") + ">" + tmpPlayer.name + "</td><td>" + tmpPlayer.bestTime + "</td><td>" + tmpPlayer.totalTime + "</td><td>" + tmpPlayer.deaths + "</td><td>" + tmpPlayer.score + "</td></tr>"
    }
    endBoardTable.innerHTML = b
}
function showModeList() {
    if (modeList)
        if ("block" == modeListView.style.display)
            modeListView.style.display = "none";
        else {
            for (var a = "", b = 0; b < modeList.length; ++b)
                a += "<div onclick='changeMode(" + b + ")' class='modeListItem'>" + modeList[b].name + "</div>";
            modeListView.style.display = "block";
            modeListView.innerHTML = a
        }
}
function changeMode(a) {
    modeList && modeList[a] && a !== modeIndex && (modeListView.style.display = "none",
    modeSelector.innerHTML = modeList[a].name + "<i style='vertical-align: middle;' class='material-icons'>&#xE5C5;</i>",
    window.location.href = modeList[a].url)
}
window.addEventListener("resize", resize);
function resize() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    var a = MathMAX(screenWidth / maxScreenWidth, screenHeight / maxScreenHeight);
    mainCanvas.width = screenWidth;
    mainCanvas.height = screenHeight;
    mainContext.setTransform(a, 0, 0, a, (screenWidth - maxScreenWidth * a) / 2, (screenHeight - maxScreenHeight * a) / 2)
}
resize();
var targetFPS = 60
  , then = Date.now();
window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a, b) {
        window.setTimeout(a, 1E3 / targetFPS)
    }
}();
function callUpdate() {
    requestAnimFrame(callUpdate);
    currentTime = Date.now();
    var a = currentTime - then;
    a > 1E3 / targetFPS && (then = currentTime - a % (1E3 / targetFPS),
    updateGameLoop(a),
    sendTarget(0),
    updateMenuLoop(a))
}
callUpdate();

