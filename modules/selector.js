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
let albumArtistMap = {}; // Dynamic map of album titles to artist names
let artistAlbumsMap = {}; // Dynamic map of artist names to their albums

let currentTrackIndex = 0;
const audioPlayer = document.getElementById("audioPlayer");
const albumCover = document.getElementById("albumCover-container");
const trackTitle = document.getElementById("trackTitle");
const artistName = document.getElementById("artistName");
const albumTitle = document.getElementById("albumTitle");

// Load album IDs and artist mappings from data service on initialization
async function loadAlbumIdMap() {
  try {
    const musicData = await window.dataService.getMusicPlayersData();
    albumIdMap = {};
    albumArtistMap = {};
    artistAlbumsMap = {};
    
    musicData.forEach(artist => {
      const artistName = artist.artist;
      artistAlbumsMap[artistName] = [];
      
      artist.albums.forEach(album => {
        const albumTitle = album.title;
        
        // Map album title to artist name
        albumArtistMap[albumTitle] = artistName;
        
        // Map album title to album ID (if exists)
        if (album.appleAlbumId) {
          albumIdMap[albumTitle] = album.appleAlbumId;
        }
        
        // Store album list for each artist
        artistAlbumsMap[artistName].push(albumTitle);
      });
    });
    
    console.log('Album ID map loaded:', albumIdMap);
    console.log('Album-Artist map loaded:', albumArtistMap);
    console.log('Artist-Albums map loaded:', artistAlbumsMap);
  } catch (error) {
    console.error('Error loading album data:', error);
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
    // Dynamic artist list from loaded data
    list = Object.keys(artistAlbumsMap);
    targetDisplay = document.getElementById("artistName");
    dropdownButton = document.querySelector('[data-id="3"]');
  }

  if (type == 'album') {
    // Dynamic album list based on current artist
    if (currentArtist && artistAlbumsMap[currentArtist]) {
      list = artistAlbumsMap[currentArtist];
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
      console.log(`Fetching tracks from iTunes API for album ID: ${currentAlbumId}`);
      
      // Use JSONP to avoid CORS issues
      trackData = await fetchWithJsonp(`https://itunes.apple.com/lookup?id=${currentAlbumId}&entity=song&limit=200`);
      
      console.log(`iTunes API response:`, trackData);
      
      if (trackData.results && trackData.results.length > 1) {
        // First result is the album, rest are tracks
        tracks = trackData.results.slice(1).filter(item => 
          item.wrapperType === "track" && item.kind === "song"
        );
        
        if (tracks.length > 0) {
          console.log(`Found ${tracks.length} tracks`);
          trackNames = tracks.map(item => item.trackName);
          setTimeout(() => updatePlayer(), 0);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching tracks by album ID:', error);
      console.error('Error details:', error.message);
      // Fall through to search method
    }
  }
  
  // Fallback to search API
  try {
    const trackResponse = await fetchWithJsonp(`https://itunes.apple.com/search?term=${encodeURIComponent(currentAlbum)}+${encodeURIComponent(currentArtist)}&entity=musicTrack&limit=200`);
    trackData = trackResponse;

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
  const trackTitleElement = document.getElementById("trackTitle");
  if (trackTitleElement) {
    trackTitleElement.innerText = "No tracks found.";
  }
  console.warn('No tracks found for album:', currentAlbum, 'artist:', currentArtist);
}

// Helper function to fetch using JSONP (avoids CORS issues)
function fetchWithJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonpCallback_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    const script = document.createElement('script');
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP request timeout'));
    }, 10000);
    
    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };
    
    function cleanup() {
      clearTimeout(timeoutId);
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }
    
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP request failed'));
    };
    
    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
    document.head.appendChild(script);
  });
}

export function albumSelect(album = null, albumId = null) { 
  const albumTitleElement = document.getElementById("albumTitle");
  const artistNameElement = document.getElementById('artistName');

  if (album === null) {
    spawnDropdown('album');
    return;
  }

  if (albumTitleElement && album) {
    console.log(`albumSelect called with: album="${album}", albumId="${albumId}"`);
    console.log(`Current albumArtistMap:`, albumArtistMap);
    
    // Store the album ID if provided directly
    if (albumId) {
      currentAlbumId = albumId;
      console.log(`Using provided album ID: ${albumId}`);
    } else {
      // Look up album ID from dynamically loaded map
      currentAlbumId = albumIdMap[album] || null;
      console.log(`Looked up album ID from map: ${currentAlbumId || 'not found'}`);
    }
    
    // Look up artist from dynamic map
    currentArtist = albumArtistMap[album];
    console.log(`Artist lookup result: "${currentArtist}" for album: "${album}"`);
    
    if (!currentArtist) {
      console.warn(`Artist not found for album: ${album}. Checking for partial matches...`);
      console.warn(`Available albums in map:`, Object.keys(albumArtistMap));
      // Try to find a match with special character variations
      const normalizedAlbum = album.replace(/[^\w\s]/g, '').toLowerCase();
      for (const [mappedAlbum, mappedArtist] of Object.entries(albumArtistMap)) {
        const normalizedMapped = mappedAlbum.replace(/[^\w\s]/g, '').toLowerCase();
        if (normalizedMapped === normalizedAlbum) {
          currentArtist = mappedArtist;
          console.log(`Found artist via normalization: ${currentArtist}`);
          break;
        }
      }
    }
    
    // Set the album and artist in the UI
    currentAlbum = album;
    albumTitleElement.innerHTML = album;
    
    // Update artist display
    console.log(`Updating artist display - Element exists: ${!!artistNameElement}, Artist: ${currentArtist}`);
    if (artistNameElement && currentArtist) {
      artistNameElement.innerHTML = currentArtist;
      console.log(`✅ Artist name set to: ${currentArtist}`);
    } else {
      console.error(`❌ Failed to set artist name - Element: ${!!artistNameElement}, Artist: ${currentArtist}`);
    }
    
    console.log(`Final state - Album: ${currentAlbum}, Artist: ${currentArtist}, ID: ${currentAlbumId || 'none'}`);
    setTimeout(() => fetchTracks(), 0);
  }
}

export function artistSelect(artist = null) {
  if (artist) { // Initialization
    const artistNameElement = document.getElementById("artistName");
    artistNameElement.innerHTML = `${artist}`;
    currentArtist = artist;
    
    // Dynamically select the first album for this artist
    if (artistAlbumsMap[artist] && artistAlbumsMap[artist].length > 0) {
      const firstAlbum = artistAlbumsMap[artist][0];
      albumSelect(firstAlbum);
    } else {
      console.warn(`No albums found for artist: ${artist}`);
    }
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