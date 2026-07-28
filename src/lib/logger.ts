type LogLevel = "error" | "info" | "warn";

type LogFields = Record<string, boolean | number | string | null | undefined>;

function write(level: LogLevel, event: string, fields: LogFields = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields,
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
    return;
  }

  if (level === "warn") {
    console.warn(output);
    return;
  }

  console.info(output);
}

export const logger = {
  error(event: string, fields?: LogFields) {
    write("error", event, fields);
  },
  info(event: string, fields?: LogFields) {
    write("info", event, fields);
  },
  warn(event: string, fields?: LogFields) {
    write("warn", event, fields);
  },
};
