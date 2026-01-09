let zIndexCounter = 2;  
export function makeDraggable(container, handle) {
    let offsetX = 0, offsetY = 0;
    let isDragging = false;
    const isBlock = container.classList.contains("block");

    if (isBlock) {
        container.style.zIndex = 0; 
    } else {
        container.style.zIndex = zIndexCounter++; 
    }

    // Mouse events
    handle.addEventListener('mousedown', (e) => {
        startDrag(e.clientX, e.clientY);
        document.addEventListener('mousemove', mouseDragMove);
        document.addEventListener('mouseup', dragEnd);
    });

    // Touch events for mobile
    handle.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
        document.addEventListener('touchmove', touchDragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
    });

    function startDrag(clientX, clientY) {
        isDragging = true;
        offsetX = clientX - container.getBoundingClientRect().left;
        offsetY = clientY - container.getBoundingClientRect().top;

        if (!isBlock) {
            container.style.zIndex = zIndexCounter++;
        }
    }

    function mouseDragMove(e) {
        if (!isDragging) return;
        updatePosition(e.clientX, e.clientY);
    }

    function touchDragMove(e) {
        if (!isDragging) return;
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

    function dragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', mouseDragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', touchDragMove);
        document.removeEventListener('touchend', dragEnd);
    }
}
