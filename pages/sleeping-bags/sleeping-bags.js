import {
  handleHttpErrors,
  sanitizeStringWithTableRows,
  setStatusMsg,
  makeOptions,
} from "../../utils.js";

const URL = "http://localhost:8080/api/sleeping-bags";

export function initSleepingBags() {
  document
    .getElementById("submit-info")
    ?.addEventListener("click", sleepingBagFormSend);
  document.getElementById("temp")?.addEventListener("input", adjustTempValue);
  document.getElementById("price")?.addEventListener("input", adjustPriceValue);
}


function sleepingBagFormSend() {
  const trip = {};
  
  try {
    const environmentTemperatureMin =
      document.getElementById("temp-value")?.textContent;

    if (environmentTemperatureMin?.length !== 0) {
      trip.environmentTemperatureMin = environmentTemperatureMin;
    }
  } catch (error) {}

  try {
    const maxCost = document.getElementById("price-value")?.textContent;

    if (maxCost?.length !== 0) {
      trip.maxCost = maxCost;
    }
  } catch (error) {}

  try {
    const isFemale =
      document.querySelector('input[name="gender"]:checked').value === "female"
        ? "true"
        : "false";
    trip.isFemale = isFemale;
  } catch (error) {}

  try {
    const isColdSensitive =
      document.querySelector('input[name="cold"]:checked').value === "true"
        ? "true"
        : "false";
    trip.isColdSensitive = isColdSensitive;
  } catch (error) {}

  try {
    const innerMaterial =
      document.querySelector('input[name="fill"]:checked').value === "fiber"
        ? "Fiber"
        : "Dun";
    trip.innerMaterial = innerMaterial;
  } catch (error) {}

  try {
    const personHeight = document.getElementById("height").value;

    if (personHeight?.length !== 0) {
      trip.personHeight = personHeight;
    }
  } catch (error) {}

  fetchFilteredSleepingBags(trip)
}

function adjustTempValue() {
  const temp = document.getElementById("temp-value");
  temp.textContent = this.value;
}

function adjustPriceValue() {
  const price = document.getElementById("price-value");
  price.textContent = this.value;
}

function showMultipleSleepingBags(data) {
  const tableRowsArray = data.map(
    (sleepingbag) => `
  <div class="card m-2 col">
    <img class="card-img-top" src="https://www.fotoagent.dk/single_picture/12535/138/large/389010021.jpg" alt="Image" style="width:200px">
    <div class="card-body">
      <h6 class="card-title">${sleepingbag.model}</h6>
      <p class="card-text">${sleepingbag.brand}</p>
      <p class="card-text">Pris:</p>

      <button type="button" class="btn btn-sm btn-dark" style="background-color: #00461c;" 
      data-sku="${sleepingbag.sku}"
      data-action="details"
      data-bs-toggle="modal"
      data-bs-target="#exampleModal">Details</button> 
      
    </div>
  </div>

  `
  );

  
  document.getElementById("sleeping-bags-result").onclick = showSleepingBagDetails;


  const tableRowsString = tableRowsArray.join("\n");
  document.getElementById("sleeping-bags-result").innerHTML =
    sanitizeStringWithTableRows(tableRowsString);
}


async function showSleepingBagDetails(event) {
  const target = event.target;
  if (target.dataset.action == "details") {
      const id = target.dataset.sku;

      // bootstrap 5 modal
      document.querySelector("#exampleModalLabel").innerText =
        "Information om sovepose " + id;
  
      // OBS modal, ikke ændres. Hente 1 sovepose @GetMapping("/{sku}
      const sleepingbag = await fetch(URL + "/" + id)
        .then((res) => res.json())
        .then((sleepingbag) => {
          document.querySelector("#modal-body").innerText = `
          Mærke: ${sleepingbag.brand}
          Produktnavn: ${sleepingbag.model}
          Pris: ${sleepingbag.cost}
          Personlængde: ${sleepingbag.personHeight}
          Komforttemp.(°C): ${sleepingbag.comfortTemp}
          Lower limit. (°C): ${sleepingbag.lowerLimitTemp}
          Fyld: ${sleepingbag.innerMaterial}
          Vægt (g): ${sleepingbag.productWeight}
          Lagerstatus: ${sleepingbag.stockLocation}
          Varenr: ${sleepingbag.sku}
          `;
          // Generate link to the sleepingbag at Friluftslands homepage
          const link = generateLink(sleepingbag.sku);
          document.querySelector("#modal-link").innerHTML = link;
        });
  
  }
}

function generateLink(sku) {
  return `<a href="https://www.friluftsland.dk/msearch?q=${sku}" target="_blank">Link</a>`;
}


async function fetchFilteredSleepingBags(tripObj) {
  //TODO: change to true when security is added
  const options = makeOptions("POST", tripObj, false);

  try {
    const filteredResult = await fetch(URL, options).then(handleHttpErrors);
    showMultipleSleepingBags(filteredResult);
  } catch (err) {
    // setStatusMsg("Error", true);
  }
}
