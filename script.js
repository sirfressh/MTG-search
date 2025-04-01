let currentCardData = null;
let printings = [];

async function searchCard(cardName = null) {
  const name = cardName || document.getElementById("cardInput").value.trim();
  if (!name) return;

  try {
    const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`);
    const data = await response.json();

    if (data.object === 'error') {
      document.getElementById("cardInfo").innerHTML = `<p>Card not found. Try a different name.</p>`;
      return;
    }

    currentCardData = data;

    // Fetch alternate printings
    const printsResponse = await fetch(data.prints_search_uri);
    const printsData = await printsResponse.json();

    // Only keep printings with normal image URIs
    printings = printsData.data.filter(card => card.image_uris?.normal);

    displayCard(data);
  } catch (error) {
    console.error("Search error:", error);
    document.getElementById("cardInfo").innerHTML = `<p>Something went wrong. Try again later.</p>`;
  }
}

function displayCard(data) {
  const priceUSD = data.prices.usd ? `$${data.prices.usd}` : "N/A";
  const priceFoil = data.prices.usd_foil ? `$${data.prices.usd_foil}` : "N/A";
  const tcgLink = data.purchase_uris?.tcgplayer || "#";

  const thumbnails = printings.map(card =>
    `<img src="${card.image_uris.normal}" class="thumb" onclick='setMainCard("${card.id}")'>`
  ).join("");

  document.getElementById("cardInfo").innerHTML = `
    <h2>${data.name}</h2>
    <img id="cardImage" src="${data.image_uris.normal}" alt="${data.name}" />
    
    <p><strong>Type:</strong> ${data.type_line}</p>
    <p><strong>Text:</strong> ${data.oracle_text || ''}</p>

    <p><strong>Market Price:</strong><br>
      Non-Foil: ${priceUSD}<br>
      Foil: ${priceFoil}
    </p>

    <a href="${data.scryfall_uri}" target="_blank">View on Scryfall</a>
    <a href="https://edhrec.com/commanders/${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
      See commander page on EDHREC
    </a>
    <a href="https://commanderspellbook.com/?q=${encodeURIComponent(data.name)}" target="_blank">
      Find combos on Commander Spellbook
    </a>
    <a href="${tcgLink}" target="_blank">Buy on TCGPlayer</a>

    <div style="margin-top: 20px;" id="thumbGallery">
      ${thumbnails}
    </div>
  `;
}

function setMainCard(cardId) {
  const selected = printings.find(c => c.id === cardId);
  if (selected) displayCard(selected);
}

async function getSuggestions() {
  const query = document.getElementById("cardInput").value;
  const suggestionsDiv = document.getElementById("suggestions");

  if (!query.trim()) {
    suggestionsDiv.innerHTML = '';
    return;
  }

  try {
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
  } catch (error) {
    console.error("Autocomplete error:", error);
  }
}
