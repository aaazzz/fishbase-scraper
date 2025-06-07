// load from and to JSON files and merge

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

function merge(existingData: any[], newData: any[], keyField: string): any[] {
  const existingMap = new Map(existingData.map(item => [item[keyField], item]));

  for (const newItem of newData) {
    if (existingMap.has(newItem[keyField])) {
      // Merge logic: update existing item with new item properties
      Object.assign(existingMap.get(newItem[keyField]), newItem);
    } else {
      // Add new item if it doesn't exist
      existingMap.set(newItem[keyField], newItem);
    }
  }

  return Array.from(existingMap.values());
}

async function mergeJsonFiles(fromFile: string, toFile: string, keyField: string): Promise<void> {
  try {
    // Read the existing data
    const existingDataRaw = await readFile(toFile, "utf-8");
    const existingData = JSON.parse(existingDataRaw);

    // Read the new data to merge
    const newDataRaw = await readFile(fromFile, "utf-8");
    const newData = JSON.parse(newDataRaw);

    // Merge the data
    const mergedData = merge(existingData, newData, keyField);

    // Ensure the directory exists
    await mkdir(join(__dirname, "data"), { recursive: true });

    // Write the merged data back to the file
    await writeFile(toFile, JSON.stringify(mergedData, null, 2), "utf-8");

    console.log(`✅ Merged data from ${fromFile} into ${toFile}`);
  } catch (error) {
    console.error("❌ Error merging JSON files:", error);
  }

}

// bun run merge-json -f path/to/new-data.json -t path/to/existing-data.json -k species

const args = process.argv.slice(2);
const fromFile = args.find(arg => arg.startsWith("-f="))?.split("=")[1];
const toFile = args.find(arg => arg.startsWith("-t="))?.split("=")[1];
const keyField = args.find(arg => arg.startsWith("-k="))?.split("=")[1] || "species";
if (!fromFile || !toFile) {
  console.error("Usage: bun run merge-json -f=<from-file> -t=<to-file> [-k=<key-field>]");
  process.exit(1);
}
mergeJsonFiles(fromFile, toFile, keyField)
  .catch(error => {
    console.error("❌ Error:", error);
    process.exit(1);
  });


