const ARTIST_NAME = "Young Thug";
const MAX_RESULTS = 50;
const API_KEY = 'AIzaSyBYOdFNlLytvvpH52y4UyZHwHklFN_N2Qg';

let currentPlaylist = [];
let currentTrack = 0;
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  document.getElementById('playButton').addEventListener('click', () => {
    event.target.playVideo();
  });

  document.getElementById('nextButton').addEventListener('click', () => {
    currentTrack++;
    if (currentTrack >= currentPlaylist.length) {
      currentTrack = 0;
    }
    playVideo(currentPlaylist[currentTrack]);
  });

  gapi.load('client', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
  }).then(function () {
    searchVideos();
  });
}

function searchVideos() {
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
  checkEmbeddableVideos(videoIds);
}

function checkEmbeddableVideos(videoIds) {
  const request = gapi.client.youtube.videos.list({
    part: "status",
    id: videoIds.join(','),
    fields: "items(id,status(embeddable))"
  });

  request.execute(onVideoDetailsResponse);
}

function onVideoDetailsResponse(response) {
  const embeddableVideoIds = response.items
    .filter(item => item.status.embeddable)
    .map(item => item.id);

  currentPlaylist = embeddableVideoIds;
  shuffleArray(currentPlaylist); // Shuffle the playlist before starting playback
  playVideo(currentPlaylist[currentTrack]);
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    currentTrack++;
    if (currentTrack >= currentPlaylist.length) {
      currentTrack = 0;
    }
    playVideo(currentPlaylist[currentTrack]);
  }
}
function playVideo(videoId) {
  if (player && videoId) {
    player.loadVideoById(videoId);
  }
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
