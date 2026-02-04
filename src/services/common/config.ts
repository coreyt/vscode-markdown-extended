import { ConfigReader } from "./configReader";

class Config extends ConfigReader {
    constructor() {
        super('markdownExtended');
    }

    onChange() { }
    get disabledPlugins(): string[] {
        let conf = this.read<string>('disabledPlugins').trim();
        if (!conf) return [];
        return conf.toLowerCase().split(',').map(p => p.trim());
    }
    get tocLevels(): Number[] {
        let conf = this.read<Number[]>('tocLevels');
        if (!(conf instanceof Array)) conf = [];
        if (conf.length) conf = conf.filter(c => typeof c == "number");
        if (!conf.length) return [1, 2, 3];
        return conf;
    }
    get exportOutDirName(): string {
        return this.read<string>('exportOutDirName');
    }
}

export const config = new Config();
