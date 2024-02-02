<?php
class DatabaseManager
{
    private $mysqli;

    public function __construct($hostname, $username, $password, $database)
    {
        $this->mysqli = new mysqli($hostname, $username, $password, $database);

        if ($this->mysqli->connect_error) {
            die("Connection failed: " . $this->mysqli->connect_error);
        }
    }

    public function executeQuery($query, $params)
    {
        try {
            $stmt = $this->mysqli->prepare($query);
    
            if (!$stmt) {
                throw new \Exception("Error in preparing query: " . $this->mysqli->error);
            }
    
            // Extract the type definition and values separately
            $typeDefinition = array_shift($params);
            $bindParams = [&$typeDefinition]; // First element is the type definition
    
            foreach ($params as $param) {
                $bindParams[] = &$param; // Pass each parameter by reference
            }
    
            // Bind parameters and execute the statement
            call_user_func_array([$stmt, 'bind_param'], $bindParams);
            $stmt->execute();
    
            // Check for execution errors
            if ($stmt->errno) {
                throw new \Exception("Error executing query: " . $stmt->error);
            }
    
            // Get the result
            $result = $stmt->get_result();
    
            // Check for result errors
            if ($stmt->errno) {
                throw new \Exception("Error getting result: " . $stmt->error);
            }
    
            return $result;
        } catch (\Exception $e) {
            // Handle the exception (log, rethrow, etc.)
            // Optionally, you can rethrow the exception if you want it to be handled elsewhere
            throw $e;
        } finally {
            // Close the statement in the finally block
            if (isset($stmt)) {
                $stmt->close();
            }
        }
    }      

    public function closeConnection()
    {
        $this->mysqli->close();
    }
}
