<?php
    require_once 'config.inc';
    
    $dbhost = isset($dbhost) ? $dbhost : '127.0.0.1';
    $dbname = isset($dbname) ? $dbname : 'sglp';
    $dbuser = isset($dbuser) ? $dbuser : 'sglp';
    $dbpass = isset($dbpass) ? $dbpass : '';
    
    /**
     * Recursively counts GPS data array. Due to array structure, using PHP function
     * count($parsedArray, COUNT_RECURSIVE) instead, produced inacurate results.
     * 
     * @param array $array  GPS data array to be counted.
     * 
     * @return int          Number of elements in GPS data array.
     */
    function countGPSPoints($array, &$pointsCount, &$groupsCount, &$groupsArray)
    {
        $pointsCount = 0;
        $groupsCount = 0;
        $groupsArray = array();
        
        foreach($array as $uuid)
        {
            foreach($uuid as $group)
            {
                $pointsCount = $pointsCount + count($group);
                
                $groupsArray[] = $group;
                
                ++$groupsCount;
            }
        }
    }
    
    /**
     * Returns given param value. Reads it either from query, cookie or returs
     * default value, if neither are set.
     * 
     * @param string $paramName         Param name to be read from either query or cookie.
     * @param variant $defValue         Default value returned, if neither query nor cookie contains param.
     * @param boolean $cookieCheck      Whether check for a value stored in a cookie.
     * @param boolean $queryCheck       Whether check for a value passed in a query.
     * @param boolean $validateInput    Whether perform value validity check.
     * 
     * @return variant                  Returns read value or default value.
     */
    function readScriptParam($paramName, $defValue = '', $cookieCheck = TRUE, $queryCheck = TRUE, $validateInput = TRUE)
    {
        $sp = $paramName;
        $cp = 'gpsd_'.$paramName;
        
        if($cookieCheck)
        {
            if(isset($_COOKIE[$cp]))
            {
                if($validateInput)
                {
                    if(gettype($defValue) == 'string')
                    {
                        $fromCookie = ($_COOKIE[$cp] !== '') ? $_COOKIE[$cp]: '';
                    }
                    else
                    {
                        $fromCookie = ($_COOKIE[$cp] > 0) ? $_COOKIE[$cp]: '';
                    }
                }
                else $fromCookie = $_COOKIE[$cp];
            }
            else $fromCookie = '';
        }
        else $fromCookie = '';
        
        if($queryCheck)
        {
            if(isset($_GET[$sp]))
            {
                if($validateInput)
                {
                    if(gettype($defValue) == 'string')
                    {
                        $fromQuery = ($_GET[$sp] !== '') ? $_GET[$sp] : '';
                    }
                    else
                    {
                        $fromQuery = ($_GET[$sp] > 0) ? $_GET[$sp] : '';
                    }
                }
                else $fromQuery = $_GET[$sp];
            }
            else $fromQuery = '';
        }
        else $fromQuery = '';
        
        $param = ($fromQuery !== '') ? $fromQuery : (($fromCookie !== '') ? $fromCookie : $defValue);
        
        return $param;
    }
    
    /**
     * Renders page based on given view file and feeds it with passed variables.
     * 
     * @param string $_viewFile_    File name (optionally with path) in format valid for require.
     * @param variant $_data_       Variable or array of variables to be passed to rendered view.
     * @param boolean $_return_     Whether view should be rendered and echoed or only returned.
     * 
     * @return string               Returns rendered view, fed with variables, if $_return_ === TRUE.
     */
    function renderPage($_viewFile_, $_data_ = null, $_return_ = TRUE)
    {
        if(is_array($_data_))
            extract($_data_, EXTR_PREFIX_SAME, 'data');
        else 
            $data = $_data_;
        
        if($_return_) 
        {
            ob_start(); 
            ob_implicit_flush(false); 
            
            require($_viewFile_);
            
            return ob_get_clean();
        }
        else require($_viewFile_);
    }
    
    /**
     * Returns $value with correct Polish ending and optional preceeding addition
     * or/and proper formatting (bolding) of whole text. Only first four parameters
     * are required, $boldMode defaults to FALSE (nothing will be bolded in output)
     * and last three params defaults to empty string (nothing will be added).
     * 
     * @param integer $value          Base value,
     * @param string $textFor1        Text for one (i.e. "sekunda"),
     * @param string $textFor2to4     Text for 2-4 (i.e. "sekundy"),
     * @param string $textFor5plus    Text for 5+ (i.e. "sekund"),
     * @param variant $boldMode       What will be surrounded by <strong> tags i output:
     *                                - 0: nothing (same as when $boldMode = FALSE, default value),
     *                                - 1: only value passed in $value,
     *                                - 2: value and ending (i.e. $textFor1),
     *                                - 3: everything (beginning, value and ending),
     *                                - 9: special mode: returns unbolded ending only (without value or beginning),
     * @param string $addFor1         Beginning for one (i.e. "pozostała" -- "pozostała 1 sekunda"),
     * @param string $addFor2to4      Beginning for 2-4 (i.e. "pozostały" -- "pozostały 2 sekundy"),
     * @param string $addFor5plus     Beginning for 5+ (i.e. "pozostało" -- "pozostało 7 sekund"),
     * 
     * @return string                 Value with proper ending, optional beginning and properly formatted.
     * 
     * Notice: In Polish language there three modes (types of ending), basing on value that preceeds it:
     * - 1: only for value = 1 (singular from), i.e. "1 sekunda", "1 klocek", "1 drzewo",
     * - 2: for values = 2-4, at every position, with exception of 11-19, i.e. "2 sekundy", "22 klocki", "194 drzewa",
     * - 3: for values = 1, at every position, for number higher than 10 (i.e. "21 sekund"), all values in range 11-19 (i.e. "14 klocków") and all others situations, not covered by mode 1-2 (i.e. "217 drzew").
     */
    function addPolishEnding($value, $textFor1 = '', $textFor2to4 = '', $textFor5plus = '', $boldMode = FALSE, $addFor1 = '', $addFor2to4 = '', $addFor5plus = '')
    {
        $mode = 3; //Default, because most sitations fullfills third mode.

        $last = substr($value, strlen($value) - 1, 1); //Check last number
        $lastTwo = substr($value, strlen($value) - 2, 2); //Check last two numbers

        if (($last > 1) and ($last < 5)) $mode = 2; //Numbers from range 2-4 on first position -- second mode.
        if (($lastTwo > 10) and ($lastTwo < 20)) $mode = 3; //Forcing mode 3 for numbers having 11-19 at the end (i.e. 11, 113, 1119 and so on).
        if ($value == 1) $mode = 1; //Mode 1 is special mode only for value = 1 (singular form).

        $beginAddition = '';

        if ($mode == 1)
        {
            $baseText = $textFor1;
            if ($addFor1 != '') $beginAddition = $addFor1.' ';
        }

        if ($mode == 2)
        {
            $baseText = $textFor2to4;
            if ($addFor2to4 != '') $beginAddition = $addFor2to4.' ';
        }

        if ($mode == 3)
        {
            $baseText = $textFor5plus;
            if ($addFor5plus != '') $beginAddition = $addFor5plus.' ';
        }

        if ($boldMode == 0) $formattedText = $beginAddition.$value.' '.$baseText;
        if ($boldMode == 1) $formattedText = $beginAddition.'<strong>'.$value.'</strong> '.$baseText;
        if ($boldMode == 2) $formattedText = $beginAddition.'<strong>'.$value.' '.$baseText.'</strong>';
        if ($boldMode == 3) $formattedText = '<strong>'.$beginAddition.$value.' '.$baseText.'</strong>';
        if ($boldMode == 9) $formattedText = $baseText;

        return $formattedText;
    }

    /**
     * Draws XHTML select element based on array.
     * 
     * @param array $elements   Array of elements (key->value pairs) put to select element.
     * @param string $id        The ID of element.
     * @param string $selected  Selected value (if any).
     * 
     * @return string           XHTML code for generated select element.
     */
    function drawSelectFromArray($elements, $id, $selected, $extra = '')
    {
        $combo = '<select '.$extra.' id="'.$id.'">';
        
        foreach($elements as $value=>$text)
        {
            $value = strval($value);
            
            $combo .= '<option value="'.$value.'"'.(($value === $selected) ? ' selected="selected"' : '').'>'.trim($text).'</option>';
            $combo .= "\n";
        }
        $combo .= '</select>';
        
        return $combo;
    }
    
    /**
     * Draws XHTML select element based on given string, where elements are placed
     * in separated lines and key->value pairs are separated by #.
     * 
     * @param array $data       String with elements.
     * @param string $id        The ID of element.
     * @param string $selected  Selected value (if any).
     * 
     * @return string           XHTML code for generated select element.
     */    
    function drawSelectFromString($data, $id, $selected)
    {
        $combo = '<select id="'.$id.'">';
        $cont = explode("\n", $data);

        for ($i = 0; $i < count($cont); ++$i)
        {
            list($value, $text) = explode('#', $cont[$i]);
            
            $combo .= '<option value="'.$value.'"'.(($value == $selected) ? ' selected="selected"' : '').'>'.trim($text).'</option>';
            $combo .= "\n";
        }
        $combo .= '</select>';

        return $combo;
    }
    
    /**
     * Wrapper function to draw XHTML select element based on string read from file.
     * Elements separation as in drawSelectFromString() function.
     * 
     * @param array $fileName   Filename (with optional path) of a data file to read.
     * @param string $id        The ID of element.
     * @param string $selected  Selected value (if any).
     * 
     * @return string           XHTML code for generated select element.
     */
    function drawSelectFromFile($fileName, $id, $selected)
    {     
         return drawSelectFromString(file_get_contents($fileName), $id, $selected);
    }
    
    /**
     * Internal GPS-Project function to convert (parse) database query result array,
     * from measure-oriented to IMEI-oriented and to do some additional data clenaup.
     * 
     * @param array $array  Input array
     * 
     * @return array        Resulting array after conversion and clenaup
     */
    function parseArray($array)
    {
        $rowsJSON = array();
        $cDG = array();
        $groupCount = 0;
        
        foreach($array as $r)
        {
            $pDG = $cDG;
            
            /**
             * Remove unnecessary components from datagram and filter invalid data.
             */
            $cDG = $r;
            unset($cDG['imei'], $cDG['data']);
            
            if
            (
                !isset($cDG['timestamp']) || !isset($pDG['timestamp']) ||
                !isset($cDG['latitude']) || !isset($pDG['latitude']) ||
                !isset($cDG['longitude']) || !isset($pDG['longitude'])
            )
            continue;
			
			/**
			 * If "time difference between two points is longer
			 * than 3 minutes (180 seconds), start a new track.
			 *
			 * Previous values:
			 *
			 * - 7 minutes (420 seconds), till 2013-11-08,
			 * - 10 minutes (600 seconds), since project start (2012).
			 */
            
            if($cDG['timestamp'] - $pDG['timestamp'] > 180) ++$groupCount;
            
            //Converte to IMEI-oriented array -- insert only unique results
            if
            (
                ($pDG['timestamp'] <> $cDG['timestamp']) 
                &&
                (
                    ($pDG['latitude'] <> $cDG['latitude'])
                    ||
                    ($pDG['longitude'] <> $cDG['longitude'])
                )
            )
            $rowsJSON[$r['imei']][$groupCount][] = $cDG;
        }
        
        return $rowsJSON;
    }
    
    /**
     * Internal GPS-Project function to cleanup (parse) data sent from GPS localizer
     * or mobile application.
     * 
     * @param array $row    Input array with only one element (string) -- data read from localizer.
     * 
     * @return array        Parsed array with many elements, as required by database table.
     */
    function parseRow($row)
    {
        /**
         * Main parse routine.
         */
        $data = explode(' ', $row['data']);
        
        foreach($data as $tmp)
        {
            if(strpos($tmp, ':') !== FALSE)
            {
                list($key, $value) = explode(':', $tmp);
                $row[$key] = $value;
            }
        }
        
        /**
         * Aditional fixups to parsed data.
         */
        unset($row['date'], $row['time']); //Incorrectly recorded, so drop them.
        $row['speed'] = (isset($row['speed'])) ? round(($row['speed'] * 3600) / 1000, 2) : ''; //Recalculate speed: m/s --> km/s and round up.
        $row['ip'] = '"'.$row['ip'].'"'; //Recalculate speed: m/s --> km/s and round up.
        
        //Fixups to battery power and network signal strength.
        $row['signal'] = (isset($row['signal'])) ? ((int)(($row['signal'] === 'F') ? '100' : $row['signal'])) : '';
        if(isset($row['bat']))
        {
            $row['battery'] = ((int)(($row['bat'] === 'F') ? '100' : $row['bat']));
            unset($row['bat']);
        }
        else $row['battery'] = '';
        
        /**
         * Change lat and long to full qualified name.
         */
        $row['latitude'] = (isset($row['lat'])) ? $row['lat'] : '';
        $row['longitude'] = (isset($row['long'])) ? $row['long'] : '';
        unset($row['lat'], $row['long']);
        
        /**
         * Correct method and protocol names and correct their values.
         */
        $row['gps'] = (isset($row['method']) && $row['method'] != 'null') ? (($row['method'] === 'gps') ? '"true"' : '"false"') : 'null';
        $row['gprs'] = (isset($row['protocol']) && $row['protocol'] != 'null') ? (($row['protocol'] === 'gprs') ? '"true"' : '"false"') : 'null';
        unset($row['method'], $row['protocol']);
        
        return $row;
    }
    
    /**
     * Builds proper SQL for insert of new or update of existing localizer data row.
     * 
     * @param array $row            Row of data, usualy result of parseRow() function.
     * @param boolean $updateMode   Whether insertion or update of existing row.
     * 
     * @return string               SQL ready to be executed on database.
     */
    function buildSQL($row, $updateMode = FALSE)
    {
        global $dbname;
        
        if($updateMode)
        {
            /**
             * Remove array elements that won't be in generated SQL statement (i.e.
             * columns that won't be updated).
             */
            unset($row['timestamp'], $row['ip'], $row['protocol'], $row['rowid']);

            $sql = 'UPDATE `'.$dbname.'`.`geo` SET ';

            foreach($row as $key=>$value) $sql .= '`'.$key."` = '".$value."', ";
            
            $sql = rtrim($sql, ', ');
        }
        else
        {
            $sql = 'INSERT INTO `'.$dbname.'`.`geo` (';

            foreach($row as $key=>$value) $sql .= '`'.$key.'`, ';
            
            $sql = rtrim($sql, ', ');

            $sql .= ') VALUES (';

            foreach($row as $key=>$value) $sql .= "'".$value."', ";
            
            $sql = rtrim($sql, ', ');

            $sql .= ')';
        }
        
        return $sql;
    }
?>