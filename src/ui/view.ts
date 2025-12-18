import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import VTMV5DiceRollerPlugin from 'src/main';

export

class DiceRollView extends ItemView {
	private plugin: VTMV5DiceRollerPlugin;

	//Container for the Dice Results
	regularResults: (string | HTMLElement)[];
    hungerResults: (string | HTMLElement)[];

    // Containers for counting results
    numSuccess: number;
    numCrit: number;
    numMessyCrit: number;
    numBestialFail: number;
	numDifficulty: number;

    // HTML Container
    container: Element;

    constructor(leaf: WorkspaceLeaf, plugin: VTMV5DiceRollerPlugin) {
        super(leaf);
		this.plugin = plugin;

		this.regularResults = [];
		this.hungerResults = [];

		this.numSuccess = 0;
		this.numCrit = 0;
		this.numMessyCrit = 0;
		this.numBestialFail = 0;
		this.numDifficulty = 0;
    }

	getViewType(): string {
        return 'vtmv5-dice-roller';
    }

    getDisplayText(): string {
        return 'VTMV5 Dice Roller';
    }

    getIcon(): string {
        return 'dices';
    }

    getRegularDieResult(die: number): (string | HTMLElement) {
		switch (die) {
			case 10:
				return 'Critical';
			case 6:
			case 7:
			case 8:
			case 9:
				return 'Success';
			default:
				return 'Failure';
		}
    }

    getHungerDiceResult(die: number): (string | HTMLElement) {
		switch (die) {
			case 10:
				return 'Messy Critical';
			case 6:
			case 7:
			case 8:
			case 9:
				return 'Success';
			case 1:
				return 'Bestial Failure';
			default:
				return 'Failure';
		}
    }

    displayVerboseResults(){
		// Setup Div
		const resultDiv = this.container.querySelector('.results') as HTMLElement;
		if (resultDiv) {
			resultDiv.empty();
		} else {
			this.container.createDiv({ cls: 'results' });
		}

		const resultsEl = this.container.querySelector('.results') as HTMLElement;
		resultsEl.createEl('h4', { text: 'Regular Dice:' });

		/* Display Images Example
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
	    */

		// Regular Dice Results
		resultsEl.createEl('p', { text: this.regularResults.join(' | ') });

		// Space between regular and hunger results
		resultsEl.createEl('br');

		// Hunger Dice Results
		resultsEl.createEl('h4', { text: 'Hunger Dice:' });
		resultsEl.createEl('p', { text: this.hungerResults.join(' | ') });

		/* Display verbose result */
		// Calculate total crits including messy crits
		let resultText = '';
		let critText = '';
		//console.log('numSuccess:', numSuccess, 'numCrit:', numCrit, 'numMessyCrit:', numMessyCrit, 'numBestialFail:', numBestialFail);

		if (this.numSuccess < this.numDifficulty || this.numSuccess < 1) {
			resultText += (this.numBestialFail >= 1) ? "Bestial Failure" : "Failure";
		} else {
			const totalCrits = this.numCrit + this.numMessyCrit;
			let totalSuccesses = this.numSuccess;
			//console.log('totalCrits:', totalCrits);
			if (totalCrits > 1) {
				// Each pair of crits adds 2 extra successes
				totalSuccesses += 2 * (Math.floor(totalCrits / 2));
				critText = (this.numMessyCrit >= 1)? ": Messy Crititcal" : ": Critical Success";
			}
			resultText = `${totalSuccesses} Successes` + critText;
		}

		// Space before summary
		resultsEl.createEl('br');

		// Summary Header
		resultsEl.createEl('h4', { text: 'Result:' });
		resultsEl.createEl('p', { text: resultText });
    }

    async onOpen() {
        this.container = this.containerEl.children[1];
        this.container.empty();
        this.container.setAttribute('style', 'padding: 10px;');

        // Get settings
		const pluginSettings = this.plugin.settings;

        // View Title
        this.container.createEl('h2', { text: 'Vampire the Masquerade V5 Dice Roller', cls: 'roller__title' });
        this.container.createEl('h3', { text: 'Dice Pool:', cls: 'roller__text' });

        // Input for number of dice
        const inputContainer = this.container.createDiv();

        // Input Total Dice Pool
        inputContainer.createEl('label', { text: 'Total Dice: ', cls: 'roller__text' });
        const dicePoolInput = inputContainer.createEl('input', { type: 'number', value: '5' });
        dicePoolInput.setAttribute('min', '1');
        dicePoolInput.setAttribute('max', '20');

        // Line Break
        inputContainer.createEl('br');

        // Input Hunger Dice
        inputContainer.createEl('label', { text: 'Hunger Dice: ', cls: 'roller__hunger' });
        const diceHungerInput = inputContainer.createEl('input', { type: 'number', value: '1' });
        diceHungerInput.setAttribute('min', '1');
        diceHungerInput.setAttribute('max', '5');

        // Line Break
        inputContainer.createEl('br');

        // Input Roll Difficulty
        inputContainer.createEl('label', { text: 'Difficulty: ', cls: 'roller__text' });
        const diceDifficultyInput = inputContainer.createEl('input', { type: 'number', value: '0' });
        diceDifficultyInput.setAttribute('min', '0');
        diceDifficultyInput.setAttribute('max', '20');

        // Roll button
        const rollButton = this.container.createEl('button', { text: 'Roll Dice' });
        rollButton.addEventListener('click', () => {
            const numHunger = parseInt(diceHungerInput.value);
            const numRegularDice = parseInt(dicePoolInput.value) - numHunger;
            //console.log('Regular Dice:', numRegularDice, 'Hunger Dice: ', numHunger);
            if (isNaN(numRegularDice) || numRegularDice < 1) {
                new Notice('Please enter a valid number of dice.');
                return;
            }

            // Reset Result Values
            this.numSuccess = 0;
			this.numCrit = 0;
			this.numMessyCrit = 0;
			this.numBestialFail = 0;
			this.numDifficulty = 0;

            // Set Difficulty
            this.numDifficulty = parseInt(diceDifficultyInput.value);

            // Roll Regular Dice
			this.regularResults = [];
            for (let i = 0; i < numRegularDice; i++) {
                // Random number between 1 and 10
				const regularDieResult = this.getRegularDieResult(Math.floor(Math.random() * 10) + 1);
				this.regularResults.push(regularDieResult);

				/* Example: Push an image instead of text
	            const critImg = document.createElement('img');
	            critImg.src = './images/Crit.png'; // Path of Image
	            critImg.alt = 'Critical Success';
	            critImg.style.width = '20px';
	            critImg.style.height = '20px';
	            this.regularResults.push(critImg);
	            */

				if (regularDieResult == 'Critical') {
					this.numCrit += 1;
					this.numSuccess += 1;
				} else if (regularDieResult ==  'Success') {
					this.numSuccess += 1;
				}
            }

            // Roll Hunger Dice
            this.hungerResults = [];
            for (let i = 0; i < numHunger; i++) {
                // Random number between 1 and 10
				const hungerDieResult = this.getHungerDiceResult(Math.floor(Math.random() * 10) + 1);
				this.hungerResults.push(hungerDieResult);

				if (hungerDieResult == 'Messy Critical') {
					this.numMessyCrit += 1;
					this.numSuccess += 1;
				} else if (hungerDieResult == 'Success') {
					this.numSuccess += 1;
				} else if (hungerDieResult == 'Bestial Failure') {
					this.numBestialFail += 1;
				}
            }

            // Display results
			this.displayVerboseResults();

            // Show Willpower Reroll Button after a roll
            willpowerRerollButton.toggleVisibility(true);
        });

        // Willpower Reroll Button
        const willpowerRerollButton = this.container.createEl('button', { text: 'Reroll Failures with Willpower' });
        willpowerRerollButton.toggleVisibility(false); // Hide initially
        willpowerRerollButton.addEventListener('click', () => {
            //  Get Settings for Willpower Re-roll
            //console.log(pluginSettings.willpowerRerollMethod);
            const rerollType = pluginSettings.willpowerRerollMethod;
			const maxReroll = 3;

            if (this.regularResults.length > 0) {
                this.regularResults.sort();
				for (let i = 0; i <= maxReroll && i <= this.regularResults.length; i++) {
					if (this.regularResults[i] != 'Critical'){
						if (rerollType == 'max_fail' && this.regularResults[i] != 'Success') {
							//console.log(regularResults[i]);
							const newResult = this.getRegularDieResult(Math.floor(Math.random() * 10) + 1);

							if (newResult == 'Critical') {
								this.numCrit += 1;
								this.numSuccess += 1;
							} else if (newResult ==  'Success') {
								this.numSuccess += 1;
							}

							this.regularResults[i] = newResult;
						} else if (rerollType == 'max_crit') {
							//console.log(regularResults[i]);
                            const newResult = this.getRegularDieResult(Math.floor(Math.random() * 10) + 1);

                            if (this.regularResults[i] == 'Success') {
								if (newResult == 'Critical') {
									this.numCrit += 1;
								} else if (newResult ==  'Failure') {
									this.numSuccess -= 1;
								}
                            } else {
                                if (newResult == 'Critical') {
									this.numCrit += 1;
								} else if (newResult ==  'Success') {
									this.numSuccess += 1;
								}
							}

							this.regularResults[i] = newResult;
						}
					}
				}

                // Display new results
                this.displayVerboseResults();

                // Hide Willpower Reroll Button after a re-roll
                willpowerRerollButton.toggleVisibility(false);
            }
        });
    }

    async onClose() {
        // Cleanup if needed
    }
}
