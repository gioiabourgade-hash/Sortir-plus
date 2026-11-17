/* SORTIR+ V17 — extensions sans modification des droits Supabase */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const escape = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateISO = d => [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  function renderWeekend(){
    if (!$('#weekendCards') || typeof eventData === 'undefined') return;
    const now=new Date(); const day=now.getDay(); const friday=new Date(now);friday.setDate(now.getDate()+((5-day+7)%7));
    if(day===6||day===0)friday.setDate(now.getDate()-(day===6?1:2));
    const sunday=new Date(friday);sunday.setDate(friday.getDate()+2);
    const a=dateISO(friday),b=dateISO(sunday);
    $('#weekendDates').textContent=`Du ${friday.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})} au ${sunday.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}`;
    const items=eventData.filter(e=>e.start<=b && e.end>=a).sort((x,y)=>x.start.localeCompare(y.start));
    $('#weekendCards').innerHTML=items.length?items.map(e=>`<article class="weekend-card"><span class="tag">${escape(e.category)}</span><h2>${escape(e.title)}</h2><p>📅 ${escape(e.start)}${e.end!==e.start?' au '+escape(e.end):''}</p><p>📍 ${escape(e.place)}</p><p>${escape(e.description)}</p><p><strong>${escape(e.hours||'Horaires à vérifier')}</strong></p><p>${escape(e.price||'Tarif à vérifier')}</p><a href="${/^https:\/\//.test(e.source||'')?escape(e.source):'https://www.bordeaux-tourisme.com/agenda.html'}" target="_blank" rel="noopener noreferrer">Source et informations ↗</a></article>`).join(''):'<p>Aucun événement confirmé pour ce week-end dans notre sélection. Consulte la rubrique Événements pour les prochaines dates.</p>';
  }
  window.addEventListener('sortir:events',renderWeekend);document.addEventListener('DOMContentLoaded',renderWeekend);
  // Recherche sur la carte et marqueurs des restaurants : aucune donnée inventée.
  let mapSearch='';
  $('#mapSearch')?.addEventListener('input',e=>{mapSearch=e.target.value.trim().toLocaleLowerCase('fr');if(typeof renderMapMarkers==='function')renderMapMarkers();});
  const originalMapRender=window.renderMapMarkers;
  if(typeof originalMapRender==='function')window.renderMapMarkers=function(){
    originalMapRender();if(!window.markerLayer||!window.L)return;
    const cat=$('#mapCategory')?.value||'Toutes';
    if(mapSearch){markerLayer.eachLayer(layer=>{const t=layer.getPopup()?.getContent()?.replace(/<[^>]*>/g,' ').toLocaleLowerCase('fr')||'';if(!t.includes(mapSearch))markerLayer.removeLayer(layer);});}
    if(cat!=='Toutes'&&cat!=='Restaurants')return;
    // Les adresses des restaurants sont consultables dans leurs fiches ;
    // pas de marqueur géographique sans coordonnées vérifiées.

  };
  // Carnet d'avis personnel : aucune fausse note publique.
  const key='sortirPlusPrivateReviewsV1';let reviews=[];try{reviews=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(reviews))reviews=[];}catch(_){reviews=[];}
  function showReviews(){const node=$('#localReviewList');if(!node)return;node.innerHTML=reviews.length?reviews.map((r,i)=>`<div class="private-review"><strong>${escape(r.place)} · ${escape(r.rating)}/5</strong><p>${escape(r.text)}</p><button type="button" data-remove-review="${i}">Supprimer</button></div>`).join(''):'<p>Aucun avis personnel enregistré pour le moment.</p>';}
  $('#localReviewForm')?.addEventListener('submit',e=>{e.preventDefault();reviews.unshift({place:$('#localReviewPlace').value.trim().slice(0,100),rating:$('#localReviewRating').value,text:$('#localReviewText').value.trim().slice(0,500)});reviews=reviews.slice(0,50);try{localStorage.setItem(key,JSON.stringify(reviews));}catch(_){}e.target.reset();showReviews();});
  $('#localReviewList')?.addEventListener('click',e=>{const b=e.target.closest('[data-remove-review]');if(!b)return;reviews.splice(Number(b.dataset.removeReview),1);try{localStorage.setItem(key,JSON.stringify(reviews));}catch(_){}showReviews();});showReviews();
})();
