<?php

class DatabaseManager
{
    private $mysqli;
    private $dbConfig;

    public function __construct($dbConfig)
    {
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->dbConfig = $dbConfig;
    }

    private function connect()
    {
        if (!$this->mysqli || !$this->mysqli->ping()) {
            // Establish a new connection if none exists or if the connection is closed or lost
            $this->mysqli = new mysqli($this->dbConfig['hostname'], $this->dbConfig['username'], $this->dbConfig['password'], $this->dbConfig['database']);

            if ($this->mysqli->connect_error) {
                throw new \Exception("Connection failed: " . $this->mysqli->connect_error);
            }
        }
    }

    public function executeQuery($query, $params)
    {
        $this->connect(); // Ensure the connection is open or reestablished

        try {
            if (!$stmt = $this->mysqli->prepare($query)) {
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

    public function getError()
    {
        return $this->mysqli->error;
    }

    public function closeConnection()
    {
       if ($this->mysqli) {
            $this->mysqli->close();
            $this->mysqli = null;
        }
    }
}
