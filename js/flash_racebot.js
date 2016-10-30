// Main code for the Buster aimbot
// This code is loaded before the slightly modified game.js

var max_velocity_samples = 1;
var bot_name = "hai";

window.localStorage = null;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function compute_cartesian_distance(x1, y1, x2, y2) {
    return MathSQRT((x2 -= x1) * x2 + (y2 -= y1) * y2)
}

function compute_distance(other_obj) {
    return compute_cartesian_distance(other_obj.x, other_obj.y, player.x, player.y)
}

function chat(data) {
    socket.emit("c", data);
}

class CircleMapCourse {
    constructor() {
        this.target_arc_length = 500; // screen-independent pixels
    }

    polar_arg(angle) {
        return angle;
    }

    x_cart(angle) {
        return (map.heightH-map.trackWidth*15/16)*MathCOS(this.polar_arg(angle));
    }

    y_cart(angle) {
        return (map.heightH-map.trackWidth*15/16)*MathSIN(this.polar_arg(angle));
    }

    get_target_position() {
        let return_values = new Object();
        let map_radius = map.heightH - (map.trackWidth/2);
        // Calculate new position polar angle relative to center of circle map (in radians)
        let new_angle = MathATAN2(player.y, player.x);
        new_angle -= this.target_arc_length/map_radius;
        return_values.x = this.x_cart(new_angle);
        return_values.y = this.y_cart(new_angle);
        return return_values;
    }
}
var circle_map_course = new CircleMapCourse();

function get_racing_target() {
    let return_values = new Object();
    let target_position = circle_map_course.get_target_position();
    return_values.angle = MathATAN2(target_position.y - player.y, target_position.x - player.x);
    return_values.distance = compute_cartesian_distance(player.x, player.y, target_position.x, target_position.y);
    return return_values;
}

function pseudo_enter_key() {
    enter_event = new Event("keyup");
    enter_event.keyCode = 13;
    setTimeout(function() {
        enter_event = new Event("keyup", {"bubbles": true});
        enter_event.keyCode = 13;
        userNameInput.dispatchEvent(enter_event);
        enter_event = new Event("mouseup", {"bubbles": true});
        enter_event.button = 1;
        enterGameButton.dispatchEvent(enter_event);
    }, 500);
}

// Function hooks and overrides

function hook_addChatItem(a, b, c) {
    //console.log("CHAT:", a, b, c)
}

function hook_socket_callback_spawn(a, b) {
    if (b) {
        console.log("Current SID: " + player.sid);
    }
}

function hook_socket_callback_7(a, b, c) {
}

function hook_updateObjectData_condition_a(a) {
}

function hook_updateObjectData_condition_b_loop(game_object) {
}

function hook_leaveGame() {
    pseudo_enter_key();
}

function hook_kickPlayer(a) {
    console.log("Got kicked for '" + a + "'. Reconnecting...");
    window.socket = undefined;
    window.port = undefined;
    window.kickReason = false;
    window.oldTime = 0;
    window.gameState = 0;
    window.gameOver = false;
    var partyKey = null , player = null , modeIndex = 0, modeList = undefined, gameObjects = [], map = null, currentMode = null, target = [0, 0, 0, 0], viewMult = 1, maxScreenWidth = 1920, maxScreenHeight = 1080, originalScreenWidth = maxScreenWidth, originalScreenHeight = maxScreenHeight, screenWidth = undefined, screenHeight = undefined;
    setTimeout(function() {
        hideMainMenuText();
        window.onload();
        toggleGameUI(false);
        toggleMenuUI(true);
        endBoardContainer.style.display = "none";
        pseudo_enter_key();
    }, 10000);
}

function override_sendTarget(a) {
    var b = currentTime;
    if (!gameOver && player && !player.dead && (a || b - lastSent > sendFrequency)) {
        lastSent = b;
        let new_target = get_racing_target();
        target[0] = new_target.angle;
        target[1] = new_target.distance;
        target[0] = target[0].round(2);
        target[1] = target[1].round(2);
        target[2] = 1;
        socket.emit("1", target);
    }
}
