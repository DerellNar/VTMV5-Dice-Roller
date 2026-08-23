import { App, PluginSettingTab, Setting } from 'obsidian';
import VTMV5DiceRollerPlugin from 'src/main';

export interface VTMV5DiceRollerSettings {
    willpowerRerollMethod: string;
}

export const DEFAULT_SETTINGS: VTMV5DiceRollerSettings = {
    willpowerRerollMethod: 'manual'
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
			.setDesc('Choose Willpower Re-roll Strategy')
			.addDropdown(dropdown => dropdown
				.addOption('manual', 'Manually select Dice to Re-roll')
				.addOption('max_fail', 'Re-roll Max Failed')
				.addOption('max_crit', 'Re-roll for Max Critical')
				.setValue(this.plugin.settings.willpowerRerollMethod)
				.onChange(async (value) => {
					this.plugin.settings.willpowerRerollMethod = value;
					await this.plugin.saveSettings();
				}));
	}

	getSettingDefinitions() {
		return [
			{
				name: 'Willpower Re-roll Method',
				desc: 'Choose Willpower Re-roll Strategy',
				control: {
					type: 'dropdown',
					key: 'willpowerRerollMethod',
					defaultValue: 'manual',
					options: {
						manual: 'Manually select Dice to Re-roll',
						max_fail: 'Re-roll Max Failed',
						max_crit: 'Re-roll for Max Critical'
					},
				},
			}
		];
	}
}
