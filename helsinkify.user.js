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
// @version     0.1.0-pre 
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @require     https://raw.github.com/brandonaaron/jquery-outerhtml/master/jquery.outerhtml.js
// ==/UserScript==

// See: http://developer.spotify.com/en/metadata-api/overview/#rate-limiting
var metadataQueryDelay = 1000

function getMostPopularTrackHref(tracks) {
  if (tracks.length == 0) { return }
  var maxPopularity = Math.max.apply(Math, $.map(tracks, function(track) { return track.popularity })) 
  var mostPopularTrack = $.grep(tracks, function(track) { return parseFloat(track.popularity) == maxPopularity })[0]
  return mostPopularTrack.href
}

function helsinkify() {
  var ajaxRequestQueue = []
  var lists = []
  setInterval(function() {
    if (ajaxRequestQueue.length > 0) {
      var ajaxRequest = ajaxRequestQueue.pop()
      if (typeof ajaxRequest === "function") {
        var spotifyLink = ajaxRequest()
        var track = spotifyLink.href ? $('<a>').attr('href', spotifyLink.href).text(spotifyLink.track).outerHTML() : spotifyLink.track
        lists[spotifyLink.listIndex].prepend('» ' + track + $('<br>').outerHTML())
      }
    }
  }, metadataQueryDelay)
  $('p.lista-p').each(function(index) {
    var list = $(this)
    lists[index] = list
    var text = $.trim(list.text())
    list.empty()
    $.each(text.split('\n'), function() {
      var track = this.substring(this.lastIndexOf('» ') + 2)
      var split = track.split(': ')
      var query = (split[0] + ' track:"' + split[1] + '"').toLowerCase()
      ajaxRequestQueue.push(function() {
        var href
        $.ajax({
          url: 'http://ws.spotify.com/search/1/track.json?q=' + escape(query),
          async: false,
          success: function(data) { href = getMostPopularTrackHref($.parseJSON(data).tracks) }
        })
        return { 'listIndex': index, 'track': track, 'href': href }
      })
    })
  })
}

helsinkify()
