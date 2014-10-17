DROP TABLE IF EXISTS `geo`;
CREATE TABLE IF NOT EXISTS `geo` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'An ID',
  `timestamp` int(10) unsigned NOT NULL COMMENT 'Timestamp of a measure',
  `ip` varchar(20) CHARACTER SET utf8 NOT NULL COMMENT 'IP address used during connection',
  `port` smallint(5) unsigned NOT NULL COMMENT 'Port used during connection',
  `latitude` decimal(9,6) NOT NULL COMMENT 'Latitude coordinate of location',
  `longitude` decimal(9,6) NOT NULL COMMENT 'Longitude coordinate of location',
  `speed` float unsigned NOT NULL COMMENT 'Speed of an object being tracked',
  `heading` float NOT NULL COMMENT 'Heading (direction) of device',
  `altitude` float NOT NULL COMMENT 'An altitude of device',
  `accuracy` smallint(5) unsigned NOT NULL DEFAULT '30' COMMENT 'Geolocation accuracy',
  `battery` tinyint(3) unsigned NOT NULL COMMENT 'Battery charge level (0-100)',
  `signal` tinyint(3) unsigned NOT NULL COMMENT 'GPRS signal strength',
  `imei` tinytext CHARACTER SET utf8 NOT NULL COMMENT 'IMEI or UUID of device reporting location',
  `gps` tinyint(1) NOT NULL COMMENT 'Whether GPS satelites or WiFi network is used to determine location',
  `gprs` tinyint(1) NOT NULL COMMENT 'Whether GPRS celluar or WiFi network is used to push data to server',
  `xacceleration` decimal(9,6) NOT NULL COMMENT 'An acceleration in the X axis',
  `yacceleration` decimal(9,6) NOT NULL COMMENT 'An acceleration in the Y axis',
  `zacceleration` decimal(9,6) NOT NULL COMMENT 'An acceleration in the Z axis',
  `orientation` varchar(1) CHARACTER SET utf8 NOT NULL COMMENT 'Orientation of a device',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci AUTO_INCREMENT=1 ;