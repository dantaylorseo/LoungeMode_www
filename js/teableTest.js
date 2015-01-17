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
    db.transaction(
        function(tx) {
            var query = "SELECT home.teamName AS homeTeam, away.teamName AS awayTeam, result.resultHome AS homeScore, result.resultAway AS awayScore, result.resultResult AS res, g.gameDate AS gameDate FROM games AS g INNER JOIN teams AS home ON home.teamID = g.gameHome INNER JOIN teams AS away ON away.teamID = g.gameAway INNER JOIN leagues AS league ON league.leagueID = home.teamLeague INNER JOIN results AS result ON g.gameID = resultGame WHERE league.leagueID = " + league + " ORDER BY gameDate ASC";
            var table = {};
            var data = {};

            tx.executeSql(query, [], function(tx, rs) {
                for (var i = 0; i < rs.rows.length; i++) {
                    if (rs.rows.item(i).res == 1) {
                        data[rs.rows.item(i)['homeTeam']]['win']++;
                        data[rs.rows.item(i)['awayTeam']]['loss']++;

                        data[rs.rows.item(i)['homeTeam']]['for'] = data[rs.rows.item(i)['homeTeam']]['for'] + a['homeScore'];
                        data[rs.rows.item(i)['homeTeam']]['against'] = data[rs.rows.item(i)['homeTeam']]['against'] + a['awayScore'];
                        data[rs.rows.item(i)['awayTeam']]['for'] = data[rs.rows.item(i)['awayTeam']]['for'] + a['awayScore'];
                        data[rs.rows.item(i)['awayTeam']]['against'] = data[rs.rows.item(i)['awayTeam']]['against'] + a['homeScore'];

                        data[rs.rows.item(i)['homeTeam']]['points'] = data[rs.rows.item(i)['homeTeam']]['points'] + 3;

                        data[rs.rows.item(i)['homeTeam']]['gd'] = data[rs.rows.item(i)['homeTeam']]['for'] - data[rs.rows.item(i)['homeTeam']]['against'];
                        data[rs.rows.item(i)['awayTeam']]['gd'] = data[rs.rows.item(i)['awayTeam']]['for'] - data[rs.rows.item(i)['awayTeam']]['against'];
                    } else if (rs.rows.item(i).res == 2) {
                        data[rs.rows.item(i)['awayTeam']]['win']++;
                        data[rs.rows.item(i)['homeTeam']]['loss']++;

                        data[rs.rows.item(i)['homeTeam']]['for'] = data[rs.rows.item(i)['homeTeam']]['for'] + a['homeScore'];
                        data[rs.rows.item(i)['homeTeam']]['against'] = data[rs.rows.item(i)['homeTeam']]['against'] + a['awayScore'];
                        data[rs.rows.item(i)['awayTeam']]['for'] = data[rs.rows.item(i)['awayTeam']]['for'] + a['awayScore'];
                        data[rs.rows.item(i)['awayTeam']]['against'] = data[rs.rows.item(i)['awayTeam']]['against'] + a['homeScore'];

                        data[rs.rows.item(i)['awayTeam']]['points'] = data[rs.rows.item(i)['awayTeam']]['points'] + 3;

                        data[rs.rows.item(i)['homeTeam']]['gd'] = data[rs.rows.item(i)['homeTeam']]['for'] - data[rs.rows.item(i)['homeTeam']]['against'];
                        data[rs.rows.item(i)['awayTeam']]['gd'] = data[rs.rows.item(i)['awayTeam']]['for'] - data[rs.rows.item(i)['awayTeam']]['against'];
                    } else if (rs.rows.item(i).res == 3) {
                        data[rs.rows.item(i)['awayTeam']]['draw']++;
                        data[rs.rows.item(i)['homeTeam']]['draw']++;

                        data[rs.rows.item(i)['homeTeam']]['for'] = data[rs.rows.item(i)['homeTeam']]['for'] + a['homeScore'];
                        data[rs.rows.item(i)['homeTeam']]['against'] = data[rs.rows.item(i)['homeTeam']]['against'] + a['awayScore'];
                        data[rs.rows.item(i)['awayTeam']]['for'] = data[rs.rows.item(i)['awayTeam']]['for'] + a['awayScore'];
                        data[rs.rows.item(i)['awayTeam']]['against'] = data[rs.rows.item(i)['awayTeam']]['against'] + a['homeScore'];

                        data[rs.rows.item(i)['homeTeam']]['points'] = data[rs.rows.item(i)['homeTeam']]['points'] + 1;
                        data[rs.rows.item(i)['awayTeam']]['points'] = data[rs.rows.item(i)['awayTeam']]['points'] + 1;

                        data[rs.rows.item(i)['homeTeam']]['gd'] = data[rs.rows.item(i)['homeTeam']]['for'] - data[rs.rows.item(i)['homeTeam']]['against'];
                        data[rs.rows.item(i)['awayTeam']]['gd'] = data[rs.rows.item(i)['awayTeam']]['for'] - data[rs.rows.item(i)['awayTeam']]['against'];
                    }
                }
                console.log(data);
            }, errorCB);
        }
    );

    //aasort($data,"points");
    //$data = array_reverse($data, true);



    //echo '<pre>'.print_r($table, true).'</pre>';
    //echo '<pre>'.print_r($data, true).'</pre>';

    if ((data)) {
        sort = {};
        for (var k in data) {
            v = data[k];
            sort['points'][k] = v['points'];
            sort['gd'][k] = v['gd'];
            sort['for'][k] = v['for'];
        }
        output = '';

        array_multisort(sort['points'], SORT_DESC, sort['gd'], SORT_DESC, sort['for'], SORT_DESC, data);
        for (var key in data) {
            value = data[key];
            //echo print_r($value, true);
            gd = value['for'] - value['against'];
            played = value['win'] + value['draw'] + value['loss'];



            output += '<tr>';
            i++;

            output += '<td>' + key + '</td> <td>' + (played == ''
                '0'
                played) + '</td> <td>' + (value['win'] == ''
                '0'
                value['win']) + '</td> <td>' + (value['draw'] == ''
                '0'
                value['draw']) + '</td> <td>' + (value['loss'] == ''
                '0'
                value['loss']) + '</td> <td>' + (value['for'] == ''
                '0'
                value['for']) + '</td> <td>' + (value['against'] == ''
                '0'
                value['against']) + '</td> <td>' + (gd == ''
                '0'
                gd) + '</td> <td>' + (value['points'] == ''
                '0'
                value['points']) + '</td> </tr>';

        }
    } else {
        output += '<tr><td colspan="9">Sorry no data to display. Get playing!</td></tr>';
    }
    $("#leagueTableInner").html(output);
}

function aasort(array, key) {
    var sorter = {};
    var ret = {};
    //reset(array);
    for (var ii in array) {
        va = array[ii];
        sorter[ii] = va[key];
    }
    asort(sorter);
    for (var ii in sorter) {
        va = sorter[ii];
        ret[ii] = array[ii];
    }
    array = ret;
    return array;
}