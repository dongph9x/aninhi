import { get } from "lodash";

export const componentData = <T = unknown>(n: string, d?: T) => {
    return JSON.stringify({ n, d });
};

export const resolveVariables = (input: string, payload: object) => {
    return input.replaceAll(/{(.+?)}/g, (_, path) => get(payload, path) ?? "<invalid_variable>");
};
