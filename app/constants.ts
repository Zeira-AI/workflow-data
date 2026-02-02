export const CLIENTS = [
  {
    name: "DSM-F",
    value: "dsm-f",
  },
  {
    name: "Ferrero",
    value: "ferrero",
  },
  {
    name: "Ferrero Chocolate",
    value: "ferrero-chocolate",
  },
  {
    name: "Kerry",
    value: "kerry",
  },
  {
    name: "Kerry Requirements",
    value: "kerry-requirements",
  },
  {
    name: "Croda",
    value: "croda",
  },
  {
    name: "Kalbe",
    value: "kalbe",
  },
] as const;

export const VALID_CLIENTS = CLIENTS.map((c) => c.value) as string[];

export type ClientId = (typeof CLIENTS)[number]["value"];
