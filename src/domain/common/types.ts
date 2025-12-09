export type TelemetryParameters = Record<string, number | string | boolean>;

export type TelemetryDiff = {
  changed: Array<{
    parameter: string;
    previous: number | string | boolean | undefined;
    current: number | string | boolean;
    delta?: number; // only for numeric changes
  }>;
};


