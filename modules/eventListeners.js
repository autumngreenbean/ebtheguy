/* 
eventListeners.js is a simple function that initializes all misc. event-listeners for the document 
*/

import { initializePlayer } from './selector.js';
import { makeDraggable } from './makeDraggable.js';
import { spawnPlayer } from './spawnPlayer.js';
import { updateTime } from './time.js';
import { about } from './about.js';
import { blog } from './blog.js';
import { blogPost } from './blog.js';

export function setupEventListeners() {

    document.addEventListener('keydown', function(event) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
            event.preventDefault(); 
            console.log('Cmd-E');
            document.querySelector(`#blogpost[data-id="blog3"]`).style.display = '';
            blogPost();  
        }
    });
    
    const aboutBox = document.getElementById('about-box');
    aboutBox.addEventListener('click', function () {
        about();
    });

    const blogBox = document.getElementById('blog-box');
    blogBox.addEventListener('click', function () {
        blog();
    });

    const closeBlogButtons = document.querySelectorAll('[id="close-button"][data-id]');
    closeBlogButtons.forEach(button => {
        button.addEventListener("click", function () {
            const dataID = button.getAttribute("data-id");
            blog(dataID);
            console.log('close-button pressed: ' + dataID);

        });
    });

    
    const closeAboutButtons = document.querySelectorAll('#close-button-about, #about-OK');
    if (closeAboutButtons.length > 0) {
        closeAboutButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('about window ' + button.dataset.id + ' closed...');
                const dataId = button.dataset.id;
                about(dataId);
            });
        });
    }

    document.querySelectorAll('.block.audio').forEach(block => {
        block.addEventListener('click', () => {
            const title = block.dataset.title;
            spawnPlayer('album', title);
        });
    });

    document.addEventListener('DOMContentLoaded', function () {
        aboutBox.addEventListener("click", () => {
            about();
        });
        blog();
        about();
        initializePlayer();
        updateTime();
        setInterval(updateTime, 60000);

    const aboutWindows = document.querySelectorAll('#about');
    aboutWindows.forEach(win => {
        const header = win.querySelector('#header');
        if (header) {
            makeDraggable(win, header);
        } else {
            console.warn('No header found for draggable window:', win);
        }
    });

    const blogWindows = document.querySelectorAll('#blog');
    blogWindows.forEach(win => {
        const header = win.querySelector('#header');
        if (header) {
            makeDraggable(win, header);
        } else {
            console.warn('No header found for draggable window:', win);
        }
    });
});

    document.querySelectorAll('.block').forEach(block => {
        let img = block.querySelector('img');
        block.style.setProperty('--mask-url', `url(${img.src})`);
    });
}
