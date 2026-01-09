/* 
about.js is a simple function that hides #about windows on page load, and spawns them on a button click. 
Targeted windows will close if about.js is called with their data-id as the parameter.
*/
import { makeDraggable } from './makeDraggable.js';

let hasInitialized = false;
let contentData = null;

// Fetch content data from JSON
async function loadContentData() {
    if (!contentData) {
        try {
            const response = await fetch('./data/content.json');
            contentData = await response.json();
            populateAboutContent();
        } catch (error) {
            console.error('Error loading content data:', error);
        }
    }
}

// Populate about windows with data from JSON
function populateAboutContent() {
    if (!contentData || !contentData.about) return;

    // Populate window1
    const window1Data = contentData.about.window1;
    document.querySelector('[data-content="window1-title"]').textContent = window1Data.title;
    document.querySelector('[data-content="window1-welcome"]').textContent = window1Data.welcomeText;
    document.querySelector('[data-content="window1-message"]').textContent = window1Data.message;

    // Populate window2
    const window2Data = contentData.about.window2;
    document.querySelector('[data-content="window2-title"]').textContent = window2Data.title;
    document.querySelector('[data-content="window2-email"]').textContent = window2Data.email;
    document.querySelector('[data-content="window2-contact"]').textContent = window2Data.contact;

    // Create buttons dynamically
    const buttonsContainer = document.getElementById('about-buttons-container');
    buttonsContainer.innerHTML = '';
    
    window2Data.buttons.forEach((button, index) => {
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'window-box';
        buttonDiv.id = 'about-button';
        buttonDiv.style.cssText = 'width: 160px; height: 100%; justify-content: center; display: flex; align-items: center; background-color: #c0c0c0;' + 
                                   (index > 0 ? ' margin-left: 30px;' : '');
        
        const buttonLink = document.createElement('a');
        buttonLink.href = button.url;
        buttonLink.target = '_blank';
        buttonLink.rel = 'noopener noreferrer';
        buttonLink.style.cssText = 'text-decoration: none; color: black; background-color: #c0c0c0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;';
        
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
        textContainer.style.cssText = 'font-family: 95; background-color: #c0c0c0; color: black;';
        textContainer.textContent = button.text;
        
        buttonLink.appendChild(textContainer);
        buttonDiv.appendChild(buttonLink);
        buttonsContainer.appendChild(buttonDiv);
    });

    // Auto-show welcome window if enabled
    if (contentData.about.showWelcomeOnLoad) {
        setTimeout(() => {
            const welcomeWindow = document.querySelector('#about[data-id="window1"]');
            if (welcomeWindow) {
                welcomeWindow.style.display = '';
                welcomeWindow.style.right = 'auto';
                welcomeWindow.style.bottom = 'auto';
                
                if (window.innerWidth <= 768) {
                    welcomeWindow.style.left = '50%';
                    welcomeWindow.style.top = '50%';
                    welcomeWindow.style.transform = 'translate(-50%, -50%)';
                } else {
                    welcomeWindow.style.left = '200px';
                    welcomeWindow.style.top = '100px';
                    welcomeWindow.style.transform = 'none';
                }
                
                const header = welcomeWindow.querySelector('#header');
                if (header) {
                    makeDraggable(welcomeWindow, header);
                }
            }
        }, 500);
    }
}

export function about(dataId) {

    const allAbouts = document.querySelectorAll('#about');

    if (!hasInitialized) {
        allAbouts.forEach(el => {
            el.style.display = 'none';
        });
        hasInitialized = true;
        loadContentData(); // Load content data on initialization
        return;
    }

    if (!dataId) {
        allAbouts.forEach(el => {
            el.style.display = '';
            // Clear conflicting positioning styles
            el.style.right = 'auto';
            el.style.bottom = 'auto';
            
            // Set proper initial position
            if (!el.style.left || el.style.left === 'auto') {
                if (window.innerWidth <= 768) {
                    el.style.left = '50%';
                    el.style.top = '50%';
                    el.style.transform = 'translate(-50%, -50%)';
                } else {
                    el.style.left = '200px';
                    el.style.top = '100px';
                    el.style.transform = 'none';
                }
            }
        });
        const aboutWindows = document.querySelectorAll('#about');
        aboutWindows.forEach(win => {
            const header = win.querySelector('#header');
            if (header) {
                makeDraggable(win, header);
            } else {
                console.warn('No header found for draggable window:', win);
            }
        });
        return;
    }
    const windowAboutToClose = document.querySelector(`#about[data-id="${dataId}"]`);
    if (windowAboutToClose) {
        windowAboutToClose.style.display = 'none';
    } else {
        console.warn(`No #about[data-id="${dataId}"] found`);
    }
}
