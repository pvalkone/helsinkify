// ==UserScript==
// @name        Helsinkify
// @namespace   https://github/pvalkone
// @include     *
// @author      Petteri Valkonen
// @description An UserScript for adding Spotify links to Radio Helsinki's playlist pages (http://www.radiohelsinki.fi/soittolistat/).
// @version     0.1  
// ==/UserScript==

// A function that loads jQuery and calls a callback function when jQuery has finished loading.
// See: http://r.evold.ca/jquery4us
function addJQuery(callback) {
  var script = document.createElement("script")
  script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js")
  script.addEventListener('load', function() {
    var script = document.createElement("script")
    script.textContent = "(" + callback.toString() + ")();"
    document.body.appendChild(script)
  }, false)
  document.body.appendChild(script)
}

function helsinkify() {
  function getMostPopularTrackHref(tracks) {
    var href = undefined
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
    var href = undefined
    var query = track.replace(':', '').toLowerCase()
    $.ajax({
      url: 'http://ws.spotify.com/search/1/track.json?q=' + escape(query),
      async: false,
      success: function(data) {
        href = getMostPopularTrackHref(data.tracks)
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
}

addJQuery(helsinkify);
