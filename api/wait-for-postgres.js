// Small dependency-free replacement for the classic wait-for-it.sh /
// netcat approach, so the Docker image doesn't need any OS packages
// installed just to check whether Postgres is accepting connections yet.
const net = require("net");

const host = process.env.POSTGRES_HOST || "postgres";
const port = Number(process.env.POSTGRES_PORT || 5432);
const timeoutMs = 30000;
const start = Date.now();

function tryConnect() {
  const socket = net.createConnection(port, host);

  socket.once("connect", () => {
    socket.end();
    process.exit(0);
  });

  socket.once("error", () => {
    socket.destroy();
    if (Date.now() - start > timeoutMs) {
      console.error(`Timed out waiting for Postgres at ${host}:${port}`);
      process.exit(1);
    }
    setTimeout(tryConnect, 1000);
  });
}

console.log(`Waiting for Postgres at ${host}:${port}...`);
tryConnect();
