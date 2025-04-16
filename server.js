
const cities = [
  { id: 2, name: "Lille", country: "France" },
  { id: 3, name: "Nantes", country: "France" },
  { id: 5, name: "Bremen", country: "Germany" },
  { id: 10, name: "Dresden", country: "Germany" },
  { id: 11, name: "Heidelberg", country: "Germany" },
  { id: 12, name: "Venice", country: "Italy" },
  { id: 13, name: "Rome", country: "Italy" },
  { id: 16, name: "Graz", country: "Austria" },
  { id: 20, name: "Basel", country: "Switzerland" },
  { id: 21, name: "Lucerne", country: "Switzerland" },
  { id: 22, name: "Kraków", country: "Poland" },
  { id: 23, name: "Warsaw", country: "Poland" },
  { id: 24, name: "Poznań", country: "Poland" },
  { id: 28, name: "Ghent", country: "Belgium" },
  { id: 31, name: "Maastricht", country: "Netherlands" },
  { id: 38, name: "Maribor", country: "Slovenia" },
  { id: 42, name: "Strasbourg", country: "France" },
];


async function handler(req) {

  const reqMethod = req.method;
  const reqUrl = new URL(req.url);
  const reqPathname = reqUrl.pathname;
  const reqParamText = reqUrl.searchParams.get("text");
  const reqParamCountry = reqUrl.searchParams.get("country");


  if (reqPathname === "/cities/search" && reqMethod == "GET") {

    if (!reqParamText) {
      return new Response(JSON.stringify("Missing 'text' parameter"), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const filteredCities = cities.filter(currCity => {
      const nameMatches = currCity.name.toLowerCase().includes(reqParamText.toLowerCase());

      if (reqParamCountry) {
        return nameMatches && currCity.country.toLowerCase() === reqParamCountry.toLowerCase();
      }

      return nameMatches;
    });

    return new Response(JSON.stringify(filteredCities), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  }

  if (reqPathname.startsWith("/cities/") && reqMethod === "GET") {
    const id = parseInt(reqPathname.split("/")[2]);
    const city = cities.find(c => c.id === id);
    if (!city) {
      return new Response("City not found", {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(city), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (reqPathname == "/cities" && reqMethod == "GET") {

    return new Response(JSON.stringify(cities), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (reqPathname == "/cities" && reqMethod == "POST") {
    const reqBody = await req.json();

    if (!reqBody.name || !reqBody.country) {
      return new Response(JSON.stringify("Missing input data, either city or country."), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const existingCity = cities.some(currCity => currCity.name.toLowerCase() === reqBody.name.toLowerCase());

    if (existingCity) {
      return new Response(JSON.stringify("The city already exists."), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }

    let maxIdOfCity = 0;
    for (const currCity of cities) {
      if (currCity.id > maxIdOfCity) {
        maxIdOfCity = currCity.id;
      }
    }

    const newCityObj = {
      id: maxIdOfCity + 1,
      name: reqBody.name,
      country: reqBody.country
    };

    cities.push(newCityObj);

    return new Response(JSON.stringify(newCityObj), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }


  if (reqPathname == "/cities" && reqMethod == "DELETE") {
    const reqBody = await req.json();

    if (!reqBody.id) {
      return new Response(JSON.stringify("Missing an ID"), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    let cityInx = -1;
    for (let i = 0; i < cities.length; i++) {
      if (cities[i].id === reqBody.id) {
        cityInx = i;
        break;
      }
    }

    if (cityInx == -1) {
      return new Response(JSON.stringify("No matching ID found."), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    } else {

      cities.splice(cityInx, 1); // ***

      return new Response(JSON.stringify("Delete OK"), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })

    }



  }

  return new Response(JSON.stringify(""), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  })


}

Deno.serve(handler)

