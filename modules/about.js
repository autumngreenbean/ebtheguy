/* 
about.js is a simple function that hides #about windows on page load, and spawns them on a button click. 
Targeted windows will close if about.js is called with their data-id as the parameter.
*/
import { makeDraggable } from './makeDraggable.js';

let hasInitialized = false;

export function about(dataId) {

    const allAbouts = document.querySelectorAll('#about');

    if (!hasInitialized) {
        allAbouts.forEach(el => {
            el.style.display = 'none';
        });
        hasInitialized = true;
        return;
    }

    if (!dataId) {
        allAbouts.forEach(el => {
            el.style.display = '';
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
