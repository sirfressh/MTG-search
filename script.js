let printImages = [];
let currentPrintIndex = 0;

async function searchCard(cardName = null) {
  const name = cardName || document.getElementById("cardInput").value;
  const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`);
  const data = await response.json();

  if (data.object === 'error') {
    document.getElementById("cardInfo").innerHTML = `<p>Card not found. Try a different name.</p>`;
    return;
  }

  // Fetch alternate printings
  const printsResponse = await fetch(data.prints_search_uri);
  const printsData = await printsResponse.json();

  printImages = printsData.data
    .filter(card => card.image_uris?.normal)
    .map(card => card.image_uris.normal);

  currentPrintIndex = 0;
  displayCard(data);
}

function displayCard(data) {
  const imageUrl = printImages[currentPrintIndex] || '';
  document.getElementById("cardInfo").innerHTML = `
    <h2>${data.name}</h2>
    <div style="position: relative; text-align: center;">
      <img id="cardImage" src="${imageUrl}" alt="${data.name}" />
      <div style="margin-top: 10px;">
        <button onclick="prevPrint()">⬅️</button>
        <button onclick="nextPrint()">➡️</button>
      </div>
    </div>
    <p><strong>Type:</strong> ${data.type_line}</p>
    <p><strong>Text:</strong> ${data.oracle_text || ''}</p>
    <a href="${data.scryfall_uri}" target="_blank">View on Scryfall</a>
    <a href="https://edhrec.com/commanders/${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
      See commander page on EDHREC
    </a>
    <a href="https://commanderspellbook.com/?q=${encodeURIComponent(data.name)}" target="_blank">
      Find combos on Commander Spellbook
    </a>
  `;
}

function prevPrint() {
  if (printImages.length > 1) {
    currentPrintIndex = (currentPrintIndex - 1 + printImages.length) % printImages.length;
    document.getElementById("cardImage").src = printImages[current
