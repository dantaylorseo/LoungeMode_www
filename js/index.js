var app = {
initialize: function() {
    this.bindEvents();
},
bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    document.addEventListener('offline', this.onOffline, false);
    document.addEventListener('online', this.onOnline, false);
},
onOnline: function () {
    $(function() {
      function errorCB(err) {
      console.log("Error processing SQL: ");
      console.log(err.message);
      }
      
      // NOTE TO DAN: You need to pass a last sync date to the Ajax Query and then do an INSERT OR REPLACE
      
      console.log('Online');
      
      
      
      });
},
onOffline: function() {
    $(function() {
      console.log('Offline');
      });
},
onDeviceReady: function() {
    console.log(device.platform);
    
    function checkConnection() {
        var networkState = navigator.connection.type;
        
        var states = {};
        states[Connection.UNKNOWN]  = 0;
        states[Connection.ETHERNET] = 6;
        states[Connection.WIFI]     = 5;
        states[Connection.CELL_2G]  = 2;
        states[Connection.CELL_3G]  = 3;
        states[Connection.CELL_4G]  = 4;
        states[Connection.CELL]     = 1;
        states[Connection.NONE]     = 0;
        
        return states[networkState];
    }
    
    IAP.initialize();
            IAP.render = function() {
                if (IAP.loaded) {
                    var render = "";
                    console.log(IAP.list);
                    console.log(IAP.products);
                    var index = 0;
                    var buttonStyle = "display:inline-block; padding: 2px 10px; border: 1px solid #fff; float: right; font-size: 0.8em;";
                    for (var title in IAP.products) {
                        var p = IAP.products[title];
                        render += "<li><a id='buy-" + index + "' class='buyLeague' productId='" + p.id + "' type='button'>" + p.title + "<span class='ui-li-count " + p.id + "'>" + p.price + "</span></a>" + "</li>";
                        ++index;
                    }
                    $("#in-app-purchase-list").html(render).listview("refresh");
                    //alert($("#buyleagues").html());
                } else {
                    $("#in-app-purchase-list").html("In-App Purchases not available").trigger("create");
                }
            };
    
    var addtodb = function(toAdd, addmess, userID) {
                console.log('user: '+userID+' - To add: '+toAdd);
                
                var query = 'UPDATE users SET userPaid= userPaid + '+toAdd+' WHERE userID="'+userID+'"';
                
                db.transaction(
                    function(tx) {
                        console.log('Succesfully added');
                        tx.executeSql(query, [], outputCredits, errorCB);
                    }, errorCB
                );
            };
    function outputCredits() {
        var query2 = 'SELECT userPaid FROM users WHERE userID="'+window.localStorage.user_id+'"';
        db.transaction(
            function(tx) {
                tx.executeSql(query2, [], function(tx, rs) {
                    console.log('Credits: '+rs.rows.item(0).userPaid);
                    window.localStorage.user_credits = rs.rows.item(0).userPaid;
                    $('.userCredits').html(rs.rows.item(0).userPaid);
                }, errorCB);  
            }, errorCB
        );
    }
    IAP.updateDB = function(productId) {
                var toAdd = 0;
                var addmess = '';
                switch (productId) {
                    case 'de.loungemo.1league':
                        toAdd = 1;
                        addmess = '1 League';
                        break;
                    case 'de.loungemo.5leagues':
                        toAdd = 5;
                        addmess = '5 Leagues';
                        break;
                    case 'de.loungemo.9leagues':
                        toAdd = 10;
                        addmess = '10 Leagues';
                        break;
                    default:
                        break;
                }
                addtodb(toAdd, addmess, window.localStorage["user_id"]);
            };
    
    function download_email(email) {
        $.ajax({
               type: 'GET',
               url: 'http://loungemo.de/ajax/app-download-users.php',
               dataType: 'json',
               data: 'email='+email,
               success: function(data) {
               var result = {};
               var db = window.openDatabase("lounge_db", "1.0", "LoungeMode DB", 200000);
               $.each(data, function(k) {
                      
                      var userEmail = this.userEmail;
                      var userPass = this.userPass;
                      var userID = k;
                      
                      
                      db.transaction(function(tx) {
                                     tx.executeSql('INSERT OR IGNORE INTO users (userID, userEmail, userPass, userSync) VALUES ("'+userID+'", "'+userEmail+'","'+userPass+'",1)', [],
                                                   function(tx, rs) {
                                                   console.log('user id: '+userID+ ' inserted');
                                                   });
                                     }, errorCB);
                      
                      });
               }
               });
    }
    
    $('body').addClass(device.platform);
    
    if (window.plugins && window.plugins.iAd && device.platform == 'iOS') {
        window.plugins.iAd.createBannerView({
                                            'bannerAtTop': false,
                                            'overlap': true,
                                            'offsetTopBar': false
                                            }, function() {
                                            window.plugins.iAd.showAd(true);
                                            }, function() {
                                            console.log("failed to create ad view");
                                            });
    } else {
        console.log('iAd plugin not available/ready.');
    }
    
    $.mobile.defaultPageTransition = 'none';
    
    /*$(document).ajaxStart(function() {
     $.mobile.loading('show');
     });
     
     $(document).ajaxStop(function() {
     $.mobile.loading('hide');
     });*/
    
    FastClick.attach(document.body);
    
    $('[data-role="header"]').toolbar();
    $("#nav-panel").enhanceWithin().panel();
    
    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                                                                  var r = (d + Math.random()*16)%16 | 0;
                                                                  d = Math.floor(d/16);
                                                                  return (c=='x' ? r : (r&0x7|0x8)).toString(16);
                                                                  });
        return uuid;
    };
    
    function populateDB(tx) {
        // Drop tables - remove in production
         /*tx.executeSql('DROP TABLE IF EXISTS games');
         tx.executeSql('DROP TABLE IF EXISTS leagues');
         tx.executeSql('DROP TABLE IF EXISTS results');
         tx.executeSql('DROP TABLE IF EXISTS teams');
         tx.executeSql('DROP TABLE IF EXISTS users');
         window.localStorage.removeItem("user_id");
         window.localStorage.clear();
         $("body").pagecontainer("change", "#login");*/
        
        // Create tables
        tx.executeSql('CREATE TABLE IF NOT EXISTS games (gameID TEXT PRIMARY KEY,gameHome TEXT, gameAway TEXT, gameDate TEXT, gameLeague TEXT, gameMatch INT, gameStatus INTEGER DEFAULT "0")');
        tx.executeSql('CREATE TABLE IF NOT EXISTS leagues (leagueID TEXT PRIMARY KEY, leagueType INT, leagueUser TEXT, leagueName TEXT, leaguePlays INT, leagueDeleted INT, leagueCreated TEXT DEFAULT CURRENT_TIMESTAMP)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS results (resultID TEXT PRIMARY KEY, resultHome INT, resultAway INT, resultGame TEXT, resultResult INT, resultLeague TEXT )');
        tx.executeSql('CREATE TABLE IF NOT EXISTS teams (teamID TEXT PRIMARY KEY, teamName TEXT, teamCoach TEXT, teamLeague TEXT, teamUser TEXT )');
        tx.executeSql('CREATE TABLE IF NOT EXISTS users (userID TEXT PRIMARY KEY, userName TEXT, userPass TEXT, userType INT, userEmail TEXT, userFname TEXT, userLname TEXT, userCreated TEXT DEFAULT CURRENT_TIMESTAMP, userNews INT, userCountry TEXT, userActive INT DEFAULT "1", userPaid INT DEFAULT "5", userSync INTEGER DEFAULT "0" )');
        
    }
    
    function errorCB(err) {
        console.log("Error processing SQL: ");
        console.log(err.message);
    }
    
    function successCB() {
        console.log("success!");
    }
    
    var db = window.openDatabase("lounge_db", "1.0", "LoungeMode DB", 200000);
    db.transaction(populateDB, errorCB, successCB);
    
    function renderLeagueList(user) {
        var leagueQuery = 'SELECT l.leagueName, l.leagueID, COUNT(t.teamID) noteams FROM leagues l INNER JOIN teams t ON t.teamLeague  = l.leagueID WHERE leagueUser="' + user + '" GROUP BY l.leagueID ORDER BY leagueCreated DESC';
        console.log(leagueQuery);
        db.transaction(
                       function(tx) {
                       tx.executeSql(leagueQuery, [], renderLeagues, errorCB);
                       }
                       )
        
        function renderLeagues(tx, rs) {
            var rowOutput = "";
            var rowOutput2 = "";
            for (var i = 0; i < rs.rows.length; i++) {
                console.log(rs.rows.item(i));
                rowOutput += renderLeagueRow(rs.rows.item(i));
                rowOutput2 += renderNewLeagueRow(rs.rows.item(i));
            }
            $(".listLeagues").html(rowOutput).trigger("create");
            $(".listNewLeagues").html(rowOutput2).trigger("create");
        }
        
        function renderLeagueRow(row) {
            var output = '<li data-role="collapsible" data-iconpos="right" data-inset="false"><h2>' + row.leagueName + '</h2>';
            output += '<ul data-role="listview" data-theme="c">';
            output += '<li><a href="#" class="viewleague" rel="' + row.leagueID + '">View <span class="hideiphone">' + row.leagueName + ' </span>Table</a></li>';
            output += '<li><a href="#" class="viewfixtures" rel="' + row.leagueID + '"><span class="hideiphone">' + row.leagueName + ' </span> League Fixtures</a></li>';
            output += '<li><a href="#" class="playleague" rel="' + row.leagueID + '">Play League <span class="hideiphone">' + row.leagueName + '</span></a></li>';
            output += '<li><a href="#" class="deleteleague" rel="' + row.leagueID + '">Delete League <span class="hideiphone">' + row.leagueName + '</span></a></li>';
            output += '<li class="hideiphone"><a href="#" class="viewleague" rel="' + row.leagueID + '">Live View Output</a></li>';
            output += '</ul>';
            output += '</li>';
            
            return output;
        }
        
        function renderNewLeagueRow(row) {
            
            var percent = row.nores / row.nogames * 100;
            var output = '<li data-iconpos="right" data-inset="false"><a href="#" rel="' + row.leagueID + '" >' + row.leagueName + '<br>' + row.noteams + ' Teams - ' + percent + '% Played</a></li>';
            return output;
        }
    }
    
    function isEven(value) {
        if (value % 2 == 0) return true;
        else return false;
    }
    
    function shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    
    function team_name(num, names) {
        var i = num - 1;
        
        return names[i];
    }
    
    function flip(input) {
        var output = [];
        var i;
        for (i = 0; i < input.length; i++) {
            for (var n = 0; n < input[i].length; n++) {
                var data = input[i][n]['home'];
                var data2 = input[i][n]['away'];
                output.push({
                            away: data,
                            home: data2
                            });
            }
        }
        return output.reverse();
    }
    
    function build_fixtures(league) {
        var names = [];
        var query = 'SELECT leagueID, teamID, leaguePlays FROM leagues AS l INNER JOIN teams AS t ON t.teamLeague = l.leagueID WHERE l.leagueID = "' + league + '" ORDER BY t.teamName ASC';
        var plays = '';
        
        db.transaction(
                       function(tx) {
                       tx.executeSql(query, [],
                                     function(tx, rs) {
                                     var len = rs.rows.length;
                                     for (var i = 0; i < len; i++) {
                                     //console.log(rs.rows.item(i).teamID);
                                     names.push(rs.rows.item(i).teamID);
                                     plays = rs.rows.item(i).leaguePlays;
                                     }
                                     output_fixtures(league, names, plays);
                                     }, errorCB);
                       });
    }
    
    function output_fixtures(league, names, plays) {
        var teams = names.length;
        //console.log(names);
        shuffle(names);
        shuffle(names);
        console.log(plays);
        var ghost = false;
        if (teams % 2 == 1) {
            teams++;
            ghost = true;
            names.push('--ghost--');
        }
        
        var totalRounds = teams - 1;
        var matchesPerRound = teams / 2;
        var roundarray = [];
        
        for (var i = 0; i < totalRounds; i++) {
            roundarray[i] = [];
        }
        var ht = '';
        var at = '';
        var counter =1;
        for (var round = 0; round < totalRounds; round++) {
            for (var match = 0; match < matchesPerRound; match++) {
                var home = (round + match) % (teams - 1);
                var away = (teams - 1 - match + round) % (teams - 1);
                if (match == 0) {
                    away = teams - 1;
                }
                
                if (round == 0) {
                    roundarray[round][match] = {
                    home: team_name(home + 1, names),
                    away: team_name(away + 1, names),
                    match: counter
                    };
                    
                } else {
                    roundarray[round][match] = {
                    away: team_name(home + 1, names),
                    home: team_name(away + 1, names),
                    match: counter
                    };
                }
                counter++;
            }
        }
        //console.log(roundarray);
        interleaved = [];
        for (var i = 0; i < totalRounds; i++) {
            interleaved[i] = [];
        }
        
        var evn = 0;
        var odd = (teams / 2);
        for (var i = 0; i < roundarray.length; i++) {
            if (i % 2 == 0) {
                interleaved[i] = roundarray[evn++];
            } else {
                interleaved[i] = roundarray[odd++];
            }
        }
        
        roundarray = interleaved;
        console.log(roundarray);
        var mt = '';
        var mt2 ='';
        var insquery = new Array();
        for (var k = 0; k < plays; k++) {
            console.log(k);
            if (isEven(k) || k == 0) {
                db.transaction(
                               function(tx) {
                               for (var i = 0; i < roundarray.length; i++) {
                               var gamearray = roundarray[i];
                               for (var n = 0; n < gamearray.length; n++) {
                               var teamarray = gamearray[n];
                               console.log(teamarray);
                               //console.log('home: '+home+', away: '+away+', league: '+league);
                               
                               ht = teamarray['home'];
                               at = teamarray['away'];
                               mt = teamarray['match'];
                               if (ht != '--ghost--' && at != '--ghost--') {
                               //console.log('home: '+ht+', away: '+at+', league: '+league);
                               insert_fixture(tx, ht, at, mt, league);
                               }
                               }
                               
                               
                               }
                               
                               }
                               );
            } else {
                var secondarray = flip(roundarray);
                db.transaction(
                               function(tx2) {
                               for (var z = secondarray.length - 1; z >= 0; z--) {
                               var gamearray2 = secondarray[z];
                               //console.log('home: '+home+', away: '+away+', league: '+league);
                               ht2 = gamearray2['home'];
                               at2 = gamearray2['away'];
                               mt2 = gamearray2['match'];
                               if (ht2 != '--ghost--' && at2 != '--ghost--') {
                               //console.log('home: '+ht+', away: '+at+', league: '+league);
                               insert_fixture(tx2, ht2, at2, mt2, league);
                               }
                               }
                               
                               }
                               );
            }
        }
        goto_fixtures(league);
    }
    
    function insert_fixture(tx, ht1, at1, mt, league) {
        var gameID = generateUUID();
        var matchno = parseInt(mt);
        tx.executeSql('INSERT INTO games (gameID, gameLeague, gameHome, gameAway, gameMatch, gameStatus) VALUES (?,?,?,?,?,0)', [gameID, league, ht1, at1, matchno],
                      function(tx, rs) {
                      console.log('home: '+ht1+', away: '+at1+', league: '+league+', match: '+matchno);
                      var data = {
                      gameid : gameID,
                      leagueid : league,
                      home: ht1,
                      away: at1
                      }
                      syncNewFixture(data);
                      }, errorCB);
    }
    
    function goto_fixtures(league) {
        console.log(league);
        var output = '';
        var fixquery = 'SELECT l.leagueID, l.leagueName, home.teamName AS homeTeam, away.teamName AS awayTeam, home.teamCoach AS homeCoach, away.teamCoach AS awayCoach, games.gameHome AS homeID, games.gameAway AS awayID, games.gameID AS gameID, results.resultHome AS homeScore, results.resultAway AS awayScore FROM  leagues AS l INNER JOIN games AS games ON l.leagueID = games.gameLeague INNER JOIN teams AS home ON games.gameHome = home.teamID INNER JOIN teams AS away ON games.gameAway = away.teamID LEFT JOIN results AS results ON results.resultGame = games.gameID WHERE l.leagueID = "' + league + '" ORDER BY  games.gameMatch ASC';
        //console.log(fixquery);
        db.transaction(
                       function(tx) {
                       tx.executeSql(fixquery, [],
                                     function(tx, rs) {
                                     var n = 0;
                                     
                                     for (var i = 0; i < rs.rows.length; i++) {
                                     var leaguename = rs.rows.item(i).leagueName;
                                     var leagueID = rs.rows.item(i).leagueID;
                                     var classn = '';
                                     if (rs.rows.item(i).homeScore == null && rs.rows.item(i).awayScore == null) {
                                         classn += '';
                                     } else {
                                         classn += ' played ';
                                     }
                                     if (n == 0) {
                                        n++;
                                     } else {
                                        classn += ' alt ';
                                        n = 0;
                                     }
                                     output += '<tr class="'+classn+'">';
                                     output += '<td class="teamname">' + rs.rows.item(i).homeTeam + '<small>'+rs.rows.item(i).homeCoach+'</small></td><td> v </td><td class="teamname">' + rs.rows.item(i).awayTeam + '<small>'+rs.rows.item(i).awayCoach+'</small></td>';
                                     if (rs.rows.item(i).homeScore == null && rs.rows.item(i).awayScore == null) {
                                     
                                     output += '<td><a class="playfixture ui-btn" rel="'+rs.rows.item(i).gameID+'" href="#">Play</a></td>';
                                     } else {
                                     output += '<td class="result" league="'+league+'" rel="'+rs.rows.item(i).gameID+'">' + rs.rows.item(i).homeScore + ' - ' + rs.rows.item(i).awayScore + '</td>';
                                     }
                                     output += '</tr>';
                                     }
                                     $("#fixturebody").html('').html(output).trigger("create");
                                     $("#viewfixtures h1.title").remove();
                                     $(".leagueName").html(leaguename);
                                     $(".playlgetable").attr("rel", leagueID);
                                     $(".viewfixtable").attr("rel", leagueID);
                                     $("body").pagecontainer("change", "#viewfixtures");
                                     }, errorCB);
                       });
        
    }
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    
    function isEmpty(obj) {
        
        // null and undefined are "empty"
        if (obj == null) return true;
        
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0) return false;
        if (obj.length === 0) return true;
        
        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }
        
        return true;
    }
    function play_reg_league(league) {
		db.transaction(
                       function(tx) {
                       tx.executeSql('SELECT away.teamName AS awayTeam,home.teamName AS homeTeam,home.teamID AS homeID,away.teamID AS awayID,g.gameID,l.leagueID,l.leagueType, l.leagueName, g.gameStatus="0" FROM leagues AS l INNER JOIN games AS g ON g.gameLeague = l.leagueID INNER JOIN teams AS home ON g.gameHome = home.teamID INNER JOIN teams AS away ON g.gameAway = away.teamID WHERE l.leagueID = "' + league + '" AND g.gameStatus = 0 ORDER BY g.gameMatch ASC LIMIT 1', [],
                                     function(tx, rs) {
                                     var output = '';
                                     if (isEmpty(rs.rows)) {
                                     output += '<p>All games have been played</p>';
                                     } else {
                                     output += '<h1>' + rs.rows.item(0).leagueName + '</h1>';
                                     output += '<div class="homeplay">';
                                     output += '<label>' + rs.rows.item(0).homeTeam + '</label>';
                                     output += '<input class="text score" name="homeScore" rel="' + rs.rows.item(0).homeID + '" type="text" pattern="[0-9]*" value="0"  />';
                                     output += '</div><div class="awayplay">';
                                     output += '<label>' + rs.rows.item(0).awayTeam + '</label>';
                                     output += '<input class="text score" name="awayScore" rel="' + rs.rows.item(0).awayID + '" type="text" pattern="[0-9]*" value="0"  />';
                                     output += '</div>';
                                     output += '<p class="addbtn"><input type="submit" value="Add Score" data-theme="a" id="submit" /></p>';
                                     output += '<input type="hidden" name="leagueID" value="' + league + '" />';
                                     output += '<input type="hidden" name="gameID" value="' + rs.rows.item(0).gameID + '" />';
                                     output += '<input type="hidden" name="skipGame" id="skipGame" value="0" />';
                                     output += '<input type="hidden" name="leagueType" value="' + rs.rows.item(0).leagueType + '" />';
                                     output += '<input type="hidden" name="homeID" value="' + rs.rows.item(0).homeID + '" />';
                                     output += '<input type="hidden" name="awayID" value="' + rs.rows.item(0).awayID + '" />';
                                     console.log(output);
                                     }
                                     $("#playLeague").html(output).trigger("create");
                                     $("body").pagecontainer("change", "#playleague");
                                     }, errorCB);
                       }
                       );	
	}
	
	function play_one_league(league) {
		console.log('SELECT teamName, teamCoach, leagueID, leagueName, leagueType, teamID FROM leagues INNER JOIN teams ON teamLeague = leagueID WHERE leagueID = "'+league+'" ORDER BY teamName ASC');
		db.transaction(
			function(tx) {
				tx.executeSql('SELECT teamName, teamCoach, leagueID, leagueName, leagueType, teamID FROM leagues INNER JOIN teams ON teamLeague = leagueID WHERE leagueID = "'+league+'" ORDER BY teamName ASC', [], function (tx, rs) {
				var output = '';
				if (isEmpty(rs.rows)) {
					output += '<p>All games have been played</p>';
				} else {
					output += '<h1>' + rs.rows.item(0).leagueName + '</h1>';
					output += '<div class="homeplay">';
					output += '<label>' + rs.rows.item(0).teamName + '</label>';
					output += '<input class="text score" name="homeScore" rel="' + rs.rows.item(0).teamID + '" type="text" pattern="[0-9]*" value="0"  />';
					output += '</div><div class="awayplay">';
					output += '<label>' + rs.rows.item(1).teamName + '</label>';
					output += '<input class="text score" name="awayScore" rel="' + rs.rows.item(1).teamID + '" type="text" pattern="[0-9]*" value="0"  />';
					output += '</div>';
					output += '<p class="addbtn"><input type="submit" value="Add Score" data-theme="a" id="submit" /></p>';
					output += '<input type="hidden" name="leagueID" value="' + league + '" />';
					//output += '<input type="hidden" name="gameID" value="' + rs.rows.item(0).gameID + '" />';
					output += '<input type="hidden" name="skipGame" id="skipGame" value="0" />';
					output += '<input type="hidden" name="leagueType" value="' + rs.rows.item(0).leagueType + '" />';
					output += '<input type="hidden" name="homeID" value="' + rs.rows.item(0).teamID + '" />';
					output += '<input type="hidden" name="awayID" value="' + rs.rows.item(1).teamID + '" />';
					console.log(output);
				}
				$("#playLeague").html(output).trigger("create");
				$("body").pagecontainer("change", "#playleague");
				}, errorCB);
			}
		);
	}
	
	function play_adhoc_league(league) {
		console.log('SELECT teamName, teamCoach, leagueID, leagueName, leagueType, teamID FROM leagues INNER JOIN teams ON teamLeague = leagueID WHERE leagueID = "'+league+'" ORDER BY teamName ASC');
		db.transaction(
			function(tx) {
				tx.executeSql('SELECT teamName, teamCoach, leagueID, leagueName, leagueType, teamID FROM leagues INNER JOIN teams ON teamLeague = leagueID WHERE leagueID = "'+league+'" ORDER BY teamName ASC', [], function (tx, rs) {
				var output = '';
				if (isEmpty(rs.rows)) {
					output += '<p>All games have been played</p>';
				} else {
					output += '<h1>' + rs.rows.item(0).leagueName + '</h1>';
					output += '<div class="homeplay">';
					//output += '<label>' + rs.rows.item(0).teamName + '</label>';
					output += '<select id="adhochome" name="homeID"><option value="0" disabled selected>Select Home Team</option>';
					for (var n = 0; n < rs.rows.length; n++) {
						output += '<option value="'+rs.rows.item(n).teamID+'">'+rs.rows.item(n).teamName+'</option>';	
					}	
					output += '</select>';				
					output += '<input class="text score" name="homeScore" rel="' + rs.rows.item(0).teamID + '" type="text" pattern="[0-9]*" value="0"  />';
					output += '</div><div class="awayplay">';
					//output += '<label>' + rs.rows.item(1).teamName + '</label>';
					output += '<select id="adhocaway" name="awayID"><option id="selhome" value="0" disabled>Select Home Team First</option>';
					output += '</select>';	
					output += '<input class="text score" name="awayScore" rel="' + rs.rows.item(1).teamID + '" type="text" pattern="[0-9]*" value="0"  />';
					output += '</div>';
					output += '<p class="addbtn"><input type="submit" value="Add Score" data-theme="a" id="submit" /></p>';
					output += '<input type="hidden" name="leagueID" id="adhocleagueid" value="' + league + '" />';
					//output += '<input type="hidden" name="gameID" value="' + rs.rows.item(0).gameID + '" />';
					output += '<input type="hidden" name="skipGame" id="skipGame" value="0" />';
					output += '<input type="hidden" name="leagueType" value="' + rs.rows.item(0).leagueType + '" />';
					console.log(output);
				}
				$("#playLeague").html(output).trigger("create");
				$("body").pagecontainer("change", "#playleague");
				}, errorCB);
			}
		);
	}
	
    function play_league(league) {
		db.transaction(
			function(tx) {
				tx.executeSql('SELECT leagueType FROM leagues WHERE leagueID="'+league+'"', [], function(tx, rs) {
						if(rs.rows.item(0).leagueType == 1) {
							 play_one_league(league);	
						} else if(rs.rows.item(0).leagueType == 2) {
							 play_reg_league(league);	
						} else if(rs.rows.item(0).leagueType == 3) {
							 play_adhoc_league(league);	
						}
					}, errorCB
				)
			}, errorCB
		);
        
    }
    
    function play_game(game) {
        db.transaction(
                       function(tx) {
                       tx.executeSql('SELECT away.teamName AS awayTeam,home.teamName AS homeTeam,home.teamID AS homeID,away.teamID AS awayID,g.gameID,l.leagueID,l.leagueType, l.leagueName, g.gameStatus="0" FROM leagues AS l INNER JOIN games AS g ON g.gameLeague = l.leagueID INNER JOIN teams AS home ON g.gameHome = home.teamID INNER JOIN teams AS away ON g.gameAway = away.teamID WHERE g.gameID = "' + game + '" AND g.gameStatus = 0 ORDER BY g.gameMatch ASC LIMIT 1', [],
                                     function(tx, rs) {
                                     var output = '';
                                     if (isEmpty(rs.rows)) {
                                     output += '<p>All games have been played</p>';
                                     } else {
                                     output += '<h1>' + rs.rows.item(0).leagueName + '</h1>';
                                     output += '<div class="homeplay">';
                                     output += '<label>' + rs.rows.item(0).homeTeam + '</label>';
                                     output += '<input class="text score" name="homeScore" rel="' + rs.rows.item(0).homeID + '" type="text" pattern="[0-9]*" value="0"  />';
                                     output += '</div><div class="awayplay">';
                                     output += '<label>' + rs.rows.item(0).awayTeam + '</label>';
                                     output += '<input class="text score" name="awayScore" rel="' + rs.rows.item(0).awayID + '" type="text" pattern="[0-9]*" value="0"  />';
                                     output += '</div>';
                                     output += '<p class="addbtn"><input type="submit" value="Add Score" data-theme="a" id="submit" /></p>';
                                     output += '<input type="hidden" name="leagueID" value="' + rs.rows.item(0).leagueID + '" />';
                                     output += '<input type="hidden" name="gameID" value="' + rs.rows.item(0).gameID + '" />';
                                     output += '<input type="hidden" name="skipGame" id="skipGame" value="0" />';
                                     output += '<input type="hidden" name="leagueType" value="' + rs.rows.item(0).leagueType + '" />';
                                     output += '<input type="hidden" name="homeID" value="' + rs.rows.item(0).homeID + '" />';
                                     output += '<input type="hidden" name="awayID" value="' + rs.rows.item(0).awayID + '" />';
                                     console.log(output);
                                     }
                                     $("#playLeague").html(output).trigger("create");
                                     $("body").pagecontainer("change", "#playleague");
                                     }, errorCB);
                       }
                       );
    }
    
    function add_reg_score(league, game, homescore, awayscore) {
        db.transaction(
                       function(tx) {
                       // Work out who won
                       var winner = '';
                       if (awayscore < homescore) {
                       winner = 1;
                       } else if (homescore < awayscore) {
                       winner = 2;
                       } else {
                       winner = 3;
                       }
                       var query = "INSERT INTO results (resultID, resultGame, resultHome, resultAway, resultResult, resultLeague) VALUES (?,?,?,?,?,?)";
                       console.log(query);
					   var resultID = generateUUID();
                       tx.executeSql(query, [resultID, game, homescore, awayscore, winner, league], function(tx, rs) {
                                     console.log('Done 1');
                                     var data = {
                                     game: game,
                                     homescore: homescore,
                                     awayscore: awayscore,
                                     winner: winner
                                     }
                                     syncNewScore(data);
                                     db.transaction(
                                                    function(tx2) {
                                                    var query2 = "UPDATE games SET gameStatus=1 WHERE gameID=?";
                                                    console.log(query2);
                                                    tx2.executeSql(query2, [game], function(tx2, rs) {
                                                                   console.log('Done 2');
                                                                   play_league(league);
                                                                   }, errorCB);
                                                    }
                                                    );
                                     }, errorCB);
                       }
                       );
        
    }
	function delete_score(game, league) {
        db.transaction(
            function(tx) {
                var query = "DELETE FROM results WHERE resultGame='"+game+"'";
                tx.executeSql(query, [], function(tx, rs) {
                    db.transaction(
                        function(tx2) {
                            var query2 = "UPDATE games SET gameStatus=0 WHERE gameID='"+game+"'";
                            console.log(query2);
                            tx2.executeSql(query2, [], function(tx2, rs2) {
                                goto_fixtures(league);    
                            });
                        }, errorCB
                    );
                });
            }, errorCB
        );
    }
	function add_one_score(league, homeID, awayID, homescore, awayscore) {
        db.transaction(
                       function(tx) {
                       // Work out who won
                       var winner = '';
                       if (awayscore < homescore) {
                       winner = 1;
                       } else if (homescore < awayscore) {
                       winner = 2;
                       } else {
                       winner = 3;
                       }
                       
					   var query = "INSERT INTO games (gameID, gameLeague, gameHome, gameAway, gameStatus) VALUES (?, ?, ?, ?, ?)";
					   var gameID = generateUUID();
					   
					   tx.executeSql(query, [gameID, league, homeID, awayID, 1], function(tx, rs) {
							var query2 = "INSERT INTO results (resultID, resultGame, resultHome, resultAway, resultResult) VALUES (?,?,?,?,?)"; 
							var resultID = generateUUID();
							tx.executeSql(query2, [resultID, gameID, homescore, awayscore, winner], function(tx, rs) { 
								var data = {
									 game: gameID,
									 result: resultID,
									 league: league,
									 homescore: homescore,
									 awayscore: awayscore,
									 winner: winner
								}
                                syncNewScore(data);
								output_league(league);
							}, errorCB);
					   }, errorCB);
                       }
                    );
        
    }
    
    function array_multisort(arr) {
        
        var g, i, j, k, l, sal, vkey, elIndex, lastSorts, tmpArray, zlast;
        
        var sortFlag = [0];
        var thingsToSort = [];
        var nLastSort = [];
        var lastSort = [];
        // possibly redundant
        var args = arguments;
        
        var flags = {
            'SORT_REGULAR': 16,
            'SORT_NUMERIC': 17,
            'SORT_STRING': 18,
            'SORT_ASC': 32,
            'SORT_DESC': 40
        };
        
        var sortDuplicator = function(a, b) {
            return nLastSort.shift();
        };
        
        var sortFunctions = [
                             [
                              
                              function(a, b) {
                              lastSort.push(a > b ? 1 : (a < b ? -1 : 0));
                              return a > b ? 1 : (a < b ? -1 : 0);
                              },
                              function(a, b) {
                              lastSort.push(b > a ? 1 : (b < a ? -1 : 0));
                              return b > a ? 1 : (b < a ? -1 : 0);
                              }
                              ],
                             [
                              
                              function(a, b) {
                              lastSort.push(a - b);
                              return a - b;
                              },
                              function(a, b) {
                              lastSort.push(b - a);
                              return b - a;
                              }
                              ],
                             [
                              
                              function(a, b) {
                              lastSort.push((a + '') > (b + '') ? 1 : ((a + '') < (b + '') ? -1 : 0));
                              return (a + '') > (b + '') ? 1 : ((a + '') < (b + '') ? -1 : 0);
                              },
                              function(a, b) {
                              lastSort.push((b + '') > (a + '') ? 1 : ((b + '') < (a + '') ? -1 : 0));
                              return (b + '') > (a + '') ? 1 : ((b + '') < (a + '') ? -1 : 0);
                              }
                              ]
                             ];
        
        var sortArrs = [
                        []
                        ];
        
        var sortKeys = [
                        []
                        ];
        
        // Store first argument into sortArrs and sortKeys if an Object.
        // First Argument should be either a Javascript Array or an Object, otherwise function would return FALSE like in PHP
        if (Object.prototype.toString.call(arr) === '[object Array]') {
            sortArrs[0] = arr;
        } else if (arr && typeof arr === 'object') {
            for (i in arr) {
                if (arr.hasOwnProperty(i)) {
                    sortKeys[0].push(i);
                    sortArrs[0].push(arr[i]);
                }
            }
        } else {
            return false;
        }
        
        // arrMainLength: Holds the length of the first array. All other arrays must be of equal length, otherwise function would return FALSE like in PHP
        //
        // sortComponents: Holds 2 indexes per every section of the array that can be sorted. As this is the start, the whole array can be sorted.
        var arrMainLength = sortArrs[0].length;
        var sortComponents = [0, arrMainLength];
        
        // Loop through all other arguments, checking lengths and sort flags of arrays and adding them to the above variables.
        var argl = arguments.length;
        for (j = 1; j < argl; j++) {
            if (Object.prototype.toString.call(arguments[j]) === '[object Array]') {
                sortArrs[j] = arguments[j];
                sortFlag[j] = 0;
                if (arguments[j].length !== arrMainLength) {
                    return false;
                }
            } else if (arguments[j] && typeof arguments[j] === 'object') {
                sortKeys[j] = [];
                sortArrs[j] = [];
                sortFlag[j] = 0;
                for (i in arguments[j]) {
                    if (arguments[j].hasOwnProperty(i)) {
                        sortKeys[j].push(i);
                        sortArrs[j].push(arguments[j][i]);
                    }
                }
                if (sortArrs[j].length !== arrMainLength) {
                    return false;
                }
            } else if (typeof arguments[j] === 'string') {
                var lFlag = sortFlag.pop();
                // Keep extra parentheses around latter flags check to avoid minimization leading to CDATA closer
                if (typeof flags[arguments[j]] === 'undefined' || ((((flags[arguments[j]]) >>> 4) & (lFlag >>> 4)) > 0)) {
                    return false;
                }
                sortFlag.push(lFlag + flags[arguments[j]]);
            } else {
                return false;
            }
        }
        
        for (i = 0; i !== arrMainLength; i++) {
            thingsToSort.push(true);
        }
        
        // Sort all the arrays....
        for (i in sortArrs) {
            if (sortArrs.hasOwnProperty(i)) {
                lastSorts = [];
                tmpArray = [];
                elIndex = 0;
                nLastSort = [];
                lastSort = [];
                
                // If there are no sortComponents, then no more sorting is neeeded. Copy the array back to the argument.
                if (sortComponents.length === 0) {
                    if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
                        args[i] = sortArrs[i];
                    } else {
                        for (k in arguments[i]) {
                            if (arguments[i].hasOwnProperty(k)) {
                                delete arguments[i][k];
                            }
                        }
                        sal = sortArrs[i].length;
                        for (j = 0, vkey = 0; j < sal; j++) {
                            vkey = sortKeys[i][j];
                            args[i][vkey] = sortArrs[i][j];
                        }
                    }
                    delete sortArrs[i];
                    delete sortKeys[i];
                    continue;
                }
                
                // Sort function for sorting. Either sorts asc or desc, regular/string or numeric.
                var sFunction = sortFunctions[(sortFlag[i] & 3)][((sortFlag[i] & 8) > 0) ? 1 : 0];
                
                // Sort current array.
                for (l = 0; l !== sortComponents.length; l += 2) {
                    tmpArray = sortArrs[i].slice(sortComponents[l], sortComponents[l + 1] + 1);
                    tmpArray.sort(sFunction);
                    // Is there a better way to copy an array in Javascript?
                    lastSorts[l] = [].concat(lastSort);
                    elIndex = sortComponents[l];
                    for (g in tmpArray) {
                        if (tmpArray.hasOwnProperty(g)) {
                            sortArrs[i][elIndex] = tmpArray[g];
                            elIndex++;
                        }
                    }
                }
                
                // Duplicate the sorting of the current array on future arrays.
                sFunction = sortDuplicator;
                for (j in sortArrs) {
                    if (sortArrs.hasOwnProperty(j)) {
                        if (sortArrs[j] === sortArrs[i]) {
                            continue;
                        }
                        for (l = 0; l !== sortComponents.length; l += 2) {
                            tmpArray = sortArrs[j].slice(sortComponents[l], sortComponents[l + 1] + 1);
                            // alert(l + ':' + nLastSort);
                            nLastSort = [].concat(lastSorts[l]);
                            tmpArray.sort(sFunction);
                            elIndex = sortComponents[l];
                            for (g in tmpArray) {
                                if (tmpArray.hasOwnProperty(g)) {
                                    sortArrs[j][elIndex] = tmpArray[g];
                                    elIndex++;
                                }
                            }
                        }
                    }
                }
                
                // Duplicate the sorting of the current array on array keys
                for (j in sortKeys) {
                    if (sortKeys.hasOwnProperty(j)) {
                        for (l = 0; l !== sortComponents.length; l += 2) {
                            tmpArray = sortKeys[j].slice(sortComponents[l], sortComponents[l + 1] + 1);
                            nLastSort = [].concat(lastSorts[l]);
                            tmpArray.sort(sFunction);
                            elIndex = sortComponents[l];
                            for (g in tmpArray) {
                                if (tmpArray.hasOwnProperty(g)) {
                                    sortKeys[j][elIndex] = tmpArray[g];
                                    elIndex++;
                                }
                            }
                        }
                    }
                }
                
                // Generate the next sortComponents
                zlast = null;
                sortComponents = [];
                for (j in sortArrs[i]) {
                    if (sortArrs[i].hasOwnProperty(j)) {
                        if (!thingsToSort[j]) {
                            if ((sortComponents.length & 1)) {
                                sortComponents.push(j - 1);
                            }
                            zlast = null;
                            continue;
                        }
                        if (!(sortComponents.length & 1)) {
                            if (zlast !== null) {
                                if (sortArrs[i][j] === zlast) {
                                    sortComponents.push(j - 1);
                                } else {
                                    thingsToSort[j] = false;
                                }
                            }
                            zlast = sortArrs[i][j];
                        } else {
                            if (sortArrs[i][j] !== zlast) {
                                sortComponents.push(j - 1);
                                zlast = sortArrs[i][j];
                            }
                        }
                    }
                }
                
                if (sortComponents.length & 1) {
                    sortComponents.push(j);
                }
                if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
                    args[i] = sortArrs[i];
                } else {
                    for (j in arguments[i]) {
                        if (arguments[i].hasOwnProperty(j)) {
                            delete arguments[i][j];
                        }
                    }
                    
                    sal = sortArrs[i].length;
                    for (j = 0, vkey = 0; j < sal; j++) {
                        vkey = sortKeys[i][j];
                        args[i][vkey] = sortArrs[i][j];
                    }
                    
                }
                delete sortArrs[i];
                delete sortKeys[i];
            }
        }
        return true;
    }
    
    function output_league(league) {
        console.log(league);
        db.transaction(
                       function(tx) {
                       var query = 'SELECT home.teamName AS homeTeam, away.teamName AS awayTeam, home.teamCoach AS homeCoach, away.teamCoach AS awayCoach, result.resultHome AS homeScore, result.resultAway AS awayScore, result.resultResult AS res, g.gameDate AS gameDate, league.leagueName AS leagueName, league.leagueID AS leagueID FROM games AS g INNER JOIN teams AS home ON home.teamID = g.gameHome INNER JOIN teams AS away ON away.teamID = g.gameAway INNER JOIN leagues AS league ON league.leagueID = home.teamLeague LEFT JOIN results AS result ON g.gameID = resultGame WHERE league.leagueID="' + league + '"';
                       
                       console.log(query);
                       
                       tx.executeSql(query, [], function(tx, rs) {
                                     var data = {};
                                     console.log(rs.rows.item);
                                     for (var n = 0; n < rs.rows.length; n++) {
                                     var homeTeam = rs.rows.item(n).homeTeam;
                                     var awayTeam = rs.rows.item(n).awayTeam;
                                     var leagueName = rs.rows.item(n).leagueName;
                                     data[homeTeam] = {
                                     coach: rs.rows.item(n).homeCoach,
                                     win: 0,
                                     loss: 0,
                                     for: 0,
                                     against: 0,
                                     gd: 0,
                                     points: 0,
                                     draw: 0
                                     };
                                     data[awayTeam] = {
                                     coach: rs.rows.item(n).awayCoach,
                                     win: 0,
                                     loss: 0,
                                     for: 0,
                                     against: 0,
                                     gd: 0,
                                     points: 0,
                                     draw: 0
                                     };
                                     var leagueID = rs.rows.item(n).leagueID;
                                     }
                                     for (var i = 0; i < rs.rows.length; i++) {
                                     var homeT = rs.rows.item(i).homeTeam;
                                     var awayT = rs.rows.item(i).awayTeam;
                                     
                                     if (rs.rows.item(i).res == 1) {
                                     
                                     data[homeT].win++;
                                     data[awayT].loss++;
                                     
                                     data[homeT].for = data[homeT].for+rs.rows.item(i).homeScore;
                                     data[homeT].against = data[homeT].against + rs.rows.item(i).awayScore;
                                     data[awayT].for = data[awayT].for+rs.rows.item(i).awayScore;
                                     data[awayT].against = data[awayT].against + rs.rows.item(i).homeScore;
                                     
                                     data[homeT].gd = data[homeT].for-data[homeT].against;
                                     data[awayT].gd = data[awayT].for-data[awayT].against;
                                     
                                     } else if (rs.rows.item(i).res == 2) {
                                     data[awayT].win++;
                                     data[homeT].loss++;
                                     
                                     data[homeT].for = data[homeT].for+rs.rows.item(i).homeScore;
                                     data[homeT].against = data[homeT].against + rs.rows.item(i).awayScore;
                                     data[awayT].for = data[awayT].for+rs.rows.item(i).awayScore;
                                     data[awayT].against = data[awayT].against + rs.rows.item(i).homeScore;
                                     
                                     data[homeT].gd = data[homeT].for-data[homeT].against;
                                     data[awayT].gd = data[awayT].for-data[awayT].against;
                                     
                                     } else if (rs.rows.item(i).res == 3) {
                                     data[awayT].draw++;
                                     data[homeT].draw++;
                                     
                                     data[homeT].for = data[homeT].for+rs.rows.item(i).homeScore;
                                     data[homeT].against = data[homeT].against + rs.rows.item(i).awayScore;
                                     data[awayT].for = data[awayT].for+rs.rows.item(i).awayScore;
                                     data[awayT].against = data[awayT].against + rs.rows.item(i).homeScore;
                                     
                                     data[homeT].gd = data[homeT].for-data[homeT].against;
                                     data[awayT].gd = data[awayT].for-data[awayT].against;
                                     
                                     }
                                     data[homeT].points = (data[homeT].win * 3) + (data[homeT].draw * 1);
                                     data[awayT].points = (data[awayT].win * 3) + (data[awayT].draw * 1);
                                     }
                                     console.log(data);
                                     var sort = {};
                                     sort['points'] = {};
                                     sort['gd'] = {};
                                     sort['for'] = {};
                                     for (var k in data) {
                                     var v = data[k];
                                     sort.points[k] = v.points;
                                     sort.gd[k] = v.gd;
                                     sort.for[k] = v.for;
                                     }
                                     array_multisort(sort.points, 'SORT_DESC', 'SORT_NUMERIC', sort.gd, 'SORT_DESC', 'SORT_NUMERIC', sort.for, 'SORT_DESC', 'SORT_NUMERIC', data, 'SORT_ASC', 'SORT_STRING');
                                     var posn = 0;
                                     var output = '';
                                     for (var key in data) {
                                     value = data[key];
                                     //console.log(key);
                                     //console.log(value.points);
                                     //console.log(value);
                                     //console.log(value.gd);
                                     //console.log(value.points);
                                     
                                     var played = value.win + value.draw + value.loss;
                                     var gd = value.for-value.against;
                                     output += '<tr>';
                                     posn++;
                                     
                                     output += '<td class="teamname">' + key + '<small>'+value.coach+'</small></td>';
                                     output += '<td>' + played + '</td>';
                                     output += '<td>' + value.win + '</td>';
                                     output += '<td>' + value.draw + '</td>';
                                     output += '<td>' + value.loss + '</td>';
                                     output += '<td>' + gd + '</td>';
                                     output += '<td>' + value.points + '</td>';
                                     output += '</tr>';
                                     }
                                     console.log(output);
                                     $(".playlgetable").attr("rel", leagueID);
                                     $(".viewfixtable").attr("rel", leagueID);
                                     $(".leagueName").html(leagueName);
                                     $("#leagueTableInner").html(output).trigger("create");
                                     $("#table-custom-2").trigger("create");
                                     $("body").pagecontainer("change", "#viewleague");
                                     
                                     }, errorCB);
                       }, errorCB
                       );
    }
    
    function download_data(user) {
        console.log(user);
        $.ajax({
               type: 'GET',
               url: 'http://loungemo.de/ajax/app-download-data.php',
               dataType: 'json',
               data: 'user='+user,
               success: function(data) {
               console.log(data);
               var total = data.games.length + data.leagues.length + data.teams.length + data.results.length;
               console.log(total);
               var pbar = jQMProgressBar('progressbar')
               .setOuterTheme('a')
               .setInnerTheme('b')
               .isMini(false)
               .setMax(total)
               .setStartFrom(0)
               .showCounter(true)
               .build();
               var i = 0;
               $.each(data.leagues, function(k, v) {
                      
                      
                      console.log('"'+v.leagueID+'", "'+v.leagueUser+'", "'+v.leagueName+'","'+v.leagueType+'", "'+v.leaguePlays+'" , 0');
                      db.transaction(function(tx) {
                                     tx.executeSql('INSERT OR IGNORE INTO leagues (leagueID, leagueUser, leagueName, leagueType, leaguePlays, leagueDeleted, leagueCreated) VALUES ("'+v.leagueID+'", "'+v.leagueUser+'", "'+v.leagueName+'","'+v.leagueType+'", "'+v.leaguePlays+'" , 0, "'+v.leagueCreated+'")', [],
                                                   function(tx, rs) {
                                                   i++;
                                                   pbar.setValue(i);
                                                   });
                                     }, errorCB);
                      
                      });
               $.each(data.games, function(k, v) {
                      pbar.setValue(i);
                      console.log('"'+v.gameID+'", "'+v.gameLeague+'","'+v.gameHome+'", "'+v.gameAway+'" , "'+v.gameDate+'", "'+v.gameStatus+'"');
                      db.transaction(function(tx) {
                                     tx.executeSql('INSERT OR IGNORE INTO games (gameID, gameLeague, gameHome, gameAway, gameDate, gameStatus) VALUES ("'+v.gameID+'", "'+v.gameLeague+'","'+v.gameHome+'", "'+v.gameAway+'" , "'+v.gameDate+'", "'+v.gameStatus+'")', [],
                                                   function(tx, rs) {
                                                   i++;
                                                   pbar.setValue(i);
                                                   });
                                     }, errorCB);
                      
                      });
               $.each(data.results, function(k, v) {
                      pbar.setValue(i);
                      console.log('"'+v.resultID+'", "'+v.resultLeague+'","'+v.resultGame+'", "'+v.resultHome+'" , "'+v.resultAway+'", "'+v.resultResult+'"');
                      db.transaction(function(tx) {
                                     tx.executeSql('INSERT OR IGNORE INTO results (resultID, resultLeague, resultGame, resultHome, resultAway, resultResult) VALUES ("'+v.resultID+'", "'+v.resultLeague+'","'+v.resultGame+'", "'+v.resultHome+'" , "'+v.resultAway+'", "'+v.resultResult+'")', [],
                                                   function(tx, rs) {
                                                   i++;
                                                   pbar.setValue(i);
                                                   });
                                     }, errorCB);
                      
                      });
               $.each(data.teams, function(k, v) {
                      pbar.setValue(i);
                      console.log('"'+v.teamID+'", "'+v.teamLeague+'","'+v.teamName+'", "'+v.teamCoach+'" , "'+v.teamUser+'"');
                      db.transaction(function(tx) {
                                     tx.executeSql('INSERT OR IGNORE INTO teams (teamID, teamLeague, teamName, teamCoach, teamUser) VALUES ("'+v.teamID+'", "'+v.teamLeague+'","'+v.teamName+'", "'+v.teamCoach+'" , "'+v.teamUser+'")', [],
                                                   function(tx, rs) {
                                                   i++;
                                                   pbar.setValue(i);
                                                   });
                                     }, errorCB);
                      
                      });
               /*
                var db = window.openDatabase("lounge_db", "1.0", "LoungeMode DB", 200000);
                $.each(data, function(k) {
                
                var userEmail = this.userEmail;
                var userPass = this.userPass;
                var userID = k;*/
               
               
               /*db.transaction(function(tx) {
                tx.executeSql('INSERT OR IGNORE INTO users (userID, userEmail, userPass, userSync) VALUES ("'+userID+'", "'+userEmail+'","'+userPass+'",1)', [],
                function(tx, rs) {
                console.log('user id: '+userID+ ' inserted');
                });
                }, errorCB);
                
                });*/
               }
               });
    }
    
    function syncNewLeague(leagueID, data) {
        data.leagueID = leagueID;
        $.post('http://loungemo.de/app/add-league.php', data, function(result) {
               console.log(result);
               });
    }
    
    function syncNewFixture(data) {
        $.post('http://loungemo.de/ajax/test.php', data, function(result) {
               console.log(result);
               });
    }
    
    function syncNewScore(data) {
        $.post('http://loungemo.de/ajax/test.php', data, function(result) {
               console.log(result);
               });
    }
    
    function delete_league(league) {
        var query = [];
        var countdel =0;
        query.push("DELETE FROM leagues WHERE leagueID=?");
        query.push("DELETE FROM teams WHERE teamLeague=?");
        query.push("DELETE FROM games WHERE gameLeague=?");
        query.push("DELETE FROM results WHERE resultLeague=?");
        $.each(query, function(index, value) {
           var delq = value;
           db.transaction(
                function(tx) {
                    tx.executeSql(delq, [league], function(tx, rs) {
                            console.log(query+' Executed succesfully');
                            countdel++;
                            if(countdel == 3) { 
                                renderLeagueList(window.localStorage.user_id);
                            }
                        }
                    );
                }, errorCB
           );
        });
        
    }
    function reduce_credits(amount) {
        var user = window.localStorage.user_id;
        var query = "UPDATE users SET userPaid = userPaid-"+amount+" WHERE userID='"+user+"'";
        db.transaction(
            function(tx) {
                tx.executeSql(
                    query, [], function(tx,rs) {
                        outputCredits();   
                    }
                );
            }
        );
    }
    var pageHTML = '';
    var delTimer;
    $(document)
    .on("click", ".deleteleague", function(event) {
        event.preventDefault(); 
        var league = $(this).attr("rel");
        navigator.notification.confirm(
           'Do you wish to delete this league?\r\nThis is a permanent action.',
           function(buttonIndex) {
                if (buttonIndex == 1) {
                    console.log('in');
                    delete_league(league);
                } 
           },
           'Delete League?',
           ['Yes','No']
           );
    })
    .on("click", ".result", function(event) {
        event.preventDefault(); 
        var element = $(this);
        var game = element.attr("rel");
        var league = element.attr("league");
        var store = element.html();
        
        element.html('<a class="delgame ui-btn" rel="'+game+'" league="'+league+'" href="#">Del?</a>');
        delTimer = setTimeout(function(){ 
            element.html(store);
        }, 5000);
    })
    .on("click", ".delgame", function(event) {
        event.preventDefault(); 
        clearTimeout(delTimer);
        var element = $(this);
        var game = element.attr("rel");
        var league = element.attr("league");
        navigator.notification.confirm(
           'Do you wish to delete this fixture?',
           function(buttonIndex) {
                if (buttonIndex == 1) {
                    console.log('in');
                    delete_score(game, league);
                } else {
                    goto_fixtures(league);
                }
           },
           'Delete Result?',
           ['Yes','No']
           );
    })
    .on("click", ".buyLeague", function(event) {
        event.preventDefault();
        var prodID = $(this).attr('productId');
        var price = $(this).children('span').text();
        $(this).children('span').text("Wait...");
        IAP.buy(prodID);
        $("#in-app-purchase-list").listview("refresh");
        $(this).children('span').text(price);
    })
    .on('touchstart', 'input, a', function(e) {
        if(device.platform == 'Android')
        {
        window.plugins.deviceFeedback.haptic();
        }
        })
    .on('touchend', 'input, a', function(e) {
        if(device.platform == 'Android')
        {
        window.plugins.deviceFeedback.acoustic();
        }
        })
    .on("click", "#refreshLeagues", function(event) {
        event.preventDefault();
        navigator.notification.confirm(
                                       'Do you want to sync your account online?',
                                       function(buttonIndex) {
                                       console.log(buttonIndex);
                                       if (buttonIndex == 1) {
                                       console.log('in');
                                       $("body").pagecontainer("change", "#syncdata");
                                       download_data(window.localStorage.user_id);
                                       } else {
                                       // Do no
                                       }
                                       },
                                       'Sync Online?',
                                       ['Yes','No']
                                       );
        })
    .on('complete', '#progressbar', function () {
        $("body").pagecontainer("change", "#league");
        })
    .on("pagecreate", function () {
        $("[data-role=panel]").one("panelbeforeopen", function () {
                                   var height = $.mobile.pageContainer.pagecontainer("getActivePage").outerHeight();
                                   $(".ui-panel-wrapper").css("height", height + 1);
                                   })
        })
    .on('pagebeforeshow', function(e, ui) {
        var pageId = $('body').pagecontainer('getActivePage').prop('id');
        $('[data-type="header"]').toolbar();
        $("#nav-panel").enhanceWithin().panel();
        if (pageId == 'league') {
        renderLeagueList(window.localStorage.user_id);
            outputCredits();
        }
        if (pageId == 'addleague') {
            $('#addleagueinner [data-role=listview]').trigger('create');
        }
    })
    .on("submit", "#signupForm", function(event) {
        event.preventDefault();
        var result = {};
        $.each($(this).serializeArray(), function() {
               result[this.name] = this.value;
               });
        
        function signUp(tx) {
        tx.executeSql('INSERT INTO users (userPass, userEmail) VALUES ("' + result.userPass + '","' + result.userEmail + '")', [], function(tx, rs) {
                      window.localStorage.user_id = rs.insertId;
                      $("body").pagecontainer("change", "#league");
                      console.log(rs.insertId);
                      });
        }
        db.transaction(signUp, errorCB, successCB);
        })
    .on("focus", ".score", function(event) {
        if ($(this).val() == 0) {
        $(this).val('');
        }
        }).on("blur", ".score", function(event) {
              if ($(this).val() == '') {
              $(this).val('0');
              }
              })
    .on("blur", "#usernamelogin", function() {
        var user = $('#usernamelogin').val();
        download_email(user);
        })
    .on("submit", "#loginForm", function(e) {
        e.preventDefault();
        var user = $('#usernamelogin').val();
        var pass = $('#passwordlogin').val();
        //console.log("SELECT userID, userName, userPass FROM users WHERE userName='"+user+"'");
        
        db.transaction(function(tx) {
                       tx.executeSql("SELECT userID, userEmail, userPass FROM users WHERE userEmail='" + user.trim() + "'", [], function(tx, rs) {
                                     if (rs.rows.item(0).userPass == pass.trim()) {
                                     window.localStorage.user_id = rs.rows.item(0).userID;
                                     $("body").pagecontainer("change", "#league", {
                                                             beforeshow: function(event, ui) {
                                                             console.log('Prev page: ' + ui.prevPage[0].id);
                                                             }
                                                             });
                                     //console.log("User ID: " + window.localStorage.user_id);
                                     //console.log("Data: " + rs.rows.item(0).userPass + " " + pass);
                                     navigator.notification.confirm(
                                                                    'Do you want to sync your account online?',
                                                                    function(buttonIndex) {
                                                                    console.log(buttonIndex);
                                                                    if (buttonIndex == 1) {
                                                                    console.log('in');
                                                                    $("body").pagecontainer("change", "#syncdata");
                                                                    download_data(window.localStorage.user_id);
                                                                    } else {
                                                                    // Do no
                                                                    }
                                                                    },
                                                                    'Sync Online?',
                                                                    ['Yes','No']
                                                                    );
                                     } else {
                                     console.log("error " + rs.rows.item(0).userPass + " " + pass);
                                     }
                                     }, errorCB);
                       }, errorCB);
        
        })
    .on("click", ".playfixture", function(event) {
        event.preventDefault();
        var game = $(this).attr("rel");
        play_game(game);
        })
    .on("click", ".viewfixtures", function(event) {
        event.preventDefault();
        var league = $(this).attr("rel");
        goto_fixtures(league);
        })
    .on("click", ".viewleague", function(event) {
        event.preventDefault();
        var league = $(this).attr("rel");
        output_league(league);
        })
    .on("click", ".playleague", function(event) {
        event.preventDefault();
        var league = $(this).attr("rel");
        play_league(league);
        })
    .on("click", ".addleaguebtn", function(event) {
        pageHTML = $('#addleagueinner').html();
        $('#addleagueinner').trigger('create');
        if(window.localStorage.user_credits < 1) {
            event.preventDefault();
            navigator.notification.confirm(
               'You do not have enough credits',
               function(buttonIndex) {
                    if (buttonIndex == 1) {
                       $("body").pagecontainer("change", "#buyleagues");
                    } else {
                        $("body").pagecontainer("change", "#league");
                    }
               },
               'Buy More?',
               'Yes,No'
               );
        }
    })
    .on("submit", "#playLeague", function(e) {
        e.preventDefault();
        var result = {};
        $.each($(this).serializeArray(), function() {
               result[this.name] = this.value;
               });
        console.log(result);
		if(result.leagueType == 2) {
        	add_reg_score(result.leagueID, result.gameID, result.homeScore, result.awayScore);
		} else {
			add_one_score(result.leagueID, result.homeID, result.awayID, result.homeScore, result.awayScore);
		}
        
        })
    .on("click", ".lsel", function(event) {
        event.preventDefault();
        var rel = $(this).attr("rel");
        switch (rel) {
        case '1':
        navigator.notification.confirm(
                                       'Are you sure you want to play \r\none-on-one league?\r\n\r\nThis will use 1 credit',
                                       function(buttonIndex) {
                                       if (buttonIndex == 1) {
                                       $('#leagueTeams').remove();
                                       $('#leaguePlays').remove();
                                       $('#leagueType').val('1');
                                       $('#leagueName').after('<input type="hidden" name="leagueTeams" id="leagueTeams" value="2" />');
                                       $("#addLeague0").slideUp();
                                       $('h2.step1').show().addClass('active');
                                       $("#addLeague1").slideDown();
                                       } else {
                                       $("body").pagecontainer("change", "#addleague");
                                       }
                                       },
                                       'Are You Sure?',
                                       'Yes,No'
                                       );
        break;
        case '2':
        navigator.notification.confirm(
                                       'Are you sure you want to play\r\nfixture generated league?\r\n\r\nThis will use 1 credit',
                                       function(buttonIndex) {
                                       if (buttonIndex == 1) {
                                       $("#addLeague0").slideUp();
                                       $('#leagueType').val('2');
                                       $('h2.step1').show().addClass('active');
                                       $("#addLeague1").slideDown();
                                       } else {
                                       $("body").pagecontainer("change", "#addleague");
                                       }
                                       },
                                       'Are You Sure?',
                                       'Yes,No'
                                       );
        break;
        case '3':
        navigator.notification.confirm(
                                       'Are you sure you want to play \r\nad-hoc league?\r\n\r\nThis will use 1 credit',
                                       function(buttonIndex) {
                                       if (buttonIndex == 1) {
                                       $("#addLeague0").slideUp();
                                       $('#leagueType').val('3');
                                       $('#leaguePlays').remove();
                                       $('h2.step1').show().addClass('active');
                                       $("#addLeague1").slideDown();
                                       } else {
                                       $("body").pagecontainer("change", "#addleague");
                                       }
                                       },
                                       'Are You Sure?',
                                       'Yes,No'
                                       );
        break;
        default:
        break;
        }
        })
    .on("click", "#addLeagueForm1Submit", function(event) {
        $(".warning").remove();
        var error = 0;
        if ($('#leagueName').val() == '') {
        error++;
        $('#leagueName').parent().css('border-color', '#C22320').after('<p class="warning">Please enter a league name</p>');
        }
        if ($('#leagueType').val() != '1' && $('#leagueTeams').val() == '') {
        error++;
        $('#leagueTeams').parent().css('border-color', '#C22320').after('<p class="warning">Please enter a number of teams</p>');
        } else {
        if ($.isNumeric($('#leagueTeams').val())) {} else {
        if ($('#leagueType').val() != '1') {
        error++;
        $('#leagueTeams').parent().css('border-color', '#C22320').after('<p class="warning">Please enter a valid number</p>');
        }
        }
        }
        if ($('#leagueType').val() > '1' && $('#leaguePlays').val() == "null") {
        error++;
        $('#leaguePlays').parent().parent().css('border-color', '#C22320').after('<p class="warning">Please choose an option</p>');
        }
        if (error == 0) {
        $('#addLeagueForm h2').toggleClass('active');
        event.preventDefault();
        var n = $('#leagueTeams').val();
        var html = '';
        if (n > 0) {
        var i = 1;
        var html = '<p>Now add your teams</p>';
        for (i = 0; i < n; i++) {
        c = i + 1;
        html += '<h2>Team' + c + '</h2>';
        html += '<p><input type="text" name="teamName[' + i + ']" id="teamName' + c + '" placeholder="Team ' + c + ' Name"  /></p>';
        html += '<p><input type="text" name="teamCoach[' + i + ']" id="teamCoach' + c + '" placeholder="Team ' + c + ' Player" /></p>';
        if (n != i) {
        html += '<hr/>';
        }
        }
        html += '<p><input type="submit" id="addLeagueForm2Submit" value="Finish" /></p>';
        } else {
        html += '<p>Please add team details first.</p>';
        }
        $('h2.step2').show();
        $("#addLeague2").html(html).trigger('create').slideDown();
        $("#addLeague1").slideUp();
        } else {
        $(this).parent().after('<p class="warning">Please amend any errors.</p>');
        }
        }).on("click", "h2.step1", function(event) {
              event.preventDefault();
              $('#addLeagueForm h2').toggleClass('active');
              $("#addLeague1").slideToggle();
              $("#addLeague2").slideToggle();
              }).on("click", "h2.step2", function(event) {
                    event.preventDefault();
                    $('#addLeagueForm h2').toggleClass('active');
                    $("#addLeague1").slideToggle();
                    $("#addLeague2").slideToggle();
                    })
    .on("submit", "#addLeagueForm", function(event) {
        event.preventDefault();
        $("#addLeagueForm2Submit").attr("disabled", "disabled");
        $(".warning").remove();
        error = 0;
        $("#addLeague2 input[type=text]").each(function(index) {
                                               if ($(this).val() == '') {
                                               error++;
                                               $(this).parent().css('border-color', '#C22320').after('<p class="warning">Please  a value</p>');
                                               }
                                               });
        if (error == 0) {
        var result = {};
        var teams = {};
        var players = {};
        $.each($(this).serializeArray(), function() {
               result[this.name] = this.value;
               });
        result.leagueUser = window.localStorage["user_id"];
        // Add league here
        var leagueSql = "INSERT INTO leagues (leagueID, leagueName, leagueUser, leaguePlays, leagueType) VALUES (?,?,?,?,?)";
        var teamSql = "INSERT INTO teams (teamID, teamName, teamCoach, teamLeague, teamUser) VALUES (?,?,?,?,?)";
        //var db = window.openDatabase("lounge_db", "1.0", "LoungeMode DB", 200000);
        
        var insleagueID = generateUUID();
        
        
        db.transaction(
                       function(tx) {
                       tx.executeSql(leagueSql, [insleagueID, result.leagueName, result.leagueUser, result.leaguePlays, result.leagueType], addTeams, errorCB);
                       }
                       );
        
        function addTeams(tx, rx) {
        var n = 0;
        for (n = 0; n < result.leagueTeams; n++) {
        var teamID = generateUUID();
        if(checkConnection() > 1) {
        
        }
        tx.executeSql(teamSql, [teamID, result["teamName[" + n + "]"], result["teamCoach[" + n + "]"], insleagueID, result.leagueUser], function(tx, rx) {}, errorCB);
        }
        syncNewLeague(insleagueID, result);
        
		// Check if league type == 2 here 
		if(result.leagueType == 2) {
			build_fixtures(insleagueID);
			$(".playlgetable").attr("rel", insleagueID);
            $(".viewfixtable").attr("rel", insleagueID);
		} else {
			play_league(insleagueID);
			$(".playlgetable").attr("rel", insleagueID);
            $(".viewfixtable").attr("rel", insleagueID);	
		}
        
        }
        reduce_credits(1);
        $('#addleagueinner').html(pageHTML);
        $('#addleagueinner').trigger('create');
        } else {
        $('#addLeagueForm2Submit').parent().after('<p class="warning">Please amend any errors.</p>');
        }
        })
    .on('click', '.logout', function(event) {
        event.preventDefault();
        localStorage.clear();
        $("body").pagecontainer("change", "#login");
        })
		.on("change", "#adhochome", function(event) {
			event.preventDefault();
			var selected = $(this).val();
			var league = $("#adhocleagueid").val();
			if(this.val != 0) {
				//console.log('SELECT teamName, teamCoach, leagueID, leagueName, leagueType, teamID FROM leagues INNER JOIN teams ON teamLeague = leagueID WHERE leagueID = "'+league+'" AND teamID != "'+selected+'" ORDER BY teamName ASC');
				db.transaction(
					function(tx) {
						tx.executeSql('SELECT teamName, teamCoach, leagueID, leagueName, leagueType, teamID FROM leagues INNER JOIN teams ON teamLeague = leagueID WHERE leagueID = "'+league+'" AND teamID != "'+selected+'" ORDER BY teamName ASC', [], function (tx, rs) {
								var output = '<option disabled selected value="0">Select Away Team</option>';
								
								for (var n = 0; n < rs.rows.length; n++) {
									output += '<option value="'+rs.rows.item(n).teamID+'">'+rs.rows.item(n).teamName+'</option>';	
								}	
								console.log(output);
								$("#adhocaway-button span").text('Select Away Team');
								$("#adhocaway").html(output).val(0).trigger("create");
							 }, errorCB);
					}, errorCB);
			}
		})
    ;
    
    if (window.localStorage.user_id != undefined) {
        $("body").pagecontainer("change", "#league");
        navigator.splashscreen.hide();
    } else {
        $("body").pagecontainer("change", "#login");
        navigator.splashscreen.hide();
    }
}
};