import { ItemView, Notice } from 'obsidian';

export

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

        //container.createDiv({ cls: 'roller' });

        // View Title
        container.createEl('h2', { text: 'Vampire the Masquerade V5 Dice Roller', cls: 'roller__title' });
        container.createEl('h3', { text: 'Dice Pool:', cls: 'roller__text' });

        // Input for number of dice
        const inputContainer = container.createDiv();

        // Input Total Dice Pool
        inputContainer.createEl('label', { text: 'Total Dice: ' });
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
        inputContainer.createEl('label', { text: 'Difficulty: ' });
        const diceDifficultyInput = inputContainer.createEl('input', { type: 'number', value: '0' });
        diceDifficultyInput.setAttribute('min', '0');
        diceDifficultyInput.setAttribute('max', '20');

        // Roll button
        const rollButton = container.createEl('button', { text: 'Roll Dice' });
        rollButton.addEventListener('click', () => {
            const numHunger = parseInt(diceHungerInput.value);
            const numRegularDice = parseInt(dicePoolInput.value) - numHunger;
            //console.log('Regular Dice:', numRegularDice, 'Hunger Dice: ', numHunger);
            if (isNaN(numRegularDice) || numRegularDice < 1) {
                new Notice('Please enter a valid number of dice.');
                return;
            }

            /* Roll Dice */
            // Containers for counting results
            var numSuccess = 0;
            var numCrit = 0;
            var numMessyCrit = 0;
            var numBestialFail = 0;

            // Roll Regular Dice
            const regularResults: (string | HTMLElement)[] = [];
            for (let i = 0; i < numRegularDice; i++) {
                var dieValue = Math.floor(Math.random() * 10) + 1
                switch (dieValue) {
                    case 10:
                        /* Push an image instead of text example
                        const critImg = document.createElement('img');
                        critImg.src = './images/Crit.png'; // Path of Image
                        critImg.alt = 'Critical Success';
                        critImg.style.width = '20px';
                        critImg.style.height = '20px';
                        regularResults.push(critImg);
                        */
                        regularResults.push('Crit');
                        numCrit += 1;
                        numSuccess += 1;
                        break;
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        regularResults.push('Success');
                        numSuccess += 1;
                        break;
                    default:
                        regularResults.push('Fail');
                        break;
                }
            }

            // Roll Hunger Dice
            const hungerResults = [];
            for (let i = 0; i < numHunger; i++) {
                var diceValue = Math.floor(Math.random() * 10) + 1;
                switch (diceValue) {
                    case 10:
                        hungerResults.push('Messy Crit');
                        numMessyCrit += 1;
                        numSuccess += 1;
                        break;
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        hungerResults.push('Success');
                        numSuccess += 1;
                        break;
                    case 1:
                        hungerResults.push('Bestial Fail');
                        numBestialFail += 1;
                        break;
                    default:
                        hungerResults.push('Fail');
                        break;
                }
            }

            /* Display results */
            // Setup Div
            const resultDiv = container.querySelector('.results') as HTMLElement;
            if (resultDiv) {
                resultDiv.empty();
            } else {
                container.createDiv({ cls: 'results' });
            }

            const resultsEl = container.querySelector('.results') as HTMLElement;
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
            resultsEl.createEl('p', { text: regularResults.join(' | ') });

            // Space between regular and hunger results
            resultsEl.createEl('br');

            // Hunger Dice Results
            resultsEl.createEl('h4', { text: 'Hunger Dice:' });
            resultsEl.createEl('p', { text: hungerResults.join(' | ') });

            /* Display verbose result */
            // Calculate total crits including messy crits
            var resultText = '';
            var critText = '';
            //console.log('numSuccess:', numSuccess, 'numCrit:', numCrit, 'numMessyCrit:', numMessyCrit, 'numBestialFail:', numBestialFail);

            const numDifficulty = parseInt(diceDifficultyInput.value);
            if (numSuccess < numDifficulty || numSuccess < 1) {
                resultText += (numBestialFail >= 1) ? "Bestial Failure" : "Failure";
            } else {
                const totalCrits = numCrit + numMessyCrit;
                var totalSuccesses = numSuccess;
                //console.log('totalCrits:', totalCrits);
                if (totalCrits > 1) {
                    // Each pair of crits adds 2 extra successes
                    totalSuccesses += 2 * (Math.floor(totalCrits / 2));
                    critText = (numMessyCrit >= 1)? ": Messy Crititcal" : ": Critical Success";
                }
                resultText = `${totalSuccesses} Successes` + critText;
            }

            // Space before summary
            resultsEl.createEl('br');
            
            // Summary Header
            resultsEl.createEl('h4', { text: 'Result:' });
            resultsEl.createEl('p', { text: resultText });

        });

        // Willpower Reroll Button
        const willpowerRerollButton = container.createEl('button', { text: 'Reroll Failures with Willpower' });
        willpowerRerollButton.addEventListener('click', () => {
            new Notice('Willpower Reroll not yet implemented.');
        });
    }

    async onClose() {
        // Cleanup if needed
    }
}