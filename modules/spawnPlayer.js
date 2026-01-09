/* Welcome to SpawnPlayer.js! 
This module is responsible for creating the CD Player window and its contents. 
The spawnPlayer function is called when the user clicks on an album icon on the desktop.
The function:
- creates a new windowContainer div element.
- fetches templates.html to inject content into the windowContainer.
- appends the windowContainer to the body of the document, with draggable functionality from makeDraggable.js.
- calls albumSelect to display the selected album's tracks in the CD Player.
- sets up event listeners for the media player buttons and dropdown buttons.
*/


let visible = false;
import { makeDraggable } from './makeDraggable.js';
import { albumSelect, trackSelect, artistSelect, prevTrack, nextTrack, play, pause } from './selector.js';

export function spawnPlayer(type, title) {

    const existingPlayer = document.getElementById('windowContainer-audio');

    if (existingPlayer) {
        albumSelect(title);
        existingPlayer.style.display = '';
        visible = true;
        document.querySelector('.window-box[data-id="4"] .media-svg')?.classList.add('clicked'); //pause
        document.querySelector('#media-control-button[data-id="3"] .media-svg')?.classList.remove('clicked'); //stop play
        const header = existingPlayer.querySelector('#header');
        const existingMenu = document.getElementById('menu-container');
        if (header) makeDraggable(existingPlayer, header);
        if (existingMenu) existingMenu.remove();
        return;
    } else {
        const windowContainer = document.createElement('div');
        windowContainer.id = 'windowContainer-audio';
        let nextLeft = '200px';

        // Mobile optimization: center player on mobile
        if (window.innerWidth <= 768) {
            windowContainer.style.top = '50%';
            windowContainer.style.left = '50%';
            windowContainer.style.transform = 'translate(-50%, -50%)';
        } else {
            windowContainer.style.top = nextLeft;
            windowContainer.style.left = nextLeft;
        }
        
        windowContainer.style.position = 'absolute';
        windowContainer.style.zIndex = '10';

        windowContainer.addEventListener('mousedown', (e) => {
            windowContainer.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', () => {
            windowContainer.style.cursor = 'grab';
        });

        windowContainer.innerHTML = `
                <div id = "window-section" class="window-box" style="width: 500px; height: 220px; position: absolute; left: 0px; top: 0.0464981px;">
                    <div class="header-container">
                        <div id="header">
                            <div class="window-title"><img src="icons/cd.png" alt="" style="bottom: 1.5px; position: relative; width:23px; height: 23px; display: inline; background-color: inherit;"> &nbsp;CD Player </div>
                            <div class="window-box" id="close-button" data-id= "player">X</div>
                        </div>
                    </div>
                    <div class="body-container">
                        <div id = "volume-control-container"></div>
                    </div>
                </div>
            `;

        windowContainer.querySelector(".window-title").innerHTML = '<img src="icons/cd.png" alt="" style="width:20px; height: 20px; display: inline; background-color:#000080;"></div> &nbsp;Audio Production ';


        fetch('./modules/templates.html')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const mediaPlayerDiv = doc.querySelector('#media-player');
                const mediaControl = doc.querySelector('#media-control-container');

                if (mediaPlayerDiv) {
                    windowContainer.querySelector('.body-container').innerHTML = mediaPlayerDiv.outerHTML + mediaControl.outerHTML;

                    function setupButtonListeners() {
                        // <--media player buttons-->
                        const stopButton = document.querySelector('.window-box[data-id="4"]');
                        if (stopButton) {
                            const stopSvg = stopButton.querySelector('.media-svg');
                            stopSvg.classList.add('clicked');

                        }
                        document.querySelectorAll('.window-box#media-control-button').forEach(button => {
                            if (button.dataset.id === "1") { // Previous button (no toggle)
                                button.addEventListener('click', function () {
                                    prevTrack();
                                });
                            }

                            if (button.dataset.id === "2") { // Skip button (no toggle)
                                button.addEventListener('click', function () {
                                    nextTrack();
                                });
                            }

                            if (button.dataset.id === "3") {
                                button.addEventListener('click', function () {
                                    let svgContainer = this.querySelector('.media-svg');
                                    if (svgContainer) {
                                        svgContainer.classList.toggle('clicked');
                                    }
                                    const stopSvg = document.querySelector('.window-box#media-control-button[data-id="4"] .media-svg');
                                    if (stopSvg) {
                                        stopSvg.classList.remove('clicked');
                                    }
                                    play();
                                });
                            }
                            if (button.dataset.id === "4") {
                                button.addEventListener('click', function () {
                                    let svgContainer = this.querySelector('.media-svg');
                                    if (svgContainer) {
                                        svgContainer.classList.toggle('clicked');
                                    }
                                    const playSvg = document.querySelector('.window-box#media-control-button[data-id="3"] .media-svg');
                                    if (playSvg) {
                                        playSvg.classList.remove('clicked');
                                    }
                                    pause();
                                });
                            }
                        });
                        //<--dropdown buttons--> 
                        document.querySelectorAll('.window-box#dropdown-button[data-id="1"]').forEach(btn =>
                            btn.addEventListener("click", () => albumSelect(null))
                        );
                        document.querySelectorAll('.window-box#dropdown-button[data-id="2"]').forEach(btn =>
                            btn.addEventListener("click", () => trackSelect(null))
                        );
                        document.querySelectorAll('.window-box#dropdown-button[data-id="3"]').forEach(btn =>
                            btn.addEventListener("click", () => artistSelect(null))
                        );

                        const closeButtons = document.querySelectorAll('#close-button[data-id="player"]');

                        closeButtons.forEach(button => {
                            button.addEventListener("click", function () {
                                console.log("Close button clicked");
                                if (existingPlayer) {
                                    console.log('found existing player');
                                    existingPlayer.style.display = 'none';
                                }
                                visible = false;
                            });
                        });
                    }
                    setupButtonListeners();
                    const existingPlayer = document.getElementById('windowContainer-audio');
                    existingPlayer.style.display = 'none';
                    visible = false;

                } else {
                    console.error('media-player div not found in templates.html');
                }

            })
            .catch(error => console.error('Error loading the template:', error));

        document.body.appendChild(windowContainer);

        const windowBox = windowContainer.querySelector('#window-section');
        const header = windowContainer.querySelector('#header');
        makeDraggable(windowContainer, header);

        // requestAnimationFrame(() => {
        //     setTimeout(() =>albumSelect(title), 0);
        //             });
    }
}