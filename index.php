<?php
    /**
     * Debug (Ripple Emulator's UUID): 3D0AD03B-8B46-431A-BEF5-FF01B96BA990
     */
    require_once 'functions.php';
    
    try
    {
        $db = new PDO
        (
            'mysql:host='.$dbhost.';dbname='.$dbname.';charset=utf8',  
            $dbuser,
            $dbpass,
            array
            (  
                PDO::ATTR_EMULATE_PREPARES=>false,  
                PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION
            )
        );
    }
    catch(PDOException $e)
    {
        echo 'Error establishing MySQL connection: "'.$e->getMessage().'"!';

        die();
    }
    
    /**
     * Building IMEIs list
     */
    $matches = array();
    $imeiList = file_get_contents('imei.list');
    preg_match_all('/(.*?)#\s?(.*?)(\r\n|$)/', $imeiList, $matches);
    $imeis = array_combine(array_map('trim', $matches[1]), $matches[2]);
    
    $rowsIMEI = $db->query('SELECT DISTINCT imei FROM geo ORDER BY imei')->fetchAll(PDO::FETCH_ASSOC);
    
    foreach($rowsIMEI as $r) $theIMEIs[$r['imei']] = (isset($imeis[$r['imei']])) ? $imeis[$r['imei']] : $r['imei'];
    
    asort($theIMEIs);
    
    if(count($theIMEIs) > 1) $theIMEIs['all'] = '[wszystkie]';
    reset($theIMEIs);
    $defIMEI = key($theIMEIs);
    
    $IMEI = readScriptParam('imei', $defIMEI, FALSE, TRUE, FALSE);
    
    /**
     * Building dates list
     */
    $dateSQL = 'SELECT DISTINCT timestamp FROM geo'.(($IMEI !== '' && $IMEI !== 'all') ? ' WHERE imei="'.$IMEI.'"' : '').' ORDER BY imei';
    
    $rowsDate = $db->query($dateSQL)->fetchAll(PDO::FETCH_ASSOC);
    
    foreach($rowsDate as $r)
    {
        $secondsPerDay = 86400;
        $todayMidnight = strtotime(date('Y-m-d'));
        $readMidnight = strtotime(date('Y-m-d', $r['timestamp']));
        
        $theDate =  date('d.m.Y', $readMidnight);
        
        if($readMidnight === $todayMidnight) $theDate = 'dziś';
        if($readMidnight === ($todayMidnight - $secondsPerDay)) $theDate = 'wczoraj';
        if($readMidnight === ($todayMidnight - ($secondsPerDay * 2))) $theDate = '2 dni temu';
        if($readMidnight === ($todayMidnight - ($secondsPerDay * 3))) $theDate = '3 dni temu';
        
        $theDates[$readMidnight] = $theDate;
    }
    
    if(count($theDates) <> 1) $theDates[0] = '[wszystkie]';
    
    krsort($theDates);
    
    reset($theDates);
    $defDate = key($theDates);
    
    $tab = readScriptParam('tab', 'map', FALSE, TRUE, FALSE);
    $zoom = readScriptParam('zoom', 'all', FALSE, TRUE, FALSE);
    $track = readScriptParam('track', 'all', FALSE, TRUE, FALSE);
    $date = readScriptParam('date', $defDate, FALSE, TRUE, FALSE);
    
    if($date == strtotime(date('Y-m-d')))
    {
        $auto = readScriptParam('auto', '', FALSE, TRUE, FALSE);
        $checked = ($auto == 'on') ? ' checked="checked" ' : ' ';
        
        $autoButton = '<input'.$checked.'type="checkbox" id="auto" title="Odświeżaj automatycznie co 30 sekund" />';
    }
    else $autoButton = '';
    
    /**
     * Main query
     */
    $baseSQL = 'SELECT * FROM geo WHERE port <> 0'.(($IMEI !== '' && $IMEI !== 'all') ? ' AND imei = "'.$IMEI.'"' : '').(($date > 0) ? ' AND timestamp > '.$date.' AND timestamp < '.($date + 86400) : '').' ORDER BY timestamp';
    $rowsBase = $db->query($baseSQL)->fetchAll(PDO::FETCH_ASSOC);
    
    $parsedArray = parseArray($rowsBase);
    $rowsJSON = json_encode($parsedArray);
    
    /**
     * Count groups and points.
     */
    $pointsCount = 0;
    $groupsCount = 0;
    $groupsArray = array();
    
    countGPSPoints($parsedArray, $pointsCount, $groupsCount, $groupsArray);
    
    $countStr = addPolishEnding($pointsCount, 'punkt', 'punkty', 'punktów', 1);
    $countStr .= ' i '.addPolishEnding($groupsCount, 'trasę', 'trasy', 'tras', 1);
    
    /**
     * History and version info
     */
    $cont = explode("\n", file_get_contents('view/history.txt'));
    
    $historyContent = '<h2>Historia zmian</h2>';
    
    for ($i = 0; $i < count($cont); ++$i)
    {
        list($version, $when, $text) = explode('#', $cont[$i]);
        
        $v = is_numeric($version) ? '<strong>Wersja '.trim($version).'</strong>' : '';

        $historyContent .= '<div style="text-decoration: underline; font-size: 90%">'.$v.' ('.trim($when).')</div>';
        $historyContent .= '<div style="margin-bottom: 14px; font-size: 70%">'.trim($text).'</div>';
        $historyContent .= "\n";
    }
    
    $v = explode('#', $cont[0]);
    $currentVersion = $v[0];
    
    /**
     * Other info
     */
    $infoContent = file_get_contents('view/info.txt');
    
    /**
     * Map details
     */
    $geoData = array
    (
        //Depending on map system, range is either 0..360 or -180..180.
        'minLatitude'=>180,
        'minLongitude'=>180,
        'maxLatitude'=>-180,
        'maxLongitude'=>-180,
        'centerLatitude'=>0,
        'centerLongitude'=>0
    );
    
    foreach($parsedArray as $imei)
    {
        foreach($imei as $group)
        {
            foreach($group as $datagram)
            {
                $geoData['minLatitude'] = ($datagram['latitude'] < $geoData['minLatitude']) ? $datagram['latitude'] : $geoData['minLatitude'];
                $geoData['minLongitude'] = ($datagram['longitude'] < $geoData['minLongitude']) ? $datagram['longitude'] : $geoData['minLongitude'];
                $geoData['maxLatitude'] = ($datagram['latitude'] > $geoData['maxLatitude']) ? $datagram['latitude'] : $geoData['maxLatitude'];
                $geoData['maxLongitude'] = ($datagram['longitude'] > $geoData['maxLongitude']) ? $datagram['longitude'] : $geoData['maxLongitude'];
            }
        }
    }
    
    $geoData['centerLatitude'] = $geoData['minLatitude'] + (($geoData['maxLatitude'] - $geoData['minLatitude']) / 2);
    $geoData['centerLongitude'] = $geoData['minLongitude'] + (($geoData['maxLongitude'] - $geoData['minLongitude']) / 2);
    
    $theZooms = array
    (
        'all'=>'cała trasa',
        '---'=>'---------',
        '5'=>'5 pomiarów',
        '10'=>'10 pomiarów',
        '15'=>'15 pomiarów',
        '20'=>'20 pomiarów',
        '25'=>'25 pomiarów',
        '50'=>'50 pomiarów',
        '75'=>'75 pomiarów',
        '100'=>'100 pomiarów',
        '150'=>'150 pomiarów',
        '200'=>'200 pomiarów',
        '250'=>'250 pomiarów',
        '500'=>'500 pomiarów',
        '1000'=>'1000 pomiarów',
        '1500'=>'1500 pomiarów',
        '2000'=>'2000 pomiarów',
        '2500'=>'2500 pomiarów',
        '5000'=>'5000 pomiarów',
        '10000'=>'10000 pomiarów'
    );
    
    if(count($groupsArray) > 1)
    {
        $groupCount = 0;
        $theTracks = array
        (
            'all'=>'wszystkie',
            '---'=>'---------',
        );

        foreach($groupsArray as $group) $theTracks[++$groupCount] = 'trasa nr '.$groupCount;
        
        $tracksCombo = drawSelectFromArray($theTracks, 'track', $track, 'title="Wyświetla wszystkie trasy jednocześnie lub wybraną trasę"');
    }
    else $tracksCombo = '';
    
    /**
     * Rendering page
     */
    $variables = array
    (
        'tab'=>$tab,
        'json'=>$rowsJSON,
        'geoData'=>$geoData,
        'info'=>$infoContent,
        'history'=>$historyContent,
        'countStr'=>$countStr,
        'version'=>$currentVersion,
        'pointsCount'=>count($parsedArray),
        'trackSelect'=>$tracksCombo,
        'imeiSelect'=>drawSelectFromArray($theIMEIs, 'imei', $IMEI),
        'dateSelect'=>drawSelectFromArray($theDates, 'date', $date),
        'zoomSelect'=>drawSelectFromArray($theZooms, 'zoom', $zoom, 'title="Wyświetla całą trasę (lub wszystkie trasy) albo określoną ilość ostatnich punktów wybranej trasy"'),
        'autoButton'=>$autoButton
    );
    
    $renderedPage = renderPage('view/index.php', $variables);
    $template = file_get_contents('view/template.html');
    
    echo(str_replace('##BODY##', $renderedPage, $template));
?>