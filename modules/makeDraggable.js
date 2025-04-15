let zIndexCounter = 2;  // Start higher than block background

export function makeDraggable(container, handle) {
    let offsetX = 0, offsetY = 0;
    let isDragging = false;
    const isBlock = container.classList.contains("block");

    // Set initial z-index
    if (isBlock) {
        container.style.zIndex = 0; // Always in the background
    } else {
        container.style.zIndex = zIndexCounter++; // Always spawn on top
    }

    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;

        // Bring to front if it's a non-block
        if (!isBlock) {
            container.style.zIndex = zIndexCounter++;
        }

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    });

    function dragMove(e) {
        if (!isDragging) return;

        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;

        container.style.left = `${newX}px`;
        container.style.top = `${newY}px`;
    }

    function dragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
    }
}
