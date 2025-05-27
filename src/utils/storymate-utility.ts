import { importStoryMate } from "@drincs/pixi-vn-storymate";

export async function importAllInkLabels() {
    const files = import.meta.glob<{ default: string }>("../storymate/*.json");
    const fileEntries = await Promise.all(
        Object.entries(files).map(async ([path]) => {
            const fileModule = await import(/* @vite-ignore */ path + "?raw");
            return fileModule.default;
        })
    );
    await importStoryMate(fileEntries);
}
