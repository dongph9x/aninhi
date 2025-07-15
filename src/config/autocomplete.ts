import type { AutoCompleteMap } from "@/typings";

export const autocomplete = {
    test: ({ interaction }) => {
        interaction.respond([{ name: "Example", value: "1" }]);
    },
} satisfies AutoCompleteMap;
