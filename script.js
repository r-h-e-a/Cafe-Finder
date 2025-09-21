// 🎀 Floating ribbons
const ribbonEmojis = ["🎀","✨"];
const welcome = document.getElementById('welcome');
function createRibbon(){
  const ribbon = document.createElement('div');
  ribbon.className='ribbon';
  ribbon.textContent=ribbonEmojis[Math.floor(Math.random()*ribbonEmojis.length)];
  ribbon.style.left=Math.random()*100+'vw';
  ribbon.style.animationDuration=(5+Math.random()*5)+'s';
  welcome.appendChild(ribbon);
  setTimeout(()=>ribbon.remove(),10000);
}
setInterval(createRibbon,500);

// 🌍 Map init
const map = L.map('map');
const cafeListEl = document.getElementById('cafeList');
const restaurantListEl = document.getElementById('restaurantList');
const dessertListEl = document.getElementById('dessertList');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap contributors' }).addTo(map);

const cafeIcon = L.icon({iconUrl:'https://cdn-icons-png.flaticon.com/512/2965/2965567.png', iconSize:[30,30]});
const restaurantIcon = L.icon({iconUrl:'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', iconSize:[30,30]});
const dessertIcon = L.icon({iconUrl:'https://cdn-icons-png.flaticon.com/512/2910/2910766.png', iconSize:[30,30]});

let userLat, userLon, routingControl;
let searchRadius = 5000;
let placesLayer = L.layerGroup().addTo(map);

function updateRadius(){
  const km = document.getElementById("radiusInput").value;
  searchRadius = km * 1000;
  if(userLat && userLon){
    fetchPlaces(userLat, userLon);
  }
}

function fetchPlaces(lat, lon){
  cafeListEl.innerHTML='';
  restaurantListEl.innerHTML='';
  dessertListEl.innerHTML='';
  placesLayer.clearLayers();

  const query=`
    [out:json];
    (
      node["amenity"="cafe"](around:${searchRadius},${lat},${lon});
      node["amenity"="restaurant"](around:${searchRadius},${lat},${lon});
      node["amenity"="ice_cream"](around:${searchRadius},${lat},${lon});
      node["shop"="dessert"](around:${searchRadius},${lat},${lon});
    );
    out;
  `;
  const url="https://overpass-api.de/api/interpreter?data="+encodeURIComponent(query);

  fetch(url).then(res=>res.json()).then(data=>{
    const cafes=data.elements.filter(el=>el.tags?.name && el.tags.amenity==="cafe");
    const restaurants=data.elements.filter(el=>el.tags?.name && el.tags.amenity==="restaurant");
    const desserts=data.elements.filter(el=>el.tags?.name && (el.tags.amenity==="ice_cream" || el.tags.shop==="dessert"));

    cafes.forEach(el=>{
      const marker=L.marker([el.lat,el.lon],{icon:cafeIcon}).bindPopup(`<b>${el.tags.name}</b><br>☕ Cafe`);
      placesLayer.addLayer(marker);
      const item=document.createElement('div'); item.className='place-item cafe-item'; item.textContent=`☕ ${el.tags.name}`;
      item.onclick=()=>{ map.setView([el.lat,el.lon],17); marker.openPopup(); goToPlace(el.lat,el.lon); };
      cafeListEl.appendChild(item);
    });

    restaurants.forEach(el=>{
      const marker=L.marker([el.lat,el.lon],{icon:restaurantIcon}).bindPopup(`<b>${el.tags.name}</b><br>🍴 Restaurant`);
      placesLayer.addLayer(marker);
      const item=document.createElement('div'); item.className='place-item restaurant-item'; item.textContent=`🍴 ${el.tags.name}`;
      item.onclick=()=>{ map.setView([el.lat,el.lon],17); marker.openPopup(); goToPlace(el.lat,el.lon); };
      restaurantListEl.appendChild(item);
    });

    desserts.forEach(el=>{
      const marker=L.marker([el.lat,el.lon],{icon:dessertIcon}).bindPopup(`<b>${el.tags.name}</b><br>🍦 Dessert`);
      placesLayer.addLayer(marker);
      const item=document.createElement('div'); item.className='place-item dessert-item'; item.textContent=`🍦 ${el.tags.name}`;
      item.onclick=()=>{ map.setView([el.lat,el.lon],17); marker.openPopup(); goToPlace(el.lat,el.lon); };
      dessertListEl.appendChild(item);
    });

    if(cafes.length===0) cafeListEl.innerHTML='<p>No named cafes nearby 😢</p>';
    if(restaurants.length===0) restaurantListEl.innerHTML='<p>No named restaurants nearby 😢</p>';
    if(desserts.length===0) dessertListEl.innerHTML='<p>No named desserts nearby 😢</p>';
  }).catch(err=>console.error(err));
}

function goToPlace(lat, lon){
  if(routingControl) map.removeControl(routingControl);
  routingControl=L.Routing.control({
    waypoints:[L.latLng(userLat,userLon), L.latLng(lat,lon)],
    routeWhileDragging:false,
    draggableWaypoints:false,
    addWaypoints:false
  }).addTo(map);
}

// 🚀 Start button
document.getElementById('startBtn').addEventListener('click',()=>{
  welcome.style.display='none';
  document.getElementById('mapContainer').style.display='flex';
  map.setView([28.6139,77.2090],14);
  map.locate({setView:true,maxZoom:16});

  map.on("locationfound", e=>{
    userLat=e.latitude; userLon=e.longitude;
    L.marker(e.latlng).addTo(map).bindPopup("📍 You are here").openPopup();
    fetchPlaces(userLat,userLon);
  });

  map.on("locationerror", ()=>{
    alert("Could not detect your location. Showing default (New Delhi).");
    userLat=28.6139; userLon=77.2090;
    fetchPlaces(userLat,userLon);
  });
});
