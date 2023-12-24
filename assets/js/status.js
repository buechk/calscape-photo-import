/**
 * @param {*} message 
 * @param {*} isError 
 */
export function displayStatusMessage(message, isError = false, autoDismiss = false) {
    const statusArea = document.getElementById('status-area');

    // Set class based on message type (error or success)
    const statusClass = isError ? 'error' : 'success';

    // Create a new status message element
    const statusMessage = document.createElement('div');
    statusMessage.className = `status-message ${statusClass}`;
    statusMessage.textContent = message;

    // Clear existing messages and append the new one
    statusArea.innerHTML = '';
    statusArea.appendChild(statusMessage);

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

const closeStatus = document.getElementById('close-status');

// Close the Flickr import modal
closeStatus.addEventListener('click', () => {
    dismissStatus();
});
