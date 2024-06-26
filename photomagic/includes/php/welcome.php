<?php
// welcome.php

define('WELCOME', <<<HTML
<div class="flex-container-column">
    <div id="welcome-container">
        <h2 style="text-align: center;">Welcome to the Calscape Photo Companion</h2>
        <p id="welcome">Your contributions play a pivotal role in expanding our botanical
            knowledge. You can easily contribute to our platform by uploading plant photos. Whether you choose to upload images
            from your computer or provide Flickr URLs, your contributions are invaluable.</p>
    </div>
    <div id="to-do-container">
        <h2>What would you like to do?</h2>
    </div>
    <div id="container">
        <div id="tabs">
            <button id="contribute-container-tab" class="tablinks" onclick="openTab(event, 'contribute-container')">Contribute Photos</button>
            <button id="review-container-tab" class="tablinks" onclick="openTab(event, 'review-container')">Review Photos</button>
        </div>
        <div id="contribute-container" class="tabcontent">
            <h2 class="centered-text">Contribute Photos</h2>
            <p>How to contribute photos:</p>
            <p>
                Copy guidelines here or link to Google doc/PDF <a
                    href="file:///C:/Users/paige/Downloads/Calscape%20Photo%20Guidelines.pdf">Calscape Photo
                    Guidelines</a>? <br>
            </p>
            <p>
                We encourage you to follow our photo guidelines to ensure the quality and accuracy of your contributions.
                Please make sure the uploaded images do not infringe on any copyrights. They should be either your own,
                owned by CNPS, in the public domain, or licensed under Creative Commons Share Alike. When uploading, be sure
                to include the Creative Commons license and author information.
            </p>
            <p>
                Your contributions help us create a
                comprehensive repository of California's plant life, and we appreciate your role in this botanical
                community. Thank you for sharing your knowledge through photos.
            </p>
            <div class="button-container">
                <a href="#" class="button" id="contributeButton" data-menu="role-contributor" data-nav="select-photos">Contribute photos</a>
            </div>
        </div>
        <div id="review-container" class="tabcontent">
            <h2 class="centered-text">Review Photos</h2>
            <p>How to Review photos:</p>
            <p>
                The role as a Calscape reviewer is essential in maintaining the quality and accuracy of our plant photo
                database. This involves ensuring that all contributed photos are of high quality, properly documented, and
                relevant to the intended species.
            </p>
            <p>
                Reviewers also play a pivotal role in maintaining the appropriateness of the content, confirming that each
                image's primary focus aligns with the specified species while minimizing any potential confusion with other
                plants in the photo. Additionally, they verify that key fields such as author, species, copyright, and
                date are correctly filled in.
                By upholding these standards, reviewers help create a reliable and comprehensive botanical resource, enriching
                the experience for all Calscape users.
            </p>
            <p>
                Your diligent efforts as a reviewer help us provide the most reliable and comprehensive botanical
                resource possible. Thank you for your invaluable contribution to our community.
            </p>
            <div class="button-container">
                <a href="#" class="button" id="reviewButton" data-menu="role-reviewer" data-nav="select-collection">Review photos</a>
            </div>
        </div>
    </div>

    <footer>
        <div class="version-info">
            <div id="version"></div>
            <div id="db_version"></div>
        </div>
        <div class="copyright">
            <a href="https://www.cnps.org/" target="_blank">© California Native Plant Society. All rights reserved.</a>
        </div>
    </footer>
</div>

<script>
    function openTab(evt, tabName) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    }

    function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    // Check if evt is defined (i.e., function is called with an event object)
    if (evt) {
        evt.preventDefault(); // Prevent default action for programmatic click
    }

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    
    // Add the 'active' class to the clicked tab or the tab being opened programmatically
    var tab = document.getElementById(tabName + "-tab");
    if (tab) {
        tab.className += " active";
    }
}


    document.getElementById('version').innerText = "Photo Companion version: " + window.photoCompanionVersion;
    document.getElementById('db_version').innerText = "Calscape version: " + window.calscapeVersion;
</script>
HTML);
