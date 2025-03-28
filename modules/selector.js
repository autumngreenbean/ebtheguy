
let currentArtist;
let currentAlbum;
let initialize = false; 

export function updatePlayer() {
    artistSelect(currentArtist);
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
    list = ['Murdock Street', 'Lokadonna', 'tsunxme']; //var artists
    targetDisplay = document.getElementById("artistName"); //var artistName
    dropdownButton = document.querySelector('[data-id="3"]');
  }

  if (type == 'album') {
    if (currentArtist=='Murdock Street') {
      list = ['Basement Candy', 'Ode to You'];
      targetDisplay = document.getElementById("albumTitle");
      dropdownButton = document.querySelector('[data-id="1"]');

    }
  }

  if (!dropdownButton) return;

  const menuContainer = document.createElement('div');
  menuContainer.id = 'menu-container';
  menuContainer.style.position = 'absolute';
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
  
  const rect = dropdownButton.getBoundingClientRect();
  document.body.appendChild(menuContainer);

  menuContainer.style.top = (window.scrollY + rect.bottom) + 'px'; 
  menuContainer.style.left = (rect.right - menuContainer.offsetWidth + 1) + 'px'; 

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
      if (existingMenu) {existingMenu.remove();}

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
  document.body.appendChild(menuContainer);


}

export function albumSelect(album = null) {
  const albumTitle = document.getElementById("albumTitle");
  if (album === null) {
    spawnDropdown('album');
  }
  
  if (albumTitle && album) { //if album selected via other methods (don't autoplay) and delete this comment plz eventually thx
    if (album === 'Ode To You' || album === 'Basement Candy') {
      currentArtist = 'Murdock Street';
    }
    console.log(album);
    albumTitle.innerHTML = `${album}`; 
    currentAlbum = `${album}`;
    updatePlayer();
  }

  //Once
  if (!albumTitle) {
      const observer = new MutationObserver(() => {
          const albumTitle = document.getElementById('albumTitle');
          if (albumTitle) {
              observer.disconnect(); 
              albumTitle.innerText = `${album}`;
              console.log('Album Title set to:', `${album}`);
              currentAlbum = `${album}`;
              updatePlayer();
              albumSelect(album); //recurse
          }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      initialize = true; 
      return;  
  }
}

export function artistSelect(artist = null) {
    if (artist) { //called by initializtion 
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
        console.log('Album Title set to:', title);
        updatePlayer();
    }
});
observer.observe(document.body, { childList: true, subtree: true });
initialize = true; 
return;  
}