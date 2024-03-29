<?php
// collections_for_review_list.php
define('COLLECTIONS_FOR_REVIEW', <<<HTML
<div id="collections_for_review-container" class="collections-for-review-container">
    <h2>Photo collections for review</h2>   
    <!-- Text element to display the selected count -->
    <div class ="actions-container"> 
        <div id="selected-count" class="selected-count">0 collections selected</div>
        <button id="delete-button"><i class="fa-solid fa-trash-can"></i></button>
    </div>
    <table id="collection-table">
    <thead>
        <tr>
            <th><input type="checkbox" id="select-all"> Select all</th>
            <th>Name</th>
            <th>Species</th>
            <th>Contributor</th>
            <th>Photo count</th>
        </tr>
    </thead>
    <tbody id="collection-review-list"></tbody>
</table>
</div>
HTML);