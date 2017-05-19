/*$(function() {
   $("form").on("submit", function(e) {
       e.preventDefault();
       // prepare the request
       var request = gapi.client.youtube.search.list({
           part: "snippet",
           type: "video",
           q: encodeURIComponent($("#search").val()).replace(/%20/g, "+"),
           maxResults: 3,
           order: "viewCount",
           publishedAfter: "2015-01-01T00:00:00Z"
       });
       // execute the request
       request.execute(function(response) {
           console.log(response);
       });
   });
});

function init() {
    gapi.client.setApiKey("AIzaSyBUfKE_-49b8yfKdNvDepJHUS7IrqpKijo");
    gapi.client.load("youtube", "v3", function () {
//       yt api is ready 
    });
}*/

$(function() {
    
var searchState = {
    apiKey: "AIzaSyBUfKE_-49b8yfKdNvDepJHUS7IrqpKijo",
    query: undefined,
    nextPageToken: undefined,
    maxResults: undefined
}

function requestYouTubeSearchResults(query, pageToken, callback) {
    var YOUTUBE_SEARCH_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';
    var data = {
        key: searchState.apiKey,
        part: "snippet",
        q: query,
        maxResults: 10,
    };
    typeof pageToken === 'function'? callback = pageToken : data.pageToken = pageToken;
    searchState.query = query;
    $.getJSON(YOUTUBE_SEARCH_ENDPOINT, data, callback);
}

function logResponse(data) {
    console.log(data);
}
    
function formatSearchResultItem(url, thumbnailURL, title, descr, pubDate) {
    var result = 
    '<li class="row search-result">' +
        '<div class="aspect-ratio">' +
            '<div class="result-thumb col-sm-6 col-md-4">' +
                '<a href="' + url + '" target="_blank"><img src="' + thumbnailURL + '" alt="' + descr + '"></a>' +
            '</div>' +
        '</div>' +
        '<div class="result-info col-sm-6 col-md-8">' +
            '<h2 class="result-title">' +
                '<a href="' + url + '" target="_blank">' + title + '</a>' +
            '</h2>' +
            '<h3 class="result-description-header">Description: </h3>' +
            '<p class="result-description">' + descr + '</p>' +
            '<h4 class="result-pub-date-header">Published: &nbsp; </h4>' + 
            '<time class="result-pub-date">' + pubDate + '</time>' +
        '</div>' +
    '</li>';
    return result;
}
    
function formatSearchResultsToHTML(apiResponse) {
    var results = $.map(apiResponse.items, function(item, i) {
        var url = "https://www.youtube.com/watch?v=" + item.id.videoId;
        var thumbnailURL = item.snippet.thumbnails.medium.url;
        var title = item.snippet.title.slice(0, 60) + "...";
        var descr = item.snippet.description.slice(0, 100) + "...";
        var pubDate = new Date(item.snippet.publishedAt).toDateString();
        return formatSearchResultItem(url, thumbnailURL, title, descr, pubDate);
    });
    // Store nextPageToken for infinite scroll
    searchState.nextPageToken = apiResponse.nextPageToken;
    return results.join("");
}
    
function renderSearchResults(apiResponse) {
    console.log(apiResponse);
    $(".search-results").html(formatSearchResultsToHTML(apiResponse));
}

function searchYouTubeOnSubmit() {
    $("form").on("submit", function(e) {
        e.preventDefault();
        var query = $("#search").val();
        requestYouTubeSearchResults(query, renderSearchResults);
    });
}
    
function loadMore(apiResponse) {
    $(".search-results").append(formatSearchResultsToHTML(apiResponse));
    $(window).bind('scroll', bindScroll);
    $("#loading-results").addClass("hidden");
 }

 function bindScroll(){
    if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
        var q = searchState.query;
        var pageToken = searchState.nextPageToken;
        $(window).unbind('scroll');
        $("#loading-results").removeClass("hidden");
        requestYouTubeSearchResults(q, pageToken, loadMore);
   }
}


searchYouTubeOnSubmit();
$(window).scroll(bindScroll);
    
});