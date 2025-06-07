
import { readFile, writeFile, mkdir, copyFile } from "fs/promises";

async function generateSite() {
  const raw = await readFile("data/fish.json", "utf-8");
  const fishList = JSON.parse(raw);

  await mkdir("site", { recursive: true });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vietnam Marine Fish</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Vietnam Marine Fish</h1>
  <input type="text" id="search" placeholder="Search species or family..." autofocus>
  <div id="results"></div>

  <script>
    const fishData = ${JSON.stringify(fishList)};
  </script>
  <script src="script.js"></script>
</body>
</html>
`;

  await writeFile("site/index.html", html);
  await writeFile("site/style.css", baseCSS);
  await writeFile("site/script.js", searchJS);

  console.log("✅ Site generated at ./site/index.html");
}

const baseCSS = `
body {
  font-family: sans-serif;
  max-width: 1000px;
  margin: auto;
  padding: 1em;
}
#search {
  width: 100%;
  padding: 0.5em;
  font-size: 1em;
}
.fish {
  display: flex;
  align-items: center;
  margin-top: 1em;
  gap: 1em;
  border-bottom: 1px solid #ddd;
  padding-bottom: 1em;
}
.fish img {
  width: 120px;
  height: auto;
  object-fit: contain;
  border: 1px solid #ccc;
}
`;

const searchJS = `
const input = document.getElementById('search');
const results = document.getElementById('results');

function render(list) {
  results.innerHTML = '';
  list.forEach(fish => {
    const div = document.createElement('div');
    div.className = 'fish';
    div.innerHTML = \`
      <img src="../data/\${fish.localImagePath}" alt="\${fish.species}">
      <div>
        <a href=\${fish.speciesUrl}>
        <strong>\${fish.species}</strong><br>
        </a>
        <em>\${fish.family}</em><br>
        <small>\${fish.other}</small>
      </div>
    \`;
    results.appendChild(div);
  });
}

input.addEventListener('input', () => {
  const keyword = input.value.toLowerCase();
  const filtered = fishData.filter(fish =>
    fish.species.toLowerCase().includes(keyword) ||
    fish.family.toLowerCase().includes(keyword) ||
    fish.other.toLowerCase().includes(keyword)
  );
  render(filtered);
});

render(fishData);
`;

generateSite().catch(console.error);
