function setBet(a) {
    game.bet = parseFloat(parseFloat(a).toFixed(2)), betSave = game.bet, "undefined" != $.cookie("gameBet") && $.removeCookie("gameBet"), $.cookie("gameBet", betSave)
}

function setBombs(a) {
    game.bombs = Math.floor(parseFloat(a)), "undefined" != $.cookie("gameBombs") && $.removeCookie("gameBombs"), $.cookie("gameBombs", game.bombs)
}

function setClientSeed(a) {
    game.clientSeed = parseFloat(a), "undefined" != $.cookie("clientSeed") && $.removeCookie("clientSeed"), $.cookie("clientSeed", game.clientSeed)
}

function getURLParameter(a) {
    return decodeURIComponent((new RegExp("[#|&]" + a + "=([^&;]+?)(&|#|;|$)").exec(location.hash) || [, ""])[1].replace(/\+/g, "%20")) || null
}

function onkeyup_check(a) {
    13 == a.keyCode && sendMessage(document.getElementById("chatText").value)
}

function sendMessage(a) {
    document.getElementById("chatText").value = "";
    socket.emit("new_message", {
        text: a
    }, function(a, b) {
        return a ? void console.log("Error when submitting new_message to server:", a) : void console.log("Successfully submitted message:", b)
    })
}

function ObjectLength(a) {
    var b = 0;
    for (var c in a) a.hasOwnProperty(c) && ++b;
    return b
}

function addNewChatMessage(a) {
    if ("undefined" != typeof a.user && "undefined" != typeof a.channel) var b = escapeHTML(a.user.uname),
        c = a.user.role;
    else var b = "Server",
        c = "server";
    var d = {
            hours: addZero(new Date(a.created_at).getHours()),
            mins: addZero(new Date(a.created_at).getMinutes())
        },
        e = escapeHTML(a.text);
    e = stripCombiningMarks(e);
    var f = !1;
    "" != $("#username").text() && e.indexOf("@" + $("#username").text()) > -1 && (b != $("#username").text() && (f = !0), e = e.replace("@" + $("#username").text(), "<span class='notify'>@" + $("#username").text() + "</span>"));
    var g = document.getElementById("chatMonitor"),
        h = "Server" == b ? "style='color:lime;font-weight:bold;'" : "",
        i = "OWNER" == c ? "style='color:#E74C3C;" : "ADMIN" == c ? "style='color:#EC87C0;" : "MOD" == c ? "style='color:#2ECC71;" : "style='";
    isInHighRollersList(b) && (i += 'background:url("lib/css/img/sparkle.gif");'), i += "'", g.innerHTML += '<span class="chatMessage ' + (f ? "notify" : "") + '" ' + h + "><small>" + d.hours + ":" + d.mins + "</small> <b " + i + ">" + b + "</b>: " + urlify(e) + "<br></span>", g.scrollTop = g.scrollHeight;
    var j = document.getElementsByClassName("chatMessage");
    j.length > 120 && g.removeChild(j[0]), $(".safeLink").click(function() {
        var a = $(this).text();
        $("#unknownLink").text(a), $(".safeLinkDoRedirectButton").attr("href", a), $("#safeLinkForm").modal("setting", "closable", !1).modal("show"), $("#safeLinkCancelRedirectButton").click(function() {
            $("#safeLinkForm").modal("hide")
        })
    })
}

function addZero(a) {
    return a < 10 && (a = "0" + a), a
}

function onloadCallback() {
    grecaptcha.render("faucetClaimCaptcha", {
        sitekey: "6LfUTgsUAAAAAOLo8nvx1M81WqIGYY_ytCu-Q5eP",
        callback: correctCaptcha
    })
}

function correctCaptcha(a) {
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "https://api.moneypot.com/v1/claim-faucet?access_token=" + access_token,
        data: JSON.stringify({
            response: a
        }),
        dataType: "json"
    }).done(function(a) {
        return "undefined" != typeof a.error ? "FAUCET_ALREADY_CLAIMED" == a.error ? (console.error("Faucet already claimed"), addNewChatMessage({
            created_at: (new Date).toISOString(),
            text: "You already claimed the faucet. (All moneypot apps shares the same faucet and therefore the same timer)"
        }), void grecaptcha.reset()) : "INVALID_INPUT_RESPONSE" == a.error ? (console.error("Google has rejected the response. Try to refresh and do again."), addNewChatMessage({
            created_at: (new Date).toISOString(),
            text: "(faucet) Google has rejected the response. Try to refresh and do again."
        }), void grecaptcha.reset()) : (console.error(a.error), addNewChatMessage({
            created_at: (new Date).toISOString(),
            text: "(faucet) An error occured. Be sure you haven't already claimed a moneypot app's faucet within 5 mins."
        }), void grecaptcha.reset()) : (console.log(a.amount / 100 + " bits has been added to your balance!"), addNewChatMessage({
            created_at: (new Date).toISOString(),
            text: a.amount / 100 + " bits has been added to your balance!"
        }), $.get("https://api.moneypot.com/v1/auth?access_token=" + access_token, function(a) {
            "undefined" != typeof a.user.uname && (user_balance = a.user.balance / 100, $("#balance").text(user_balance.formatMoney(2, ".", ",")))
        }), $("#faucetClaimCaptcha").css("top", "-90px"), grecaptcha.reset(), showingrecaptcha = !1, claimedTime = (new Date).getTime(), faucetTimer = setInterval(function() {
            return parseInt(claimedTime) + 3e5 <= (new Date).getTime() ? ($("#faucetButton").removeClass("claimed"), clearInterval(faucetTimer), claimedTime = !1, $("#faucetButton").attr("disabled", !1), void $("#faucetButton").text("FAUCET")) : ($("#faucetButton").attr("disabled", !0), $("#faucetButton").addClass("claimed"), $("#faucetButton").text(parseFloat(300 - ((new Date).getTime() - claimedTime) / 1e3).formatMoney(2, ".", ",")), void 0)
        }, 100), "undefined" != $.cookie("faucetClaim") && $.removeCookie("faucetClaim"), void $.cookie("faucetClaim", claimedTime))
    }).fail(function(a) {
        var b = a.error;
        "FAUCET_ALREADY_CLAIMED" == b ? (console.error("Faucet already claimed"), addNewChatMessage({
            created_at: (new Date).toISOString(),
            text: "You already claimed the faucet. (All moneypot apps shares the same faucet and therefore the same timer)"
        }), grecaptcha.reset()) : "INVALID_INPUT_RESPONSE" == b ? (console.error("Google has rejected the response. Try to refresh and do again."), addNewChatMessage({
            created_at: (new Date).toISOString(),
            text: "(faucet) Google has rejected the response. Try to refresh and do again."
        }), grecaptcha.reset()) : (console.error(b), addNewChatMessage({
            created_at: (new Date).toISOString(),
            text: "(faucet) An error occured. Be sure you haven't already claimed a moneypot app's faucet within 5 mins."
        }), grecaptcha.reset()), $("#faucetClaimCaptcha").css("top", "-90px"), showingrecaptcha = !1
    })
}

function startNewGame() {
    if (!connected) return $("#theDimmer").html('Error: Not connected!<br><a href="https://www.moneypot.com/oauth/authorize?app_id=2392&response_type=token&state=Meh&redirect_uri=http://bitsweep.ga/">Click here to login</a>'), void $("#game_left").dimmer("show");
    if ($(".settingsButon").css("display", "none"), game.bombs < 1 || game.bombs > 24) return $("#theDimmer").html("Error: Bombs amount!<br>(min 1 & max 24)"), $("#game_left").dimmer("show"), void $(".settingsButon").css("display", "inline-block");
    if (game.tilesClicked = 0, houseEdge = .01, odds = (25 - game.bombs - game.tilesClicked) / (25 - game.tilesClicked), next = game.bet * ((1 - houseEdge) / odds) - game.bet, game = {
            status: "IN_PROGRESS",
            profit: 0,
            bet: game.bet,
            bombs: game.bombs,
            clientSeed: game.clientSeed,
            tilesClicked: 0,
            odds: odds,
            next: next,
            stake: game.bet
        }, user_balance - game.bet < 0) return $("#theDimmer").html("Error: Not enough Balance!"), $("#game_left").dimmer("show"), game = {
        status: "ENDED",
        profit: game.stake,
        bet: parseFloat($("#bet").val()),
        bombs: game.bombs,
        clientSeed: game.clientSeed,
        tilesClicked: 0,
        odds: 0,
        next: 0,
        stake: 0
    }, void $(".settingsButon").css("display", "inline-block");
    if (game.bet < 0) return $("#theDimmer").html("Error: Invalid bet amount!"), $("#game_left").dimmer("show"), game = {
        status: "ENDED",
        profit: game.stake,
        bet: parseFloat($("#bet").val()),
        bombs: game.bombs,
        clientSeed: game.clientSeed,
        tilesClicked: 0,
        odds: 0,
        next: 0,
        stake: 0
    }, void $(".settingsButon").css("display", "inline-block");
    $("#cashoutButton").css("display", "inline-block"), $("#next_value").text(parseFloat(game.next).formatMoney(2, ".", ",")), $("#stake_value").text(parseFloat(game.stake).formatMoney(2, ".", ",")), boardHtml = $("#board").html(), $("#board").html("");
    for (var a = 0; a < 25; a++) $("#board").append("<li data-tile='" + a + "' class='tile'></li>");
    $(".tile").each(function(a) {
        $(this).click(function() {
            if ("IN_PROGRESS" == game.status) {
                var b = !1;
                if ($(".tile").each(function(a) {
                        $(this).hasClass("tileLoading") && (b = !0)
                    }), !b) {
                    user_balance -= game.stake, $("#balance").text(user_balance.formatMoney(2, ".", ","));
                    parseInt($(this).attr("data-tile"));
                    $(this).addClass("tileLoading"), $(this).html('<div class="ui active loader"></div>');
                    var d = 100 * game.stake;
                    console.log("[BET] Game:", game);
                    var e = Math.floor(Math.pow(2, 32) * game.odds);
                    game.tilesClicked++;
                    var f = $(this);
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: "https://api.moneypot.com/v1/bets/custom?access_token=" + access_token,
                        data: JSON.stringify({
                            client_seed: parseInt(game.clientSeed),
                            hash: String(Hash),
                            wager: d,
                            payouts: [{
                                from: 0,
                                to: e,
                                value: 100 * (game.stake + game.next)
                            }, {
                                from: e,
                                to: Math.pow(2, 32),
                                value: 0
                            }]
                        }),
                        dataType: "json",
                        error: function(a, b, c) {
                            console.error("[BET ERROR]", a.responseText)
                        }
                    }).done(function(b) {
                        if (f.removeClass("tileLoading"), console.log("[BET RESULT]", b), b.next_hash)
                            if (console.log("[Provably fair] new hash: " + b.next_hash), Hash = b.next_hash, b.outcome >= e) {
                                if (f.addClass("pressed"), f.addClass("bomb reveal"), f.html('<i class="icon-alert warning icon"></i>'), $("#logs").html('<div class="log_item" style="border-left: 4px solid #E74C3C;">Clicked tile #' + a + '<br>Found: <span style="color: #E74C3C">Bomb</span>! <button id="playAgainButton">Play Again</button><div class="info"><a href="https://www.moneypot.com/bets/' + b.id + '" target="_blank"><i class="info circle icon"></i></a></div></div>' + $("#logs").html()), $("#playAgainButton").click(function() {
                                        $("#playAgainButton").remove(), $("#board").html(boardHtml), $("#customBombs").val(game.bombs), $("#startNewGameButton").click(function() {
                                            startNewGame()
                                        }), $("#bombsButtons .button").each(function(a) {
                                            $(this).click(function() {
                                                $("#bombsButtons .button").each(function() {
                                                    $(this).removeClass("active")
                                                }), $(this).addClass("active"), 0 === a ? game.bombs = 1 : 1 === a ? game.bombs = 3 : 2 === a ? game.bombs = 5 : 3 === a ? game.bombs = 24 : 4 === a && (game.bombs = parseInt($("#customBombs").val())), $(this).hasClass("customBombsButton") ? $("#customBombsInputArea").css("display", "inline-flex") : $("#customBombsInputArea").css("display", "none")
                                            })
                                        }), game = {
                                            status: "ENDED",
                                            profit: game.stake,
                                            bet: parseFloat(betSave),
                                            bombs: game.bombs,
                                            clientSeed: game.clientSeed,
                                            tilesClicked: 0,
                                            odds: 0,
                                            next: 0,
                                            stake: 0
                                        }, $("#bet").val(game.bet)
                                    }), game.bombs > 1)
                                    for (var c = 0; c < game.bombs - 1; c++) {
                                        var d = [];
                                        $(".tile").each(function(a) {
                                            $(this).hasClass("pressed") || $(this).hasClass("reveal") || d.push(a)
                                        }), roll = Math.floor(Math.random() * d.length) + 1, $(".tile:eq(" + d[roll - 1] + ")").addClass("reveal").html('<i class="icon-alert warning icon"></i>')
                                    }
                                $("#cashoutButton").css("display", "none"), game = {
                                    status: "ENDED",
                                    profit: 0 - parseFloat($("#bet").val()),
                                    bet: parseFloat(betSave),
                                    bombs: game.bombs,
                                    clientSeed: game.clientSeed,
                                    tilesClicked: 0,
                                    odds: 0,
                                    next: 0,
                                    stake: 0
                                }, $("#next_value").text(parseFloat(game.next).formatMoney(2, ".", ",")), $("#stake_value").text(parseFloat(game.stake).formatMoney(2, ".", ",")), $(".log_item").each(function(a) {
                                    a > 5 && $(this).remove()
                                }), console.log(game), $(".settingsButon").css("display", "inline-block")
                            } else f.addClass("pressed"), f.html('<span class="tile_val">+' + parseFloat(game.next).formatMoney(2, ".", ",") + "</span>"), $("#logs").html('<div class="log_item" style="border-left: 4px solid #8D4;">Clicked tile #' + a + '<br>Found: <span style="color: #8D4">' + parseFloat(game.next).formatMoney(2, ".", ",") + '</span> Bits!<div class="info"><a href="https://www.moneypot.com/bets/' + b.id + '" target="_blank"><i class="info circle icon"></i></a></div></div>' + $("#logs").html()), user_balance += game.next + game.stake, $("#balance").text(user_balance.formatMoney(2, ".", ",")), houseEdge = .01, odds = (25 - game.bombs - game.tilesClicked) / (25 - game.tilesClicked), next = (game.bet + game.next) * ((1 - houseEdge) / odds) - (game.bet + game.next), game = {
                                status: "IN_PROGRESS",
                                profit: 0,
                                bet: game.bet + game.next,
                                bombs: game.bombs,
                                clientSeed: game.clientSeed,
                                tilesClicked: game.tilesClicked,
                                odds: odds,
                                next: next,
                                stake: game.bet + game.next
                            }, $("#next_value").text(parseFloat(game.next).formatMoney(2, ".", ",")), $("#stake_value").text(parseFloat(game.stake).formatMoney(2, ".", ",")), $(".log_item").each(function(a) {
                                a > 5 && $(this).remove()
                            }), console.log(game);
                        else console.log("BET ERROR: " + JSON.stringify(b.responseJSON)), $("#theDimmer").html("BET ERROR: " + JSON.stringify(b.responseJSON) + '<br><a href="https://www.moneypot.com/oauth/authorize?app_id=2392&response_type=token&state=Meh&redirect_uri=http://bitsweep.ga/">Click here to reconnect</a>'), $("#game_left").dimmer("show"), $(".settingsButon").css("display", "inline-block")
                    })
                }
            }
        })
    }), console.log("~~ New game ~~\n", game), $("#game_log").css("display", "inline-block"), $("#highRoller_log").css("top", "480px"), $(this).css("display", "inline-block")
}

function showSettings() {
    $("#theDimmer").html('<label style="color:white;">Bet:</label><input class="bet" type="number" pattern="[0-9]*" value="' + betSave + '" onkeyup="setBet($(this).val());" onchange="setBet($(this).val());" style="color:black;width:150px;"><br><label style="color:white;">Bombs:</label><input class="bet" type="number" pattern="[0-9]*" value="' + game.bombs + '" onkeyup="setBombs($(this).val());" onchange="setBombs($(this).val());" style="color:black;width:150px;"><br><label style="color:white;">Client Seed:</label><input class="bet" type="number" pattern="[0-9]*" value="' + game.clientSeed + '" onkeyup="setClientSeed($(this).val());" onchange="setClientSeed($(this).val());" style="color:black;width:150px;">'), $("#game_left").dimmer("show")
}

function escapeHTML(a) {
    a += "";
    for (var b = "", c = 0; c < a.length; c++) b += "<" === a[c] ? "&lt;" : ">" === a[c] ? "&gt;" : "'" === a[c] ? "&#39;" : '"' === a[c] ? "&#34;" : "%" === a[c] ? "&#37;" : "\\" === a[c] ? "&#92;" : "¢" === a[c] ? "&#162;" : "¼" === a[c] ? "&#188;" : "½" === a[c] ? "&#189;" : "¾" === a[c] ? "&#190;" : "#" === a[c] ? "&#35;" : "&" === a[c] && "#" === a[c + 1] ? "&#38;" : a[c];
    return b
}

function urlify(a) {
    var b = /(https?:\/\/[^\s]+)/g;
    return a.replace(b, function(a) {
        return '<a class="safeLink">' + a + "</a>"
    })
}

function isInHighRollersList(a) {
    var b = !1;
    return $(".hr_log_item_username").each(function() {
        $(this).text() == a && (b = !0)
    }), b
}

function getRandCseed() {
    var a = new Uint32Array(1);
    return window.crypto.getRandomValues(a)[0]
}
var socket, users = 0,
    Hash = "",
    showingrecaptcha = !1,
    boardHtml = "",
    user_balance = 0,
    claimedTime = !1,
    faucetTimer, access_token = null,
    currentSafeLink = "",
    jackpot_socket, jackpot_socket_connected = !1,
    jackpot_streak = 0;
if ("undefined" == typeof $.cookie("faucetClaim") ? (claimedTime = !1, $.cookie("faucetClaim", claimedTime)) : (claimedTime = parseInt($.cookie("faucetClaim")), claimedTime && claimedTime > 0 && (faucetTimer = setInterval(function() {
        return parseInt(claimedTime) + 3e5 <= (new Date).getTime() ? ($("#faucetButton").removeClass("claimed"), clearInterval(faucetTimer), claimedTime = !1, $("#faucetButton").attr("disabled", !1), $("#faucetButton").text("FAUCET"), "undefined" != $.cookie("faucetClaim") && $.removeCookie("faucetClaim"), void $.cookie("faucetClaim", claimedTime)) : ($("#faucetButton").attr("disabled", !0), $("#faucetButton").addClass("claimed"), $("#faucetButton").text(parseFloat(300 - ((new Date).getTime() - claimedTime) / 1e3).formatMoney(2, ".", ",")), void 0)
    }, 100))), "undefined" == typeof $.cookie("gameBet")) {
    var betSave = 2;
    $.cookie("gameBet", betSave)
} else var betSave = $.cookie("gameBet");
if ("undefined" == typeof $.cookie("gameBombs")) {
    var gameBombs = 3;
    $.cookie("gameBombs", gameBombs)
} else var gameBombs = $.cookie("gameBombs");
var connected = !1;
if ("undefined" == typeof $.cookie("clientSeed")) {
    var clientSeed = getRandCseed();
    $.cookie("clientSeed", clientSeed)
} else var clientSeed = $.cookie("clientSeed");
var game = {
    status: "?",
    profit: 0,
    bet: parseFloat(betSave),
    bombs: parseInt(gameBombs),
    clientSeed: clientSeed,
    tilesClicked: 0,
    odds: 0,
    next: 0,
    stake: 0
};
$("#bet").val(game.bet), $("#bombsButtons .button").each(function(a) {
    1 == game.bombs ? 0 === a ? $(this).addClass("active") : $(this).removeClass("active") : 3 == game.bombs ? 1 === a ? $(this).addClass("active") : $(this).removeClass("active") : 5 == game.bombs ? 2 === a ? $(this).addClass("active") : $(this).removeClass("active") : 24 == game.bombs ? 3 === a ? $(this).addClass("active") : $(this).removeClass("active") : 4 === a ? ($(this).addClass("active"), $("#customBombs").val(game.bombs), $("#customBombsInputArea").css("display", "inline-flex")) : $(this).removeClass("active")
}), $(function() {
    var a = jQuery("<div/>", {
            id: "loaderContainer",
            style: "position: absolute;top: 0; right: 0; bottom: 0; left: 0;z-index: 2000;"
        }).appendTo("body"),
        b = jQuery("<div/>", {
            class: "ui segment",
            style: "height: 100%; opacity: 0.7;"
        }).appendTo(a),
        c = jQuery("<div/>", {
            class: "ui active dimmer"
        }).appendTo(b);
    jQuery("<div/>", {
        id: "loaderText",
        class: "ui text loader",
        text: "Connecting"
    }).appendTo(c);
    "undefined" != typeof $.session.get("session_access_token") && (access_token = $.session.get("session_access_token")), "" != getURLParameter("access_token") && null != getURLParameter("access_token") && (access_token = getURLParameter("access_token"), "undefined" != typeof $.session.get("session_access_token") && $.session.remove("session_access_token"), $.session.set("session_access_token", access_token), window.history.pushState("", "Bitsweep", "/")), socket = io.connect("https://socket.moneypot.com");
    var e = {
        app_id: 2392,
        access_token: "" != access_token && null != access_token ? access_token : void 0,
        subscriptions: ["CHAT", "DEPOSITS", "BETS"]
    };
    socket.on("connect", function() {
        (user_balance > 0 || null != access_token) && (connected = !0), console.info("[socketpot] connected");
        var a = {
            app_id: e.app_id,
            access_token: e.access_token,
            subscriptions: e.subscriptions
        };
        socket.emit("auth", a, function(a, b) {
            if (a) return $("#loaderContainer").css("display", "block"), $("#loaderText").text("Error while connecting: " + a), void console.error("[auth] Error:", a);
            var c = b;
            $("#loaderContainer").css("display", "none"), "" != access_token && null != access_token && ($("#connectButton").css("display", "none"), jQuery("<input/>", {
                id: "chatText",
                type: "text",
                maxlength: "200",
                placeholder: "Chat here"
            }).appendTo("#chat"), jQuery("<button/>", {
                id: "chatButton",
                text: "Send"
            }).appendTo("#chat"), $("#chatText").keyup(function(a) {
                onkeyup_check(a)
            }), $("#chatButton").click(function() {
                sendMessage(String(document.getElementById("chatText").value))
            }), $.getJSON("https://api.moneypot.com/v1/token?access_token=" + access_token, function(a) {
                $("#connectionText").css("display", "block"), $("#betPanel").css("display", "block"), $("#depositButton").css("display", "inline-block"), $("#withdrawButton").css("display", "inline-block"), $("#username").text(a.auth.user.uname), $("#balance").text((a.auth.user.balance / 100).formatMoney(2, ".", ",")), user_balance = a.auth.user.balance / 100, connected = !0, $("#highRoller_log").css("display", "block"), $("#highRoller_logs").html('<div class="ui active loader"></div>'), $.post("https://api.moneypot.com/v1/hashes?access_token=" + access_token, "", function(a) {
                    if (console.log("[Provably fair] We received our hash: " + a.hash), Hash = "undefined" != typeof a.hash && a.hash, $("#loaderContainer").css("display", "none"), "" == Hash || 0 == Hash) return $("#theDimmer").html('Error: Moneypot did not give a correct hash!<br><a href="https://www.moneypot.com/oauth/authorize?app_id=2392&response_type=token&state=Meh&redirect_uri=http://bitsweep.ga/">Click here to reconnect</a><br>Error: ' + JSON.stringify(a).replace(access_token, "[censored]")), $("#game_left").dimmer("show"), void $(".settingsButon").css("display", "inline-block")
                }, "json"), $(".chatMessage").each(function(a) {
                    $(this).html().split(":")[1];
                    $(this).html($(this).html().replace("@" + $("#username").text(), "<span class='notify'>@" + $("#username").text() + "</span>"))
                })
            }), $.getJSON("https://api.moneypot.com/v1/list-bets?access_token=" + access_token + "&app_id=2392&wager=4500000&limit=11&order_by=desc", function(a) {
                $("#highRoller_logs").html(""), a.length > 0 && $.each(a.reverse(), function(b) {
                    a[b].profit <= 0 ? $("#highRoller_logs").html('<div class="hr_log_item" style="border-left: 4px solid #E74C3C;"><b><a class="hr_log_item_username" href="https://www.moneypot.com/users/' + a[b].uname + '">' + a[b].uname + '</a></b>: <span style="color: #E74C3C">' + parseFloat(a[b].wager / 100).formatMoney(2, ".", ",") + '</span> Bits! <div class="info"><a href="https://www.moneypot.com/bets/' + a[b].id + '" target="_blank"><i class="info circle icon"></i></a></div></div>' + $("#highRoller_logs").html()) : $("#highRoller_logs").html('<div class="hr_log_item" style="border-left: 4px solid #8D4;"><b><a class="hr_log_item_username" href="https://www.moneypot.com/users/' + a[b].uname + '">' + a[b].uname + '</a></b>: <span style="color: #8D4">' + parseFloat(a[b].wager / 100).formatMoney(2, ".", ",") + '</span> Bits! <div class="info"><a href="https://www.moneypot.com/bets/' + a[b].id + '" target="_blank"><i class="info circle icon"></i></a></div></div>' + $("#highRoller_logs").html()), $(".hr_log_item").each(function(a) {
                        a > 10 && $(this).remove()
                    })
                })
            }), console.log(c)), users = ObjectLength(c.chat.userlist), $("#connectedUsersAmount").text(users);
            for (var d = 0; d < c.chat.messages.length; d++) addNewChatMessage(c.chat.messages[d]);
            var e = document.getElementById("chatMonitor");
            e.innerHTML += '<span class="chatMessage"><div style="border-top:1px solid rgba(241,196,15,0.3);border-bottom:1px solid rgba(241,196,15,0.3);background-color:rgba(241,196,15,0.2);"><span style="color: #F1C40F;font-weight:bold;">Warning:</span> Never give your access_token to anyone or run unknown scripts. This may compromise your wallet security.</div><br></span>', e.scrollTop = e.scrollHeight, $(".safeLink").click(function() {
                var a = $(this).text();
                $("#unknownLink").text(a), $(".safeLinkDoRedirectButton").attr("href", a), $("#safeLinkForm").modal("setting", "closable", !1).modal("show"), $("#safeLinkCancelRedirectButton").click(function() {
                    $("#safeLinkForm").modal("hide")
                })
            })
        })
    }), socket.on("disconnect", function() {
        console.warn("[socketpot] disconnected"), document.getElementById("chatMonitor").innerHTML = "", connected = !1, $("#loaderContainer").css("display", "block"), $("#loaderText").text("Lost connection to socketpot. If this happens many time, verify your connection or contact moneypot support."), console.error("Lost connection to socketpot. If this happens many time, verify your connection or contact moneypot support.")
    }), socket.on("client_error", function(a) {
        console.error("[socketpot] client_error:", a)
    }), socket.on("error", function(a) {
        console.error("[socketpot] error:", a)
    }), socket.on("reconnect_error", function(a) {
        console.error("[socketpot] error while reconnecting:", a), console.info("Couldn't connect to socketpot. Verify your connection or contact moneypot support."), $("#loaderContainer").css("display", "block"), $("#loaderText").text("Error while reconnecting! Couldn't connect to socketpot. Verify your connection or contact moneypot support."), connected = !1
    }), socket.on("reconnecting", function() {
        console.warn("[socketpot] attempting to reconnect..."), console.info("Couldn't connect to socketpot. Verify your connection or contact moneypot support."), $("#loaderContainer").css("display", "block"), $("#loaderText").text("Reconnecting"), connected = !1
    }), socket.on("reconnect", function() {
        console.info("[socketpot] successfully reconnected"), $("#loaderContainer").css("display", "none"), connected = !0
    }), socket.on("user_joined", function(a) {
        users++, $("#connectedUsersAmount").text(users), console.log(a.uname + " joined the chat. (" + users + " users online)")
    }), socket.on("user_left", function(a) {
        users--, $("#connectedUsersAmount").text(users), console.log(a.uname + " left the chat. (" + users + " users online)")
    }), socket.on("new_message", function(a) {
        addNewChatMessage(a)
    }), socket.on("new_bet", function(a) {
        if ($("#username").text() == a.uname) {
            var b = document.getElementById("game_mybets_logs"),
                c = b.insertRow(0);
            c.id = "mybet_" + a.id, c.className = "mybets_log_item";
            var d = c.insertCell(0),
                e = c.insertCell(1),
                f = c.insertCell(2),
                g = parseFloat(a.profit) >= 0;
            d.innerHTML = '<a href="https://www.moneypot.com/bets/' + a.id + '" target="blank">' + a.id + "</a>", d.className = g ? "win" : "lose", e.innerHTML = parseFloat(parseFloat(a.wager / 100).toFixed(2)) + " Bits", f.innerHTML = g ? '<span style="color: #8D4">' + (a.profit / 100).formatMoney(2, ".", ",") + "</span> Bits" : '<span style="color: #E74C3C">' + (a.profit / 100).formatMoney(2, ".", ",") + "</span> Bits", jackpot_socket_connected && (0 == jackpot_streak ? a.outcome >= 429496729 && a.outcome <= 858993458 ? jackpot_streak++ : jackpot_streak = 0 : 1 == jackpot_streak ? a.outcome >= 858993459 && a.outcome <= 1288490187 ? jackpot_streak++ : jackpot_streak = 0 : 2 == jackpot_streak ? a.outcome >= 1288490188 && a.outcome <= 1717986917 ? jackpot_streak++ : jackpot_streak = 0 : 3 == jackpot_streak ? a.outcome >= 1717986918 && a.outcome <= 2147483647 ? jackpot_streak++ : jackpot_streak = 0 : 4 == jackpot_streak ? a.outcome >= 2147483648 && a.outcome <= 2576980376 ? jackpot_streak++ : jackpot_streak = 0 : 5 == jackpot_streak ? a.outcome >= 2576980377 && a.outcome <= 3006477106 ? jackpot_streak++ : jackpot_streak = 0 : 6 == jackpot_streak && (a.outcome >= 3006477107 && a.outcome <= 3435973835 ? jackpot_streak++ : jackpot_streak = 0)), jackpot_streak > 0 && (f.innerHTML = f.innerHTML + '<div style="width: 10px;height: 10px;background: gold;position: absolute;right: 10px;margin-top: -15px;border-radius: 50%;color: black;font-size: 7px;text-align: center;line-height: 10px;font-weight: bold;" title="Jackpot Streak ' + jackpot_streak + '">' + jackpot_streak + "</div>"), a.wager / 100 >= 1e5 && (a.profit <= 0 ? $("#highRoller_logs").html('<div class="hr_log_item" style="border-left: 4px solid #E74C3C;"><b><a class="hr_log_item_username" href="https://www.moneypot.com/users/' + a.uname + '">' + a.uname + '</a></b>: <span style="color: #E74C3C">' + parseFloat(a.wager / 100).formatMoney(2, ".", ",") + '</span> Bits! <div class="info"><a href="https://www.moneypot.com/bets/' + a.id + '" target="_blank"><i class="info circle icon"></i></a></div></div>' + $("#highRoller_logs").html()) : $("#highRoller_logs").html('<div class="hr_log_item" style="border-left: 4px solid #8D4;"><b><a class="hr_log_item_username" href="https://www.moneypot.com/users/' + a.uname + '">' + a.uname + '</a></b>: <span style="color: #8D4">' + parseFloat(a.wager / 100).formatMoney(2, ".", ",") + '</span> Bits! <div class="info"><a href="https://www.moneypot.com/bets/' + a.id + '" target="_blank"><i class="info circle icon"></i></a></div></div>' + $("#highRoller_logs").html()), $(".hr_log_item").each(function(a) {
                a > 10 && $(this).remove()
            })), $(".mybets_log_item").each(function(a) {
                a > 8 && $(this).remove()
            })
        }
        var b = document.getElementById("game_allbets_logs"),
            c = b.insertRow(0);
        c.id = "bet_" + a.id, c.className = "allbets_log_item";
        var d = c.insertCell(0),
            e = c.insertCell(1),
            f = c.insertCell(2),
            g = parseFloat(a.profit) >= 0;
        d.innerHTML = '<a href="https://www.moneypot.com/bets/' + a.id + '" target="blank">' + a.id + "</a>", d.className = g ? "win" : "lose", e.innerHTML = '<a href="https://www.moneypot.com/users/' + a.uname + '">' + a.uname + "</a>", f.innerHTML = g ? '<span style="color: #8D4">' + (a.profit / 100).formatMoney(2, ".", ",") + "</span> Bits" : '<span style="color: #E74C3C">' + (a.profit / 100).formatMoney(2, ".", ",") + "</span> Bits", a.wager / 100 >= 1e5 && (a.profit <= 0 ? $("#highRoller_logs").html('<div class="hr_log_item" style="border-left: 4px solid #E74C3C;"><b><a class="hr_log_item_username" href="https://www.moneypot.com/users/' + a.uname + '">' + a.uname + '</a></b>: <span style="color: #E74C3C">' + parseFloat(a.wager / 100).formatMoney(2, ".", ",") + '</span> Bits! <div class="info"><a href="https://www.moneypot.com/bets/' + a.id + '" target="_blank"><i class="info circle icon"></i></a></div></div>' + $("#highRoller_logs").html()) : $("#highRoller_logs").html('<div class="hr_log_item" style="border-left: 4px solid #8D4;"><b><a class="hr_log_item_username" href="https://www.moneypot.com/users/' + a.uname + '">' + a.uname + '</a></b>: <span style="color: #8D4">' + parseFloat(a.wager / 100).formatMoney(2, ".", ",") + '</span> Bits! <div class="info"><a href="https://www.moneypot.com/bets/' + a.id + '" target="_blank"><i class="info circle icon"></i></a></div></div>' + $("#highRoller_logs").html()), $(".hr_log_item").each(function(a) {
            a > 10 && $(this).remove()
        })), $(".allbets_log_item").each(function(a) {
            a > 8 && $(this).remove()
        })
    }), socket.on("balance_change", function(a) {
        $("#balance").text((a.balance / 100).formatMoney(2, ".", ",")), user_balance = a.balance / 100
    })
}), Number.prototype.formatMoney = function(a, b, c) {
    var d = this,
        a = isNaN(a = Math.abs(a)) ? 2 : a,
        b = void 0 == b ? "." : b,
        c = void 0 == c ? "," : c,
        e = d < 0 ? "-" : "",
        f = parseInt(d = Math.abs(+d || 0).toFixed(a)) + "",
        g = (g = f.length) > 3 ? g % 3 : 0;
    return e + (g ? f.substr(0, g) + c : "") + f.substr(g).replace(/(\d{3})(?=\d)/g, "$1" + c) + (a ? b + Math.abs(d - f).toFixed(a).slice(2) : "")
}, $("#depositButton").click(function() {
    $.get("https://api.moneypot.com/v1/deposit-address?access_token=" + access_token, function(a) {
        $("#depositForm").modal("setting", "closable", !1).modal("show"), "undefined" != typeof a.deposit_address ? $("#depositBtcAddy").text(a.deposit_address) : $("#depositBtcAddy").text("Couldn't request a deposit addy. Please, use moneypot.")
    })
}), $("#tipButton").click(function() {
    $("#tippingForm").modal("setting", "closable", !1).modal("show")
}), $("#sendTipButton").click(function() {
    $("#sendTipButton").addClass("loading"), $("#sendTipButton").attr("disabled", !0);
    var a = $("#tipping_username_input").val(),
        b = $("#tipping_amount_input").val(),
        c = confirm("Are you sure to tip " + b + " Bits to " + a + " ?");
    1 == c && b == parseFloat(b) && $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "https://api.moneypot.com/v1/tip?access_token=" + access_token,
        data: JSON.stringify({
            uname: a,
            amount: Math.floor(100 * b)
        }),
        dataType: "json",
        error: function(b, c, d) {
            console.error("[TIP ERROR]", b.responseText), addNewChatMessage({
                created_at: (new Date).toISOString(),
                text: "Error when sending tip to " + a + ": " + b.responseText.error
            })
        }
    }).done(function(c) {
        c.id ? (addNewChatMessage({
            created_at: (new Date).toISOString(),
            text: "Sent " + b + " Bits to " + a
        }), user_balance -= b, $("#balance").text(user_balance.formatMoney(2, ".", ","))) : addNewChatMessage({
            created_at: (new Date).toISOString(),
            text: "Error when sending tip to " + a + ": " + c
        }), $("#tippingForm").modal("hide"), $("#sendTipButton").removeClass("loading"), $("#sendTipButton").attr("disabled", !1), $("#tipping_username_input").val(""), $("#tipping_amount_input").val("")
    })
}), $("#moneypotDepositButton").click(function() {
    var a = "https://www.moneypot.com/dialog/deposit?app_id=2392",
        b = "manage-auth",
        c = "width=420,height=350,left=100,top=100",
        d = window.open(a, b, c);
    d.focus()
}), $("#withdrawButton").click(function() {
    var a = "https://www.moneypot.com/dialog/withdraw?app_id=2392",
        b = "manage-auth",
        c = "width=420,height=350,left=100,top=100",
        d = window.open(a, b, c);
    d.focus()
}), $("#faucetButton").click(function() {
    0 == showingrecaptcha ? ($("#faucetClaimCaptcha").css("top", "10px"), showingrecaptcha = !0, console.log("showing google recaptcha")) : 1 == showingrecaptcha && ($("#faucetClaimCaptcha").css("top", "-90px"), showingrecaptcha = !1, console.log("hiding google recaptcha"))
}), $("#bombsButtons .button").each(function(a) {
    $(this).click(function() {
        $("#bombsButtons .button").each(function() {
            $(this).removeClass("active")
        }), $(this).addClass("active"), 0 === a ? game.bombs = 1 : 1 === a ? game.bombs = 3 : 2 === a ? game.bombs = 5 : 3 === a ? game.bombs = 24 : 4 === a && (game.bombs = parseInt($("#customBombs").val())), $(this).hasClass("customBombsButton") ? $("#customBombsInputArea").css("display", "inline-flex") : $("#customBombsInputArea").css("display", "none")
    })
});
var houseEdge, odds, next;
$("#startNewGameButton").click(function() {
    startNewGame()
}), $("#cashoutButton").click(function() {
    var a = !1;
    if ($(".tile").each(function(b) {
            $(this).hasClass("tileLoading") && (a = !0)
        }), !a) {
        $(this).css("display", "none"), $("#logs").html('<div class="log_item" style="border-left: 4px solid #F39C12;">Cashed out!<br>Profit: <span style="color: #F39C12">' + parseFloat(game.stake).formatMoney(2, ".", ",") + '</span> Bits! <button id="playAgainButton">Play Again</button></div>' + $("#logs").html()), $("#playAgainButton").click(function() {
            $("#playAgainButton").remove(), $("#board").html(boardHtml), $("#customBombs").val(game.bombs), $("#startNewGameButton").click(function() {
                startNewGame()
            }), $("#bombsButtons .button").each(function(a) {
                $(this).click(function() {
                    $("#bombsButtons .button").each(function() {
                        $(this).removeClass("active")
                    }), $(this).addClass("active"), 0 === a ? game.bombs = 1 : 1 === a ? game.bombs = 3 : 2 === a ? game.bombs = 5 : 3 === a ? game.bombs = 24 : 4 === a && (game.bombs = parseInt($("#customBombs").val())), $(this).hasClass("customBombsButton") ? $("#customBombsInputArea").css("display", "inline-flex") : $("#customBombsInputArea").css("display", "none")
                })
            }), game = {
                status: "ENDED",
                profit: game.stake,
                bet: parseFloat(betSave),
                bombs: game.bombs,
                clientSeed: game.clientSeed,
                tilesClicked: 0,
                odds: 0,
                next: 0,
                stake: 0
            }, $("#bet").val(game.bet)
        });
        for (var b = 0; b < game.bombs; b++) {
            var c = [];
            $(".tile").each(function(a) {
                $(this).hasClass("pressed") || $(this).hasClass("reveal") || c.push(a)
            }), roll = Math.floor(Math.random() * c.length) + 1, $(".tile:eq(" + c[roll - 1] + ")").addClass("reveal").html('<i class="icon-alert warning icon"></i>')
        }
        $("#cashoutButton").css("display", "none"), game = {
            status: "ENDED",
            profit: 0 - parseFloat($("#bet").val()),
            bet: parseFloat(betSave),
            bombs: game.bombs,
            clientSeed: game.clientSeed,
            tilesClicked: 0,
            odds: 0,
            next: 0,
            stake: 0
        }, $("#next_value").text(parseFloat(game.next).formatMoney(2, ".", ",")), $("#stake_value").text(parseFloat(game.stake).formatMoney(2, ".", ",")), $(".log_item").each(function(a) {
            a > 5 && $(this).remove()
        }), console.log(game), $(".settingsButon").css("display", "inline-block")
    }
}), $(document).keypress(function(a) {
    if (32 == a.which && $("input:focus").length <= 0)
        if ("IN_PROGRESS" == game.status) $("#cashoutButton").css("display", "none"), $("#logs").html('<div class="log_item" style="border-left: 4px solid #F39C12;">Cashed out!<br>Profit: <span style="color: #F39C12">' + parseFloat(game.stake).formatMoney(2, ".", ",") + "</span> Bits!</div>" + $("#logs").html()), $("#board").html(boardHtml), $("#customBombs").val(game.bombs), $("#startNewGameButton").click(function() {
            startNewGame()
        }), $("#bombsButtons .button").each(function(a) {
            $(this).click(function() {
                $("#bombsButtons .button").each(function() {
                    $(this).removeClass("active")
                }), $(this).addClass("active"), 0 === a ? game.bombs = 1 : 1 === a ? game.bombs = 3 : 2 === a ? game.bombs = 5 : 3 === a ? game.bombs = 24 : 4 === a && (game.bombs = parseInt($("#customBombs").val())), $(this).hasClass("customBombsButton") ? $("#customBombsInputArea").css("display", "inline-flex") : $("#customBombsInputArea").css("display", "none")
            })
        }), game = {
            status: "ENDED_AWAITING",
            profit: game.stake,
            bet: parseFloat(betSave),
            bombs: game.bombs,
            clientSeed: game.clientSeed,
            tilesClicked: 0,
            odds: 0,
            next: 0,
            stake: 0
        }, $("#bet").val(game.bet), $("#next_value").text(parseFloat(game.next).formatMoney(2, ".", ",")), $("#stake_value").text(parseFloat(game.stake).formatMoney(2, ".", ",")), $(".log_item").each(function(a) {
            a > 5 && $(this).remove()
        }), console.log(game), $(".settingsButon").css("display", "inline-block");
        else {
            if ("?" == game.status || "ENDED_AWAITING" == game.status) return void startNewGame();
            $("#playAgainButton").remove(), $("#board").html(boardHtml), $("#customBombs").val(game.bombs), $("#startNewGameButton").click(function() {
                startNewGame()
            }), $("#bombsButtons .button").each(function(a) {
                $(this).click(function() {
                    $("#bombsButtons .button").each(function() {
                        $(this).removeClass("active")
                    }), $(this).addClass("active"), 0 === a ? game.bombs = 1 : 1 === a ? game.bombs = 3 : 2 === a ? game.bombs = 5 : 3 === a ? game.bombs = 24 : 4 === a && (game.bombs = parseInt($("#customBombs").val())), $(this).hasClass("customBombsButton") ? $("#customBombsInputArea").css("display", "inline-flex") : $("#customBombsInputArea").css("display", "none")
                })
            }), game = {
                status: "ENDED_AWAITING",
                profit: game.stake,
                bet: parseFloat(betSave),
                bombs: game.bombs,
                clientSeed: game.clientSeed,
                tilesClicked: 0,
                odds: 0,
                next: 0,
                stake: 0
            }, $("#bet").val(game.bet)
        }
}), $("#balanceRefreshButton").click(function() {
    $("#balanceRefreshIcon").addClass("loading"), $.getJSON("https://api.moneypot.com/v1/auth?access_token=" + access_token, function(a) {
        $("#balanceRefreshIcon").removeClass("loading"), $("#balance").text((a.user.balance / 100).formatMoney(2, ".", ",")), user_balance = a.user.balance / 100, addNewChatMessage({
            created_at: (new Date).toISOString(),
            text: "Balance refreshed! Amount: " + (a.user.balance / 100).formatMoney(2, ".", ",") + " Bits"
        })
    })
}), $(".viewMyBetsButton").click(function() {
    console.log("Loading My bets history..."), $("#game_jackpotwinners_log").css("display", "none"), $("#game_mybets_log").css("display", "block"), $("#game_allbets_log").css("display", "none")
}), $(".viewAllBetsButton").click(function() {
    console.log("Loading All bets history..."), $("#game_jackpotwinners_log").css("display", "none"), $("#game_mybets_log").css("display", "none"), $("#game_allbets_log").css("display", "block")
}), $(".viewJackpotWinnersButton").click(function() {
    console.log("Loading Jackpot winners history..."), $("#game_jackpotwinners_log").css("display", "block"), $("#game_mybets_log").css("display", "none"), $("#game_allbets_log").css("display", "none")
}), $("#logoutButton").click(function() {
    "undefined" != typeof $.session.get("session_access_token") && $.session.remove("session_access_token"), window.location.href = "/"
}), $("#jackpot_help_button").click(function() {
    $("#jackpotHelpModal").modal("show")
});
