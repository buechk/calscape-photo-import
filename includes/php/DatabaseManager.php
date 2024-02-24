<?php

class DatabaseManager
{
    private $mysqli;

    public function __construct($dbConfig)
    {
        $this->mysqli = new mysqli($dbConfig['hostname'], $dbConfig['username'], $dbConfig['password'], $dbConfig['database']);

        if ($this->mysqli->connect_error) {
            die("Connection failed: " . $this->mysqli->connect_error);
        }
    }

    public function beginTransaction()
    {
        return $this->mysqli->begin_transaction();
    }

    public function commit()
    {
        return $this->mysqli->commit();
    }

    public function rollback()
    {
        return $this->mysqli->rollback();
    }

    public function executeQuery($query, $params)
    {
        try {
            $stmt = $this->mysqli->prepare($query);
    
            if (!$stmt) {
                throw new \Exception("Error in preparing query: " . $this->mysqli->error);
            }
    
            // Initialize bindParams with an empty array
            $bindParams = [];
    
            // If $params is not empty, extract the type definition and values separately
            if (!empty($params)) {
                $typeDefinition = array_shift($params);
                $bindParams[] = &$typeDefinition; // First element is the type definition
    
                foreach ($params as $param) {
                    $bindParams[] = &$param; // Pass each parameter by reference
                }
            }
    
            // Bind parameters and execute the statement
            if (!empty($bindParams)) {
                call_user_func_array([$stmt, 'bind_param'], $bindParams);
            }
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
        } catch (Exception $e) {
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
