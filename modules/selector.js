/* Welcome to selector.js!
This module is responsible for handling the selection of artists, albums, and tracks in the CD Player.
The spawnDropdown function is called when the user clicks on the artist or album dropdown buttons.
The functions:
- spawnDropdown creates a dropdown menu for artists and albums.
- fetchTracks fetches the tracks for the selected album.
- albumSelect sets the selected album.
- artistSelect sets the selected artist.
- trackSelect sets the selected track.
- initializePlayer sets the initial album title.
- updatePlayer updates the CD Player with the selected track.
- togglePlayPause toggles the play/pause state of the audio player.
- nextTrack plays the next track in the playlist.
- prevTrack plays the previous track in the playlist.

~ signalkitten <3
*/

let currentArtist;
let currentAlbum;
let initialize = false;
let tracks = [];
let trackNames = [];  
let isPlaying = false;

function playSelectedTrack(trackName) {
    const trackIndex = tracks.findIndex(track => track.trackName === trackName);
    document.querySelector('#media-control-button[data-id="3"] .media-svg')?.classList.add('clicked');
    document.querySelector('.window-box[data-id="4"] .media-svg')?.classList.remove('clicked');


    if (trackIndex === -1) {
        console.error("Track not found:", trackName);
        return;
    }

    currentTrackIndex = trackIndex; // Update player to selected track
    updatePlayer();
    audioPlayer.play();
    isPlaying = true;
}


export function spawnDropdown(type) {
  let dropdownButton = '';
  let list = [];
  let targetDisplay = null;
  const existingMenu = document.getElementById('menu-container');
  if (existingMenu) {
      console.log('byebye!');
      existingMenu.remove();
      return;
  }

  if (type == 'artist') {
      list = ['Murdock Street', 'Lokadonna', 'tsunxme'];
      targetDisplay = document.getElementById("artistName");
      dropdownButton = document.querySelector('[data-id="3"]');
  }

  if (type == 'album' && currentArtist == 'Murdock Street') {
      list = ['Basement Candy - EP', 'Ode to You'];
      targetDisplay = document.getElementById("albumTitle");
      dropdownButton = document.querySelector('[data-id="1"]');
  }

  if (!dropdownButton) return;

  const windowContainer = document.getElementById('windowContainer-audio');
  if (!windowContainer) return;

  const menuContainer = document.createElement('div');
  menuContainer.id = 'menu-container';
  menuContainer.style.position = 'absolute';  // Position relative to windowContainer-audio
  menuContainer.style.backgroundColor = 'white';
  menuContainer.style.border = '1px solid black';
  menuContainer.style.padding = '1px';
  menuContainer.style.zIndex = '1000';
  menuContainer.style.width = '260px';

  const scrollbar = document.createElement('div');
  scrollbar.style.position = 'absolute';
  scrollbar.style.top = '0';
  scrollbar.style.right = '0';
  scrollbar.style.width = '17px';
  scrollbar.style.backgroundColor = '#ccc';
  scrollbar.style.height = '100%';
  scrollbar.style.boxSizing = 'border-box';

  windowContainer.appendChild(menuContainer);
  const rect = dropdownButton.getBoundingClientRect();
  const containerRect = windowContainer.getBoundingClientRect();
  
  menuContainer.style.top = `${rect.bottom - containerRect.top}px`;
  menuContainer.style.left = `${rect.right - containerRect.left - menuContainer.offsetWidth}px`;

  list.forEach(item => {
      const menuDiv = document.createElement('div');
      menuDiv.textContent = item;
      menuDiv.style.paddingLeft = '2px';
      menuDiv.style.fontFamily = 'w95fa';
      menuDiv.style.backgroundColor = 'transparent';
      menuDiv.style.color = 'black';
      menuDiv.style.marginBottom = '1px';
      menuDiv.style.cursor = 'pointer';

      menuDiv.addEventListener('mouseenter', () => {
          menuDiv.style.backgroundColor = '#0a246a';
          menuDiv.style.color = 'white';
      });

      menuDiv.addEventListener('mouseleave', () => {
          menuDiv.style.backgroundColor = 'white';
          menuDiv.style.color = 'black';
      });

      menuDiv.addEventListener('click', () => {
          const existingMenu = document.getElementById('menu-container');
          if (existingMenu) {
              existingMenu.remove();
          }

          targetDisplay.innerHTML = `${item}`;

          if (type === 'artist') {
              currentArtist = item;
              artistSelect(currentArtist);
          } else if (type === 'album') {
              currentAlbum = item;
              albumSelect(currentAlbum);
          } else if (type === 'track') {
              currentTrack = item;
              trackSelect(currentTrack);
          }
          console.log(item + ' selected for ' + type);
      });
      menuContainer.appendChild(menuDiv);
  });

  menuContainer.appendChild(scrollbar);
}

let currentTrackIndex = 0;
const audioPlayer = document.getElementById("audioPlayer");
const albumCover = document.getElementById("album-Cover");
const trackTitle = document.getElementById("trackTitle");
const artistName = document.getElementById("artistName");
const albumTitle = document.getElementById("albumTitle");



function updatePlayer() {
    artistSelect(currentArtist);

    const track = tracks[currentTrackIndex];
    console.log("Track being played:", track);
    if (audioPlayer) console.log('audioPlayerpresent');
    if (albumCover) console.log('albumCoverpresent');
    if (trackTitle) console.log('trackTitlepresnet');


    if (audioPlayer && albumCover) {
        audioPlayer.src = track.previewUrl;

        // Set the background image for the album cover (using the div)
        albumCover.src = track.artworkUrl100.replace("100x100", "300x300");
        
        trackTitle.innerText = track.trackName;
        artistName.innerText = currentArtist;
        albumSelect(currentArtist);
    } else {
        console.log("audioPlayer or albumCover element not found!");
    }
}


export async function fetchTracks(album) {
    const trackResponse = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(currentAlbum)}&entity=musicTrack`);
    const trackData = await trackResponse.json();

    if (trackData.results && trackData.results.length > 1) {
        tracks = trackData.results.filter(item => 
            item.wrapperType === "track" && item.artistName === currentArtist
        );
        if (tracks.length > 0) {
            trackNames = tracks.map(item => item.trackName); 
            updatePlayer();
            return;
        } else {
            trackTitle.innerText = "No tracks found.";
            updatePlayer();
        }
    } else {
        trackTitle.innerText = "No tracks found.";
        updatePlayer();
    }
}

export function albumSelect(album = null) {
  const albumTitle = document.getElementById("albumTitle");
  if (album === null) {
    spawnDropdown('album');
  }
  
  if (albumTitle && album) { 
    if (album === 'Ode To You' || album === 'Basement Candy - EP') {
      currentArtist = 'Murdock Street';
    }
    fetchTracks();

    albumTitle.innerHTML = `${album}`; 
    currentAlbum = `${album}`;
  }

  //Initalization
  if (!albumTitle) {
      const observer = new MutationObserver(() => {
          const albumTitle = document.getElementById('albumTitle');
          if (albumTitle) {
              observer.disconnect(); 
              albumTitle.innerText = `${album}`;
            //   console.log('Album Title set to:', `${album}`);
              currentAlbum = `${album}`;
              albumSelect(album); //finalization
          }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      initialize = true; 
      return;  
  }
}

export function artistSelect(artist = null) {
    if (artist) { //Initialization
      const artistName = document.getElementById("artistName");
      artistName.innerHTML = `${artist}`; 
      currentArtist=artist;
    } else {
    spawnDropdown('artist');
  }
}


export function trackSelect() {
  
}

export function initializePlayer(title) {
  const observer = new MutationObserver(() => {
    const albumTitle = document.getElementById('albumTitle');
    if (albumTitle) {
        observer.disconnect(); 
        albumTitle.innerText = title;
        // console.log('Album Title set to:', title);
    }
});
observer.observe(document.body, { childList: true, subtree: true });
initialize = true; 
return;  
}

// <--media controls-->

export function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
    isPlaying = !isPlaying;
}



export function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    updatePlayer();
    audioPlayer.play();
    isPlaying = true;
}

export function prevTrack() {
    if (currentTrackIndex === 0) {
        audioPlayer.currentTime = 0; 
    } else {
        currentTrackIndex--;
    }
    updatePlayer();
    audioPlayer.play();
    isPlaying = true;
}