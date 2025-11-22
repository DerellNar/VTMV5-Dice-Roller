import { Plugin, WorkspaceLeaf, setIcon } from 'obsidian';
import { VTMV5DiceRollerView, VIEW_TYPE_VTMV5_DICE_ROLLER } from './view';

export default class VTMV5DiceRoller extends Plugin { 
    async onload() {
        console.log('VTMV5 Plugin OnLoad');

        this.registerView (
            VIEW_TYPE_VTMV5_DICE_ROLLER,
            (leaf: WorkspaceLeaf) => new VTMV5DiceRollerView(leaf)
        );

        this.addRibbonIcon('dices', 'Activate view', () => { this.activateView(); })
    }

    async onunload() {
        console.log('VTMV5 Plugin OnUnload');
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_VTMV5_DICE_ROLLER);

        if (leaves.length > 0){
            // A leaf already exists, use it
            leaf = leaves[0];
        } else {
            // Our view could not be found in the workspace, create a new leaf
            // in the right sidebar for it
            leaf = workspace.getRightLeaf(false);
            if (leaf) { await leaf.setViewState({ type: VIEW_TYPE_VTMV5_DICE_ROLLER, active: true }); }
        }

        // "Reveal" the leaf in case it is in a collapsed sidebar
        if (leaf) { workspace.revealLeaf(leaf); }
    }
}