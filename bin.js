const exec = require("execa");
const meow = require("meow");
const path = require("path");

const cli = meow("$ ...");
(async () => {
  const elec = path.join(__dirname, "node_modules", ".bin", "electron");
  await exec(elec, [".", cli.input[0]]);
})();
