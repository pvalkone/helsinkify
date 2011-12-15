// Helsinkify - A Greasemonkey user script for adding Spotify links to Radio
// Helsinki's playlist pages. 
//
// Copyright Petteri Valkonen <petteri.valkonen@iki.fi>, 2011
//
// This program is free software. It comes without any warranty, to the extent
// permitted by applicable law. You can redistribute it and/or modify it under
// the terms of the Do What The Fuck You Want To Public License, Version 2, as
// published by Sam Hocevar. See http://sam.zoy.org/wtfpl/COPYING for more
// details.
 
// ==UserScript==
// @name        Helsinkify
// @namespace   https://github/pvalkone
// @match       http://www.radiohelsinki.fi/soittolistat/
// @author      Petteri Valkonen
// @description An user script for adding Spotify links to Radio Helsinki's playlist pages.
// @version     0.1  
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @require     http://github.com/cowboy/jquery-throttle-debounce/raw/v1.1/jquery.ba-throttle-debounce.min.js
// @require     https://raw.github.com/brandonaaron/jquery-outerhtml/master/jquery.outerhtml.js
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
  return href ? $('<a>').attr('href', href).text(track).outerHTML() : href
}

function helsinkify() {
  $('p.lista-p').each(function(index) {
    var text = $.trim($(this).text())
    $.each(text.split('\n'), function() {
      var track = this.substring(this.lastIndexOf('» ') + 2)
      var spotifyLink = getSpotifyLinkFor(track)
      text = text.split(track).join((spotifyLink ? spotifyLink : track) + $('br').outerHTML())
    })
    $(this).html(text)
  })
}

helsinkify()
