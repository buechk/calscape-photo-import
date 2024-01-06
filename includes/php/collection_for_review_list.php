<?php
// collections_for_review_list.php
define('COLLECTIONS_FOR_REVIEW', <<<HTML
<div id="collections_for_review-container" class="collections_for_review-container">
    <h2>Photo collections for review</h2>
    <table id="collection-table">
    <thead>
        <tr>
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
