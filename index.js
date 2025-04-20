function init() {
    fetch("http://localhost:8080/cities")
        .then(handleResponse)
        .then(showCities)
        .catch(handleError);
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error("Server error: " + response.status);
    }
    return response.json();
}

function handleError(error) {
    console.log("ERROR", error);
}

function showCities(allCities) {

    const cityContainerDOM = document.querySelector(".cityBoxContainer");
    cityContainerDOM.innerHTML = "";

    for (let currCity of allCities) {
        const newCityBox = document.createElement("div");
        newCityBox.classList.add("cityBox");

        newCityBox.innerHTML =
            `<p class="cityBoxText">${currCity.name}, ${currCity.country}</p> 
            <button class="btnDelete" id="cityId-${currCity.id}">Delete</button>`;

        cityContainerDOM.appendChild(newCityBox);
    }

    const deleteBtns = document.querySelectorAll(".btnDelete");
    for (let currBtn of deleteBtns) {
        currBtn.addEventListener("click", deleteCity);
    }
}

function addCity() {
    const cityNameInput = document.querySelector(".UIAddCityName input").value.trim();
    const countryNameInput = document.querySelector(".UIAddCityCountry input").value.trim();

    if (!cityNameInput || !countryNameInput) {
        alert("Name and country are required.");
        clearUserFields();
        return;
    }

    const newCityObj = {
        name: cityNameInput,
        country: countryNameInput
    };

    fetch("http://localhost:8080/cities", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newCityObj)
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 400) {

                    alert("Missing fields.")
                    clearUserFields();

                } else if (response.status === 409) {

                    alert("City already exists.")
                    clearUserFields();

                };

                clearUserFields();
                throw new Error("Failed to add city");
            }
            return response.json();
        })
        .then(init)
        .catch(handleError);
    clearUserFields();
}

function deleteCity(event) {
    const cityIdFromBtn = event.currentTarget.id.split('cityId-')[1];

    fetch(`http://localhost:8080/cities`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(cityIdFromBtn) })
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) alert("City not found.");
                else throw new Error("Delete failed");
            }
            return response.text();
        })
        .then(init)
        .catch(handleError);
}

function searchCities() {
    const cityNameInput = document.querySelector(".UISearchCityName input").value.trim();
    const countryNameInput = document.querySelector(".UISearchCityCountry input").value.trim();

    if (!cityNameInput) {
        alert("Name of city is required.");
        clearUserFields();
        return;
    }

    const searchParams = {
        city: cityNameInput
    };

    if (countryNameInput) {
        searchParams.country = countryNameInput;
    }

    const params = new URLSearchParams(searchParams);

    fetch("http://localhost:8080/cities/search?" + params.toString())
        .then(function (response) {
            return response.json();
        })
        .then(function (filteredCities) {
            showSearchHits(filteredCities);
        })
        .catch(handleError);
}

function showSearchHits(filteredCities) {
    const searchContainer = document.querySelector(".searchHitsField");
    searchContainer.innerHTML = "";

    if (!filteredCities || filteredCities.length === 0) {
        searchContainer.innerHTML = "<p>No search results found.</p>";
        return;
    }

    for (let currCity of filteredCities) {
        const newCityBoxSearch = document.createElement("div");
        newCityBoxSearch.classList.add("searchBox", "cityBox");
        newCityBoxSearch.innerHTML = `<p class="cityBoxText">${currCity.name}, ${currCity.country}</p>`;

        searchContainer.appendChild(newCityBoxSearch);
    }
}

function clearUserFields() {
    const UIFiellds = document.querySelectorAll(".userInputField input");
   
    UIFiellds.forEach(currInput => {
        currInput.value = "";
    })
}

document.querySelector(".btnAdd").addEventListener("click", addCity);
document.querySelector(".btnSearch").addEventListener("click", searchCities);

init();