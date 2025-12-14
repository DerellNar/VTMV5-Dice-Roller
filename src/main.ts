import { Editor, MarkdownView, Plugin, WorkspaceLeaf } from 'obsidian';
import { VTMV5SettingTab } from './settings';
import { DiceRollView } from './ui/view';
import { VTMV5DiceRollerSettings, DEFAULT_SETTINGS } from './settings';

export default class VTMV5DiceRollerPlugin extends Plugin {
	settings: VTMV5DiceRollerSettings;

	async onload() {
		await this.loadSettings();

		// Register the view
		this.registerView('vtmv5-dice-roller', (leaf: WorkspaceLeaf) => new DiceRollView(leaf));

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dices', 'VTMV5 Dice Roller', (_evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.openDiceRollView();
		});
		
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('VTMV5 Dice Roller');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-vtmv5-dice-roller-view-simple',
			name: 'Open VTMV5 dice roller view (simple)',
			callback: () => {
				this.openDiceRollView();
			}
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'vtmv5-dice-roller-editor-command',
			name: 'VTMV5 Dice Roller editor command',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('VTMV5 Dice Roller Editor Command');
			}
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-vtmv5-dice-roller-view-complex',
			name: 'Open VTMV5 dice roller view (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						this.openDiceRollView();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new VTMV5SettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		this.app.workspace.detachLeavesOfType('vtmv5-dice-roller');
	}

	async openDiceRollView() {
		const leaf = this.app.workspace.getRightLeaf(false);
		if (leaf) { await leaf.setViewState({ type: 'vtmv5-dice-roller' }); }
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
