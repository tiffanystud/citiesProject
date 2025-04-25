
function init() {

    const requestObj = new Request("http://localhost:8000/cities");

    fetch(requestObj)
        .then(fetchAndShowCities)
        .then(showCities)
        .catch(handleError);
}

function fetchAndShowCities() {
    const requestObj = new Request("http://localhost:8000/cities");

    fetch(requestObj)
        .then(response => {
            if (!response.ok) {
                showFeedbackText("Server error");
                throw new Error("Server error");
            }
            return response.json(); 
        })
        .then(allCities => {
            // Lägg till kontrollen här för allCities
            if (allCities) {
                showCities(allCities);  // Anropar showCities bara om allCities finns
            } else {
                showFeedbackText("No cities found");
            }
        }) 
        .catch(error => showFeedbackText(error.message)); 
}


function handleError(error) {

    const feedbackText = document.querySelector(".feedbackText");

    if (error) {
        if (error.message) {
            feedbackText.innerHTML = error.message;
        } else {
            feedbackText.innerHTML = error;
        }
    } else {
        feedbackText.innerHTML = "Something went wrong";
    }

}

function showFeedbackText(message) {
    const feedbackText = document.querySelector(".feedbackText");
    feedbackText.innerHTML = message;
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


async function addCity() {

    const cityNameInput = document.querySelector(".UIAddCityName input").value;
    const countryNameInput = document.querySelector(".UIAddCityCountry input").value;

    const newCityObj = {
        name: cityNameInput,
        country: countryNameInput
    };

    const requestObj = new Request("http://localhost:8000/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(newCityObj)
    });

    try {
        const responseObj = await fetch(requestObj);

        if (!responseObj.ok) {
            const returnedError = await responseObj.json();
            throw {
                message: "City already exists."
            };
        }

        const feedbackText = document.querySelector(".feedbackText");
        showFeedbackText("City added")
        init();
    }

    catch (error) {
        handleError(error);
    }

    clearUserFields();

}

function deleteCity(event) {

    const cityIdFromBtn = event.currentTarget.id.split("cityId-")[1];

    const requestObj = new Request("http://localhost:8000/cities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(cityIdFromBtn) })
    });


    fetch(requestObj)
        .then(responseObj => {
            if (responseObj.ok) {
                showFeedbackText("Delete OK");
                return responseObj.json();
            } else {
                return responseObj.text().then(errorText => { throw new Error(errorText) })
            }
        })
        .then(init)
        .catch(handleError);

}


async function searchCities() {
    const cityNameInput = document.querySelector(".UISearchCityName input").value.trim();
    const countryNameInput = document.querySelector(".UISearchCityCountry input").value.trim();

    if (!cityNameInput) {
        showFeedbackText("City name required");
        clearUserFields();
        return;
    }

    let searchParamsObj = {}

    if (cityNameInput && countryNameInput) {
        searchParamsObj = {
            city: cityNameInput,
            country: countryNameInput
        }
    } else {
        searchParamsObj = {
            city: cityNameInput
        }
    }


    const searchParamsURL = new URLSearchParams(searchParamsObj);
    const requestObj = new Request("http://localhost:8000/cities/search?" + searchParamsURL.toString(), {
        method: "GET"
    });


    try {
        const responseObj = await fetch(requestObj);

        if (responseObj.ok) {
            const filteredCities = await responseObj.json();
            showSearchHits(filteredCities);
        }

        if (!responseObj.ok) {
            const returnedError = await responseObj.json();
            handleError(returnedError);
        }

    } catch (error) {
        handleError(error);
    } finally {
        clearUserFields();
    }
}

function showSearchHits(filteredCities) {
    const feedbackText = document.querySelector(".feedbackText");
    const searchContainer = document.querySelector(".searchHitsField");
    searchContainer.innerHTML = "";
    feedbackText.innerHTML = "";

    if (!filteredCities || filteredCities.length === 0) {
        showFeedbackText("No search results found");
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

    const UIFields = document.querySelectorAll(".userInputField input");

    UIFields.forEach(currInput => {
        currInput.value = "";
    });

}

document.querySelector(".btnAdd").addEventListener("click", addCity);
document.querySelector(".btnSearch").addEventListener("click", searchCities);

init();