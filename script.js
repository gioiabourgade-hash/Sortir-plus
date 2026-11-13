const activities = [
  {id:"ceramique", name:"Atelier céramique", category:"Créatif", price:24, description:"Découvre la poterie et façonne ton propre objet.", emoji:"🏺", place:"Bordeaux"},
  {id:"escape", name:"Escape game", category:"Jeux", price:22, description:"Une aventure à résoudre en équipe.", emoji:"🔐", place:"Bordeaux"},
  {id:"escalade", name:"Escalade en salle", category:"Sport", price:16, description:"Bouge et relève un nouveau défi.", emoji:"🧗", place:"Bordeaux Métropole"},
  {id:"peinture", name:"Atelier peinture", category:"Créatif", price:29, description:"Un moment créatif à partager.", emoji:"🎨", place:"Bordeaux"},
  {id:"balade", name:"Balade découverte", category:"Sortie", price:12, description:"Redécouvre la ville autrement.", emoji:"🚶", place:"Bordeaux"},
  {id:"quiz", name:"Quiz entre amis", category:"Jeux", price:18, description:"Teste tes connaissances en équipe.", emoji:"💡", place:"Bordeaux"}
];
const COMMISSION_RATE = 0.10; // Taux indicatif de démonstration, à négocier avec les partenaires.
const $ = selector => document.querySelector(selector);
const euro = amount => new Intl.NumberFormat("fr-FR", {style:"currency", currency:"EUR"}).format(amount);

function activityCard(activity) {
  return `<article class="activity-card">
    <div class="card-visual" aria-hidden="true">${activity.emoji}</div>
    <div class="card-body">
      <span class="tag">${activity.category} · ${activity.place}</span>
      <h3>${activity.name}</h3>
      <p>${activity.description}</p>
      <div class="card-bottom"><span class="price">${euro(activity.price)} / pers.</span>
      <button class="mini-btn" type="button" data-book="${activity.id}">Choisir →</button></div>
    </div></article>`;
}
function renderCards() {
  $("#featuredCards").innerHTML = activities.slice(0,3).map(activityCard).join("");
  filterCards();
}
function filterCards() {
  const query = ($("#searchInput")?.value || "").trim().toLocaleLowerCase("fr");
  const category = $("#categoryFilter")?.value || "Toutes";
  const results = activities.filter(item =>
    (category === "Toutes" || item.category === category) &&
    `${item.name} ${item.description} ${item.category} ${item.place}`.toLocaleLowerCase("fr").includes(query)
  );
  $("#allCards").innerHTML = results.length ? results.map(activityCard).join("") : "<p>Aucune activité ne correspond à ta recherche.</p>";
}
function fillSelect() {
  $("#activity").innerHTML = activities.map(item => `<option value="${item.id}">${item.name} — ${euro(item.price)} / personne</option>`).join("");
}
function navigate() {
  const route = location.hash.slice(1) || "accueil";
  const allowed = ["accueil","activites","reservation","partenaires","infos"];
  const target = allowed.includes(route) ? route : "accueil";
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  $("#page-" + target).classList.add("active");
  document.querySelectorAll("#mainNav a").forEach(link => link.classList.toggle("selected", link.getAttribute("href") === "#" + target));
  $("#mainNav").classList.remove("open");
  window.scrollTo(0,0);
}
function updateSummary() {
  const item = activities.find(activity => activity.id === $("#activity").value) || activities[0];
  const guests = Number($("#guests").value);
  const subtotal = item.price * guests;
  const commission = subtotal * COMMISSION_RATE;
  $("#summaryTotal").textContent = euro(subtotal);
  $("#summaryCommission").textContent = euro(commission);
  $("#summaryClient").textContent = euro(subtotal);
}
document.addEventListener("click", event => {
  const button = event.target.closest("[data-book]");
  if (!button) return;
  $("#activity").value = button.dataset.book;
  updateSummary();
  location.hash = "#reservation";
});
$("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
$("#searchInput").addEventListener("input", filterCards);
$("#categoryFilter").addEventListener("change", filterCards);
$("#activity").addEventListener("change", updateSummary);
$("#guests").addEventListener("change", updateSummary);

const dateInput = $("#date");
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0,10);
dateInput.min = localToday;
dateInput.value = localToday;

$("#bookingForm").addEventListener("submit", event => {
  event.preventDefault();
  const chosen = activities.find(item => item.id === $("#activity").value);
  const date = $("#date").value;
  const guests = Number($("#guests").value);
  if (!chosen || !date || date < localToday) {
    $("#bookingResult").textContent = "Vérifie l'activité et choisis une date valide.";
    return;
  }
  updateSummary();
  $("#bookingResult").innerHTML = `<strong>Récapitulatif prêt — démonstration uniquement.</strong><br>
    ${chosen.name} · ${guests} participant(s) · ${new Date(date + "T12:00:00").toLocaleDateString("fr-FR")}.<br>
    Aucun paiement n'a été effectué et aucune réservation n'a été envoyée.`;
});
$("#partnerInterest").addEventListener("click", () => {
  const business = $("#business").value.trim();
  const offer = $("#offer").value.trim();
  $("#partnerResult").textContent = business && offer
    ? "Merci ! Ton exemple de partenariat est prêt à être discuté. Cette maquette ne transmet pas ces informations."
    : "Ajoute un nom d'établissement et une courte description de l'activité pour préparer ton exemple.";
});
window.addEventListener("hashchange", navigate);
renderCards();
fillSelect();
updateSummary();
navigate();