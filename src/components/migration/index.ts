const rexp_export = /(module.exports\s=)/gi;
const rexp_export_multi = /(module.exports.(.*?)\s=\s(.*?);)/gi;
const rexp_import_named = /\s*(const)(\s{\s(.*?)\s}\s(=)\srequire\((.*?)\);)/gi;
const rexp_import = /^\s*(const)(\s(.*?)\s=\srequire(.*?);)/gi;

export function migrate(script: string): string {
  /**
   * Export migration
   */
  // Single export
  let data: any = script.replace(rexp_export, "export =");
  // Multi named function export
  const matches = data.matchAll(rexp_export_multi);
  const funcNames = Array.from(matches, ([, , funcName]: any) => funcName);
  if (funcNames.length > 0) {
    funcNames.forEach(funcName => {
      const rexp = new RegExp(`(function\\s(${funcName}|\\s)\\()`, "gi");
      if (rexp.test(data)) {
        // Directly export same name function exports
        data = data.replace(rexp, "export $1");
        // Remove same name commonjs function exports
        data = data.replace(
          new RegExp(`\\s*(module.exports.(${funcName})\\s=\\s(.*?);)`, "gi"),
          ""
        );
      } else {
        // Replace re-export with const
        data = data.replace(
          new RegExp(`(module.exports.(${funcName})\\s=\\s(.*?);)`, "gi"),
          "export const $2 = $3;"
        );
      }
    });
  }

  /**
   * Import migration
   */
  data = data.replace(rexp_import_named, "import { $3 } from $5;\n");
  data = data.replace(rexp_import, "import$2\n");

  return data.trimEnd();
}
