<?php
// welcome.php

define('WELCOME', <<<HTML
<p id="welcome">Welcome to the Calscape Photo Manager, where your contributions play a pivotal role in expanding our botanical
    knowledge. You can easily contribute to our platform by uploading plant photos. Whether you choose to upload images
    from your computer or provide Flickr URLs, your contributions are invaluable.</p>

<h2>What would you like to do?</h2>

<div id="container">
    <div id="contribute-container">
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
            <a href="#" class="button" id="contributeButton" data-page="select-photos">Contribute photos</a>
        </div>
    </div>
    <div id="review-container">
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
            <a href="#" class="button" id="reviewButton" data-url="reviewer.html">Review photos</a>
        </div>
    </div>
</div>
HTML);
