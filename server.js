
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

const headersCORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

async function handler(req) {

  const reqMethod = req.method;
  const reqUrl = new URL(req.url);

  const reqPathname = reqUrl.pathname;
  const reqParamCity = reqUrl.searchParams.get("city");
  const reqParamCountry = reqUrl.searchParams.get("country");

  if (reqUrl.pathname === "/" || reqUrl.pathname === "/index.html") {
    const htmlFile = await Deno.readTextFile("index.html");
    return new Response(htmlFile, {
      status: 200,
      headers: { "Content-Type": "text/html", ...headersCORS },
    });
  }

  if (reqUrl.pathname === "/style.css") {
    const cssFile = await Deno.readTextFile("style.css");
    return new Response(cssFile, {
      status: 200,
      headers: { "Content-Type": "text/css", ...headersCORS },
    });
  }

  if (reqUrl.pathname === "/index.js") {
    const js = await Deno.readTextFile("index.js");
    return new Response(js, {
      status: 200,
      headers: { "Content-Type": "application/javascript", ...headersCORS }
    });
  }

  if (reqUrl.pathname === "/test.html") {
    const testFile = await Deno.readTextFile("test.html");
    return new Response(testFile, {
      status: 200,
      headers: { "Content-Type": "text/html", ...headersCORS }
    });
  }

  if (reqUrl.pathname === "/test.js") {
    const testJsFile = await Deno.readTextFile("test.js");
    return new Response(testJsFile, {
      status: 200,
      headers: { "Content-Type": "application/javascript", ...headersCORS }
    });
  }



  if (reqMethod == "GET") {

    if (reqPathname === "/cities/search") {
      if (!reqParamCity) {
        return new Response(JSON.stringify({ message: "Enter a city name." }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...headersCORS }
        });
      }

      const filteredCities = cities.filter(currCity => {
        const nameMatches = currCity.name.toLowerCase().includes(reqParamCity.toLowerCase());

        if (reqParamCountry) {
          return nameMatches && currCity.country.toLowerCase() === reqParamCountry.toLowerCase();
        }

        return nameMatches;
      });

      return new Response(JSON.stringify(filteredCities), {
        status: 200,
        headers: { "Content-Type": "application/json", ...headersCORS }
      })
    }

    if (reqPathname.startsWith("/cities/")) {
      const id = parseInt(reqPathname.split("/")[2]);
      const city = cities.find(curr => curr.id === id);

      if (!city) {
        return new Response(JSON.stringify({ message: "No city found." }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...headersCORS }
        });
      }
      return new Response(JSON.stringify(city), {
        status: 200,
        headers: { "Content-Type": "application/json", ...headersCORS }
      });
    }

    if (reqPathname == "/cities") {

      const citiesObj = [];

      for (let currCity of cities) {
        const currCityObj = {
          id: currCity.id,
          name: currCity.name,
          country: currCity.country
        }
        citiesObj.push(currCityObj);
      }

      return new Response(JSON.stringify(citiesObj), {
        status: 200,
        headers: { "Content-Type": "application/json", ...headersCORS }
      })
    }

  }

  if (reqMethod == "POST") {

    if (reqPathname == "/cities") {
      const reqBody = await req.json();

      if (!reqBody.name || !reqBody.country) {
        return new Response(JSON.stringify({ message: "Missing either city or country" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...headersCORS }
        });
      }

      const existingCity = cities.some(currCity => currCity.name.toLowerCase() === reqBody.name.toLowerCase());

      if (existingCity) {
        return new Response(JSON.stringify([]), {
          status: 409,
          headers: { "Content-Type": "application/json", ...headersCORS }
        });
      }

      if (reqBody.name || reqBody.country) {
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
          headers: { "Content-Type": "application/json", ...headersCORS }
        });
      }

    }

  }

  if (reqMethod == "DELETE") {

    if (reqPathname == "/cities") {

      let reqBody = {} 
      let requestWithoutBody = false;
    
      if (req.headers.get("Content-Length") > 0  ) {
        reqBody = await req.json();
      } else {
        requestWithoutBody = true;
      }
    
      if (!reqBody.id || requestWithoutBody) {
        return new Response(JSON.stringify({ message: "Missing city ID." }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...headersCORS }
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
        return new Response(JSON.stringify({ message: "No matching city ID found." }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...headersCORS }
        });
      } else {

        cities.splice(cityInx, 1);

        return new Response(JSON.stringify({ message: "Delete OK" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...headersCORS }
        })
      }
    }

    if (reqPathname == "/mordor") {
      return new Response(JSON.stringify({ message: "Invalid endpoint." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...headersCORS }
      })
    }

    return new Response(JSON.stringify({ message: "Invalid endpoint." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...headersCORS }
    })

  }


  return new Response(JSON.stringify({ message: "Invalid endpoint." }), {
    status: 400,
    headers: { "Content-Type": "application/json", ...headersCORS }
  })


}

Deno.serve(handler)