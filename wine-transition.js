
// V16.1 — transition spectaculaire uniquement entre les rubriques publiques.
// Le hash et la navigation historique restent identiques à la version 15.6.
(function(){
  const layer=document.getElementById('wineTransition');
  if(!layer)return;
  const allowed=new Set(['accueil','activites','carte','evenements','etudiants','decouvrir','culture','histoire','restaurants','avis','contact']);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let busy=false;
  document.addEventListener('click',function(e){
    const link=e.target.closest('a[href^="#"]');
    if(!link||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const next=link.getAttribute('href').slice(1);
    const current=location.hash.slice(1)||'accueil';
    if(!allowed.has(next)||next===current||reduced.matches||busy)return;
    e.preventDefault();busy=true;
    layer.classList.remove('is-playing');void layer.offsetWidth;
    layer.classList.add('is-playing');
    window.setTimeout(function(){location.hash=next;},980);
    window.setTimeout(function(){layer.classList.remove('is-playing');busy=false;},1900);
  },true);
})();
