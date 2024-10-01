export const ENV = new Proxy(
    //@ts-ignore
  { ...import.meta.env },
  {
    get(envVars, name) {
      if (name in envVars) {
        return envVars[name as keyof typeof envVars];
      } else {
        throw new Error(`Variable ${String(name)} is not defined in this environment`);
      }
    },
  },
);
