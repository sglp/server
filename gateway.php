<?php
    /**
     * Example "add-point" URL for debug purposes:
     * 
     * http://127.0.0.1/sledz.to/server/gateway.php?request=add&timestamp=1398670376322&latitude=43.507969&longitude=-80.520570&speed=0.0000&heading=0.00&altitude=100.00&accuracy=15.00&battery=100&signal=100&imei=3D0AD03B-8B46-431A-BEF5-FF01B96BA990&gps=true&gprs=true&xacceleration=0&yacceleration=0&zacceleration=0&orientation=p
     * 
     * Example SQL query to remove all points inserted from Ripple emulator:
     * 
     * DELETE FROM `geo` WHERE `imei` LIKE '%3D0AD03B-8B46-43%';
     * 
     * Debug (Ripple Emulator's UUID): 3D0AD03B-8B46-431A-BEF5-FF01B96BA990
     */
    /**
     * General switch
     */
    const SERVER_DOWN = FALSE;
    
    $result = array();
    
    if(SERVER_DOWN)
    {
        $result = array
        (
            'status'=>'down'
        );
    }
    else
    {
        if(isset($_GET['request']))
        {
            $request = $_GET['request'];
            
            if($request === 'check')
            {
                $result = array('status'=>'success');
            }
            elseif($request === 'add')
            {
                require_once 'functions.php';
                
                $error = '';
                $row = array();
                
                $row['id'] = '';
                $row['timestamp'] = isset($_GET['timestamp']) ? round($_GET['timestamp'] / 1000) : 'true';
                $row['ip'] = $_SERVER['REMOTE_ADDR'];
                $row['port'] = $_SERVER['REMOTE_PORT'];
                $row['latitude'] = isset($_GET['latitude']) ? $_GET['latitude'] : '0';
                $row['longitude'] = isset($_GET['longitude']) ? $_GET['longitude'] : '0';
                $row['speed'] = isset($_GET['speed']) ? $_GET['speed'] : '0';
                $row['heading'] = isset($_GET['heading']) ? $_GET['heading'] : '0';
                $row['altitude'] = isset($_GET['altitude']) ? $_GET['altitude'] : '0';
                $row['accuracy'] = isset($_GET['accuracy']) ? $_GET['accuracy'] : '0';
                $row['battery'] = isset($_GET['battery']) ? $_GET['battery'] : '100';
                $row['signal'] = isset($_GET['signal']) ? $_GET['signal'] : '100';
                $row['imei'] = isset($_GET['imei']) ? $_GET['imei'] : '';
                $row['gps'] = (isset($_GET['gps']) && $_GET['gps'] && $_GET['gps'] !== 'false') ? 1 : 0;
                $row['gprs'] = (isset($_GET['gprs']) && $_GET['gprs'] && $_GET['gprs'] !== 'false') ? 1 : 0;
                $row['xacceleration'] = isset($_GET['xacceleration']) ? $_GET['xacceleration'] : '0';
                $row['yacceleration'] = isset($_GET['yacceleration']) ? $_GET['yacceleration'] : '0';
                $row['zacceleration'] = isset($_GET['zacceleration']) ? $_GET['zacceleration'] : '0';
                $row['orientation'] = isset($_GET['orientation']) ? $_GET['orientation'] : 'p';
                
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
                    
                    $theSQL = buildSQL($row);
                    /**
                     *  Debug SQL executed on MySQL server.
                     */
//                    echo $theSQL;
//                    die();
                    
                    $query = $db->prepare($theSQL)->execute();
                    
                    $result = array('status'=>'success');
                }
                catch(PDOException $e)
                {
                    $result = array
                    (
                        'status'=>'error',
                        'error'=>'SQL error: "'.$e->getMessage().'"'
                    );
                }
            }
            else
            {
                $result = array
                (
                    'status'=>'error',
                    'error'=>'invalid: request = '.$request
                );
            }
        }
        else
        {
            $result = array
            (
                'status'=>'error',
                'error'=>'invalid: request empty',
            );
        }
    }
    echo json_encode($result);

?>