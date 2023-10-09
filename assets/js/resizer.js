/**
 * @file
 * Resizer code for resize bar
 */

const divider = document.getElementById('divider');
const leftPanel = document.querySelector('.source-photos-container');
const rightPanel = document.querySelector('.right-container');

let isDragging = false;

divider.addEventListener('mousedown', (e) => {
    isDragging = true;

    const initialX = e.clientX;
    const leftPanelWidth = leftPanel.offsetWidth;
    const rightPanelWidth = rightPanel.offsetWidth;

    document.body.classList.add('user-select-none');

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    function handleMouseMove(e) {
        if (!isDragging) return;

        const offsetX = e.clientX - initialX;
        const newLeftWidth = leftPanelWidth + offsetX;
        const newRightWidth = rightPanelWidth - offsetX;

        leftPanel.style.width = newLeftWidth + 'px';
        rightPanel.style.width = newRightWidth + 'px';
    }

    function handleMouseUp() {
        isDragging = false;
        document.body.classList.remove('user-select-none');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
});




