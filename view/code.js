/**
 *  Color array for paths on map -- http://colorbrewer2.org/
 */
var
    geoNamesArray = new Array(),
    colorArray =
    [
        ['#4D004B', '#810F7C', '#88419D', '#8C6BB1', '#8C96C6', '#9EBCDA', '#BFD3E6', '#E0ECF4', '#F7FCFD'],
        ['#005824', '#238B45', '#41AE76', '#66C2A4', '#CCECE6', '#CCECE6', '#EDF8FB'],
        ['#990000', '#D7301F', '#EF6548', '#FC8D59', '#FDBB84', '#FDD49E', '#FEF0D9'],
        ['#7A0177', '#AE017E', '#DD3497', '#F768A1', '#FA9FB5', '#FCC5C0', '#FEEBE2']
    ];

$(document).ready(function()
{
    /**
     * Binding events
     */
    $('#imei').on('change', function()
    {
        redirect('index.php?db=' + $('#db').val() + '&imei=' + this.value + (($('#zoom').val() !== '---') ? '&zoom=' + $('#zoom').val() : '') + '&tab=' + getSelectedTab());
    });
    
    $('#date').on('change', function()
    {
        redirect('index.php?db=' + $('#db').val() + '&imei=' + $('#imei').val() + '&date=' + this.value + (($('#zoom').val() !== '---') ? '&zoom=' + $('#zoom').val() : '') + '&tab=' + getSelectedTab());
    });
    
    $('#track').on('change', function()
    {
        $(window).resize();
        
        if(this.value !== '---') redirect(getRefreshButtonURL());
    });
    
    $('#zoom').on('change', function()
    {
        if(this.value !== '---') redirect(getRefreshButtonURL());
    });
    
    $('#refresh').on('click', function()
    {
        redirect(getRefreshButtonURL());
    });
    
    $('.tab-button').on('click', function()
    {
        var elem = $(this).attr('id');
        
        switchTab(elem.substr(0, elem.indexOf('Button')));
    });
    
    /**
     * Auto-refresh loop
     */
    window.setTimeout(function()
    { 
        if($('#auto').attr('checked')) redirect(getRefreshButtonURL());
    }, 30000);
});

/**
 * Extending jQuery
 */
jQuery.isJSON = function(data)
{
    var isJson = false;
    
    try
    {
       isJson = typeof ($.parseJSON(data)) === 'object';
    }
    catch(ex) {console.log('Passed data is not a valid JSON!')}
    
    return isJson;
}

/**
 * User-defined functions
 */
function switchTab(tab)
{
    $('.mcd').hide();
    $('#' + tab).show();
    
    $('.tab-button').removeClass('btn-warning');
    $('#' + tab + 'Button').addClass('btn-warning');
    
    $(window).resize();
}

function getRefreshButtonURL()
{
    var
        track = (typeof($('#track').val()) === 'undefined') ? 'all' : (($('#track').val() !== '---') ? $('#track').val() : ''),
        url = 'index.php?db=' + $('#db').val() + '&imei=' + $('#imei').val() + '&date=' + $('#date').val() + '&track=' + track + (($('#zoom').val() !== '---') ? '&zoom=' + $('#zoom').val() : '') + '&tab=' + getSelectedTab();

    if($('#auto').attr('checked')) url = url + '&auto=on';
    
    return url;
}

function getSelectedTab()
{
    var iterator = $('div.mcd').map(function(){return ($(this).css('display') === 'block') ? $(this).attr('id') : null});
    
    return iterator[0];
}

function redirect(url)
{
    $.blockUI({css:{onBlock: function(){window.location.href = url;}}});
}

/**
 * Returns value with correct Polish ending and optional preceeding addition
 * or/and proper formatting (bolding) of whole text. Only first four parameters
 * are required, boldMode defaults to FALSE (nothing will be bolded in output)
 * and last three params defaults to empty string (nothing will be added).
 * 
 * @param value          Base value,
 * @param textFor1       Text for one (i.e. "sekunda"),
 * @param textFor2to4    Text for 2-4 (i.e. "sekundy"),
 * @param textFor5plus   Text for 5+ (i.e. "sekund"),
 * @param boldMode       What will be surrounded by <strong> tags i output:
 *                          - 0: nothing (default value),
 *                          - 1: only value passed in value,
 *                          - 2: value and ending (i.e. textFor1),
 *                          - 3: everything (beginning, value and ending),
 *                          - 9: special mode: returns unbolded ending only (without value or beginning),
 * @param addFor1        Beginning for one (i.e. "pozostała" -- "pozostała 1 sekunda"),
 * @param addFor2to4     Beginning for 2-4 (i.e. "pozostały" -- "pozostały 2 sekundy"),
 * @param addFor5plus    Beginning for 5+ (i.e. "pozostało" -- "pozostało 7 sekund"),
 * 
 * @return string                 Value with proper ending, optional beginning and properly formatted.
 * 
 * Notice: In Polish language there three modes (types of ending), basing on value that preceeds it:
 * - 1: only for value = 1 (singular from), i.e. "1 sekunda", "1 klocek", "1 drzewo",
 * - 2: for values = 2-4, at every position, with exception of 11-19, i.e. "2 sekundy", "22 klocki", "194 drzewa",
 * - 3: for values = 1, at every position, for number higher than 10 (i.e. "21 sekund"), all values in range 11-19 (i.e. "14 klocków") and all others situations, not covered by mode 1-2 (i.e. "217 drzew").
 */
function addPolishEnding(value, textFor1, textFor2to4, textFor5plus, boldMode, addFor1, addFor2to4, addFor5plus)
{
    var
        textFor1 = textFor1 || '',
        textFor2to4 = textFor2to4 || '',
        textFor5plus = textFor5plus || '',
        boldMode = boldMode || false,
        addFor1 = addFor1 || '',
        addFor2to4 = addFor2to4 || '',
        addFor5plus = addFor5plus || '',
        mode = mode = 3, //Default, because most sitations fullfills third mode.
        formattedText = '',
        beginAddition = '',
        baseText = '',
        last = 0,
        lastTwo = 0;

    last = value.toString().substr(value.toString().length - 1, 1); //Check last number
    lastTwo = value.toString().substr(value.toString().length - 2, 2); //Check last two numbers

    if((last > 1) && (last < 5)) mode = 2; //Numbers from range 2-4 on first position -- second mode.
    if((lastTwo > 10) && (lastTwo < 20)) mode = 3; //Forcing mode 3 for numbers having 11-19 at the end (i.e. 11, 113, 1119 and so on).
    if(value == 1) mode = 1; //Mode 1 is special mode only for value = 1 (singular form).

    beginAddition = '';

    if(mode == 1)
    {
        baseText = textFor1;
        if(addFor1 !== '') beginAddition = addFor1 + ' ';
    }

    if(mode == 2)
    {
        baseText = textFor2to4;
        if(addFor2to4 !== '') beginAddition = addFor2to4 + ' ';
    }

    if(mode == 3)
    {
        baseText = textFor5plus;
        if (addFor5plus !== '') beginAddition = addFor5plus + ' ';
    }

    if(boldMode == 0) formattedText = beginAddition + value + ' ' + baseText;
    if(boldMode == 1) formattedText = beginAddition + '<strong>' + value + '</strong> ' + baseText;
    if(boldMode == 2) formattedText = beginAddition + '<strong>' + value + ' ' + baseText + '</strong>';
    if(boldMode == 3) formattedText = '<strong>' + beginAddition + value + ' ' + baseText + '</strong>';
    if(boldMode == 9) formattedText = baseText;

    return formattedText;
}

function timestampToTime(timestamp)
{
    var
        date = new Date(timestamp * 1000),
        hours = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()),
        minutes = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
        seconds = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());

    return hours + ':' + minutes + ':' + seconds;
}

function secondsToTime(input)
{
    var
        sec = parseInt(input, 10),
        hours = Math.floor(sec / 3600),
        minutes = Math.floor((sec - (hours * 3600)) / 60),
        seconds = sec - (hours * 3600) - (minutes * 60);

    if(hours < 10) hours = '0' + hours;
    if(minutes < 10) minutes = '0' + minutes;
    if(seconds < 10) seconds = '0' + seconds;

    return hours + ':' + minutes + ':' + seconds;
}

function parseTime(timestamp)
{
    if(timestamp === 0) return '<strong>0</strong> sekund';
    
    var
        returnText = '',
        days = Math.floor(timestamp / 86400),
        hours = Math.floor((timestamp - (days * 86400)) / 3600),
        minutes = Math.floor((timestamp - (days * 86400) - (hours * 3600)) / 60),
        seconds = timestamp - (days * 86400) - (hours * 3600) - (minutes * 60),
        daysText = (days > 0) ? addPolishEnding(days, 'dzie\u0144', 'dni', 'dni', 1) : '',
        hoursText = (hours > 0) ? addPolishEnding(hours, 'godzina', 'godziny', 'godzin', 1) : '',
        minutesText = (minutes > 0) ? addPolishEnding(minutes, 'minuta', 'minuty', 'minut', 1) : '',
        secondsText = (seconds > 0) ? addPolishEnding(seconds, 'sekunda', 'sekundy', 'sekund', 1) : '';
        
    returnText = daysText + ((daysText.length > 0) ? ', ' : '');
    returnText = returnText + hoursText + ((hoursText.length > 0) ? ', ' : '');
    returnText = returnText + minutesText + ((minutesText.length > 0) ? ' i ' : '');
    returnText = returnText + secondsText;
    
    return returnText;
}

function numberWithThousandSeparator(number, separator)
{
    var
        rx = /(\d+)(\d{3})/,
        separator = separator || ' ';
    
    return String(number).replace(/^\d+/, function(w)
    {
        while(rx.test(w))
        {
            w = w.replace(rx, '$1' + separator + '$2');
        }
        
        return w;
    });
}

/*
 * http://stackoverflow.com/a/9743119/1469208
 */
function fixedToPrecision(number)
{    
    if(number >= 10) return number.toFixed(0);
    
    if(number >= 1) return number.toFixed(1);
    
    return number.toFixed(2);
}

function statsGetFlattenMarkersArray(markers)
{
    var result = new Array();
    
    $.each(markers, function(marker, groups)
    {
        $.each(groups, function(group, data)
        {
            result = result.concat(data);
        });
    });
    
    return result;
}

function statsDrawSummary(markers, mode)
{
    var
        timeText, markerText, theText,
        baseData = statsGetTimes(markers),
        element = '#stats' + mode.charAt(0).toUpperCase() + mode.slice(1) + 'Summary';
    
    timeText = secondsToTime(baseData.total);
    markerText = addPolishEnding(baseData.count, 'pomiar', 'pomiary', 'pomiar\u00F3w', 1);
        
    theText = markerText + '. Czas: <strong>' + timeText + '</strong>.';
    
    if(mode === 'all') theText = addPolishEnding(countGroups(markers), 'trasa', 'trasy', 'tras', 1) + '. ' + theText;
    
    $(element).html(theText);
}

function statsGetDistance(markers)
{
    var
        a,
        distance = 0,
        flattenMarkers,
        result = 
        {
            metres: 0,
            kilometres: 0,
            first:
            {
                latitude: 0,
                longitude: 0
            },
            last:
            {
                latitude: 0,
                longitude: 0
            }
        };
        
    if(typeof(markers[0]) === 'undefined')
    {
        $.each(markers, function(marker, groups)
        {
            $.each(groups, function(group, data)
            {
                for(a = 0; a < data.length - 1; ++a)
                {
                    distance = distance + calculateDistanceBetweenPoints
                    (
                        parseFloat(data[a].latitude),
                        parseFloat(data[a].longitude),
                        parseFloat(data[a + 1].latitude),
                        parseFloat(data[a + 1].longitude)
                    );
                }
            });
        });
        
        flattenMarkers = statsGetFlattenMarkersArray(markers);
        
        result.first.latitude = parseFloat(flattenMarkers[0].latitude);
        result.first.longitude = parseFloat(flattenMarkers[0].longitude);
        result.last.latitude = parseFloat(flattenMarkers.slice(-1)[0].latitude);
        result.last.longitude = parseFloat(flattenMarkers.slice(-1)[0].longitude);
    }
    else
    {
        for(a = 0; a < markers.length - 1; ++a)
        {
            distance = distance + calculateDistanceBetweenPoints
            (
                parseFloat(markers[a].latitude),
                parseFloat(markers[a].longitude),
                parseFloat(markers[a + 1].latitude),
                parseFloat(markers[a + 1].longitude)
            );
        }
        
        result.first.latitude = parseFloat(markers[0].latitude);
        result.first.longitude = parseFloat(markers[0].longitude);
        result.last.latitude = parseFloat(markers.slice(-1)[0].latitude);
        result.last.longitude = parseFloat(markers.slice(-1)[0].longitude);
    }
    
    result.metres = (distance * 1000).toFixed(0);
    result.kilometres = fixedToPrecision(distance);
    
    return result;
}

function statsDrawDistance(markers, mode)
{
    var
        distanceText = '',
        result = statsGetDistance(markers),
        element = getElementFullName(mode, 'distance');
        
    
    if(result.metres >= 1000) result.metres = numberWithThousandSeparator(result.metres);
    if(result.kilometres >= 1000) result.kilometres = numberWithThousandSeparator(result.kilometres);
    
    distanceText = '<strong>' + result.kilometres + '</strong> km (' + result.metres + ' m)';
    
    if(!isLive(markers))
    {
        $(element).append('<li>pocz\u0105tkowa: ' + formatLocation(result.first) + '</li>');
        $(element).append('<li>ko\u0144cowa: ' + formatLocation(result.last) + '</li>');
    }
    else $(element).append('<li class="actual-data">aktualna: ' + formatLocation(result.last) + '</li>');
    
    $(element).append('<li>przebyty dystans: ' + distanceText + '.</li>');
}

function statsGetAcceleration(markers)
{
    var
        currentAccelerationX = 0,
        currentAccelerationY = 0,
        currentAccelerationZ = 0,
        accelerationSumTotalX = 0,
        accelerationSumTotalY = 0,
        accelerationSumTotalZ = 0,
        result = 
        {
            lastX: 0,
            lastY: 0,
            lastZ: 0,
            firstX: 0,
            firstY: 0,
            firstZ: 0,
            totalX: 0,
            totalY: 0,
            totalZ: 0,
            zerosX: 0,
            zerosY: 0,
            zerosZ: 0,
            maximumX: 0,
            maximumY: 0,
            maximumZ: 0,
            minimumX: Number.POSITIVE_INFINITY,
            minimumY: Number.POSITIVE_INFINITY,
            minimumZ: Number.POSITIVE_INFINITY,
            averageTotalX: 0,
            averageTotalY: 0,
            averageTotalZ: 0,
            averageActualX: 0,
            averageActualY: 0,
            averageActualZ: 0
        };
    
    if(typeof(markers[0]) === 'undefined') markers = statsGetFlattenMarkersArray(markers);
    
    for(a = 0; a < markers.length; ++a)
    {
        currentAccelerationX = parseFloat(markers[a].xacceleration);
        currentAccelerationY = parseFloat(markers[a].yacceleration);
        currentAccelerationZ = parseFloat(markers[a].zacceleration);
        
        accelerationSumTotalX = accelerationSumTotalX + currentAccelerationX;
        accelerationSumTotalY = accelerationSumTotalY + currentAccelerationY;
        accelerationSumTotalZ = accelerationSumTotalZ + currentAccelerationZ;
        
        if(currentAccelerationX > 0)
        {
            if(currentAccelerationX < result.minimumX) result.minimumX = currentAccelerationX;
            if(currentAccelerationX > result.maximumX) result.maximumX = currentAccelerationX;
        }
        else ++result.zerosX;
        
        if(currentAccelerationY > 0)
        {
            if(currentAccelerationY < result.minimumY) result.minimumY = currentAccelerationY;
            if(currentAccelerationY > result.maximumY) result.maximumY = currentAccelerationY;
        }
        else ++result.zerosY;
        
        if(currentAccelerationZ > 0)
        {
            if(currentAccelerationZ < result.minimumZ) result.minimumZ = currentAccelerationZ;
            if(currentAccelerationZ > result.maximumZ) result.maximumZ = currentAccelerationZ;
        }
        else ++result.zerosZ;
    }
    
    result.totalX = markers.length;
    result.totalY = markers.length;
    result.totalZ = markers.length;
    
    result.averageTotalX = accelerationSumTotalX / markers.length;
    result.averageTotalY = accelerationSumTotalY / markers.length;
    result.averageTotalZ = accelerationSumTotalZ / markers.length;
    
    result.averageActualX = accelerationSumTotalX / (markers.length - result.zerosX);
    result.averageActualY = accelerationSumTotalY / (markers.length - result.zerosY);
    result.averageActualZ = accelerationSumTotalZ / (markers.length - result.zerosZ);
    
    result.firstX = parseFloat(markers[0].xacceleration);
    result.firstY = parseFloat(markers[0].yacceleration);
    result.firstZ = parseFloat(markers[0].zacceleration);
    
    result.lastX = parseFloat(markers[markers.length - 1].xacceleration);
    result.lastY = parseFloat(markers[markers.length - 1].yacceleration);
    result.lastZ = parseFloat(markers[markers.length - 1].zacceleration);
    
    for(i = markers.length - 1; i > 0; i--)
    {
        result.lastX = parseFloat(markers[i].xacceleration);
        
        if(result.lastX > 0) break;
    }
    
    for(i = markers.length - 1; i > 0; i--)
    {
        result.lastY = parseFloat(markers[i].yacceleration);
        
        if(result.lastY > 0) break;
    }
    
    for(i = markers.length - 1; i > 0; i--)
    {
        result.lastZ = parseFloat(markers[i].zacceleration);
        
        if(result.lastZ > 0) break;
    }
    
    for(i = 0; i < markers.length - 1; i++)
    {
        result.firstX = parseFloat(markers[i].xacceleration);
        
        if(result.firstX > 0) break;
    }
    
    for(i = 0; i < markers.length - 1; i++)
    {
        result.firstY = parseFloat(markers[i].yacceleration);
        
        if(result.firstY > 0) break;
    }
    
    for(i = 0; i < markers.length - 1; i++)
    {
        result.firstZ = parseFloat(markers[i].zacceleration);
        
        if(result.firstZ > 0) break;
    }
    
    return result;
}

function statsDrawAcceleration(markers, mode)
{
    var
        isItALive = isLive(markers),
        result = statsGetAcceleration(markers),
        element = getElementFullName(mode, 'acceleration'),
        percentage = (((result.zerosX + result.zerosY + result.zerosZ) / (result.totalX + result.totalY + result.totalZ)) * 100).toFixed(0);
    
    if(isItALive) $(element).append('<li class="actual-data">aktualne: ' + formatAcceleration(result.lastX, result.lastY, result.lastZ) + '</li>');
    
    $(element).append('<li>minimalne: ' + formatAcceleration(result.minimumX, result.minimumY, result.minimumZ) + '</li>');
    $(element).append('<li>maksymalne: ' + formatAcceleration(result.maximumX, result.maximumY, result.maximumZ) + '</li>');
    $(element).append('<li>\u015Brednie faktyczne: ' + formatAcceleration(result.averageActualX, result.averageActualY, result.averageActualZ) + '</li>');
    $(element).append('<li>\u015Brednie ca\u0142kowite: ' + formatAcceleration(result.averageTotalX, result.averageTotalY,result.averageTotalZ) + '</li>');
    
    if(!isItALive)
    {
        $(element).append('<li>pocz\u0105tkowe: ' + formatAcceleration(result.firstX, result.firstY, result.firstZ) + '</li>');
        $(element).append('<li>ko\u0144cowe: ' + formatAcceleration(result.lastX, result.lastY, result.lastZ) + '</li>');
    }
    
    $(element).append('<li>zakres zawiera ' + addPolishEnding(result.zerosX + result.zerosY + result.zerosZ, 'punkt \u201Ezerowy\u201D', 'punkty \u201Ezerowe\u201D', 'punkt\u00F3w \u201Ezerowych\u201D', 1) + ' (' + percentage + '%).</li>');
}

function statsGetAltitudes(markers)
{
    var
        currentAltitude = 0,
        altitudeSumTotal = 0,
        result = 
        {
            last: 0,
            first: 0,
            total: 0,
            zeros: 0,
            maximum: 0,
            minimum: Number.POSITIVE_INFINITY,
            averageTotal: 0,
            averageActual: 0
        };
    
    if(typeof(markers[0]) === 'undefined') markers = statsGetFlattenMarkersArray(markers);
    
    for(a = 0; a < markers.length; ++a)
    {
        currentAltitude = parseFloat(markers[a].altitude);
        
        altitudeSumTotal = altitudeSumTotal + currentAltitude;
        
        if(currentAltitude > 0)
        {
            if(currentAltitude < result.minimum) result.minimum = currentAltitude;
            if(currentAltitude > result.maximum) result.maximum = currentAltitude;
        }
        else ++result.zeros;
    }
    
    result.total = markers.length;
    result.averageTotal = altitudeSumTotal / markers.length;
    result.averageActual = altitudeSumTotal / (markers.length - result.zeros);
    
    result.first = parseFloat(markers[0].altitude);
    result.last = parseFloat(markers[markers.length - 1].altitude);
    
    for(i = markers.length - 1; i > 0; i--)
    {
        result.last = parseFloat(markers[i].altitude);
        
        if(result.last > 0) break;
    }
    
    for(i = 0; i < markers.length - 1; i++)
    {
        result.first = parseFloat(markers[i].altitude);
        
        if(result.first > 0) break;
    }
    
    return result;
}

function statsDrawAltitudes(markers, mode)
{
    var
        isItALive = isLive(markers),
        result = statsGetAltitudes(markers),
        element = getElementFullName(mode, 'alt'),
        percentage = ((result.zeros / result.total) * 100).toFixed(0);
    
    if(isItALive) $(element).append('<li class="actual-data">aktualna: ' + formatGeneral(result.last, 'm n.p.m') + '</li>');
    
    $(element).append('<li>minimalna: ' + formatGeneral(result.minimum, 'm n.p.m') + '</li>');
    $(element).append('<li>maksymalna: ' + formatGeneral(result.maximum, 'm n.p.m') + '</li>');
    $(element).append('<li>\u015Brednia faktyczna: ' + formatGeneral(result.averageActual, 'm n.p.m') + '</li>');
    $(element).append('<li>\u015Brednia ca\u0142kowita: ' + formatGeneral(result.averageTotal, 'm n.p.m') + '</li>');
    
    if(!isItALive)
    {
        $(element).append('<li>pocz\u0105tkowa: ' + formatGeneral(result.first, 'm n.p.m') + '</li>');
        $(element).append('<li>ko\u0144cowa: ' + formatGeneral(result.last, 'm n.p.m') + '</li>');
    }
    
    $(element).append('<li>zakres zawiera ' + addPolishEnding(result.zeros, 'punkt \u201Ezerowy\u201D', 'punkty \u201Ezerowe\u201D', 'punkt\u00F3w \u201Ezerowych\u201D', 1) + ' (' + percentage + '%).</li>');
}

function statsGetAccuracy(markers)
{
    var
        currentAccuracy = 0,
        accuracySumTotal = 0,
        result = 
        {
            last: 0,
            first: 0,
            total: 0,
            zeros: 0,
            maximum: 0,
            minimum: Number.POSITIVE_INFINITY,
            averageTotal: 0,
            averageActual: 0
        };
    
    if(typeof(markers[0]) === 'undefined') markers = statsGetFlattenMarkersArray(markers);
    
    for(a = 0; a < markers.length; ++a)
    {
        currentAccuracy = parseFloat(markers[a].accuracy);
        
        accuracySumTotal = accuracySumTotal + currentAccuracy;
        
        if(currentAccuracy > 0)
        {
            if(currentAccuracy < result.minimum) result.minimum = currentAccuracy;
            if(currentAccuracy > result.maximum) result.maximum = currentAccuracy;
        }
        else ++result.zeros;
    }
    
    result.total = markers.length;
    result.averageTotal = accuracySumTotal / markers.length;
    result.averageActual = accuracySumTotal / (markers.length - result.zeros);
    
    result.first = parseFloat(markers[0].accuracy);
    result.last = parseFloat(markers[markers.length - 1].accuracy);
    
    return result;
}

function statsDrawAccuracy(markers, mode)
{
    var
        isItALive = isLive(markers),
        result = statsGetAccuracy(markers),
        element = getElementFullName(mode, 'accuracy'),
        percentage = ((result.zeros / result.total) * 100).toFixed(0);
    
    if(isItALive) $(element).append('<li class="actual-data">aktualna: ' + formatGeneral(result.last) + '</li>');
    
    $(element).append('<li>minimalna: ' + formatGeneral(result.minimum) + '</li>');
    $(element).append('<li>maksymalna: ' + formatGeneral(result.maximum) + '</li>');
    $(element).append('<li>\u015Brednia faktyczna: ' + formatGeneral(result.averageActual) + '</li>');
    $(element).append('<li>\u015Brednia ca\u0142kowita: ' + formatGeneral(result.averageTotal) + '</li>');
    
    if(!isItALive)
    {
        $(element).append('<li>pocz\u0105tkowa: ' + formatGeneral(result.first) + '</li>');
        $(element).append('<li>ko\u0144cowa: ' + formatGeneral(result.last) + '</li>');
    }
    
    $(element).append('<li>zakres zawiera ' + addPolishEnding(result.zeros, 'punkt \u201Ezerowy\u201D', 'punkty \u201Ezerowe\u201D', 'punkt\u00F3w \u201Ezerowych\u201D', 1) + ' (' + percentage + '%).</li>');
}

function statsGetSpeeds(markers)
{
    var
        currentSpeed = 0,
        speedSumTotal = 0,
        result = 
        {
            last: 0,
            first: 0,
            total: 0,
            zeros: 0,
            maximum: 0,
            minimum: Number.POSITIVE_INFINITY,
            averageTotal: 0,
            averageActual: 0
        };
    
    if(typeof(markers[0]) === 'undefined') markers = statsGetFlattenMarkersArray(markers);
    
    for(a = 0; a < markers.length; ++a)
    {
        currentSpeed = parseFloat(markers[a].speed);
        
        speedSumTotal = speedSumTotal + currentSpeed;
        
        if(currentSpeed > 0)
        {
            if(currentSpeed < result.minimum) result.minimum = currentSpeed;
            if(currentSpeed > result.maximum) result.maximum = currentSpeed;
        }
        else ++result.zeros;
    }
    
    result.total = markers.length;
    result.averageTotal = speedSumTotal / markers.length;
    result.averageActual = speedSumTotal / (markers.length - result.zeros);
    
    result.first = parseFloat(markers[0].speed);
    result.last = parseFloat(markers[markers.length - 1].speed);
    
    for(i = markers.length - 1; i > 0; i--)
    {
        result.last = parseFloat(markers[i].speed);
        
        if(result.last > 0) break;
    }
    
    for(i = 0; i < markers.length - 1; i++)
    {
        result.first = parseFloat(markers[i].speed);
        
        if(result.first > 0) break;
    }
    
    return result;
}

function statsDrawSpeeds(markers, mode)
{
    var
        isItALive = isLive(markers),
        result = statsGetSpeeds(markers),
        element = getElementFullName(mode, 'speed'),
        percentage = ((result.zeros / result.total) * 100).toFixed(0);
    
    if(isItALive) $(element).append('<li class="actual-data">aktualna: ' + formatSpeed(result.last) + '</li>');
    
    $(element).append('<li>minimalna: ' + formatSpeed(result.minimum) + '</li>');
    $(element).append('<li>maksymalna: ' + formatSpeed(result.maximum) + '</li>');
    $(element).append('<li>\u015Brednia faktyczna: ' + formatSpeed(result.averageActual) + '</li>');
    $(element).append('<li>\u015Brednia ca\u0142kowita: ' + formatSpeed(result.averageTotal) + '</li>');
    
    if(!isItALive)
    {
        $(element).append('<li>pocz\u0105tkowa: ' + formatSpeed(result.first) + '</li>');
        $(element).append('<li>ko\u0144cowa: ' + formatSpeed(result.last) + '</li>');
    }
    
    $(element).append('<li>zakres zawiera ' + addPolishEnding(result.zeros, 'punkt \u201Ezerowy\u201D', 'punkty \u201Ezerowe\u201D', 'punkt\u00F3w \u201Ezerowych\u201D', 1) + ' (' + percentage + '%).</li>');
}

function statsGetTimes(markers)
{
    var
        result = 
        {
            count: 0,
            total: 0,
            first: 0,
            last: 0
        },
        flattenMarkers;
        
    if(typeof(markers[0]) === 'undefined')
    {
        $.each(markers, function(marker, groups)
        {
            $.each(groups, function(group, data)
            {
                result.count = result.count + data.length;
                result.total = result.total + (data.slice(-1)[0].timestamp - data[0].timestamp);
            });
        });
        
        flattenMarkers = statsGetFlattenMarkersArray(markers);
        result.first = parseInt(flattenMarkers[0].timestamp);
        result.last = parseInt(flattenMarkers.slice(-1)[0].timestamp);
    }
    else
    {
        result.count = markers.length;
        result.first = parseInt(markers[0].timestamp);
        result.last = parseInt(markers.slice(-1)[0].timestamp);
        result.total = parseInt(markers.slice(-1)[0].timestamp) - parseInt(markers[0].timestamp);
    }
    
    return result;
}

function statsDrawTimes(markers, mode)
{
    var
        isItALive = isLive(markers),
        baseData = statsGetTimes(markers),
        element = getElementFullName(mode, 'time'),
        currentTimestamp = Math.round(new Date().getTime() / 1000),
        timeSinceLastMeasure = currentTimestamp - baseData.last;
    
    timeSinceLastMeasure = (timeSinceLastMeasure >= 0) ? timeSinceLastMeasure : 0;
    
    if(isItALive) $(element).append('<li class="actual-data">trwa rejestracja, ostatnie dane: ' + parseTime(timeSinceLastMeasure) + ' temu,</li>');
    
    $(element).append('<li>pierwszy pomiar: <strong>' + timestampToTime(baseData.first) + '</strong>,</li>');
    $(element).append('<li>ostatni pomiar: <strong>' + timestampToTime(baseData.last) + '</strong>,</li>');
    $(element).append('<li>ca\u0142kowity czas: ' + parseTime(baseData.total) + ((isItALive) ? '.' : ',') + '</li>');
    
    if(!isItALive) $(element).append('<li>rejestracja zako\u0144czona ' + parseTime(timeSinceLastMeasure) + ' temu.</li>');
}

function countGroups(markers)
{
    var groupCount = 0;
    
    $.each(markers, function(marker, groups)
    {
        $.each(groups, function(group, data)
        {
            ++groupCount;
        });
    });
    
    return groupCount;
}

function getTimeSinceLastMeasure(markers)
{
    var
        lastTimestamp = 0,
        currentTimestamp = Math.round(new Date().getTime() / 1000);
    
    if(typeof(markers[0]) === 'undefined') markers = statsGetFlattenMarkersArray(markers);
    
    lastTimestamp = markers[markers.length - 1].timestamp;
    
    return currentTimestamp - lastTimestamp;
}

function isLive(markers)
{
    var timeSinceLastMeasure = getTimeSinceLastMeasure(markers);
    
    return timeSinceLastMeasure <= 600;
}

function drawSummaryText(markers, mode)
{
    var
        groupCount = 1,
        summaryText = '',
        distanceText = '',
        tracksPointsText = '',
        speeds = statsGetSpeeds(markers),
        baseData = statsGetTimes(markers),
        timeText = secondsToTime(baseData.total),
        markerText = addPolishEnding(baseData.count, 'pomiar', 'pomiary', 'pomiar\u00F3w', 1),
        distanceResult = statsGetDistance(markers);
        
    if(mode === 'all') groupCount = countGroups(markers);
        
    tracksPointsText = addPolishEnding(groupCount, 'trasa', 'trasy', 'tras', 1) + ' | ' + markerText;
    
    if(distanceResult.kilometres >= 1000) distanceResult.kilometres = numberWithThousandSeparator(distanceResult.kilometres);
    
    if(distanceResult.metres < 10000)
    {
        if(distanceResult.metres >= 1000) distanceResult.metres = numberWithThousandSeparator(distanceResult.metres);
        
        distanceText = '<strong>' + distanceResult.metres + ' m</strong>';
    }
    else distanceText = '<strong>' + distanceResult.kilometres + ' km</strong>';
    
    if(isLive(markers))
    {
        summaryText = timeText + ' | ' + distanceText + ' | ' + formatSpeed(speeds.last, true) + ' | ' + tracksPointsText;
    }
    else summaryText = tracksPointsText + ' | ' + timeText + ' | ' + distanceText;

    $('#summaryText').html(summaryText);
}

function formatLocation(location)
{    
    var
        fakeId = randomString(),
        forGM = function(location)
        {
            var
                url = 'http://maps.google.pl/maps?',
                llString = location.latitude + ',' + location.longitude,
                data = 
                {
                    z: '13',
                    hl: 'pl',
                    q: llString,
                    ll: llString
                };
                
            return url + $.param(data);
        },
        inDD = function(location)
        {
            /*
             * DD = degree-decimal location system.
             * 
             * Integer part represents degree, where:
             * - positive number stands for north (latitude) or east (longitude),
             * - negative number stands for south (latitude) or west (longitude).
             * 
             * Fractional part is calculated out of minute and seconds in DMS system.
             * 
             * DD system is commonly used in GIS, GPS and computer-powered navigation
             * or location systems.
             */
            return location.latitude + ', ' + location.longitude;
        },
        inDMS = function(location)
        {
            /*
             * DMS = degree-minute-second location system.
             * 
             * First number represents degrees, second minutes and last -- seconds.
             * 
             * Direction (north/south or east/west) is represented by proper letter.
             * 
             * DMS system is commonly used in maps, charts and man-powered, paper
             * or traditional navigation or location systems.
             * 
             * 
             * Code used here is extracted (and fixed!) from live demo at:
             * 
             * http://transition.fcc.gov/mb/audio/bickel/DDDMMSS-decimal.html
             * 
             * Math.floor(latitudeAbsolute / 1000000) is used to eliminate 
             * small error caused by rounding in the computer:
             * e.g. 0.2 is not the same as 0.20000000000284.
             */
            var
                latitudeSign = 'N',
                longitudeSign = 'E',
                latitudeAbsolute = Math.abs(Math.round(location.latitude * 1000000)),
                longitudeAbsolute = Math.abs(Math.round(location.longitude * 1000000)),
                latitudeString = '',
                longitudeString = '';
                
            if(location.latitude < 0) latitudeSign = 'S';
            if(location.longitude < 0) longitudeSign = 'W';
                
            latitudeString = (Math.floor(latitudeAbsolute / 1000000)).toFixed(0) + '\u00B0' + (Math.floor(((latitudeAbsolute / 1000000) - Math.floor(latitudeAbsolute / 1000000)) * 60)).toFixed(0)  + '\'' + (Math.floor(((((latitudeAbsolute / 1000000) - Math.floor(latitudeAbsolute / 1000000)) * 60) - Math.floor(((latitudeAbsolute / 1000000) - Math.floor(latitudeAbsolute / 1000000)) * 60)) * 100000) * 60 / 100000).toFixed(0) + '\" ' + latitudeSign;
            longitudeString = (Math.floor(longitudeAbsolute / 1000000)).toFixed(0) + '\u00B0' + (Math.floor(((longitudeAbsolute / 1000000) - Math.floor(longitudeAbsolute / 1000000)) * 60)).toFixed(0)  + '\'' +  (Math.floor(((((longitudeAbsolute / 1000000) - Math.floor(longitudeAbsolute / 1000000)) * 60) - Math.floor(((longitudeAbsolute / 1000000) - Math.floor(longitudeAbsolute / 1000000)) * 60)) * 100000) * 60 / 100000).toFixed(0) + '\" ' + longitudeSign;
            
            return latitudeString + ', ' + longitudeString;
        },
//        reverseGeocodeGoogle = function(location, destination)
//        {
//            /*
//             * Google Maps Geocoding Service -- Reverse Geocoding (Address Lookup)
//             * 
//             * https://developers.google.com/maps/documentation/javascript/geocoding#ReverseGeocoding
//             * https://developers.google.com/maps/documentation/geocoding/index#Results
//             * 
//             * Currently not used, due to very low limits (2500 uses per day for free).
//             */
//            var
//                geocoder = new google.maps.Geocoder(),
//                latlng = new google.maps.LatLng(location.latitude, location.longitude);
//            
//            geocoder.geocode({'latLng': latlng}, function(results, status)
//            {
//                if(status == google.maps.GeocoderStatus.OK)
//                {
//                    if(results[1])
//                    {
//                        $(destination).text(results[1].formatted_address);
//                    }
//                }
//            });
//        },
        reverseGeocodeGeoNames = function(location, destination, highAccuracy)
        {
            /*
             * Google Maps Geocoding Service -- Reverse Geocoding (Address Lookup)
             * 
             * http://www.geonames.org/export/web-services.html#findNearbyPlaceName
             * http://www.geonames.org/export/JSON-webservices.html
             * http://www.geonames.org/about.html
             * 
             * http://api.geonames.org/findNearbyPlaceNameJSON?lat=54.12802&lng=15.796731&lang=pl&username=trejder
             * 
             * Seems to be free, so currently used, but limits are unknown.
             */
            var
                highAccuracy = highAccuracy || false,
                serverUrl = 'http://api.geonames.org/findNearbyPlaceNameJSON',
                data = 
                {
                    lang: 'pl',
                    username: 'trejder',
                    cities: (highAccuracy) ? '' : 'cities15000',
                    lat: location.latitude,
                    lng: location.longitude
                },
                key = (location.latitude * 1000000) + '' + (location.longitude * 1000000);
                
            if(typeof(window.geoNamesArray[key]) === 'undefined')
            {
                $.ajax
                ({
                    type: "GET",
                    dataType: "json",
                    url: serverUrl,
                    data: $.param(data),
                    success: function(response)
                    {
//                        console.log(response);

                        var
                            re = /wojew\u00F3dztwo /gi,
                            result = response.geonames[0],
                            distance = parseFloat(result.distance),
                            city = result.name,
                            country = result.countryCode,
                            voivodeship = result.adminName1.toLocaleLowerCase(),
                            text = '';

                        voivodeship = voivodeship.replace(re, '');

                        text = '<strong>' + city + '</strong>' + ((voivodeship !== '') ? ', <em>' + voivodeship + '</em>' : '') + ((country !== '') ? ', ' + country : '') + ((distance > 0) ? ' (w odleg\u0142o\u015Bci ' + fixedToPrecision(distance) + ' km)' : '') + '. ';

                        if($('#' + destination).html() != text) $('#' + destination).html($('#' + destination).html() + text);

                        window.geoNamesArray[key] = text;
                    },
                    error: function(xhr, errorType, error)
                    {
                        console.log('GeoNames.org findNearbyPlaceNameJSON error');
                        console.log(errorType);
                        console.log(error);
                    }
                });
            }
            else if($('#' + destination).html() != window.geoNamesArray[key]) $('#' + destination).html($('#' + destination).html() + window.geoNamesArray[key]);
        };
        
    reverseGeocodeGeoNames(location, fakeId, true);
//    reverseGeocodeGeoNames(location, fakeId, false);
    
    return '<a href ="' + forGM(location) + '" target="_new" style="font-weight: bold">' + inDD(location) + '</a> (' + inDMS(location) + '),<div style="font-size: 70%" id="' + fakeId + '"></div>';
}

function formatAcceleration(accelerationX, accelerationY, accelerationZ)
{
    var
        accX = accelerationX.toFixed(2),
        accY = accelerationY.toFixed(2),
        accZ = accelerationZ.toFixed(2);

    accX = (isNaN(accX)) ? '--' : accX;
    accY = (isNaN(accY)) ? '--' : accY;
    accZ = (isNaN(accZ)) ? '--' : accZ;
    
    accX = (accX == Number.POSITIVE_INFINITY) ? '~' : accX;
    accY = (accY == Number.POSITIVE_INFINITY) ? '~' : accY;
    accZ = (accZ == Number.POSITIVE_INFINITY) ? '~' : accZ;
        
    return  'X = <strong>' + accX + '</strong> m/s2' + 
            ', Y = <strong>' + accY + '</strong> m/s2' + 
            ', Z = <strong>' + accZ + '</strong> m/s2';
}

function formatGeneral(altitude, unit)
{
    var
        unit = unit || '',
        alt = altitude.toFixed(2);
    
    alt = (isNaN(alt)) ? '--' : alt;
    alt = (alt == Number.POSITIVE_INFINITY) ? '~' : alt;
    
    return '<strong>' + alt + '</strong> ' + unit;
}

function formatSpeed(speed, summaryMode)
{    
    var
        summaryMode = summaryMode || false,
        speedInMS = function(speed)
        {
            var spd = speed.toFixed(2);
            
            spd = (isNaN(spd)) ? '--' : spd;
            spd = (spd == Number.POSITIVE_INFINITY) ? '~' : spd;
            
            return spd + ' m/s';
        },
        speedInKMH = function(speed)
        {
            var spd = fixedToPrecision((speed * 3600) / 1000);
            
            spd = (isNaN(spd)) ? '--' : spd;
            spd = (spd == Number.POSITIVE_INFINITY) ? '~' : spd;
            
            return '<strong>' + spd + '</strong> km/h';
        };
        
    if(summaryMode)
    {
        return speedInKMH(speed);
    }
    else return speedInKMH(speed) + ' (' + speedInMS(speed) + '),';
}

function getElementFullName(element, ending)
{
    return '#stats' + element.charAt(0).toUpperCase() + element.slice(1) + ending.charAt(0).toUpperCase() + ending.slice(1);
}

function randomString(length)
{
    /**
     * According to http://stackoverflow.com/a/6860962/1469208, "in HTML, IDs need 
     * to start with an alphabetical character".
     * 
     * I can't confirm this (number-only ids works just fine), but maybe this is 
     * states so in the standards, so I'm going to follow this guide. That's why 
     * I split numbers and letters into  separate variables.
     */
    var
        length = length || 7,
        numbers = '0123456789',
        letters = 'abcdefghijklmnopqrstuvwxyz',
        all = letters + numbers,
        text = letters.charAt(Math.floor(Math.random() * letters.length));

    for(var i = 0; i < length; i++) text += all.charAt(Math.floor(Math.random() * all.length));

    return text;
}

/*
 * http://stackoverflow.com/a/27943/1469208
 * http://stackoverflow.com/a/365853/1469208
 * http://www.movable-type.co.uk/scripts/latlong.html
 * http://en.wikipedia.org/wiki/Haversine_formula
 */
function calculateDistanceBetweenPoints(lat1, lon1, lat2, lon2)
{
  var R = 6371; //Radius of the Earth in km.
  var dLat = degreesToRadians(lat2 - lat1);
  var dLon = degreesToRadians(lon2 - lon1); 
  var a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c; // Distance in km
  
  return d;
}

function degreesToRadians(deg)
{
  return deg * 0.0174532925199433;
  
//  return deg * (Math.PI / 180); //Performance issue...
}

function prepareStats(track, zoom)
{
    if(track !== 'all' && track !== 'und')
    {
        $('#statsTrack').show();
    }
    else $('#statsTrack').hide();
    
    if(zoom !== 'all')
    {
        $('#statsZoom').show();
    }
    else $('#statsZoom').hide();
}

function drawRoutesAndGenerateStats(markers, map, track, zoom)
{
    var
        groupCount = 0,
        markerCount = 0,
        totalGroupCount = 0,
        totalMarkerCount = 0,
        summaryMode = 'all',
        boundsArray = new Array(),
        zoomDataArray = new Array(),
        bounds = new google.maps.LatLngBounds(),
        arrowSymbol = {path: google.maps.SymbolPath.FORWARD_OPEN_ARROW},
        beginSymbol = 
        {
            path: 'M -2,0 0,-2 2,0 0,2 z',
            fillOpacity: 1
        },
        basePathOptions = 
        ({
            strokeColor: "#0000FF",
            strokeOpacity: 1,
            strokeWeight: 2.5,
            icons:
            [{
                icon: arrowSymbol,
                offset: '100%'//,
//                repeat: '7%'
            },
            {
                icon: beginSymbol,
                offset: '0%'
            }]
        });
    
    if(!($.isJSON(markers))) return;
    
    $.each(markers, function(marker, groups)
    {
        $.each(groups, function(group, data)
        {
            var
                thePathCoords = new Array(),
                thePath = new google.maps.Polyline();
                
            ++totalGroupCount;
            
            basePathOptions.strokeColor = colorArray[markerCount][groupCount];
            thePath.setOptions(basePathOptions);
            
            $.each(data, function()
            {
                var
                    d = this,
                    p = new google.maps.LatLng(d['latitude'], d['longitude']);
                
                if(d['accuracy'] <= 30)
                {
                    thePathCoords.push(p);
                    bounds.extend(p);
                
                    ++totalMarkerCount;
                }
            });
            
            boundsArray[totalGroupCount] = data;

            thePath.setPath(thePathCoords);
            thePath.setMap(map);
            
            groupCount = (groupCount < colorArray[markerCount].length - 1) ? ++groupCount : 0;
        });
        
        groupCount = 0;
        markerCount = (markerCount < colorArray.length - 1) ? ++markerCount : 0;
    });
    
    statsDrawTimes(markers, 'all');
    statsDrawSpeeds(markers, 'all');
    statsDrawSummary(markers, 'all');
    statsDrawDistance(markers, 'all');
    statsDrawAccuracy(markers, 'all');
    statsDrawAltitudes(markers, 'all');
    statsDrawAcceleration(markers, 'all');
    
    if(track !== 'all')
    {
        totalGroupCount = 1;
        totalMarkerCount = 0;
        summaryMode = 'track';
        bounds = new google.maps.LatLngBounds();
        zoomDataArray = (track !== 'und') ? boundsArray[track] : boundsArray[1];
        
        statsDrawTimes(zoomDataArray, 'track');
        statsDrawSpeeds(zoomDataArray, 'track');
        statsDrawSummary(zoomDataArray, 'track');
        statsDrawDistance(zoomDataArray, 'track');
        statsDrawAccuracy(zoomDataArray, 'track');
        statsDrawAltitudes(zoomDataArray, 'track');
        statsDrawAcceleration(zoomDataArray, 'track');
        
        if(zoom !== 'all')
        {
            summaryMode = 'zoom';
            
            zoomDataArray = zoomDataArray.slice(-Math.abs(parseInt(zoom, 10)));
            
            statsDrawTimes(zoomDataArray, 'zoom');
            statsDrawSpeeds(zoomDataArray, 'zoom');
            statsDrawSummary(zoomDataArray, 'zoom');
            statsDrawDistance(zoomDataArray, 'zoom');
            statsDrawAccuracy(zoomDataArray, 'zoom');
            statsDrawAltitudes(zoomDataArray, 'zoom');
            statsDrawAcceleration(zoomDataArray, 'zoom');
        }

        $.each(zoomDataArray, function()
        {
            var p = new google.maps.LatLng(this['latitude'], this['longitude']);

            bounds.extend(p);

            ++totalMarkerCount;
        });
    }
    else zoomDataArray = markers;
    
    drawSummaryText(zoomDataArray, summaryMode);
    
    map.fitBounds(bounds);
}