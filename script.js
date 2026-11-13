const activities=[
{name:"Atelier céramique",category:"Créatif",price:"Dès 20 €",description:"Découvre la poterie et façonne ton propre objet.",emoji:"🏺"},
{name:"Escape game",category:"Jeux",price:"Dès 18 €",description:"Une aventure à résoudre en équipe.",emoji:"🔐"},
{name:"Escalade en salle",category:"Sport",price:"Dès 12 €",description:"Bouge et relève un nouveau défi.",emoji:"🧗"},
{name:"Atelier peinture",category:"Créatif",price:"Dès 25 €",description:"Un moment créatif à partager.",emoji:"🎨"},
{name:"Balade découverte",category:"Sortie",price:"Dès 10 €",description:"Redécouvre la ville autrement.",emoji:"🚶"},
{name:"Quiz entre amis",category:"Jeux",price:"Dès 15 €",description:"Teste tes connaissances en équipe.",emoji:"💡"}
];
const $=s=>document.querySelector(s);
function card(a){return `<article class="activity-card"><div class="card-visual" aria-hidden="true">${a.emoji}</div><div class="card-body"><span class="tag">${a.category}</span><h3>${a.name}</h3><p>${a.description}</p><div class="card-bottom"><span class="price">${a.price}</span><button class="mini-btn" data-book="${a.name}">Découvrir →</button></div></div></article>`}
function renderCards(){const featured=activities.slice(0,3);$("#featuredCards").innerHTML=featured.map(card).join("");filterCards()}
function filterCards(){const q=($("#searchInput")?.value||"").toLowerCase();const c=$("#categoryFilter")?.value||"Toutes";const list=activities.filter(a=>(c==="Toutes"||a.category===c)&&(a.name+" "+a.description+" "+a.category).toLowerCase().includes(q));if($("#allCards"))$("#allCards").innerHTML=list.length?list.map(card).join(""):"<p>Aucune activité ne correspond à ta recherche.</p>"}
function fillSelect(){if($("#activity"))$("#activity").innerHTML=activities.map(a=>`<option>${a.name}</option>`).join("")}
function navigate(){const route=location.hash.replace("#","")||"accueil";const allowed=["accueil","activites","reservation","partenaires","espace"];const target=allowed.includes(route)?route:"accueil";document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));$("#page-"+target).classList.add("active");document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("selected",a.getAttribute("href")==="#"+target));$("#mainNav").classList.remove("open");window.scrollTo(0,0)}
document.addEventListener("click",e=>{const b=e.target.closest("[data-book]");if(b){$("#activity").value=b.dataset.book;location.hash="#reservation"}});
$("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
$("#searchInput")?.addEventListener("input",filterCards);$("#categoryFilter")?.addEventListener("change",filterCards);
$("#bookingForm").addEventListener("submit",e=>{e.preventDefault();$("#bookingResult").innerHTML="<strong>Demande de démonstration préparée.</strong><br>Ce prototype n'envoie pas la demande. Avant toute vraie réservation, le formulaire devra être relié à un outil sécurisé et les conditions de réservation devront être affichées.";});
$("#partnerForm").addEventListener("submit",e=>{e.preventDefault();$("#partnerResult").innerHTML="<strong>Merci pour votre intérêt !</strong><br>Ce formulaire est une maquette et n'envoie pas encore votre proposition. Contact et accord de partenariat à mettre en place avant le lancement.";});
window.addEventListener("hashchange",navigate);renderCards();fillSelect();navigate();
