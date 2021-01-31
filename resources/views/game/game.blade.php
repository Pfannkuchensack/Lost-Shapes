<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png">
		<link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png">
		<link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png">
		<link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png">
		<link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png">
		<link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png">
		<link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png">
		<link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png">
		<link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png">
		<link rel="icon" type="image/png" sizes="192x192"  href="/android-icon-192x192.png">
		<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
		<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
		<link rel="manifest" href="/manifest.json">
		<meta name="msapplication-TileColor" content="#ffffff">
		<meta name="msapplication-TileImage" content="/ms-icon-144x144.png">
		<meta name="theme-color" content="#ffffff">

		<meta name="gameid" content="{{ $gameid }}">
		<meta name="map" content="{{ $map }}">

        <!-- Fonts -->
        <!--<link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet">-->

		<style>
			.inner {
				display: table;
				margin: 0 auto;
			}

			.padding {
				padding: 20;
			}

			.fontHeading {
				font-family: Verdana, Geneva, Tahoma, sans-serif;
			}

			.outer {
				width: 100%;
			}

			body{
				background: url('/background.svg') no-repeat bottom left fixed; 
					-webkit-background-size: cover;
					-moz-background-size: cover;
					-o-background-size: cover;
					background-size: cover;
			}
		</style>

        <!-- Styles -->
		<script src="{{ mix('js/app.js') }}" defer></script>
		<script src="{{ asset('js/socket.io.js') }}" defer></script>
    </head>
	<body>
		<div class="content outer">
			<div class="inner padding">
				<h1 class="fontHeading">Lost Shapes</h1>
			</div>
			<canvas class="inner" id="game" width="640" height="420"></canvas>
		</div>
    </body>
</html>
