// SORTIR+ V16.2 — Vin progressif. Ne touche pas à Supabase ni aux formulaires.
(function(){
  'use strict';
  const layer=document.getElementById('wineTransition');
  if(!layer)return;
  const liquid=layer.querySelector('.wine-transition__liquid');
  const wave=layer.querySelector('.wine-transition__wave');
  const caption=layer.querySelector('.wine-transition__progress');
  const allowed=new Set(['accueil','activites','carte','evenements','etudiants','decouvrir','culture','histoire','restaurants','avis','contact']);
  const chapters=['accueil','activites','carte','evenements','etudiants'];
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let busy=false,level=0;
  try{level=Math.max(0,Math.min(1,Number(sessionStorage.getItem('sortirWineLevel'))||0));}catch(e){}
  const startSection=location.hash.slice(1)||'accueil';
  const initialIndex=chapters.indexOf(startSection);
  if(initialIndex>=0)level=initialIndex/4;
  function shape(amount,phase){
    // 405 = fond du calice ; 197 = près du bord. La surface reste ondulante.
    const y=405-208*amount;
    const ripple=amount>0.01?Math.sin(phase)*Math.min(7,2+amount*5):0;
    const c1=y-5-ripple,c2=y+5+ripple;
    liquid.setAttribute('d',`M250 ${y.toFixed(2)} Q315 ${c1.toFixed(2)} 380 ${y.toFixed(2)} T510 ${y.toFixed(2)} L510 420 L250 420 Z`);
    wave.setAttribute('d',`M250 ${y.toFixed(2)} Q315 ${c1.toFixed(2)} 380 ${y.toFixed(2)} T510 ${y.toFixed(2)}`);
    wave.style.opacity=amount<0.01?'0':'.8';
  }
  shape(level,0);
  function animateFill(from,to){
    const start=performance.now();const duration=1000;
    function tick(now){
      if(!busy)return;
      const t=Math.min(1,(now-start)/duration);
      const eased=t*t*(3-2*t);
      shape(from+(to-from)*eased,t*17);
      if(t<1)requestAnimationFrame(tick);else shape(to,0);
    }
    requestAnimationFrame(tick);
  }
  document.addEventListener('click',function(e){
    const link=e.target.closest('a[href^="#"]');
    if(!link||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const next=link.getAttribute('href').slice(1);
    const current=location.hash.slice(1)||'accueil';
    if(!allowed.has(next)||next===current||reduced.matches||busy)return;
    e.preventDefault();busy=true;
    const index=chapters.indexOf(next);
    const target=index>=0?index/4:level;
    const from=level;
    caption.textContent=index>=0?`${Math.round(target*100)} % du verre · ${next==='etudiants'?'Verre rempli !':'Bordeaux se découvre'}`:'Bordeaux se découvre';
    shape(from,0);
    layer.classList.remove('is-playing');void layer.offsetWidth;
    layer.classList.add('is-playing');
    window.setTimeout(function(){animateFill(from,target);},500);
    window.setTimeout(function(){location.hash=next;level=target;try{sessionStorage.setItem('sortirWineLevel',String(level));}catch(e){}},1000);
    window.setTimeout(function(){layer.classList.remove('is-playing');busy=false;shape(level,0);},1900);
  },true);
})();
