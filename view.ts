import { ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_VTMV5_DICE_ROLLER = "vtmv5-dice-roller-view";

export class VTMV5DiceRollerView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_VTMV5_DICE_ROLLER;
    }

    getDisplayText(): string {
        return "VTM V5 Dice Roller View";
    }

    async onOpen(): Promise<void> {
        console.log("VTM V5 Dice Roller view opened");

        this.icon = "dices";

        this.containerEl.createEl('h1', { text: 'Vampire the Masquerade V5 Dice Roller' });
    }

    async onClose(): Promise<void> {
        console.log("VTM V5 Dice Roller view closed");
    }
}