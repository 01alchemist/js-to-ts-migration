import * as path from "path";
import * as fs from "fs";
import { migrate } from "./components/migration";

function migrateFileSync(jsPath: string) {
  const dir = jsPath.substring(0, jsPath.lastIndexOf("/"));
  const tsPath = path.resolve(`${dir}/${jsPath.replace(".js", ".ts")}`);
  const jsCode = fs.readFileSync(jsPath, { encoding: "utf-8" });
  const data = migrate(jsCode);
  fs.writeFileSync(tsPath, data);
}

async function migrateFile(jsPath: string) {
  return new Promise((resolve, reject) => {
    // const dir = jsPath.substring(0, jsPath.lastIndexOf("/"));
    const tsPath = jsPath.replace(".js", ".ts");
    fs.readFile(jsPath, (err: NodeJS.ErrnoException | null, data: Buffer) => {
      if (err) {
        console.log("[read error]: " + jsPath);

        return reject(err);
      }
      const jsCode = migrate(data.toString());
      fs.writeFile(tsPath, jsCode, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          console.log("[write error]: " + tsPath);
          return reject(err);
        }
        resolve();
      });
    });
  });
}

async function migrateFiles(jsFiles: string[]) {
  return Promise.all(jsFiles.map(jsFile => migrateFile(jsFile)));
}

async function migrateDir(inputDir: string) {
  const files = fs.readdirSync(inputDir, { withFileTypes: true });
  const jsFiles: string[] = [];
  const dirs: string[] = [];
  files.forEach(file => {
    if (file.isFile() && file.name.endsWith(".js")) {
      jsFiles.push(`${inputDir}/${file.name}`);
    } else if (file.isDirectory()) {
      dirs.push(`${inputDir}/${file.name}`);
    }
  });
  console.log(jsFiles);
  await migrateFiles(jsFiles);
}

const [inputDir] = process.argv.slice(2);

async function main() {
  await migrateDir(inputDir);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
