import { makeDraggable } from './makeDraggable.js';
import { albumSelect, trackSelect, artistSelect, } from './selector.js';

    export function spawnPlayer(type, title) {
        const existingPlayer = document.getElementById('windowContainer-audio');
        if (existingPlayer) {
            albumSelect(title);
            return;
        } else {
            const windowContainer = document.createElement('div');
            windowContainer.id = 'windowContainer-audio';
            let nextLeft = 50 + 40;
            let nextTop = 20 + 40;

            windowContainer.style.top = `${nextTop}px`; 
            windowContainer.style.left = `${nextLeft}px`; 
            windowContainer.style.position = 'absolute';

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
                            <div class="window-box">X</div>
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
                                if (button.dataset.id === "3") { 
                                    button.addEventListener('click', function() {
                                        let svgContainer = this.querySelector('.media-svg');
                                        if (svgContainer) {
                                            svgContainer.classList.toggle('clicked');
                                        }
                                        const stopSvg = document.querySelector('.window-box#media-control-button[data-id="4"] .media-svg');
                                        if (stopSvg) {
                                            stopSvg.classList.remove('clicked');
                                        }
                                    });
                                }
                                if (button.dataset.id === "4") { 
                                    button.addEventListener('click', function() {
                                        let svgContainer = this.querySelector('.media-svg');
                                        if (svgContainer) {
                                            svgContainer.classList.toggle('clicked');
                                        }
                                        const playSvg = document.querySelector('.window-box#media-control-button[data-id="3"] .media-svg');
                                        if (playSvg) {
                                            playSvg.classList.remove('clicked');
                                        }
                                    });
                                }
                            });
                            //<--dropdown buttons--> 
                            document.querySelectorAll('.window-box#dropdown-button[data-id="1"]').forEach(btn => 
                                btn.addEventListener("click", () => albumSelect(null)) // Explicitly pass null
                            );
                            document.querySelectorAll('.window-box#dropdown-button[data-id="2"]').forEach(btn => 
                                btn.addEventListener("click", () => trackSelect(null)) // Explicitly pass null
                            );
                            document.querySelectorAll('.window-box#dropdown-button[data-id="3"]').forEach(btn => 
                                btn.addEventListener("click", () => artistSelect(null)) // Explicitly pass null
                            );
                        }
                        setupButtonListeners();

                    } else {
                        console.error('media-player div not found in templates.html');
                    }
                        
                })
                .catch(error => console.error('Error loading the template:', error));
                    
                document.body.appendChild(windowContainer);

                // Updated selector to target window-section instead of window-box
                const windowBox = windowContainer.querySelector('#window-section'); // Selecting window-section now
                const header = windowContainer.querySelector('#header'); // Selecting header inside window-section
                console.log(windowBox);
                makeDraggable(windowBox, header);

                
        requestAnimationFrame(() => {
            albumSelect(title);
        });
    }
}