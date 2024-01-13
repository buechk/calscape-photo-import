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
        $stmt = $this->mysqli->prepare($query);

        if (!$stmt) {
            die("Error in preparing query: " . $this->mysqli->error);
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

        // Handle errors if needed

        return $stmt->get_result();
    }

    public function closeConnection()
    {
        $this->mysqli->close();
    }
}
