app.initialize();
function init(){
    gameDOM = $(".wrap");
    gameHeight = gameDOM.height()-100;
    gameWidth = gameDOM.width();
    
    blockCountH = blockCount;
    //blockCountV = gameHeight/(gameWidth/blockCount);
    blockCountV = blockCount;
    storage.setItem("blockSize",(gameWidth/blockCount));
    blockCountH = Math.floor(blockCountH);
    blockCountV = Math.floor(blockCountV);
    maxBlocks = maxblock;
    gameDOM.css("top",((wh-gameDOM.height())/2)+"px");
    $(".game-over-reason").css("font-size","1px");

    var w = gameWidth/blockCount;
    var h = maxblock*(gameWidth/blockCount);

    for(var i=0; i<blockCount; i++){
        var tempColumn = {
            id: i,
            floors: 0,
            width: (gameWidth/blockCount),
            height: maxblock*(gameWidth/blockCount),
            leftMargin: (i)*(gameWidth/blockCount),
            blocks : Array(),
            el: $("<div></div>").addClass("column").attr("id","column-"+i).width((gameWidth/blockCount)).height(maxblock*(gameWidth/blockCount)).css("left",(i)*(gameWidth/blockCount)),
            getEl : function(){
                return this.el;
            },
            addBlock : function(){
                var colorID = Math.floor(Math.random()*colors.length);
                var tempBlock = {
                    type: null,
                    floor : this.floors,
                    column : this.id,
                    color : colorID,
                    checked : false,
                    size : parseInt(storage.getItem("blockSize")),
                    fromBottom : parseInt(storage.getItem("blockSize")) * this.floors,
                    el : $("<div></div>").addClass("block").width(parseInt(storage.getItem("blockSize"))).height(parseInt(storage.getItem("blockSize"))).css("background-color",colors[colorID]).css("display","none"),
                    getEl : function(){
                        var s = this;
                        this.el.click(function(){BlockClick(s)});
                        return this.el;
                    },
                    changeType : function(type){
                        this.type = type;
                        this.el.addClass(type);
                    }
                }
                if(gamemode == "time_trial"){
                    var chance = Math.random()*100;
                    if(chance < time_trial_percent_of_time){
                        tempBlock.changeType("time");
                    }
                }
                this.blocks.push(tempBlock);
                this.el.append(tempBlock.getEl().fadeIn(200));
                grid[this.id].push(tempBlock.color);
                this.floors++;
                if(this.floors >= maxblock){
                    GameOver("FULL_SCREEN");
                }
            },
            removeBlocks : function(index){
                for(var i=0; i<index.length; i++){
                    this.blocks[index[i]].checked = true;
                    if(this.blocks[index[i]].type == "time"){
                        modifyTimeTrialTimer(timetrialtimer+5);
                        storage.setItem("stats-time-gained",parseInt(storage.getItem("stats-time-gained"))+1);
                    }
                    this.blocks[index[i]].el.slideUp(200,function(){
                        this.remove();
                    });
                }
                var newArray = Array();
                grid[this.id] = Array();
                for(var i=0; i<this.blocks.length; i++){
                    if(!this.blocks[i].checked){
                        newArray.push(this.blocks[i]);
                        grid[this.id].push(this.blocks[i].color);
                    }
                }
                this.blocks = newArray;
                this.floors -= index.length;
                for(var i=0; i<this.blocks.length; i++){
                    this.blocks[i].floor = i;
                    this.blocks[i].fromBottom = i*this.blocks[i].size;
                }
            },
            clearBlocks : function(){
                this.floors = 0;
                this.blocks = Array();
                this.el.html("");
                grid[this.id] = Array();
            },
            addFromContext : function(colors_){
                this.blocks = Array();
                this.el.html("");
                for(var i=0; i<colors_.length; i++){
                    var tempBlock = {
                        type: null,
                        floor : i,
                        column : this.id,
                        color : colors_[i],
                        checked : false,
                        size : parseInt(storage.getItem("blockSize")),
                        fromBottom : parseInt(storage.getItem("blockSize")) * this.floors,
                        el : $("<div></div>").addClass("block").width(parseInt(storage.getItem("blockSize"))).height(parseInt(storage.getItem("blockSize"))).css("background-color",colors[colors_[i]]).css("display","none"),
                        getEl : function(){
                            var s = this;
                            this.el.click(function(){BlockClick(s)});
                            return this.el;
                        },
                        changeType : function(type){
                            this.type = type;
                            this.el.addClass(type);
                        }
                    }
                    if(gamemode == "time_trial"){
                        var chance = Math.random()*100;
                        if(chance < time_trial_percent_of_time){
                            tempBlock.changeType("time");
                        }
                    }
                    this.blocks.push(tempBlock);
                    this.el.append(tempBlock.getEl().fadeIn(200));
                }
                this.floors = colors_.length;
            },
            shuffle : function(){
                for(var i=0; i<this.blocks.length; i++){
                    var colorID = Math.floor(Math.random()*colors.length);
                    this.blocks[i].color = colorID;
                    this.blocks[i].el.css("background-color",colors[colorID]);
                    grid[this.id][i] = colorID;
                }
            }
        };
        columnArray[i] = tempColumn;
        grid[i] = Array();
    }
    RenderMenu("start");
    $(".to-menu").on("click",function(){
        $(".game-wrap").remove();
        $(".navigation").hide();
        RenderMenu("start");
        $(".game-menu").show();
    });
    $("#replay").on("click",function(){
        totalScore = 0;
        $(".game-over").hide();
        $(".game-over-high-score").hide();
        RenderMenu("play");
    });
    $("#to-main-menu").on("click",function(){
        $(".game-over-high-score").hide();
        totalScore = 0;
        $(".game-over").hide();
        RenderMenu("start");
    });
    $(".reset-stats").on("click",function(){
        if(confirm("Reset stats?")){
            for(var i=0; i<storageSetters.length; i++){
                storage.setItem(storageSetters[i],"0");
            }
            ShowStats();
        }
    });
}
function RenderMenu(menu_title){
    timetrialtimer = -2;
    timer = -2;
    $(".time-trial-timer").hide();
    $(".menu").html("");
    for(var i=0; i<menus[menu_title].buttons.length; i++){
        var el = $("<div></div>").appendTo($(".menu")).addClass("menu-item").attr("menu",menu_title).html(menus[menu_title].buttons[i].title).attr("id","menu-item-"+i).click(function(){CallMenuAction(this);});
        if(menus[menu_title].buttons[i].checker){
            menus[menu_title].buttons[i].checker(el);
        }
    }
    $(".game-menu").show();
}
function CallMenuAction(el){
    menus[$(el).attr("menu")].buttons[parseInt($(el).attr("id").replace("menu-item-",""))].action();
}
function ShowStats(){
    $(".hight-score .h-score .value").html(storage.getItem('stat-games-high-score'));
    $(".hight-score .games-played .value").html(storage.getItem('stat-games-payed'));
    $(".hight-score .games-won .value").html(storage.getItem('stat-games-won'));
    $(".hight-score .games-played-tt .value").html(storage.getItem('stat-games-payed-tt'));
    $(".hight-score .h-score-tt .value").html(storage.getItem('stat-games-high-score-tt'));
    $(".hight-score .stat-games-time-trial-longest .value").html(ParseTotalPlaytime(storage.getItem('stat-games-time-trial-longest')));
    $(".hight-score .blocks-removed .value").html(storage.getItem('stats-blocks-removed'));
    $(".hight-score .total-playtime .value").html(ParseTotalPlaytime(storage.getItem('stats-total-playtime')));
    $(".hight-score .time-gained .value").html(ParseTotalPlaytime(storage.getItem('stats-time-gained')));
    $(".hight-score").show();
    $(".hight-score .close-hight-score").on("click",function(){
        $(".hight-score").hide();
    });
}
function ParseTotalPlaytime(pt){
    var string = "";
    var y = Math.floor(pt / 31556926);
    if(y > 0){
        string = string + y + " y. ";
        pt = pt - (y*31556926);
    }
    var m = Math.floor(pt / 2629743);
    if(m > 0){
        string = string + m + " m. ";
        pt = pt - (m*2629743);
    }
    var d = Math.floor(pt / 86400);
    if(d > 0){
        string = string + d + " d. ";
        pt = pt - (d*86400);
    }
    var h = Math.floor(pt / 3660);
    if(h > 0){
        string = string + h + " h. ";
        pt = pt - (h*3660);
    }
    var m = Math.floor(pt / 60);
    if(m > 0){
        string = string + m + " m. ";
        pt = pt - (m*60);
    }
    string = string + pt + " s. ";
    return string;
}
function addBlocks(){
    moves = 0;
    for(var i=0; i<columnArray.length; i++){
        columnArray[i].addBlock();
    }
}
function GameOver(reason){
    var gettime = timer;
    var blockduration = 2000;
    storage.setItem("stats-total-playtime",parseInt(storage.getItem("stats-total-playtime"))+gettime);
    timer = -2;
    stopTimeTrial = true;
    $(".block").addClass("disabled-click");
    
    $("#resume-button").addClass("deactive");
    switch(reason){
        case "NO_MOVES":
            $(".game-over-text").html("GAME OVER!");
            $(".game-over-reason").html("NO MOVES!");
            if(totalScore > parseInt(storage.getItem("stat-games-high-score"))){
                $(".game-over-high-score").html("New high score!").show();
                storage.setItem('stat-games-high-score', totalScore);
            }else{
                $(".game-over-high-score").html("High score: "+storage.getItem('stat-games-high-score')).show();
            }
            break;
        case "FULL_SCREEN":
            $(".game-over-text").html("GAME OVER!");
            $(".game-over-reason").html("FULL SCREEN!");
            switch(gamemode){
                case "free_roam":
                    if(totalScore > parseInt(storage.getItem("stat-games-high-score"))){
                        $(".game-over-high-score").html("New high score!").show();
                        storage.setItem('stat-games-high-score', totalScore);
                    }else{
                        $(".game-over-high-score").html("High score: "+storage.getItem('stat-games-high-score')).show();
                    }
                    break;
                case "time_trial":
                    if(totalScore > parseInt(storage.getItem("stat-games-high-score-tt"))){
                        $(".game-over-high-score").html("New high score!").show();
                        storage.setItem('stat-games-high-score-tt', totalScore);
                    }else{
                        $(".game-over-high-score").html("High score: "+storage.getItem('stat-games-high-score-tt')).show();
                    }
                    if(parseInt(storage.getItem("stat-games-time-trial-longest")) < gettime){
                        storage.setItem("stat-games-time-trial-longest",gettime);
                    }
                    break;
            }
            break;
        case "OUT_OFF_TIME":
            if(totalScore > parseInt(storage.getItem("stat-games-high-score-tt"))){
                $(".game-over-high-score").html("New high score!").show();
                storage.setItem('stat-games-high-score-tt', totalScore);
            }else{
                $(".game-over-high-score").html("High score: "+storage.getItem('stat-games-high-score-tt')).show();
            }
            if(parseInt(storage.getItem("stat-games-time-trial-longest")) < gettime){
                storage.setItem("stat-games-time-trial-longest",gettime);
            }
            $(".game-over-text").html("GAME OVER!");
            $(".game-over-reason").html("OUT OFF TIME!");
            break;
        case "WIN":
            blockduration = 500;
            if(totalScore > parseInt(storage.getItem("stat-games-high-score"))){
                $(".game-over-high-score").html("New high score!").show();
                storage.setItem('stat-games-high-score', totalScore);
            }else{
                $(".game-over-high-score").html("High score: "+storage.getItem('stat-games-high-score')).show();
            }
            storage.setItem("stat-games-won",parseInt(storage.getItem("stat-games-won"))+1);
            $(".game-over-text").html("CONGRATULATIONS!");
            $(".game-over-reason").html("YOU WIN!!!");
            break;
        default:
            $(".game-over-text").html("GAME OVER!");
            $(".game-over-reason").html("GAME OVER!");
            break;
    }
    $(".game-wrap").animate({
        opacity: "0"
    },blockduration,"easeOutBounce",function(){
        $(".navigation").fadeOut(1000);
        $(".game-wrap").remove();
        storage.setItem("savegame","0");
        storage.setItem("savegame-score","0");
        storage.setItem("savegame-timer","0");
        storage.setItem("savegame-mode","0");
        storage.setItem("savegame-timer-left","0");
        $(".game-over-reason").show();
        $(".game-over-reason").animate({
            fontSize: "50px"
        },4000,"easeInBounce",function(){
            $(".game-over-reason").fadeOut(500);
            $(".game-over-reason").html("");
            $(".game-over-reason").css("font-size","1px");
            $(".game-over-score").html("Score: "+totalScore);
            $(".game-over").fadeIn(500,function(){
                setTimeout(function(){if(AdMob) AdMob.showInterstitial();},1000); 
            });
        });
    });
}
function resumeGame(){
    if(storage.getItem("savegame") != "0"){
        gamemode = storage.getItem("savegame-mode");
        moves = parseInt(storage.getItem("savegame-clicks"))-1;
        grid = JSON.parse(storage.getItem("savegame"));
        timer = parseInt(storage.getItem("savegame-timer"));
        UpdateScore(storage.getItem("savegame-score"));
        $(".game-menu").hide();
        var gameWrap = $("<div></div>").addClass("game-wrap").appendTo(gameDOM).height(blockCountV*parseInt(storage.getItem("blockSize"))).width(blockCount*parseInt(storage.getItem("blockSize")));
        
        $(".navigation").fadeIn(1000).attr("game-mode",storage.getItem("savegame-mode"));
        
        for(var j=0;j<grid.length; j++){
            columnArray[j].addFromContext(grid[j]);
            gameWrap.append(columnArray[j].getEl());
        }
        setTimer();
        switch(gamemode){
            case "free_roam":
                
                break;
            case "time_trial":
                stopTimeTrial = false;
                modifyTimeTrialTimer(parseInt(storage.getItem("savegame-timer-left")));
                $(".time-trial-timer").show();
                setTimeTrialTimer(); 
                break;
        } 
    } 
}
function makeField(gm){
    moves = 0;
    $(".game-wrap").remove();
    gamemode = gm;
    storage.setItem("savegame-mode",gm);
    $(".game-menu").hide();
    switch(gm){
        case "free_roam":
            storage.setItem("stat-games-payed",parseInt(storage.getItem("stat-games-payed"))+1);
            break;
        case "time_trial":
            stopTimeTrial = false;
            storage.setItem("stat-games-payed-tt",parseInt(storage.getItem("stat-games-payed-tt"))+1);
            $(".time-trial-timer").show();
            modifyTimeTrialTimer(timeTrialStartTimer);
            setTimeTrialTimer(); 
            break;
    }
    var blockSize = parseInt(storage.getItem("blockSize"));
    timer = 0;
    UpdateScore(0);
    var gameWrap = $("<div></div>").addClass("game-wrap").appendTo(gameDOM).height(blockCountV*parseInt(storage.getItem("blockSize"))).width(blockCount*parseInt(storage.getItem("blockSize")));
    $(".navigation").fadeIn(1000).attr("game-mode",gm);
    for(var i=0; i<blockCount; i++){
        columnArray[i].clearBlocks();
        gameWrap.append(columnArray[i].getEl());
    }
    
    generateBlocks();
    setTimer();
}

function setTimeTrialTimer(){
    timetrialtimer -= 0.5;
    $(".time-trial-timer div").animate({
        width : timetrialtimer+"%"
    },99);
    if(!stopTimeTrial){
        setTimeout(function(){
            if(timetrialtimer > 0){
                storage.setItem("savegame-timer-left",timetrialtimer);
                setTimeTrialTimer();
            }else{
                GameOver("OUT_OFF_TIME");
            }
        },100);
    }else{
        $(".time-trial-timer").fadeOut(500);
    }
}
function modifyTimeTrialTimer(t){
    timetrialtimer = t;
    if(timetrialtimer>100){
        timetrialtimer = 100;
    }
    $(".time-trial-timer div").width(timetrialtimer+"%");
}
function setTimer(){
    timer += 1;
    setTimeout(function(){
        if(timer > -1){setTimer();}
    },1000);
}
function generateBlocks(){
    for(var j=0;j<startFloors;j++){
        for(var i=0;i<blockCount;i++){
            var colorID = Math.floor(Math.random()*colors.length);
            columnArray[i].addBlock();
            
        }
    }
}
function BlockClick(c){
    if(!c.el.hasClass("disabled-click")){
        storage.setItem("savegame",JSON.stringify(grid));
        storage.setItem("savegame-score",totalScore);
        storage.setItem("savegame-timer",timer);
        storage.setItem("savegame-clicks",moves);

        var tempKill = KillBlocks(c);
        temp_check = Array();
        if(tempKill.length > 1){
            var key;
            var beam = {};

            for(var i=0; i<tempKill.length; i++){
                if(!beam[tempKill[i].c]){
                    beam[tempKill[i].c] = Array();
                }
                    beam[tempKill[i].c].push(tempKill[i].f);
            }
            for (key in beam) {
                if (beam.hasOwnProperty(key) && /^0$|^[1-9]\d*$/.test(key) && key <= 4294967294) {
                    beam[key].sort()
                    columnArray[key].removeBlocks(beam[key]);
                }
            }

            UpdateScore(parseInt(totalScore)+tempKill.length);
            storage.setItem("stats-blocks-removed",parseInt(storage.getItem("stats-blocks-removed"))+tempKill.length);
            moves++;
        }else{
            columnArray[tempKill[0].c].blocks[tempKill[0].f].checked = false;
        }
       
       
       if(moves == clicks){
            addBlocks();
        }

        setTimeout(function(){
            MoveColumns();
            if(!FindAvailableBlocks()){
                switch(gamemode){
                    case "free_roam":
                        GameOver("NO_MOVES");
                        break;
                    case "time_trial":
                        ShuffleBlocks();
                        break;
                }
            }
        },250);
   }
}
function MoveColumns(){
    var needToMove = false;
    if(columnArray[0].blocks.length > 0){
        needToMove = true;
    }
    for(var i=1; i<columnArray.length; i++){
        if(columnArray[i].blocks.length == 0 && needToMove){
            for(var k=i-1; k>=0; k--){
                columnArray[k+1].floors = columnArray[k].floors
                columnArray[k+1].blocks = columnArray[k].blocks;
                columnArray[k].clearBlocks();
                grid[k+1] = grid[k];
                for(var j=0; j<columnArray[k+1].blocks.length; j++){
                    columnArray[k+1].blocks[j].column = k+1;
                    columnArray[k+1].el.append(columnArray[k+1].blocks[j].getEl());
                }

            }
        }else{
            needToMove = true;
        }
    }
}
function FindAvailableBlocks(){
    if($(".block").length == 0){
        GameOver("WIN");
        return true;
    }
    if($(".block").length == 1){
        addBlocks();
        return true;
    }
    for(var c=0; c<columnArray.length; c++){
        for(var f=0; f<columnArray[c].blocks.length; f++){
            if(columnArray[c].blocks[f] != undefined){
                var thisColor = columnArray[c].blocks[f].color;
                if(c>0 && columnArray[c-1].blocks[f] != undefined){
                    if(columnArray[c-1].blocks[f].color == thisColor){
                        return true;
                    }
                }
                if(c<columnArray.length-1 && columnArray[c+1].blocks[f] != undefined){
                    if(columnArray[c+1].blocks[f].color == thisColor){
                        return true;
                    }
                }
                if(f>0 && columnArray[c].blocks[f-1] != undefined){
                    if(columnArray[c].blocks[f-1].color == thisColor){
                        return true;
                    }
                }
                if(f<columnArray[c].blocks.length-1 && columnArray[c].blocks[f+1] != undefined){
                    if(columnArray[c].blocks[f+1].color == thisColor){
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
function KillBlocks(o){
    temp_check.push({c:o.column,f:o.floor});
    o.checked = true;
    var left_side = false;
    var right_side = false;
    var top_side = false;
    var bottom_side = false;
    
    if(o.column > 0){ left_side = columnArray[o.column-1].blocks[o.floor]; }
    if(o.column != blockCount - 1){ right_side = columnArray[o.column+1].blocks[o.floor]; }
    if(o.floor > 0){ bottom_side = columnArray[o.column].blocks[o.floor-1]; }
    if(o.floor != columnArray[o.column].floors-1){ top_side = columnArray[o.column].blocks[o.floor+1]; }
    
    if(left_side && left_side.color == o.color && !left_side.checked){
        KillBlocks(left_side);
    }
    if(right_side && right_side.color == o.color && !right_side.checked){
        KillBlocks(right_side);
    }
    if(top_side && top_side.color == o.color && !top_side.checked){
        KillBlocks(top_side);
    }
    if(bottom_side && bottom_side.color == o.color && !bottom_side.checked){
        KillBlocks(bottom_side);
    }
    
    return temp_check;
}
function ShuffleBlocks(){
    for(var i=0; i<columnArray.length; i++){
        columnArray[i].shuffle();
    }
    setTimer(function(){
        if(!FindAvailableBlocks()){
            ShuffleBlocks();
        }
    },250);
}
function exitAppPopup() {
        navigator.app.exitApp();
    return false;
}
function UpdateScore(s){
    totalScore = s;
    $(".play-score").html("Score: "+s);
}