/**
 * @param {*} message 
 * @param {*} isError 
 * @param {*} autoDismissTime Number of milliseconds before message is automatically dismissed. -1 or empty means
 * the message will not be auto dismissed.
 */
export function displayStatusMessage(message, isError = false, autoDismissTime = -1, dismissOnNavigation = false) {
    const statusArea = document.getElementById('status-area');

    statusArea.dataset.dismissOnNav = dismissOnNavigation;

    // Set class based on message type (error or success)
    const statusClass = isError ? 'error' : 'success';

    // Find existing status message and close button
    const statusMessage = statusArea.querySelector('.status-message');

    statusMessage.className = `status-message ${statusClass}`;
    statusMessage.querySelector('#status-text').innerHTML = message;

    // Show the status area
    showStatus(autoDismissTime);
}

export function dismissStatusOnNavigation() {
    var statusArea = document.getElementById('status-area');
    if (statusArea.dataset.dismissOnNav) {
        dismissStatus();
    }
}

function dismissStatus() {
    var statusArea = document.getElementById('status-area');
    statusArea.style.display = 'none';
}

/**
* Show status message and automatically dismiss after 5 seconds
*/
function showStatus(autoDismissTime = -1) {
    var statusArea = document.getElementById('status-area');
    statusArea.style.display = 'block';

    if (autoDismissTime > 0) {
        setTimeout(function () {
            dismissStatus();
        }, autoDismissTime);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const closeStatus = document.getElementById('close-status');

    // Close the status box
    closeStatus.addEventListener('click', () => {
        dismissStatus();
    });
});
