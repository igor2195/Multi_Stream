// var searchingStreamsUrl = "https://api.twitch.tv/kraken/search/streams";
var twitchPlayerUrl = "https://player.twitch.tv/?channel=";
var topGamesListUrl = "https://api.twitch.tv/kraken/games/top";
var topStreamsListUr = "https://api.twitch.tv/kraken/streams";
var StreamChannelList = [];
var dataStreams;


var clientId = "w3fm9hnnceiod76zcsfbje4hy4mfxn";
var acceptHeader = "application/vnd.twitchtv.v5+json";

var defaultLimitOfGamesInGamesList = 100;
var defaultLimitOfStreamsInStreamsList = 100;

var defaultFontSizeForGameName = '17px';


//========================================================Menu================================================================================
var menuContainerDictionary = {
    games: {
        menu: '#games',
        containerToShow: '#gamesSection',
        containerToHide: '#gamesSection, #gameStreamsSection,#StreamWatch,#popularStreamsSection, #right-content'
    },
    popular: {
        menu: '#popular',
        containerToShow: '#popularStreamsSection',
        containerToHide: '#gameStreamsSection, #right-content'
    }
    // following: {
    //     menu: '#following',
    //     containerToShow: '#followingStreamsSection',
    //     containerToHide: '#followingStreamsSection'
    // }
};

function showConteiner(name){
    for(var propName in menuContainerDictionary){
        if(name == propName){
            $(menuContainerDictionary[propName].containerToHide).hide();
            $(menuContainerDictionary[propName].containerToShow).show();
            $(menuContainerDictionary[propName].menu).addClass('active');
        } else {
            $(menuContainerDictionary[propName].containerToHide).hide();
            $(menuContainerDictionary[propName].menu).removeClass('active');
        }
    }
};


//========================================================MAIN====================================================================================
$(document).ready(function(){

    

    //loading most popular games загрузка популярных игр
    $('#gamesSection').html(function(){
        $.ajax({
            url: topGamesListUrl,
            type: "GET",
            dataType: "json",
            headers: {
                "accept":acceptHeader,
                "client-id":clientId
            },
            data: {
                "limit":defaultLimitOfGamesInGamesList
            },
            beforeSend: function(){
                $("#loadingGamesImg").show();
            },
            complete: function(){
                $('#loadingGamesImg').hide();
            },
            success: function(data){
                data.top.reverse().forEach(function(element) {
                    addGameToGameSection(element.game.box.medium, element.game.name, '#gamesSection');
                }, this);
            }
        });  
    });

    //загрузка популярныч стримов 
    function showMostPopularStreams(containerSelector){
        showStreamsAjaxRequest = $.ajax({
            url: topStreamsListUr,
            type: "GET",
            dataType: "json",
            headers: {
                "accept": acceptHeader,
                "client-id": clientId                    
            },
            data: {
                "limit": defaultLimitOfStreamsInStreamsList                  
            },
            beforeSend: function(){                
                $("#loadingPopularStreamsImg").show();
            },
            complete: function(){
                $('#loadingPopularStreamsImg').hide();
            },
            success: function(data){
                dataStreams = data;                
                data.streams.forEach(function(element){
                    addStreamToStreamsList(element.channel.logo, element.preview.medium, element.channel.status, element.channel.name, element.viewers, element.game, containerSelector)
                } ,this);
            }
        });
    }

    //загрузка всех стримов выбраной игры
    function showStreamsForGame(gameName, containerSelector){
        showStreamsAjaxRequest = $.ajax({
            url: topStreamsListUr,
            type: "GET",
            dataType: "json",
            headers: {
                "accept": acceptHeader,
                "client-id": clientId                    
            },
            data: {
                
                "limit": defaultLimitOfStreamsInStreamsList,
                "game": gameName          
            },
            beforeSend: function(){                
                $("#loadingStreamsImg").show();
            },
            complete: function(){
                $('#loadingStreamsImg').hide();
            },
            success: function(data){ 
                dataStreams = data;               
                data.streams.forEach(function(element){
                    addStreamToStreamsList(element.channel.logo, element.preview.medium, element.channel.status, element.channel.name, element.viewers, element.game, containerSelector)
                } ,this);
            }
        });
    }

    

    $('#popular').click(function(){
        showConteiner('popular');
        showMostPopularStreams('#popularStreamsList');
        removeElementsInList('iframe');
        removeElementsInList('.right-content .ListSreamElement div')
        StreamChannelList.length = 0;
        $('.left-content').width('100%');
        // $('#right-content').hide();
        // $('#startWatch').hide();
    });

    $('#games').click(function(){
        showConteiner('games');
        removeElementsInList('iframe');
        removeElementsInList('.right-content .ListSreamElement div')
        StreamChannelList.length = 0;
        // $('#right-content').hide();
        $('.left-content').width('100%');
        // $('#startWatch').hide();
    });

    // $('#following').click(function(){
    //     showConteiner('following');
    //     removeElementsInList('#followingStreamsList .gameInList');
    //     showFollowingStreams('#followingStreamsList');
    // });
    

    // переход на экран всех стимов выбраной игры по клику на изображение
    $("#gamesSection").on('click','div img',function(event){
        var gameName = $(this).attr('alt');
        var gameImgUrl = $(this).attr('src');

        $('#gamesSection').hide();
        $('#gameStreamsSection').show();

        $('#smallGameIcon').attr('src', gameImgUrl);
        $('#gameName').text(gameName);

        removeElementsInList('#streamsList .gameInList');
        showStreamsForGame(gameName, '#streamsList');
    });
    
    //Кнопка возврата
    $('#backBtn').click(function(){
        showStreamsAjaxRequest.abort();
        removeElementsInList('#streamsList .gameInList');
        $('#gameStreamsSection').hide();
        $('#gamesSection').show();        
    });

    //добавление трансляции в список 
    $('#streamsList, #popularStreamsList, #followingStreamsList').on('click', '.streamPreview', function(event){
        $('.left-content').width('75%');
        $('.right-content').show();
        var channelName = $('b:first',$(this).parent()).text();
        var nameGame;
        var src;
        var url = twitchPlayerUrl + channelName;
        
        dataStreams.streams.map(stream => {  
            if (stream.channel.name === channelName) { 
                src = stream.channel.logo; 
                nameGame = stream.game;
            } 
        });
        while(StreamChannelList.includes(url) === false){
            StreamChannelList.push(url);
            $('.ListSreamElement').append(`<div class="StreamListElement"><img src="${src}"><div><div>${channelName}</div><div>${nameGame}</div></div></div>`);
        };
        console.log(StreamChannelList);
               
    }); 


    //просмотрт стримов
    $('#startWatch').click(function(){
        removeElementsInList('.gameInList');
        
        $('#gameStreamsSection').hide();
        $('#popularStreamsSection').hide();
        $('#right-content').hide();
        $('.left-content').width('100%');
        $('#StreamWatch').show();
        StreamChannelList.forEach((url) => {
            watchStream(url);
        });

    });

    //=====================================================================ADDITIONAL FUNCTIONS========================

    //Шаблон для плеера 
    function watchStream(streamURL){
        $('#StreamWatch').append("<iframe src=" + streamURL +" frameborder='0' height='300' width='550'></iframe>")
    }

    //добоавление игры в секшен
    function addGameToGameSection(imageUrl, gameName, sectionSelector){
        $(sectionSelector).prepend($('<div ' + "class='game'" + '><img src='+ imageUrl + ' alt="' + gameName + '"></div>'));
    };    
});