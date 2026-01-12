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
- nextTrack plays the next track in the playlist.
- prevTrack plays the previous track in the playlist.
*/

let currentArtist;
let currentAlbum;
let currentAlbumId; // Store Apple Music album ID
let currentTrack;
let initialize = false;
let tracks = [];
let trackNames = [];
let isPlaying = false;
let albumIdMap = {}; // Dynamic map of album titles to IDs

let currentTrackIndex = 0;
const audioPlayer = document.getElementById("audioPlayer");
const albumCover = document.getElementById("albumCover-container");
const trackTitle = document.getElementById("trackTitle");
const artistName = document.getElementById("artistName");
const albumTitle = document.getElementById("albumTitle");

// Load album IDs from data service on initialization
async function loadAlbumIdMap() {
  try {
    const musicData = await window.dataService.getMusicPlayersData();
    albumIdMap = {};
    
    musicData.forEach(artist => {
      artist.albums.forEach(album => {
        if (album.appleAlbumId) {
          albumIdMap[album.title] = album.appleAlbumId;
        }
      });
    });
    
    console.log('Album ID map loaded:', albumIdMap);
  } catch (error) {
    console.error('Error loading album IDs:', error);
  }
}

// Initialize the album ID map when the module loads
loadAlbumIdMap();

function playSelectedTrack(trackName) {
  const existingMenu = document.getElementById('menu-container');
  existingMenu.remove();

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
    existingMenu.remove();
    return;
  }

  if (type == 'artist') {
    list = ['Murdock Street', 'Lokadonna', 'tsunamë'];
    targetDisplay = document.getElementById("artistName");
    dropdownButton = document.querySelector('[data-id="3"]');
  }

  if (type == 'album') {
    // Dynamic album list based on current artist
    if (currentArtist == 'Murdock Street') {
      list = ['Basement Candy - EP', 'Ode to You'];
    } else if (currentArtist == 'Lokadonna') {
      list = ['code:GRĖĖN (feat. Prod.eb) - EP'];
    } else if (currentArtist == 'tsunamë') {
      list = ['99 Side A'];
    }
    targetDisplay = document.getElementById("albumTitle");
    dropdownButton = document.querySelector('[data-id="1"]');
  }

  if (type == 'track') {
    list = trackNames;
    targetDisplay = document.getElementById("trackTitle");
    dropdownButton = document.querySelector('[data-id="2"]');
  }

  if (!dropdownButton) return;

  const windowContainer = document.getElementById('windowContainer-audio');
  if (!windowContainer) return;

  const menuContainer = document.createElement('div');
  menuContainer.id = 'menu-container';

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
        let album = item;
        setTimeout(() => albumSelect(album), 0);
      } else if (type === 'track') {
        currentTrack = item;
        // console.log(item);
        trackSelect(currentTrack);
        playSelectedTrack(currentTrack);

      }
      // console.log(item + ' selected for ' + type);
    });
    menuContainer.appendChild(menuDiv);
  });

  menuContainer.appendChild(scrollbar);
}





function updatePlayer() {
  const trackTitle = document.getElementById("trackTitle");
  const artistName = document.getElementById("artistName");
  const albumTitle = document.getElementById("albumTitle");
  const albumCover = document.getElementById("albumCover");
  const audioPlayer = document.getElementById("audioPlayer");
  const track = tracks[currentTrackIndex];
  albumCover.src = track.artworkUrl100.replace("100x100", "300x300");
  audioPlayer.src = track.previewUrl;
  trackTitle.innerText = track.trackName;
}

export async function fetchTracks(album) {
  let trackData;
  
  // If we have an album ID, use the lookup API (more reliable)
  if (currentAlbumId) {
    try {
      const lookupResponse = await fetch(`https://itunes.apple.com/lookup?id=${currentAlbumId}&entity=song&limit=200`);
      trackData = await lookupResponse.json();
      
      if (trackData.results && trackData.results.length > 1) {
        // First result is the album, rest are tracks
        tracks = trackData.results.slice(1).filter(item => 
          item.wrapperType === "track" && item.kind === "song"
        );
        
        if (tracks.length > 0) {
          trackNames = tracks.map(item => item.trackName);
          setTimeout(() => updatePlayer(), 0);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching tracks by album ID:', error);
      // Fall through to search method
    }
  }
  
  // Fallback to search API
  try {
    const trackResponse = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(currentAlbum)}+${encodeURIComponent(currentArtist)}&entity=musicTrack&limit=200`);
    trackData = await trackResponse.json();

    if (trackData.results && trackData.results.length > 0) {
      // More flexible filtering - check if artist names match loosely
      tracks = trackData.results.filter(item => {
        if (item.wrapperType !== "track") return false;
        
        // Normalize artist names for comparison (remove special chars, lowercase)
        const normalizeStr = (str) => str.toLowerCase()
          .replace(/[ėēę]/g, 'e')
          .replace(/[äàáâã]/g, 'a')
          .replace(/[öòóôõ]/g, 'o')
          .trim();
        
        const itemArtist = normalizeStr(item.artistName || '');
        const searchArtist = normalizeStr(currentArtist);
        
        return itemArtist.includes(searchArtist) || searchArtist.includes(itemArtist);
      });
      
      if (tracks.length > 0) {
        trackNames = tracks.map(item => item.trackName);
        setTimeout(() => updatePlayer(), 0);
        return;
      }
    }
  } catch (error) {
    console.error('Error fetching tracks by search:', error);
  }
  
  // No tracks found
  trackTitle.innerText = "No tracks found.";
  setTimeout(() => updatePlayer(), 0);
}

export function albumSelect(album = null, albumId = null) { 
  const albumTitle = document.getElementById("albumTitle");
  const artistName = document.getElementById('artistName');

  if (album === null) {
    spawnDropdown('album');
    return;
  }

  if (albumTitle && album) {
    // Store the album ID if provided directly
    if (albumId) {
      currentAlbumId = albumId;
    } else {
      // Look up album ID from dynamically loaded map
      currentAlbumId = albumIdMap[album] || null;
    }
    
    // Set artist and album based on album name
    if (album === 'Ode to You' || album === 'Basement Candy - EP') {
      currentArtist = 'Murdock Street';
      currentAlbum = album;
      albumTitle.innerHTML = album;
    } else if (album === '99 Side A') {
      currentArtist = "tsunamë";
      currentAlbum = '99 Side A';
      albumTitle.innerHTML = '99 Side A';
    } else if (album === "code:GRÄ–Ä–N (feat. Prod.eb) - EP" || album === "code:GRĖĖN (feat. Prod.eb) - EP" || album.includes("code:GR")) {
      // Handle various encodings of the album name
      currentArtist = 'Lokadonna';
      currentAlbum = 'code:GRĖĖN (feat. Prod.eb) - EP';
      albumTitle.innerHTML = 'code:GRĖĖN (feat. Prod.eb) - EP';
    } else {
      // Generic fallback
      currentAlbum = album;
      albumTitle.innerHTML = album;
    }
    
    // Update artist display
    if (artistName) {
      artistName.innerHTML = currentArtist;
    }
    
    console.log(`Album selected: ${currentAlbum}, Artist: ${currentArtist}, ID: ${currentAlbumId || 'none'}`);
    setTimeout(() => fetchTracks(), 0);
  }
}

export function artistSelect(artist = null) {
  // console.log('artistSelect() ' + artist)
  if (artist) { //Initialization
    const artistName = document.getElementById("artistName");
    artistName.innerHTML = `${artist}`;
    currentArtist = artist;
    if (artist === 'Murdock Street') albumSelect('Basement Candy - EP');
    if (artist === 'tsunamë') albumSelect('99 Side A');
    if (artist === 'Lokadonna') albumSelect('code:GRĖĖN (feat. Prod.eb) - EP');

  } else {
    spawnDropdown('artist');
  }
}


export function trackSelect() {
  // console.log(trackNames);
  spawnDropdown('track');

}

export function initializePlayer(title) {
  const observer = new MutationObserver(() => {
    const albumTitle = document.getElementById('albumTitle');

    if (albumTitle) {
      observer.disconnect();
      if (title === 'code:GRÄ–Ä–N') {
        albumTitle.innerText = 'code:GREEN';
        currentAlbum = 'code:GRĖĖN (feat. Prod.eb) - EP';
      } else {
        albumTitle.innerText = title;
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  initialize = true;
  return;
}

// <--media controls-->

export function play() { //toggle
  audioPlayer.play();
  document.querySelector('#media-control-button[data-id="3"] .media-svg')?.classList.add('clicked'); //play
  document.querySelector('.window-box[data-id="4"] .media-svg')?.classList.remove('clicked'); //stop pause
}

export function pause() {
  audioPlayer.pause();
  document.querySelector('#media-control-button[data-id="3"] .media-svg')?.classList.remove('clicked'); //stop play
  document.querySelector('.window-box[data-id="4"] .media-svg')?.classList.add('clicked'); //pause
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