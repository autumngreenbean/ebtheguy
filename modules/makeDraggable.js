let zIndexCounter = 2;  // Start cycling from 2
const Z_INDEX_MIN = 2;   // Minimum z-index
const Z_INDEX_MAX = 9;   // Maximum z-index

export function makeDraggable(container, handle) {
    let offsetX = 0, offsetY = 0;
    let isDragging = false;
    const isBlock = container.classList.contains("block");

    // Ensure that blocks stay behind everything else by default
    if (isBlock) {
        container.style.zIndex = 0; // Blocks in the background
    } else {
        container.style.zIndex = 1;  // Non-blocks in front by default
    }

    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;

        // If it's not a block (non-block), bring it to the front during dragging
        if (!isBlock) {
            container.style.zIndex = zIndexCounter; // Set the current z-index for the window
            zIndexCounter++; // Increment the counter for the next window

            // Cycle the zIndex counter between Z_INDEX_MIN and Z_INDEX_MAX
            if (zIndexCounter > Z_INDEX_MAX) {
                zIndexCounter = Z_INDEX_MIN; // Reset back to the minimum
            }
        }

        // Begin dragging behavior
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

        // Reset z-index for non-blocks to stay on top
        if (!isBlock) {
            container.style.zIndex = zIndexCounter;  // Keep the last updated z-index for non-blocks
        }

        // Keep blocks in the background
        if (isBlock) {
            container.style.zIndex = 0;  // Ensure blocks stay behind everything else
        }
    }
}
