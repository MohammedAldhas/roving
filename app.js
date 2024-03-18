const apiKey = "282da9b2-6da1-4854-812b-3cd41f436bf2";

const map = new mapgl.Map("map", {
  center: [46.71167, 24.640437],
  zoom: 12,
  key: apiKey,
  lang: "ar",
  copyright: false,
  scaleControl: "topLeft",
  zoomControl: "bottomRight",
  floorControl: "bottomLeft",
  trafficControl: "topRight",
  useRtlTextPlugin: "always-on",
});

//gecoder API
async function geocoderAPI(lang, lat) {
  const response = await fetch(
    `https://catalog.api.2gis.com/3.0/items/geocode?lon=${lang}&lat=${lat}&fields=items.point&key=${apiKey}`
  );
  const data = await response.json();
  return data;
}

//map detailes
const mainInfo = document.querySelector(".info");
const info = document.querySelector(".info p");
const infos = document.querySelectorAll(".info p span");

//map detailes
map.on("click", async (e) => {
  //   if (map._impl.values.zoom1 >= 15) {
  try {
    const data = await geocoderAPI(e.lngLat[0], e.lngLat[1]);
    mainInfo.style.display = "block";
    info.innerHTML = `<h3>${data.result.items[0].full_name}</h3>`;
    let infdata = [e.lngLat[0], e.lngLat[1], e.point[0], e.point[0]];
    infos.forEach((span, i) => {
      span.innerHTML = infdata[i];
    });
  } catch (error) {
    console.error("Error", error);
  }
});

//remove
map.on("mouseout", () => {
  tooltip.style.display = "none";
});

// input
const searchBox = `<input type="text" id="search">`;
new mapgl.Control(map, searchBox, {});

const suggestBox = `<div id="suggest"></div>`;
new mapgl.Control(map, suggestBox, {});

const search = document.getElementById("search");
const suggest = document.getElementById("suggest");
suggest.style.display = "none";

search.addEventListener("input", function () {
  searchAPI(this.value);
  suggest.style.display = "block";
});

//show all places
const cont = document.querySelector(".cont");
search.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    cont.innerHTML = "";

    searchAPI(this.value).then((result) => {
      // Enter
      result.forEach((d) => {
        let places = document.createElement("div");
        places.classList = "places";
        let tex = document.createElement("p");

        places.appendChild(tex);
        cont.appendChild(places);
        tex.innerText = `Name: ${d.name}\n Location: ${d.address_name}\nType: ${d.type}`;
      });
    });
  }
});

//remove when not focus
search.addEventListener("focusout", function () {
  suggest.style.display = "none";
  search.value = "";
});

//Suggest API
async function searchAPI(input) {
  const response = await fetch(
    `https://catalog.api.2gis.com/3.0/suggests?q=${input}&location=46.711670,24.640437&key=${apiKey}&locale=en_SA`
  );
  const data = await response.json();
  const result = await data.result.items;

  suggest.innerHTML = "";

  result.forEach((e, i) => {
    let div = document.createElement("div");
    div.setAttribute("id", e.id);
    div.setAttribute(
      "title",
      e.full_name || e.address_name || "" + "\n" + e.name
    );

    typeof Number(search.value) != ""
      ? (suggest.style.display = "none")
      : (suggest.style.display = "block");
    div.innerText = e.name;
    suggest.appendChild(div);
  });

  // Show suggestbox
  suggest.style.display = "block";
  return result;
}

//Directions
const directions = new mapgl.Directions(map, {
  directionsApiKey: apiKey,
});

const dir = `<button id="dir">direction</button> `;
new mapgl.Control(map, dir, {
  position: "topLeft",
});
const dirictionBtn = document.getElementById("dir");

const controlRest = `<button id="reset" style="display: none;">Reset points</button> `;
new mapgl.Control(map, controlRest, {
  position: "topLeft",
});
const resetButton = document.getElementById("reset");

dirictionBtn.addEventListener("click", function () {
  // resetButton.classList.toggle("restBlock")
  if (resetButton.style.display === "block") {
    resetButton.style.display = "none";
  } else if (resetButton.style.display === "none") {
    resetButton.style.display = "block";
    link();
  }
});

function link() {
  const markers = [];
  const flag = [];

  let firstPoint;
  let secondPoint;
  // A current selecting point
  let selecting = "a";

  resetButton.addEventListener("click", function () {
    selecting = "a";
    firstPoint = undefined;
    secondPoint = undefined;
    directions.clear();
  });

  map.on("click", (e) => {
    const coords = e.lngLat;

    if (selecting != "end") {
      // Just to visualize selected points, before the route is done
      markers.push(
        new mapgl.Marker(map, {
          coordinates: coords,
          icon: "https://docs.2gis.com/img/dotMarker.svg",
        })
      );
    }

    if (selecting === "a") {
      firstPoint = coords;
      selecting = "b";
    } else if (selecting === "b") {
      secondPoint = coords;
      selecting = "end";
    }

    // If all points are selected — we can draw the route
    if (firstPoint && secondPoint) {
      directions.carRoute({
        points: [firstPoint, secondPoint],
      });
      markers.forEach((m) => {
        m.destroy();
      });
    }
  });
  // dirictionBtn.addEventListener('click',resetButton.remove())
}

// ========

// map.on('click', (e) => {
//     flag.push(new mapgl.Marker(map, {
//         coordinates: [e.lngLat[0],e.lngLat[1]],
//         label: {
//             text: "The marker's label",
//         },

//     }));

// });
