import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { readFile, writeFile, mkdir } from "fs/promises";
import { basename } from "path";
import { createWriteStream } from "fs";

const BASE_URL = "https://fishbase.mnhn.fr";
const IMAGE_DIR = "data/images";

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }

  const stream = createWriteStream(filepath);
  await new Promise((resolve, reject) => {
    if (res.body === null) {
      reject(new Error(`No response body for image: ${url}`));
      return;
    }
    res.body.pipe(stream);
    res.body.on("error", reject);
    stream.on("finish", resolve);
  });
}

async function scrapeImages() {
  const raw = await readFile("data/fish-list.json", "utf-8");
  const fishList = JSON.parse(raw);

  await mkdir(IMAGE_DIR, { recursive: true });

  for (let i = 0; i < fishList.length; i++) {
    const fish = fishList[i];
    console.log(`[${i + 1}/${fishList.length}] Fetching image for ${fish.species}...`);

    try {
      const res = await fetch(fish.speciesUrl);
      const html = await res.text();
      const $ = cheerio.load(html);

      const imgEl = $("img").toArray().find(img => {
        const src = $(img).attr("src");
        return src && src.includes("/images/thumbnails/");
      });

      if (!imgEl) {
        console.warn(`No thumbnail image found for ${fish.species}`);
        continue;
      }

      const src = $(imgEl).attr("src")!;

      const imageUrl = `${BASE_URL}${src}`;
      const imageFilename = basename(src);
      const localPath = `${IMAGE_DIR}/${imageFilename}`;

      await downloadImage(imageUrl, localPath);

      fish.imageUrl = imageUrl;
      fish.localImagePath = `images/${imageFilename}`;

      // rate limiting to avoid overwhelming the server
      await wait(1500 + Math.random() * 100); // random delay

    } catch (err) {
      console.error(`Error for ${fish.species}:`, err);
    }
  }

  await writeFile("data/fish.json", JSON.stringify(fishList, null, 2));
  console.log("Saved fish metadata with image info to data/fish.json");
}

scrapeImages().catch(console.error);
