let blogInitialized = false;

export function blog(dataId) {
    const allBlogs = document.querySelectorAll('#blog');

    if (!blogInitialized) {
        console.log("First call: hiding all visible #blog elements...");
        allBlogs.forEach(el => {
            // el.style.display = 'none';
        });
        blogInitialized = true;
        return; 
    }

    if (!dataId) {
        console.log("Blog button pressed — showing all #blog containers...");
        allBlogs.forEach(el => {
            el.style.display = '';
        });
        return;
    }

    const windowToClose = document.querySelector(`#blog[data-id="${dataId}"]`);
    if (windowToClose) {
        console.log(`Hiding #blog[data-id="${dataId}"]`);
        windowToClose.style.display = 'none';
    } else {
        console.warn(`No #blog[data-id="${dataId}"] found`);
    }
}
