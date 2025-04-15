
function init() {
    const response = fetch("http://localhost:8000/cities")
        .then(handleResponse)
        .then(showCities)
        .catch(handleError);
}

function handleResponse(response) {
    return response.json();
}

function handleError(error) {
    console.error("ERROR", error)
}

function showCities(allCities) {
    const cityContainerDOM = document.querySelector(".cityBoxContainer");
    cityContainerDOM.innerHTML = "";

    for (let currCity of allCities) {
        const newCityBox = document.createElement("div");
        newCityBox.classList.add("cityBoox");

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
    const cityNameInput = document.querySelector(".UIAddCityName input").value;
    const countryNameInput = document.querySelector("UIAddCityCountry input").value;

    const newCityObj = {
        name: cityNameInput,
        country: countryNameInput
    }

    fetch("http://localhost:8000/cities",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newCityObj)
        }
    ).then(init()).catch(handleError);
}

function deleteCity(event) {
    const cityIdFromBtn = event.target.id.split('cityId-')[1]; 

    fetch(`http://localhost:8000/cities/${cityIdFromBtn}`, {
        method: "DELETE"
    }).then(init()).catch(handleError);
}






