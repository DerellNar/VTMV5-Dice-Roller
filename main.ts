import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf } from 'obsidian';

// Remember to rename these classes and interfaces!

interface VTMV5DiceRollerSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: VTMV5DiceRollerSettings = {
	mySetting: 'default'
}

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
		this.addSettingTab(new VtmSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async openDiceRollView() {
		const leaf = this.app.workspace.getRightLeaf(false);//.getLeaf(true);
		if (leaf) { await leaf.setViewState({ type: 'vtmv5-dice-roller' }); }
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class DiceRollView extends ItemView {
	getViewType(): string {
		return 'vtmv5-dice-roller';
	}

	getDisplayText(): string {
		return 'VTMV5 Dice Roller';
	}

	getIcon(): string {
		return 'dices';
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.setAttribute('style', 'padding: 10px;');

		// View Title
		container.createEl('h2', {text: 'Vampire the Masquerade V5 Dice Roller', cls: 'roller__title'});

		// Input for number of dice
		const inputContainer = container.createDiv();

		// Input Total Dice Pool
		inputContainer.createEl('label', {text: 'Total Dice Pool: '});
		const dicePoolInput = inputContainer.createEl('input', {type: 'number', value: '5'});
		dicePoolInput.setAttribute('min', '1');
		dicePoolInput.setAttribute('max', '20');

		// Line Break
		inputContainer.createEl('br');

		// Input Hunger Dice
		inputContainer.createEl('label', {text: 'Hunger Dice: '});
		const diceHungerInput = inputContainer.createEl('input', {type: 'number', value: '1'});
		diceHungerInput.setAttribute('min', '1');
		diceHungerInput.setAttribute('max', '5');

		// Roll button
		const rollButton = container.createEl('button', {text: 'Roll Dice'});
		rollButton.addEventListener('click', () => {
			const numHunger = parseInt(diceHungerInput.value);
			const numRegularDice = parseInt(dicePoolInput.value) - numHunger;
			if (isNaN(numRegularDice) || numRegularDice < 1) {
				new Notice('Please enter a valid number of dice.');
				return;
			}

			// Roll Regular Dice
			const regularResults: (string | HTMLElement)[] = [];
			for (let i = 0; i < numRegularDice; i++) {
				var dieValue = Math.floor(Math.random() * 10) + 1
				switch(dieValue) {
					case 10:
						const critImg = document.createElement('img');
						critImg.src = './images/Crit.png'; // Path of Image
						critImg.alt = 'Critical Success';
						critImg.style.width = '20px';
						critImg.style.height = '20px';
						regularResults.push(critImg);
						break;
					case 6:
					case 7:
					case 8:
					case 9:
						const successImg = document.createElement('img');
						successImg.src = './images/Success.png';
						successImg.alt = 'Success';
						successImg.style.width = '20px';
						successImg.style.height = '20px';
						regularResults.push(successImg);
						break;
					default:
						const failImg = document.createElement('img');
						failImg.src = './images/Teeth.png';
						failImg.alt = 'Fail';
						failImg.style.width = '20px';
						failImg.style.height = '20px';
						regularResults.push(failImg);
				}
			}

			// Roll Hunger Dice
			const hungerResults = [];
			for (let i = 0; i < numHunger; i++) {
				var diceValue = Math.floor(Math.random() * 10) + 1;
				switch(diceValue) {
					case 10:
						hungerResults.push('Messy Crit');
						break;
					case 6:
					case 7:
					case 8:
					case 9:
						hungerResults.push('Success');
						break;
					case 1:
						hungerResults.push('Bestial Fail');
						break;
					default:
						hungerResults.push('Fail');
				}
			}

			// Display results
			const resultDiv = container.querySelector('.results') as HTMLElement;
			if (resultDiv) {
				resultDiv.empty();
			} else {
				container.createDiv({cls: 'results'});
			}

			// Setup Div
			const resultsEl = container.querySelector('.results') as HTMLElement;
			resultsEl.createEl('h4', {text: 'Regular Dice:'});
			const regularP = resultsEl.createEl('p');
			regularResults.forEach((item, index) => {
				if (typeof item === 'string') {
					regularP.appendChild(document.createTextNode(item));
				} else {
					regularP.appendChild(item);
				}
				if (index < regularResults.length - 1) {
					regularP.appendChild(document.createTextNode(' '));
				}
			});

			// Space between regular and hunger results
			resultsEl.createEl('br');
			
			// Hunger Dice Results
			resultsEl.createEl('h4', {text: 'Hunger Dice:'});
			resultsEl.createEl('p', { text: hungerResults.join(', ')});
		});
	}

	async onClose() {
		// Cleanup if needed
	}
}

class VtmSettingTab extends PluginSettingTab {
	plugin: VTMV5DiceRollerPlugin;

	constructor(app: App, plugin: VTMV5DiceRollerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
