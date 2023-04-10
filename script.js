const API_KEY = "AIzaSyBYOdFNlLytvvpH52y4UyZHwHklFN_N2Qg";
const ARTIST_NAME = "Young Thug";
const MAX_RESULTS = 25;

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

function playNextTrack() {
  currentTrack = (currentTrack + 1) % currentPlaylist.length;
  playVideo(currentPlaylist[currentTrack]);
}

function playVideo(videoId) {
  const youtubePlayer = document.getElementById("youtubePlayer");
  youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

window.addEventListener("load", onClientLoad);