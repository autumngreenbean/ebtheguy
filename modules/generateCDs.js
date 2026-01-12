/**
 * generateCDs.js
 * Dynamically generates CD icons on the desktop from musicPlayers data
 * This allows adding new CDs via Google Sheets without editing HTML
 */

import { makeDraggable } from './makeDraggable.js';
import { spawnPlayer } from './spawnPlayer.js';

/**
 * Generate all CD icons from data
 */
export async function generateCDs() {
  try {
    // Get music player data from data service
    const musicData = await window.dataService.getMusicPlayersData();
    
    // Find or create container for dynamic CDs
    let container = document.getElementById('dynamic-cds-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dynamic-cds-container';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.backgroundColor = 'transparent';
      document.body.appendChild(container);
    } else {
      // Clear existing dynamic CDs
      container.innerHTML = '';
    }
    
    // Generate CD for each album
    musicData.forEach(artist => {
      artist.albums.forEach(album => {
        createCDIcon(container, artist.artist, album);
      });
    });
    
    console.log('✅ Generated', countAlbums(musicData), 'CD icons from data');
  } catch (error) {
    console.error('Error generating CD icons:', error);
  }
}

/**
 * Create a single CD icon element
 */
function createCDIcon(container, artistName, album) {
  const cdBlock = document.createElement('div');
  cdBlock.className = 'block audio';
  cdBlock.setAttribute('data-title', album.title);
  cdBlock.setAttribute('data-artist', artistName);
  
  // IMPORTANT: Re-enable pointer events for this block
  cdBlock.style.pointerEvents = 'auto';
  
  // Set position (convert from "0.5" format to "50%" if needed)
  const topValue = album.position.top;
  const rightValue = album.position.right;
  
  // Handle both formats: "50%" or "0.5" (decimal)
  const top = topValue.includes('%') ? topValue : `${parseFloat(topValue) * 100}%`;
  const right = rightValue.includes('%') ? rightValue : `${parseFloat(rightValue) * 100}%`;
  
  cdBlock.style.top = top;
  cdBlock.style.right = right;
  
  // Create icon image
  const img = document.createElement('img');
  img.src = `icons/${album.icon}`;
  img.alt = album.displayName;
  cdBlock.appendChild(img);
  
  // Create text label
  const textIcon = document.createElement('div');
  textIcon.className = 'text-icon';
  textIcon.textContent = album.displayName;
  cdBlock.appendChild(textIcon);
  
  // Add click event listener
  cdBlock.addEventListener('click', () => {
    spawnPlayer('album', album.title);
  });
  
  // Add touch support for mobile
  cdBlock.addEventListener('touchend', (e) => {
    e.preventDefault();
    spawnPlayer('album', album.title);
  });
  
  // Make draggable - do this AFTER adding to DOM
  // Add to container first
  container.appendChild(cdBlock);
  
  // Then make it draggable
  makeDraggable(cdBlock, cdBlock);
}

/**
 * Helper to count total albums
 */
function countAlbums(musicData) {
  return musicData.reduce((total, artist) => total + artist.albums.length, 0);
}

/**
 * Refresh CD icons (useful after data updates)
 */
export async function refreshCDs() {
  // Clear cache to force fresh data
  window.dataService.clearCache();
  await generateCDs();
  console.log('🔄 CD icons refreshed');
}
