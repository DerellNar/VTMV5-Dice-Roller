import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import VTMV5DiceRollerPlugin from 'src/main';
import { VTMV5DiceRollerSettings } from 'src/settings';

export

class DiceRollView extends ItemView {
	private plugin: VTMV5DiceRollerPlugin;
	private pluginSettings: VTMV5DiceRollerSettings;

	//Container for the Dice Results
	regularResults: (string | HTMLElement)[];
	hungerResults: (string | HTMLElement)[];

	// Willpower Logic
	canUseWillpowerReroll: boolean;
	willpowerDiceReRoll: number[];
	maxWillpowerReroll: number;

    // Containers for counting results
    numSuccess: number;
    numCrit: number;
    numMessyCrit: number;
    numBestialFail: number;
	numDifficulty: number;

    // HTML Container
    container: Element;

    // Result Symbols
    successSymbol: string;
    criticalSymbol: string;
    messyCriticalSymbol: string;
    bestialFailSymbol: string;
    failureSymbol: string;

    // Result Messages
    successMessage: string;
    successesMessage: string;
    criticalMessage: string;
    messyCriticalMessage: string;
    bestialFailMessage: string;
    failureMessage: string;

    constructor(leaf: WorkspaceLeaf, plugin: VTMV5DiceRollerPlugin) {
        super(leaf);
		this.plugin = plugin;
		this.pluginSettings = plugin.settings;

		// Initialise Willpower Logic
		this.canUseWillpowerReroll = false;
		this.willpowerDiceReRoll = new Array<number>();
		this.maxWillpowerReroll = 3;

		// Initialise Result Symbols
		this.successSymbol = '𓋹';
		this.criticalSymbol = '*𓋹*';
		this.messyCriticalSymbol = '\'𓋹\'';
		this.bestialFailSymbol = '⨂';
		this.failureSymbol = '●';

		// Initialise Result Containers
		this.regularResults = [];
		this.hungerResults = [];

		// Initialise Success Counters
		this.numSuccess = 0;
		this.numCrit = 0;
		this.numMessyCrit = 0;
		this.numBestialFail = 0;
		this.numDifficulty = 0;

		// Initialise Result Messages
		this.successMessage = 'Success';
		this.successesMessage = 'Successes';
		this.criticalMessage = 'Critical';
		this.messyCriticalMessage = 'Messy Critical';
		this.bestialFailMessage = 'Bestial Failure';
		this.failureMessage = 'Failure';
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

    getRegularDieResult(): (string | HTMLElement) {
		switch (Math.floor(Math.random() * 10) + 1) {
			case 10:
				return this.criticalSymbol;
			case 6:
			case 7:
			case 8:
			case 9:
				return this.successSymbol;
			default:
				return this.failureSymbol;
		}
    }

    getHungerDiceResult(): (string | HTMLElement) {
		switch (Math.floor(Math.random() * 10) + 1) {
			case 10:
				return this.messyCriticalSymbol;
			case 6:
			case 7:
			case 8:
			case 9:
				return this.successSymbol;
			case 1:
				return this.bestialFailSymbol;
			default:
				return this.failureSymbol;
		}
    }

    displayVerboseResults() {
		// Setup Div
		const resultDiv = this.container.querySelector('.results') as HTMLElement;
		if (resultDiv) {
			resultDiv.empty();
		} else {
			this.container.createDiv({ cls: 'results' });
		}

		const resultsEl = this.container.querySelector('.results') as HTMLElement;
		resultsEl.createEl('p', { text: 'Regular Dice:', cls: 'roller__subTitle' });

		// Regular Dice Results
		const renderDiceAsButtons = (container: HTMLElement, results: (string | HTMLElement)[], cls: string) => {
			results.forEach((result, index) => {
				const btn = container.createEl('button', { text: typeof result === 'string' ? result : '', cls: 'roller__die-button' });
				// Add click listener if you want to make them interactive
				if (this.pluginSettings.willpowerRerollMethod == 'manual') {
					btn.classList.remove("is-hover-disabled");
					btn.addEventListener('click', () => {
						// Handle click logic here (e.g., toggle state)
						//console.log("Die toggled", result);
						//console.log("Button Index", index);

						const isBtnToggled = btn.classList.contains('is-selected');

						if (isBtnToggled) {
							const selectedDie = this.willpowerDiceReRoll.findIndex((i) => i === index);
							this.willpowerDiceReRoll.splice(selectedDie, 1);
							btn.classList.toggle('is-selected');
						} else if (this.willpowerDiceReRoll.length < 3) {
							this.willpowerDiceReRoll.push(index);
							btn.classList.toggle('is-selected');
						}

						//console.log(this.willpowerDiceReRoll);
					});
				} else {
					btn.classList.add("is-hover-disabled");
				}
			});
		};

		const regularContainer = resultsEl.createDiv();
		renderDiceAsButtons(regularContainer, this.regularResults, 'roller__die-button');

		// Hunger Dice Results
		const hungerContainer = resultsEl.createDiv();
		hungerContainer.createEl('p', { text: 'Hunger Dice:', cls: 'roller__subTitle' });
		this.hungerResults.forEach(hungerResult => {
			hungerContainer.createEl('button', { text: typeof hungerResult === 'string' ? hungerResult : '', cls: 'roller__hungerDie-button' });
		});

		/* Display verbose result */
		// Calculate total crits including messy crits
		let resultText = '';
		let critText = '';
		//console.log('numSuccess:', numSuccess, 'numCrit:', numCrit, 'numMessyCrit:', numMessyCrit, 'numBestialFail:', numBestialFail);

		const totalCrits = this.numCrit + this.numMessyCrit;
		let totalSuccesses = this.numSuccess;
		//console.log('totalCrits:', totalCrits);
		if (totalCrits > 1) {
			// Each pair of crits adds 2 extra successes
			totalSuccesses += 2 * (Math.floor(totalCrits / 2));
			critText = ': ';
			critText += (this.numMessyCrit >= 1)? this.messyCriticalMessage : this.criticalMessage;
		}
		resultText = `${totalSuccesses} ` + (totalSuccesses == 1 ? this.successMessage : this.successesMessage) + critText;

		// Summary Header
		resultsEl.createEl('p', { text: 'Result:', cls: 'roller__subTitle' });
		resultsEl.createEl('p', { text: resultText, cls: 'roller__text' });

		// The Roll Final Result
		let rollFinalResultText = '';
		if (this.numSuccess < this.numDifficulty || this.numSuccess < 1) {
			rollFinalResultText = (this.numBestialFail >= 1) ? this.bestialFailMessage : this.failureMessage;
			if (this.numDifficulty > 0 && (this.numDifficulty - this.numSuccess) == 1) {
				rollFinalResultText += ': 1 away';
			}
		} else if (this.numMessyCrit >= 1) {
			rollFinalResultText = this.messyCriticalMessage;
		} else {
			rollFinalResultText = this.successMessage;
		}

		// Summary Header
		resultsEl.createEl('p', { text: 'Outcome of the Roll:', cls: 'roller__subTitle' });
		resultsEl.createEl('p', { text: rollFinalResultText, cls: 'roller__text' });
    }

    async onOpen() {
        this.container = this.containerEl.children[1];
        this.container.empty();
        this.container.setAttribute('style', 'padding: 10px;');

        // View Title
        this.container.createEl('h2', { text: 'Vampire the Masquerade V5 Dice Roller', cls: 'roller__title' });
        this.container.createEl('h3', { text: 'Dice Pool:', cls: 'roller__subTitle' });

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
        inputContainer.createEl('label', { text: 'Hunger Dice: ', cls: 'roller__hungerText' });
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
        const rollButton = this.container.createEl('button', { text: 'Roll Dice', cls: 'roller__button' });
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
				const regularDieResult = this.getRegularDieResult();
				this.regularResults.push(regularDieResult);

				if (regularDieResult == this.criticalSymbol) {
					this.numCrit += 1;
					this.numSuccess += 1;
				} else if (regularDieResult ==  this.successSymbol) {
					this.numSuccess += 1;
				}
            }

            // Roll Hunger Dice
            this.hungerResults = [];
            for (let i = 0; i < numHunger; i++) {
                // Random number between 1 and 10
				const hungerDieResult = this.getHungerDiceResult();
				this.hungerResults.push(hungerDieResult);

				if (hungerDieResult == this.messyCriticalSymbol) {
					this.numMessyCrit += 1;
					this.numSuccess += 1;
				} else if (hungerDieResult == this.successSymbol) {
					this.numSuccess += 1;
				} else if (hungerDieResult == this.bestialFailMessage) {
					this.numBestialFail += 1;
				}
			}

			// Activate the Use of Willpower Reroll
			this.canUseWillpowerReroll = true;

            // Display results
			this.displayVerboseResults();

            // Show Willpower Reroll Button after a roll
			willpowerRerollButton.toggleVisibility(true);
        });

        // Willpower Reroll Button
        const willpowerRerollButton = this.container.createEl('button', { text: 'Willpower Reroll', cls: 'roller__button' });
        willpowerRerollButton.toggleVisibility(false); // Hide initially
        willpowerRerollButton.addEventListener('click', () => {
            //  Get Settings for Willpower Re-roll
            const rerollType = this.pluginSettings.willpowerRerollMethod;
            //console.log(rerollType);
			const maxReroll = this.maxWillpowerReroll;

			if (this.regularResults.length > 0) {
				if (rerollType == 'manual') {
					// Only Reroll select Indexes
					this.willpowerDiceReRoll.forEach(rerollIndex => {
						const oldResult = this.regularResults[rerollIndex];
						const newResult: (string | HTMLElement) = this.getRegularDieResult();
						this.regularResults[rerollIndex] = newResult;

						if (oldResult == this.successSymbol) {
							if (newResult == this.criticalSymbol) {
								this.numCrit += 1;
							} else if (newResult == this.failureSymbol) {
								this.numSuccess -= 1;
							}
						} else {
							if (newResult == this.criticalSymbol) {
								this.numCrit += 1;
								this.numSuccess += 1;
							} else if (newResult == this.successSymbol) {
								this.numSuccess += 1;
							}
						}
					});
				} else {
					this.regularResults.sort((a, b) => {
						if (a == this.failureSymbol) { return -1; }
						else if (a == this.successSymbol && b == this.criticalSymbol) { return -1; }
						else if (a == this.successSymbol && b == this.failureSymbol) { return 1; }
						else if (a == this.criticalSymbol) { return 1; }
						else { return 0; }
					});
					//console.log(this.regularResults);
					for (let i = 0; i <= maxReroll && i <= this.regularResults.length && this.regularResults[i] != this.criticalSymbol; i++) {
						let applyReroll = false;
						let newResult: (string | HTMLElement) = '';
						if (rerollType == 'max_crit' && this.regularResults[i] != this.criticalSymbol) {
							newResult = this.getRegularDieResult();
							applyReroll = true;
						} else if (rerollType == 'max_fail' && this.regularResults[i] == this.failureSymbol) {
							newResult = this.getRegularDieResult();
							applyReroll = true;
						}

						if (applyReroll) {
							const oldResult = this.regularResults[i];
							//console.log('Old Result: ' + oldResult + ', New Result: ' + newResult);
							this.regularResults[i] = newResult;
							if (oldResult == this.successSymbol) {
								if (newResult == this.criticalSymbol) {
									this.numCrit += 1;
								} else if (newResult == this.failureSymbol) {
									this.numSuccess -= 1;
								}
							} else {
								if (newResult == this.criticalSymbol) {
									this.numCrit += 1;
									this.numSuccess += 1;
								} else if (newResult == this.successSymbol) {
									this.numSuccess += 1;
								}
							}
						}
					}
				}

				// Deactivate the Use of Willpower Reroll
				this.canUseWillpowerReroll = false;

				// Reset Willpower Dice Reroll Array
				this.willpowerDiceReRoll.length = 0;

                // Display new results
                this.displayVerboseResults();

                // Hide Willpower Reroll Button after a re-roll
                willpowerRerollButton.toggleVisibility(false);
            }
        });
    }

    async onClose() {
        // Cleanup if needed
		this.willpowerDiceReRoll.length = 0;
    }
}
