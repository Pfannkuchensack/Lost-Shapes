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
		return ['buttons' => [[140, 180, 160, 200, 11]], 'walls' => [[50, 50, 60, 100, "#000000"], [60, 50, 160, 60, "#000000"], 
		[120, 150, 130, 220, "#000000"], [130, 150, 170, 160, "#0000FF"], [170, 150, 180, 220, "#000000"], [130, 210, 170, 220, "#000000"],
		[450, 130, 520, 140, "#000000"], [450, 140, 460, 230, "#000000"], [460, 220, 500, 230, "#000000"], [490, 230, 500, 300, "#000000"],
		[290, 50, 300, 170, "#000000"], [300, 160, 330, 170, "#000000"], [330, 160, 340, 330, "#000000"]]];
	}
}
