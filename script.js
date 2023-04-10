const API_KEY = "AIzaSyBYOdFNlLytvvpH52y4UyZHwHklFN_N2Qg";
const ARTIST_NAME = "Young Thug";
const MAX_RESULTS = 25;

let player;
let currentPlaylist = [];
let currentTrack = 0;

function onClientLoad() {
  gapi.client.setApiKey(API_KEY);
  gapi.client.load("youtube", "v3", onYouTubeApiLoad);
}

function onYouTubeApiLoad() {
  document.getElementById("playButton").addEventListener("click", searchForMusic);
  document.getElementById("nextButton").addEventListener("click", playNextTrack);
}

function searchForMusic() {
  const request = gapi.client.youtube.search.list({
    part: "snippet",
    type: "video",
    q: ARTIST_NAME,
    maxResults: MAX_RESULTS,
    fields: "items(id(videoId),snippet(publishedAt,channelId,channelTitle,title,description))"
  });

  request.execute(onSearchResponse);
}

function onSearchResponse(response) {
  const videoIds = response.items.map(item => item.id.videoId);
  currentPlaylist = videoIds;
  playVideo(currentPlaylist[currentTrack]);
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "360",
    width: "640",
    events: {
      "onReady": onPlayerReady,
      "onStateChange": onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    playNextTrack();
  }
}

function playNextTrack() {
  currentTrack = (currentTrack + 1) % currentPlaylist.length;
  playVideo(currentPlaylist[currentTrack]);
}

function playVideo(videoId) {
  if (player) {
    player.loadVideoById(videoId);
  }
}

window.addEventListener("load", onClientLoad);
