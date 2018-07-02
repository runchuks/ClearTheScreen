
var startFloors = 10;

var blockCount = 10;
var maxblock = 14;

var columnArray = Array(blockCount);
var grid = Array(blockCount);

var timeTrialStartTimer = 100;

var debug = true;

var paintBlocks = true;


var colors = ["#ff3333","#3333ff","#33ff33","#ffff33","#ff9933"];

var clicks = 5;

var time_trial_percent_of_time = 8;

var app = {
    initialize: function() {
        this.bindEvents();
        
        
        
        admobid = {
            banner: 'ca-app-pub-6320522889623517/4954467383',
            interstitial: 'ca-app-pub-6320522889623517/5130447388'
        };
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        if(AdMob) AdMob.createBanner({
            adId:admobid.banner, 
            adSize:'BANNER', 
            overlap:true, 
            position:AdMob.AD_POSITION.BOTTOM_CENTER, 
            autoShow:true
        });

        if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:false} );
        
        init();
        
        setTimeout(function(){$(".overLogo").hide();},1000);
        
        },
    receivedEvent: function(id) {
        
    }
};

var admobid = {};
var storage = window.localStorage;


var menus = {
    "start" : {
        "buttons" : [
            {
                "title" : "Play",
                "action" : function(){
                    RenderMenu("play");
                }
            },
            {
                "title" : "Resume",
                "action" : function(){
                    resumeGame();
                },
                "checker" : function(el){
                    if(storage.getItem("savegame") == "0"){
                        $(el).addClass("deactive");
                    }else{
                        $(el).removeClass("deactive");
                    }
                }
            },
            {
                "title" : "Stats",
                "action" : function(){
                    ShowStats();
                }
            },
            {
                "title" : "Exit",
                "action" : function(){
                    exitAppPopup();
                }
            }
        ]
    },
    "play" : {
        "buttons" : [
            {
                "title" : "Free roam",
                "action" : function(){
                    makeField("free_roam");
                }
            },
            {
                "title" : "Time trial",
                "action" : function(){
                    makeField("time_trial");
                }
            },
            {
                "title" : "Back",
                "action" : function(){
                    RenderMenu("start");
                }
            }
        ]
    }
}

var storageSetters = Array(
    "stat-games-payed",
    "stat-games-payed-tt",
    "stat-games-payed-c",
    "savegame",
    "savegame-score",
    "savegame-timer",
    "savegame-timer-left",
    "savegame-mode",
    "savegame-clicks",
    "stat-games-won",
    "stat-games-time-trial-longest",
    "stat-games-high-score",
    "stat-games-high-score-tt",
    "stat-games-high-score-c",
    "stats-blocks-removed",
    "stats-total-playtime",
    "stats-time-gained"
);

for(var i=0; i<storageSetters.length; i++){
    if(storage.getItem(storageSetters[i]) === null){
        storage.setItem(storageSetters[i],"0");
    }
}


var gameHeight;
var gameWidth;
var gameDOM;
var blockCountH;
var blockCountV;

var ww = $(window).width();
var wh = $(window).height();

var totalScore = 0;

var moves = 0;

var maxBlocks = 0;

var blockclick = true;

var timer = 0;

var timetrialtimer = 0;

var gamemode = null;

var temp_check = Array();

var check_count = 0;

var stopTimeTrial = false;