const activities = [
  {id:"miroir",name:"Miroir d'eau et quais",category:"Loisirs",description:"Une promenade au bord de la Garonne et autour de la place de la Bourse.",place:"Bordeaux centre",lat:44.8413,lng:-0.5707,icon:"⌁"},
  {id:"jardin-public",name:"Jardin Public",category:"Nature",description:"Un grand jardin pour se promener, faire une pause ou profiter du plein air.",place:"Bordeaux centre",lat:44.8440,lng:-0.5794,icon:"✳"},
  {id:"darwin",name:"Darwin Écosystème",category:"Loisirs",description:"Un lieu de vie et de découverte sur la rive droite. Vérifie les activités et horaires proposés.",place:"Bordeaux rive droite",lat:44.8378,lng:-0.5518,icon:"↗"},
  {id:"capc",name:"CAPC – musée d'art contemporain",category:"Culture",description:"Un lieu culturel pour découvrir des expositions d'art contemporain.",place:"Bordeaux centre",lat:44.8492,lng:-0.5727,icon:"▧"},
  {id:"parc-bordelais",name:"Parc Bordelais",category:"Nature",description:"Un espace vert pour une balade ou un moment en plein air.",place:"Caudéran",lat:44.8567,lng:-0.6084,icon:"✳"},
  {id:"patinoire",name:"Patinoire de Bordeaux Mériadeck",category:"Sport",description:"Un équipement sportif pour pratiquer le patinage selon les séances ouvertes au public.",place:"Mériadeck",lat:44.8372,lng:-0.5885,icon:"◇"},
  {id:"musee-aquitaine",name:"Musée d'Aquitaine",category:"Culture",description:"Un musée pour découvrir l'histoire de Bordeaux et de sa région.",place:"Bordeaux centre",lat:44.8376,lng:-0.5762,icon:"▧"},
  {id:"parc-pey-berland",name:"Place Pey-Berland",category:"Culture",description:"Un point de départ pour découvrir le centre historique et ses monuments.",place:"Bordeaux centre",lat:44.8378,lng:-0.5792,icon:"⌂"}
];
const $ = selector => document.querySelector(selector);
let map;
let markerLayer;
const categoryColors = {Culture:"#172d35",Sport:"#a77e53",Nature:"#6f8877",Loisirs:"#c18d5c",Famille:"#8b8170"};

function activityCard(item){
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name+" "+item.place+" Bordeaux")}`;
  return `<article class="activity-card"><div class="card-top"><span class="tag">${item.category} · ${item.place}</span><span class="card-symbol" aria-hidden="true">${item.icon}</span></div><h3>${item.name}</h3><p>${item.description}</p><div class="card-bottom"><span>Lieu à découvrir</span><a class="mini-link" href="${mapsUrl}" target="_blank" rel="noopener">Voir sur Maps ↗</a></div></article>`;
}
function renderActivities(){
  const query = ($('#searchInput')?.value || '').trim().toLocaleLowerCase('fr');
  const category = $('#categoryFilter')?.value || 'Toutes';
  const filtered = activities.filter(item => (category === 'Toutes' || item.category === category) && `${item.name} ${item.description} ${item.category} ${item.place}`.toLocaleLowerCase('fr').includes(query));
  $('#allCards').innerHTML = filtered.length ? filtered.map(activityCard).join('') : '<p>Aucun lieu ne correspond à ta recherche.</p>';
}
function initMap(){
  if(map || !window.L || !$('#activityMap')) return;
  map = L.map('activityMap').setView([44.8378,-0.5792],12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
  renderMapMarkers();
}
function renderMapMarkers(){
  if(!map || !markerLayer) return;
  markerLayer.clearLayers();
  const category = $('#mapCategory')?.value || 'Toutes';
  activities.filter(item => category === 'Toutes' || item.category === category).forEach(item => {
    const color = categoryColors[item.category] || '#172d35';
    const marker = L.circleMarker([item.lat,item.lng],{radius:9,color:'#fff',weight:2,fillColor:color,fillOpacity:1});
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name+" Bordeaux")}`;
    marker.bindPopup(`<div class="map-popup"><strong>${item.name}</strong><span>${item.category} · ${item.place}</span><br><a href="${mapsUrl}" target="_blank" rel="noopener">Itinéraire Google Maps ↗</a></div>`);
    marker.addTo(markerLayer);
  });
}
function navigate(){
  const route = location.hash.slice(1) || 'accueil';
  const allowed = ['accueil','activites','carte','evenements','etudiants','decouvrir'];
  const target = allowed.includes(route) ? route : 'accueil';
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  $('#page-'+target).classList.add('active');
  document.querySelectorAll('#mainNav a').forEach(link => link.classList.toggle('selected',link.getAttribute('href') === '#'+target));
  $('#mainNav').classList.remove('open');
  $('#menuToggle').setAttribute('aria-expanded','false');
  window.scrollTo(0,0);
  if(target === 'carte'){
    initMap();
    setTimeout(()=>map && map.invalidateSize(),100);
  }
}
$('#menuToggle').addEventListener('click',()=>{
  const isOpen = $('#mainNav').classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded',String(isOpen));
});
$('#searchInput').addEventListener('input',renderActivities);
$('#categoryFilter').addEventListener('change',renderActivities);
$('#mapCategory').addEventListener('change',renderMapMarkers);
$('#studentCategory').addEventListener('change',event=>{
  const category=event.target.value;
  document.querySelectorAll('.student-card').forEach(card=>card.hidden=category!=='Toutes'&&card.dataset.category!==category);
});
document.querySelectorAll('[data-go-category]').forEach(link=>link.addEventListener('click',()=>{
  const category=link.dataset.goCategory;
  $('#categoryFilter').value=category;
  renderActivities();
}));
window.addEventListener('hashchange',navigate);
renderActivities();
navigate();
