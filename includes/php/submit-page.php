<?php
// submit-page.php
define('SUBMIT', <<<HTML
        
<div class="container">
    
<div class="table-container">
  <h1 id="table-title">Review Your Submissions</h1>
  <h2 id="collection-name"></h2>
  <div class="review-section">
    <table id="review-table">
      <thead>
        <tr>
          <th>Select</th>
          <th>Species</th>
          <th>Caption</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody id="review-table-body">
        <!-- JS will populate this -->
      </tbody>
    </table>
    </div>
  </div>

  <div class="permissions-checkbox">
    <input type="checkbox" id="permissions" name="permissions" required>
    <label for="permissions">By clicking this box, I allow CNPS to use these photos.</label>
  </div>

  
  </div>
    <div id="submit-button-container">
        <button type=" button" class="button" id="submit-button" disabled>Submit</button>
    </div>

  <script>
    document.getElementById('permissions').addEventListener('change', function(e) {
      document.getElementById('submit-button').disabled = !e.target.checked;
    });
  </script>



HTML);