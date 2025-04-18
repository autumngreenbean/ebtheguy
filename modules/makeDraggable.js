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

    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;

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
