// Imports
const rexp_import_named = /(const)(\s{\s(.*?)\s}\s(=)\srequire\((.*?)\);)/gi;
const rexp_import_prop = /(const)(\s(.*?)\s=\srequire\((.*?)\).(.*?);)/gi;
const rexp_import = /(const)(\s(.*?)\s=\srequire\((.*?)\);)/gi;
const rexp_import_as = /(import)\s{\s((.*?):\s(.*?))?\s}/gi;
// Exports
const rexp_export = /(module.exports\s=)/gi;
const rexp_export_named = /(module.exports.(.*?)\s=\s(.*?);)/gi;

type String = string & {
  matchAll: (rex: RegExp) => Iterable<[string, string, string]>;
};

export function migrate(script: string): string {
  /**
   * Import migration
   */
  let data = script;
  data = data.replace(rexp_import_named, "import { $3 } from $5;");
  data = data.replace(rexp_import, "import$2");
  // Migrate import as
  const import_as_matches = (data as String).matchAll(rexp_import_as);
  const imports_as_array = Array.from(
    import_as_matches,
    ([group0, , group2]: [string, string, string]) => [group0, group2]
  );

  if (imports_as_array.length > 0) {
    imports_as_array.forEach(([group0, group2]) => {
      const import_as = group2.replace(/\s?:\s?/gi, " as ");
      const import_as_fixed = group0.replace(group2, import_as);
      data = data.replace(group0, import_as_fixed);
    });
  }
  /**
   * Export migration
   */
  // Single export
  data = data.replace(rexp_export, "export =");
  // Multi named function export
  const identifier_matches = (data as String).matchAll(rexp_export_named);
  const identifiers = Array.from(
    identifier_matches,
    ([, , identifier]: [string, string, string]) => identifier
  );
  if (identifiers.length > 0) {
    identifiers.forEach(identifier => {
      const rexp_func = new RegExp(`(function\\s(${identifier})\\s?\\()`, "gi");
      const rexp_const = new RegExp(`(const\\s(${identifier})\\s=)`, "gi");
      if (rexp_func.test(data)) {
        // Directly export same name function exports
        data = data.replace(rexp_func, "export $1");
        // Remove same name commonjs function exports
        data = data.replace(
          new RegExp(`\\s*(module.exports.(${identifier})\\s=\\s(.*?);)`, "gi"),
          ""
        );
      } else if (rexp_const.test(data)) {
        // Directly export same name const exports
        data = data.replace(rexp_const, "export $1");
        // Remove same name commonjs const exports
        data = data.replace(
          new RegExp(`\\s*(module.exports.(${identifier})\\s=\\s(.*?);)`, "gi"),
          ""
        );
      } else {
        // Replace re-export with const
        data = data.replace(
          new RegExp(`(module.exports.(${identifier})\\s=\\s(.*?);)`, "gi"),
          "export const $2 = $3;"
        );
      }
    });
  }

  return data.trimEnd() + "\n";
}
