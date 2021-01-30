<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MainController extends Controller
{
	//
	public function index()
	{
		return view('game.index');
	}

	public function game($gameid, $color)
	{
		return view('game.game', compact(['gameid', 'color']));
	}

	public function map($nr)
	{
		if(\file_exists(resource_path('map/' . $nr . '.json')))
		{
			return response()->file(resource_path('map/' . $nr . '.json'));
		}
		return 404;
	}
}
