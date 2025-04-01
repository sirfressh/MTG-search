async function searchCard(cardName = null) {
  const name = cardName || document.getElementById("cardInput").value;
  const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`);
  const data = await response.json();

  if (data.object === 'error') {
    document.getElementById("cardInfo").innerHTML = `<p>Card not found. Try a different name.</p>`;
    return;
  }

  document.getElementById("cardInfo").innerHTML = `
    <h2>${data.name}</h2>
    <img src="${data.image_uris?.normal || ''}" alt="${data.name}" />
    <p><strong>Type:</strong> ${data.type_line}</p>
    <p><strong>Text:</strong> ${data.oracle_text || ''}</p>
    <a href="${data.scryfall_uri}" target="_blank">View on Scryfall</a>
    <a href="https://edhrec.com/cards/${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
      Find deck ideas on EDHREC
    </a>
    <a href="https://commanderspellbook.com/?q=${encodeURIComponent(data.name)}" target="_blank">
      Find combos on Commander Spellbook
    </a>
  `;
  document.getElementById("suggestions").innerHTML = '';
}

async function getSuggestions() {
  const query = document.getElementById("cardInput").value;
  const suggestionsDiv = document.getElementById("suggestions");

  if (!query.trim()) {
    suggestionsDiv.innerHTML = '';
    return;
  }

  const response = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`);
  const data = await response.json();

  suggestionsDiv.innerHTML = '';

  if (data.data && data.data.length) {
    data.data.forEach(name => {
      const option = document.createElement("div");
      option.textContent = name;
      option.onclick = () => {
        document.getElementById("cardInput").value = name;
        suggestionsDiv.innerHTML = '';
        searchCard(name);
      };
      suggestionsDiv.appendChild(option);
    });
  }
}
