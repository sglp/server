<div id="header-wrap">
    
	<div id="header-container">
        
		<div id="header">
            
            <div style="float: left; width: 60%">
                
                <div style="display: none">Baza: <?php echo($dbSelect); ?></div>

                <?php echo($imeiSelect); ?>

                <?php echo($dateSelect); ?>
                
                <?php if($trackSelect !== '') echo($trackSelect); ?>

                <?php echo($zoomSelect); ?>
                
                <a id="refresh" class="btn btn-small btn-warning" title="Odśwież"><i class="icon-refresh"></i></a>

                <?php echo($autoButton); ?>
                
            </div>
			
			<div id="top-menu" style="float: right; width: 40%; text-align: right">
				
                <a id="mapButton" class="tab-button btn btn-small btn-success"><i class="icon-map-marker"></i> Mapa</a>

                <a id="statsButton" class="tab-button btn btn-small btn-success"><i class="icon-bar-chart"></i> Dane</a>
                
                <a id="infoButton" class="tab-button btn btn-small btn-success" title="Informacje o śledź.to" style="width: 10px"><i class="icon-info"></i></a>
                
			</div>
            
            <div style="clear: both"></div>
            
		</div>
        
	</div>
    
</div>

<div id="container">

    <div id="map" class="mcd">

        <?php if($pointsCount > 0): ?>

            <div id="message">Trwa ładowanie mapy...</div>

        <?php else: ?>

            <div id="message">Brak danych! Zmień zakres...</div>

        <?php endif; ?>
    </div>

    <div id="info" class="mcd" style="display: none">

        <div id="info-content">

            <?php echo($info); ?>

        </div>

        <div id="info-sidebar">

            <?php echo($history); ?>

        </div> 

    </div>

    <div id="stats" class="mcd" style="display: none">
        
        <div id="stats-content">
        
            <div id="statsZoom">

                <h2>Odcinek</h2>
                
                <p id="statsZoomSummary" style="margin-top: -12px">...</p>
                
                <p>Lokalizacja:</p>
                
                <ul id="statsZoomDistance" style="margin-top: -12px">
                    
                </ul>
                
                <p>Prędkość:</p>
                
                <ul id="statsZoomSpeed" style="margin-top: -12px">
                    
                </ul>
                
                <p>Wysokość:</p>
                
                <ul id="statsZoomAlt" style="margin-top: -12px">
                    
                </ul>
                
                <p>Czas:</p>
                
                <ul id="statsZoomTime" style="margin-top: -12px">
                    
                </ul>
                
                <p>Przyspieszenie:</p>
                
                <ul id="statsZoomAcceleration" style="margin-top: -12px">
                    
                </ul>
                
                <p>Dokładność pomiarów:</p>
                
                <ul id="statsZoomAccuracy" style="margin-top: -12px">
                    
                </ul>
                
            </div>
            
            <div id="statsTrack">

                <h2>Trasa</h2>

                <p id="statsTrackSummary" style="margin-top: -12px">...</p>
                
                <p>Lokalizacja:</p>
                
                <ul id="statsTrackDistance" style="margin-top: -12px">
                    
                </ul>
                
                <p>Prędkość:</p>
                
                <ul id="statsTrackSpeed" style="margin-top: -12px">
                    
                </ul>
                
                <p>Wysokość:</p>
                
                <ul id="statsTrackAlt" style="margin-top: -12px">
                    
                </ul>
                
                <p>Czas:</p>
                
                <ul id="statsTrackTime" style="margin-top: -12px">
                    
                </ul>
                
                <p>Przyspieszenie:</p>
                
                <ul id="statsTrackAcceleration" style="margin-top: -12px">
                    
                </ul>
                
                <p>Dokładność pomiarów:</p>
                
                <ul id="statsTrackAccuracy" style="margin-top: -12px">
                    
                </ul>
                
            </div>
            
            <div id="statsAll">

                <h2>Całość</h2>

                <p id="statsAllSummary" style="margin-top: -12px">...</p>
                
                <p>Lokalizacja:</p>
                
                <ul id="statsAllDistance" style="margin-top: -12px">
                    
                </ul>
                
                <p>Prędkość:</p>
                
                <ul id="statsAllSpeed" style="margin-top: -12px">
                    
                </ul>
                
                <p>Wysokość:</p>
                
                <ul id="statsAllAlt" style="margin-top: -12px">
                    
                </ul>
                
                <p>Czas:</p>
                
                <ul id="statsAllTime" style="margin-top: -12px">
                    
                </ul>
                
                <p>Przyspieszenie:</p>
                
                <ul id="statsAllAcceleration" style="margin-top: -12px">
                    
                </ul>
                
                <p>Dokładność pomiarów:</p>
                
                <ul id="statsAllAccuracy" style="margin-top: -12px">
                    
                </ul>
                
            </div>
            
            <h3>Uwagi</h3>
            
            <ul style="font-size: 60%; margin-top: -12px">
                
                <li>[<strong>prędkość</strong>] <em>punkty &bdquo;zerowe&rdquo;</em> to pomiary, w których prędkość wynosi 0 km/h (obiekt nie porusza się lub wystąpił błąd pomiaru),</li>
                <li>[<strong>prędkość</strong>] <em>średnia całkowita</em> dotyczy wszystkich pomiarów, a <em>średnia faktyczna</em> obejmuje wszystkie pomiary, w których prędkość jest wyższa niż 0 km/h.</li>
                <li>[<strong>czas</strong>] <em>całkowity czas</em> to długość faktycznej rejestracji trasy lub tras i zwykle jest on krótszy niż różnica między czasem ostatniego a czasem pierwszego pomiaru.</li>

            </ul>
            
            <p>&nbsp;</p>
            
        </div>

    </div>

</div>
    
<div id="footer-wrap">
	<div id="footer-container">
		<div id="footer">
            
            <div style="float: left"><span id="summaryText"></span></div>

            <div style="float: right">Wersja <strong><?php echo($version) ?></strong></div>
            
		</div>
	</div>
</div>

<?php if($pointsCount > 0): ?>

    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=AIzaSyDcBfxdjZQPdS35CrB1TYXVx2McDChJpDM&sensor=false"></script>

    <script type="text/javascript">
        
        $(window).resize(function()
        {
            var headerHeight = $("#header-container").height();
            
            $('.mcd').css('top', headerHeight - 10).height($(window).height() - headerHeight).width($(window).width());
            $('#message').css('top', headerHeight + 10);
            
            if($('#track').val() === 'all')
            {
                $('#zoom').val('all');
                $('#zoom').prop('disabled', true);
            }
            else $('#zoom').prop('disabled', false);
        });
        
        var markers = <?php echo($json); ?>;

        function roundNumber(num, dec)
        {
            return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        }

        function initializeMap()
        {
            var
                cc = new google.maps.LatLng(<?php echo($geoData['centerLatitude']) ?>, <?php echo($geoData['centerLongitude']) ?>),
                
                mapOptions = 
                {
                    zoom: 16,
                    center: cc,
                    panControl: false,
                    scaleControl: true,
                    mapTypeControl: false,
                    overviewMapControl: true,
                    keyboardShortcuts: false,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                },

                map = new google.maps.Map(document.getElementById("map"), mapOptions);
                
            return map;
        };
        
        $.blockUI();
        switchTab('map');
        
        var
            map = initializeMap(),
            zoom = $('#zoom').val(),
            track = (typeof($('#track').val()) === 'undefined') ? 'und' : $('#track').val();
        
        $(window).resize();
        
        prepareStats(track, zoom);
        drawRoutesAndGenerateStats(markers, map, track, zoom);
        
        window.setTimeout(function()
        { 
            switchTab('<?php echo $tab; ?>');
            $.unblockUI();
        }, 1000);
    </script>
    
<?php endif; ?>