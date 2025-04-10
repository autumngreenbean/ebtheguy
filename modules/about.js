let hasInitialized = false;

export function about(dataId) {
    const allAbouts = document.querySelectorAll('#about');

    if (!hasInitialized) {
        // console.log("First call: hiding all visible #about elements...");
        allAbouts.forEach(el => {
            el.style.display = 'none';
        });
        hasInitialized = true;
        return; 
    }

    if (!dataId) {
        // console.log("About button pressed — showing all #about containers...");
        allAbouts.forEach(el => {
            el.style.display = '';
            el.style.zIndex = '2'
        });
        return;
    }

    const windowToClose = document.querySelector(`#about[data-id="${dataId}"]`);
    if (windowToClose) {
        // console.log(`Hiding #about[data-id="${dataId}"]`);
        windowToClose.style.display = 'none';
    } else {
        console.warn(`No #about[data-id="${dataId}"] found`);
    }
}
