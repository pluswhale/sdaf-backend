export const ENV = new Proxy({ ...process.env }, {
    get(envVars, name) {
        if (name in process.env) {
            return envVars[name];
        }
        else {
            throw new Error(`Variable ${String(name)} is not defined in this environment`);
        }
    },
});
