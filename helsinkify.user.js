// ==UserScript==
// @name        Helsinkify
// @namespace   https://github/pvalkone
// @match       http://www.radiohelsinki.fi/soittolistat/
// @author      Petteri Valkonen
// @description An UserScript for adding Spotify links to Radio Helsinki's playlist pages.
// @version     0.1  
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @require     http://github.com/cowboy/jquery-throttle-debounce/raw/v1.1/jquery.ba-throttle-debounce.min.js
// ==/UserScript==

// Limit Spotify metadata queries to 10 requests / second
// See: http://developer.spotify.com/en/metadata-api/overview/#rate-limiting
var metadataQueryDelay = 1 * 1000 / 10

function getMostPopularTrackHref(tracks) {
  if (tracks.length == 0) {
    return undefined
  }
  var maxPopularity = Math.max.apply(Math, $.map(tracks, function(track) { return track.popularity })) 
  var mostPopularTrack = $.grep(tracks, function(track) { return parseFloat(track.popularity) == maxPopularity })[0]
  return mostPopularTrack.href
}

function getSpotifyLinkFor(track) {
  $.throttle(metadataQueryDelay, $.ajax({
    url: 'http://ws.spotify.com/search/1/track.json?q=' + escape(track.replace(':', '').toLowerCase()),
    async: false,
    success: function(data) { href = getMostPopularTrackHref($.parseJSON(data).tracks) }
  }))
  return href !== undefined ? '<a href="' + href + '">' + track + '</a>' : href
}

$('p.lista-p').each(function(index) {
  var text = $.trim($(this).text())
  $.each(text.split('\n'), function() {
    var track = this.substring(this.lastIndexOf('» ') + 2)
    var spotifyLink = getSpotifyLinkFor(track)
    text = text.split(track).join((spotifyLink !== undefined ? spotifyLink : track) + '<br />')
  })
  $(this).html(text)
})
