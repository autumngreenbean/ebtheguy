let zIndexCounter = 2;  
export function makeDraggable(container, handle) {
    let offsetX = 0, offsetY = 0;
    let isDragging = false;
    let isTouchDragging = false;
    const isBlock = container.classList.contains("block");

    if (isBlock) {
        container.style.zIndex = 0; 
    } else {
        container.style.zIndex = zIndexCounter++; 
    }

    // Mouse events
    handle.addEventListener('mousedown', (e) => {
        // Ignore if clicking on interactive elements
        if (e.target.closest('#close-button, #close-button-about, #about-OK, #media-control-button, #dropdown-button, button, input, textarea')) {
            return;
        }
        isDragging = true;
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;

        if (!isBlock) {
            container.style.zIndex = zIndexCounter++;
        }

        document.addEventListener('mousemove', mouseDragMove);
        document.addEventListener('mouseup', mouseEnd);
    });

    // Touch events for mobile
    handle.addEventListener('touchstart', (e) => {
        // Ignore if touching interactive elements
        if (e.target.closest('#close-button, #close-button-about, #about-OK, #media-control-button, #dropdown-button, button, input, textarea')) {
            return;
        }
        
        const touch = e.touches[0];
        isTouchDragging = true;
        offsetX = touch.clientX - container.getBoundingClientRect().left;
        offsetY = touch.clientY - container.getBoundingClientRect().top;

        if (!isBlock) {
            container.style.zIndex = zIndexCounter++;
        }

        document.addEventListener('touchmove', touchDragMove, { passive: false });
        document.addEventListener('touchend', touchEnd);
        document.addEventListener('touchcancel', touchEnd);
    });

    function mouseDragMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        updatePosition(e.clientX, e.clientY);
    }

    function touchDragMove(e) {
        if (!isTouchDragging) return;
        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
    }

    function updatePosition(clientX, clientY) {
        const newX = clientX - offsetX;
        const newY = clientY - offsetY;

        // Keep windows within viewport bounds
        const maxX = window.innerWidth - container.offsetWidth;
        const maxY = window.innerHeight - container.offsetHeight;

        const boundedX = Math.max(0, Math.min(newX, maxX));
        const boundedY = Math.max(0, Math.min(newY, maxY));

        container.style.left = `${boundedX}px`;
        container.style.top = `${boundedY}px`;
        container.style.right = 'auto';
        container.style.bottom = 'auto';
        container.style.transform = 'none';
    }

    function mouseEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', mouseDragMove);
        document.removeEventListener('mouseup', mouseEnd);
    }

    function touchEnd() {
        isTouchDragging = false;
        document.removeEventListener('touchmove', touchDragMove);
        document.removeEventListener('touchend', touchEnd);
        document.removeEventListener('touchcancel', touchEnd);
    }
}
