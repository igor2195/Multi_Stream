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
        containerToHide: '#gamesSection, #gameStreamsSection,#StreamWatch,#popularStreamsSection'
    },
    popular: {
        menu: '#popular',
        containerToShow: '#popularStreamsSection',
        containerToHide: '#gameStreamsSection'
    },
    following: {
        menu: '#following',
        containerToShow: '#followingStreamsSection',
        containerToHide: '#followingStreamsSection'
    }
};




//========================================================MAIN====================================================================================
$(document).ready(function(){

    
    //loading most popular games отображение популярных игр
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






    $('#popular').click(function(){
        showConteiner('popular');
        // removeElementsInList('#popularStreamsList .gameInList');
        // removeElementsInList('.mainContentSection');
        removeElementsInList('iframe');
        showMostPopularStreams('#popularStreamsList');
    });

    $('#games').click(function(){
        removeElementsInList('iframe');
        showConteiner('games');
    });

    $('#following').click(function(){
        showConteiner('following');
        removeElementsInList('#followingStreamsList .gameInList');
        showFollowingStreams('#followingStreamsList');
    });
    //популярные стримы 
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
                // "broadcaster_language": language,
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
    }








    //open streams section by clicking on the game image переход на экран всех стимов выбраной игры
    $("#gamesSection").on('click','div img',function(event){
        var gameName = $(this).attr('alt');
        var gameImgUrl = $(this).attr('src');

        $('#gamesSection').hide();
        $('#gameStreamsSection').show();

        $('#smallGameIcon').attr('src', gameImgUrl);
        $('#gameName').text(gameName);
        
        //settig default font-size
        $('#gameName').css('font-size', defaultFontSizeForGameName);
        // resizeFontForContainer('#gameInfoContainer', '#gameName');
        removeElementsInList('#streamsList .gameInList');
        showStreamsForGame(gameName, '#streamsList');
    });
    
    //click back button
    $('#backBtn').click(function(){
        //clearing results of previous showing streams list
        showStreamsAjaxRequest.abort();
        removeElementsInList('#streamsList .gameInList');
        
        $('#gameStreamsSection').hide();
        $('#gamesSection').show();        
    });

    //open twitch player for chanel открытие стрима 
    // $('#streamsList, #popularStreamsList, #followingStreamsList').on('click', '.streamTextInfo', function(event){
    //     var chanelName = $('b:first',this).text();
    //     var url = twitchPlayerUrl + chanelName;
        
    //     createNewWindow(url, defaultTwitchPlayerWindowWidth, defaultTwitchPlayerWindowHeight);
    //     close(); 
    // }); 

    $('#streamsList, #popularStreamsList, #followingStreamsList').on('click', '.streamPreview', function(event){
        var channelName = $('b:first',$(this).parent()).text();
        var src;
        var url = twitchPlayerUrl + channelName;

        dataStreams.streams.map(stream => {  
            if (stream.channel.name === channelName) { 
                src = stream.channel.logo; 
            } 
        });
        
        while(StreamChannelList.includes(url) === false){
            StreamChannelList.push(url);
            $('.ListSream').append(`<li><img src="${src}"></li>`);
        };
        console.log(StreamChannelList);
               
    }); 


    //просмотрт стримов
    $('#startWatch').click(function(){
        //clearing results of previous showing streams list
        // showStreamsAjaxRequest.abort();
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

    //Шаблон для плеера 
    function watchStream(streamURL){
        $('#StreamWatch').append("<iframe src=" + streamURL +" frameborder='0' height='300' width='550'></iframe>")
    }
    

    //=====================================================================ADDITIONAL FUNCTIONS========================

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

    //добоавление игры в секшен
    function addGameToGameSection(imageUrl, gameName, sectionSelector){
        $(sectionSelector).prepend($('<div ' + "class='game'" + '><img src='+ imageUrl + ' alt="' + gameName + '"></div>'));
    };    
});