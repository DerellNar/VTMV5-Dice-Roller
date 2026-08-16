import { App, PluginSettingTab, Setting } from 'obsidian';
import VTMV5DiceRollerPlugin from 'src/main';

export interface VTMV5DiceRollerSettings {
    willpowerRerollMethod: string;
}

export const DEFAULT_SETTINGS: VTMV5DiceRollerSettings = {
    willpowerRerollMethod: 'max_fail'
}

export

class VTMV5SettingTab extends PluginSettingTab {
    plugin: VTMV5DiceRollerPlugin;

    constructor(app: App, plugin: VTMV5DiceRollerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

		new Setting(containerEl)
			.setName('Willpower Re-roll Method')
			.setDesc('Choose how to use the willpower Re-roll')
			.addDropdown(dropdown => dropdown
				.addOption('max_fail', 'Re-roll Max Failed')
				.addOption('max_crit', 'Re-roll for Max Critical')
				.addOption('manual', 'Manually select which regular die to Re-roll')
				.setValue(this.plugin.settings.willpowerRerollMethod)
				.onChange(async (value) => {
					this.plugin.settings.willpowerRerollMethod = value;
					await this.plugin.saveSettings();
				}));
    }
}
