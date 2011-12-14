// ==UserScript==
// @name        Helsinkify
// @namespace   https://github/pvalkone
// @match       http://www.radiohelsinki.fi/soittolistat/
// @author      Petteri Valkonen
// @description An UserScript for adding Spotify links to Radio Helsinki's playlist pages.
// @version     0.1  
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// ==/UserScript==

function getMostPopularTrackHref(tracks) {
  var href
  if (tracks.length > 0) {
    href = tracks[0].href
    var maxPopularity = 0.0
    $.each(tracks, function() {
      var popularity = parseFloat(this.popularity)
      if (popularity > maxPopularity) {
        href = this.href
      }
    })
  }
  return href
}

function getSpotifyLinkFor(track) {
  var href
  var query = track.replace(':', '').toLowerCase()
  $.ajax({
    url: 'http://ws.spotify.com/search/1/track.json?q=' + escape(query),
    async: false,
    success: function(data) {
      var result = $.parseJSON(data)
      href = getMostPopularTrackHref(result.tracks)
    }
  })
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
