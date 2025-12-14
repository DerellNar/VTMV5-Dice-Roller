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

        // Roll button
        const rollButton = container.createEl('button', { text: 'Roll Dice' });
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
                switch (dieValue) {
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
                switch (diceValue) {
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
                container.createDiv({ cls: 'results' });
            }

            // Setup Div
            const resultsEl = container.querySelector('.results') as HTMLElement;
            resultsEl.createEl('h4', { text: 'Regular Dice:' });
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
            resultsEl.createEl('h4', { text: 'Hunger Dice:' });
            resultsEl.createEl('p', { text: hungerResults.join(', ') });
        });
    }

    async onClose() {
        // Cleanup if needed
    }
}