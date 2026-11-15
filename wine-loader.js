// SORTIR+ V16.3 — Indicateur uniquement pour chargement long ou connexion perdue.
(function(){
  'use strict';
  const layer=document.getElementById('wineTransition');
  if(!layer)return;
  const liquid=layer.querySelector('.wine-transition__liquid');
  const wave=layer.querySelector('.wine-transition__wave');
  const title=layer.querySelector('.wine-transition__caption');
  const detail=layer.querySelector('.wine-transition__progress');
  let visible=false,frame=0,started=0,slowTimer=null,limitTimer=null;
  function fill(amount,t){
    const y=404-195*amount;const ripple=2*Math.sin(t/220);
    const d=`M250 ${y} Q315 ${y-5-ripple} 380 ${y} T510 ${y} L510 420 L250 420 Z`;
    liquid.setAttribute('d',d);
    wave.setAttribute('d',`M250 ${y} Q315 ${y-5-ripple} 380 ${y} T510 ${y}`);
  }
  function tick(t){
    if(!visible)return;
    const amount=.04+.82*(1-Math.exp(-(t-started)/3400));
    fill(amount,t);frame=requestAnimationFrame(tick);
  }
  function show(offline){
    if(visible)return;
    visible=true;started=performance.now();
    title.textContent=offline?'CONNEXION INTERROMPUE':'CHARGEMENT EN COURS…';
    detail.textContent=offline?'Vérifie ta connexion Internet.':'Un instant, Bordeaux arrive…';
    layer.classList.add('is-loading');frame=requestAnimationFrame(tick);
    if(!offline)limitTimer=setTimeout(hide,9000);
  }
  function hide(){
    clearTimeout(limitTimer);visible=false;cancelAnimationFrame(frame);layer.classList.remove('is-loading');
  }
  // Pas d’animation pour un changement normal de rubrique.
  // Affichage seulement si la page met du temps à finir de charger.
  if(document.readyState!=='complete') {
    slowTimer=setTimeout(()=>{if(document.readyState!=='complete'&&navigator.onLine)show(false)},850);
    window.addEventListener('load',()=>{clearTimeout(slowTimer);if(navigator.onLine)hide()},{once:true});
  }
  if(!navigator.onLine)show(true);
  window.addEventListener('offline',()=>{clearTimeout(limitTimer);show(true);title.textContent='CONNEXION INTERROMPUE';detail.textContent='Vérifie ta connexion Internet.'});
  window.addEventListener('online',hide);
})();
