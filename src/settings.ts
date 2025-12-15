import { App, PluginSettingTab, Setting } from 'obsidian';
import VTMV5DiceRollerPlugin from 'src/main';

export interface VTMV5DiceRollerSettings {
    mySetting: string;
}

export const DEFAULT_SETTINGS: VTMV5DiceRollerSettings = {
    mySetting: 'default'
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
			.setDesc('Choose how to use the willpower Re-Roll')
			.addDropdown(dropdown => dropdown
				.addOption('crit', 'Re-roll for Max Critical')
				.addOption('fail', 'Re-roll Max Failed')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
    }
}
