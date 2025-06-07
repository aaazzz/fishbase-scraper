
const input = document.getElementById('search');
const results = document.getElementById('results');

function render(list) {
  results.innerHTML = '';
  list.forEach(fish => {
    const div = document.createElement('div');
    div.className = 'fish';
    div.innerHTML = `
      <img src="../data/${fish.localImagePath}" alt="${fish.species}">
      <div>
        <a href=${fish.speciesUrl}>
        <strong>${fish.species}</strong><br>
        </a>
        <em>${fish.family}</em><br>
        <small>${fish.other}</small>
      </div>
    `;
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
