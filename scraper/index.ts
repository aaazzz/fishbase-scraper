import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";

const BASE_URL = "https://fishbase.mnhn.fr/country";
const LIST_URL = `${BASE_URL}/CountryChecklist.php?&c_code=704&vhabitat=saltwater&family_code=1&showAll=yes`;
// const LIST_URL = `${BASE_URL}/CountryChecklist.php?&c_code=704&vhabitat=saltwater&family_code=1`;

async function scrapeFishList() {
  console.log("Fetching fish list...");
  const res = await fetch(LIST_URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  const fishList: any[] = [];

  $("table[cellspacing='0'] tr").each((i, row) => {
    // Skip header
    if (i === 0) return;

    const cols = $(row).find("td");

    const other = $(cols[0]).text().trim();
    const family = $(cols[1]).text().trim();
    const speciesEl = $(cols[2]).find("a");
    const species = speciesEl.text().trim();
    const speciesHref = speciesEl.attr("href");

    if (!speciesHref) return;

    const speciesUrl = `${BASE_URL}/${speciesHref}`;

    fishList.push({
      other,
      family,
      species,
      speciesUrl,
    });
  });

  console.log(`Collected ${fishList.length} entries`);

  await mkdir("data", { recursive: true });
  await writeFile("data/fish-list.json", JSON.stringify(fishList, null, 2));
  console.log("Saved fish list to data/fish-list.json");
}

scrapeFishList().catch(console.error);

