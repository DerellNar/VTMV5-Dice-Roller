# VTM Dice Roller Plugin

## Description
This is a plugin for Obsidian (https://obsidian.md) that provides dice rolling functionality for Vampire: The Masquerade V5 TTRPG games.

This project uses TypeScript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in TypeScript Definition format, which contains TSDoc comments describing what it does.

This plugin does the following:
- Adds a ribbon icon, which opens a workspace view to use the Dice Roller
- Adds a command "Open VTM Dice Roller" which opens a Workspace view.
- Adds a plugin setting tab to the settings page.
- The Dice roller allows you to:
	- Set your Dice Pool
	- Set the number of Hunger Dice
	- Allow for a Re-roll of regular Dice based on the scheme set in the settings by the user
 		- Manual: Re-roll Dice selected by User (Max 3)
   		- Maximise Crits: Re-roll as many Dice as possible to maximise the chances of a critical
     	- Maximise Failed Dice Re-Roll: Re-roll the maximum failed dice.
