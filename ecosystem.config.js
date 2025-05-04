module.exports = {
    apps: [
        {
            name: "uvqs-server",
            cwd: "./server",
            script: "npm",
            args: "run dev",
        },
        {
            name: "uvqs-client",
            cwd: "./",
            script: "npm",
            args: "run dev",
        },
    ],
};
