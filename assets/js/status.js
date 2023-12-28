/**
 * @param {*} message 
 * @param {*} isError 
 */
export function displayStatusMessage(message, isError = false, autoDismiss = false) {
    const statusArea = document.getElementById('status-area');

    // Set class based on message type (error or success)
    const statusClass = isError ? 'error' : 'success';

    // Find existing status message and close button
    const statusMessage = statusArea.querySelector('.status-message');

    statusMessage.className = `status-message ${statusClass}`;
    statusMessage.querySelector('#status-text').textContent = message;

    // Show the status area
    showStatus(autoDismiss);
}

function dismissStatus() {
    var statusArea = document.getElementById('status-area');
    statusArea.style.display = 'none';
}

/**
* Show status message and automatically dismiss after 5 seconds
*/
function showStatus(autoDismiss = false) {
    var statusArea = document.getElementById('status-area');
    statusArea.style.display = 'block';

    if (autoDismiss) {
        setTimeout(function () {
            dismissStatus();
        }, 5000); // 5000 milliseconds (5 seconds)
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const closeStatus = document.getElementById('close-status');

    // Close the status box
    closeStatus.addEventListener('click', () => {
        dismissStatus();
    });
});
