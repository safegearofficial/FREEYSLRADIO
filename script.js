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
    currentTrack = getRandomTrack();
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

function searchVideos(pageToken) {
  const request = gapi.client.youtube.search.list({
    part: "snippet",
    type: "video",
    q: `${ARTIST_NAME} official music`,
    maxResults: 50,
    fields: "nextPageToken,items(id(videoId),snippet(publishedAt,channelId,channelTitle,title,description))",
    videoDefinition: "high",
    pageToken: pageToken,
  });

  request.execute(response => {
    onSearchResponse(response);

    if (response.nextPageToken) {
      searchVideos(response.nextPageToken);
    }
  });
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
  currentTrack = getRandomTrack();
  playVideo(currentPlaylist[currentTrack]);
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    currentTrack = getRandomTrack();
    playVideo(currentPlaylist[currentTrack]);
  }
}

function playVideo(videoId) {
  if (player && videoId) {
    player.loadVideoById(videoId);
  }
}

function getRandomTrack() {
  return Math.floor(Math.random() * currentPlaylist.length);
}
