import { AssetDto } from "./backend";
import { ConfigurationSection } from "./configuration";

export interface LocalAssetDto extends AssetDto {
    configurationId: string;
    formData: {
        sections: ConfigurationSection[];
    };
}
