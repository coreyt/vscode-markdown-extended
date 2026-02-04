import { ConfigReader } from "./configReader";

class Config extends ConfigReader {
    constructor() {
        super('markdownExtended');
    }

    onChange() { }
    get disabledPlugins(): string[] {
        let conf = this.read<string>('disabledPlugins');
        if (!conf) return [];
        return conf.trim().toLowerCase().split(',').map(p => p.trim());
    }
    get tocLevels(): number[] {
        let conf = this.read<number[]>('tocLevels');
        if (!(conf instanceof Array)) conf = [];
        if (conf.length) conf = conf.filter((c): c is number => typeof c === "number");
        if (!conf.length) return [1, 2, 3];
        return conf;
    }
    get exportOutDirName(): string {
        return this.read<string>('exportOutDirName') ?? '';
    }
}

export const config = new Config();
