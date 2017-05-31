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

    
function formatSearchResultItem(url, thumbnailURL, title, descr, pubDate) {
    var result = 
    '<li class="row search-result">' +
            '<div class="result-thumb col-sm-6 col-md-4">' +
                '<a href="' + url + '" target="_blank"><img src="' + thumbnailURL + '" alt="' + descr + '"></a>' +
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
    $(".search-results").html(formatSearchResultsToHTML(apiResponse));
}

function searchYouTubeOnSubmit() {
    $("form").on("submit", function(e) {
        e.preventDefault();
        var query = $("#search").val();
        var inputObj = $("#search")[0];
        if (query) {
            requestYouTubeSearchResults(query, renderSearchResults);
            inputObj.attributes.placeholder.textContent = "Type here to search...";
        } else {
            inputObj.attributes.placeholder.textContent = "Hey! I said type here to search...";
        }
    });
}
    
function loadMore(apiResponse) {
    $(".search-results").append(formatSearchResultsToHTML(apiResponse));
    $(window).bind('scroll', bindScroll);
    $("#loading-results").addClass("hidden");
 }

 function bindScroll(){
    if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
        if(searchState.query) {
            var q = searchState.query;
            var pageToken = searchState.nextPageToken;
            $(window).unbind('scroll');
            $("#loading-results").removeClass("hidden");
            requestYouTubeSearchResults(q, pageToken, loadMore);
        }
   }
}
    
function getVideoURL(event) {
    var regURL = $(event.currentTarget).find("a").first().attr("href");
    var vidID = regURL.slice(regURL.indexOf("=") + 1);
    var embedURL = "https://www.youtube.com/embed/" + vidID;
    return embedURL;
}
    
function setLightboxURL(url) {
    var src = $("#modal-video")[0].attributes.src;
    src.value = url;
    src.textContent = url;
}
    
function openLightbox(event) {
    var urlForLightbox = getVideoURL(event);
    setLightboxURL(urlForLightbox);
    $("body").addClass("lightboxIsOpen");
    closeLightboxOnClick();
}
    
function closeLightbox() {
    setLightboxURL("");
    $("body").removeClass("lightboxIsOpen");
    $(".modal-page-wrap").off("click");
}
    
function openLightboxOnClick() {
    $(".search-results").on("click", ".search-result", openLightbox);
}
    
function closeLightboxOnClick() {
    $(".modal-page-wrap").on("click", closeLightbox)
}


searchYouTubeOnSubmit();
openLightboxOnClick();
$(window).scroll(bindScroll);
    
});