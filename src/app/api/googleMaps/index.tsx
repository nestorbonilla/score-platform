let map: google.maps.Map;
let service: google.maps.places.PlacesService;
let infowindow: google.maps.InfoWindow;

function initMap(): void {
  const defaultLocation = new google.maps.LatLng(0, 0);
  infowindow = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center: defaultLocation,
    zoom: 15,
  });

  // input elements
  const locationInput = document.createElement("input");
  locationInput.placeholder = "Enter location";
  const searchInput = document.createElement("input");
  searchInput.placeholder = "Enter search query";
  const searchButton = document.createElement("button");
  searchButton.textContent = "Search";

  // add input elements to the map
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(locationInput);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchButton);

  // add click event listener to the search button
  searchButton.addEventListener("click", () => {
    const location = locationInput.value;
    const query = searchInput.value;
    searchLocation(location, query);
  });

  service = new google.maps.places.PlacesService(map);
}

function searchLocation(location: string, query: string): void {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: location }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
      const locationLatLng = results[0].geometry.location;
      map.setCenter(locationLatLng);

      const request = {
        query: query,
        fields: ["name", "geometry", "place_id"],
        locationBias: locationLatLng,
      };

      service.findPlaceFromQuery(
        request,
        (
          results: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus
        ) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            for (const place of results) {
              createMarker(place);
              getPlaceDetails(place.place_id!);
            }
          }
        }
      );
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

function createMarker(place: google.maps.places.PlaceResult) {
  if (!place.geometry || !place.geometry.location) return;

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });

  google.maps.event.addListener(marker, "click", () => {
    infowindow.setContent(place.name || "");
    infowindow.open(map, marker);
  });
}

function getPlaceDetails(placeId: string) {
  const request = {
    placeId: placeId,
    fields: [
      "name",
      "rating",
      "user_ratings_total",
      "photos",
      "opening_hours",
    ],
  };

  service.getDetails(request, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
      let content = `<b>${place.name}</b>`;
      if (place.rating) {
        content += `<br>Rating: ${place.rating}`;
      }
      if (place.user_ratings_total) {
        content += `<br>Reviews: ${place.user_ratings_total}`;
      }
      if (place.photos && place.photos.length > 0) {
        content += `<br><img src="${place.photos[0].getUrl({ maxHeight: 100 })}" alt="Place photo">`;
      }
      if (place.opening_hours && place.opening_hours.periods) {
        content += `<br><b>Opening Hours:</b><br>`;
        for (const period of place.opening_hours.periods) {
          const openTime = period.open?.time || "N/A";
          const closeTime = period.close?.time || "N/A";
          content += `Day ${period.open?.day}: ${openTime} - ${closeTime}<br>`;
        }
      }
      infowindow.setContent(content);
    } else {
      console.error("Error getting place details:", status);
    }
  });
}



declare global {
  interface Window {
    initMap: () => void;
  }
}

window.initMap = initMap;
export {};
