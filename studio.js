/* SORTIR+ Studio V15 — navigateur, aucune clé secrète. Autorisations appliquées par Supabase RLS. */
(() => {
 const el=id=>document.getElementById(id);
 const status=msg=>{if(el('studioStatus'))el('studioStatus').textContent=msg};
 const url=window.SORTIR_SUPABASE_URL, key=window.SORTIR_SUPABASE_KEY;
 if(!window.supabase || !url || !key || key.includes('COLLER_ICI')) {status('Configuration en attente : renseignez la clé publique dans supabase-config.js. Le catalogue V14 reste disponible.');return;}
 const client=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 let user=null, role='user', rows=[];
 const recoveryRequested=new URLSearchParams(location.search).get('sortir_recovery')==='1';
 let recoveryMode=recoveryRequested;
 function showAuthPanel(which){
  el('studioLoginPanel').hidden=which!=='login';
  el('studioForgotPanel').hidden=which!=='forgot';
  el('studioNewPasswordPanel').hidden=which!=='reset';
  if(which!=='private')el('studioPrivate').hidden=true;
 }
 if(recoveryRequested){showAuthPanel('reset');setTimeout(()=>{document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));el('page-admin')?.classList.add('active');},0);}

 const fields={title:'studioTitle',category:'studioCategory',description:'studioDescription',place:'studioPlace',address:'studioAddress',starts_on:'studioStart',ends_on:'studioEnd',hours:'studioHours',price:'studioPrice',booking:'studioBooking',booking_url:'studioUrl',transport:'studioTransport'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function reset(){el('studioForm').reset();el('studioId').value='';el('studioFormTitle').textContent='Nouvelle annonce';}
 function edit(id){const row=rows.find(r=>r.id===id);if(!row)return;el('studioId').value=id;el('studioKind').value=row.kind;for(const [k,f] of Object.entries(fields))el(f).value=row[k]||'';el('studioFormTitle').textContent='Modifier une annonce';el('studioForm').scrollIntoView({behavior:'smooth',block:'start'});}
 function draw(){const type=el('studioFilter').value;const selected=rows.filter(r=>type==='all'||r.kind===type);el('studioList').replaceChildren();if(!selected.length){el('studioList').textContent='Aucune annonce pour le moment.';return;}
 for(const r of selected){const box=document.createElement('div');box.className='studio-item';const name=document.createElement('div');name.innerHTML=`<strong>${esc(r.title)}</strong><small>${esc(r.kind)} · ${esc(r.status)} · ${esc(r.place)}</small>`;const actions=document.createElement('div');actions.className='studio-item-actions';const editBtn=document.createElement('button');editBtn.textContent='Modifier';editBtn.onclick=()=>edit(r.id);actions.append(editBtn);
 if(role==='admin'&&r.status!=='published'){const pub=document.createElement('button');pub.textContent='Publier';pub.onclick=()=>setStatus(r.id,'published');actions.append(pub)}
 if(role==='admin'&&r.status==='published'){const unpub=document.createElement('button');unpub.textContent='Dépublier';unpub.onclick=()=>setStatus(r.id,'pending');actions.append(unpub)}
 const del=document.createElement('button');del.textContent='Supprimer';del.onclick=()=>remove(r.id);actions.append(del);box.append(name,actions);el('studioList').append(box)} }
 async function reload(){const {data,error}=await client.from('listings').select('*').order('created_at',{ascending:false});if(error)throw error;rows=data||[];draw()}
 async function publicRefresh(){const {data,error}=await client.from('listings').select('*').eq('status','published');if(error)throw error;
 const all=data||[];const events=all.filter(x=>x.kind==='event').map(x=>({title:x.title,category:x.category,description:x.description,place:x.place,start:x.starts_on,end:x.ends_on,hours:x.hours,price:x.price,booking:x.booking,bookingUrl:x.booking_url,transport:x.transport}));
 // Les fiches V14 restent visibles jusqu'à migration ; les annonces Supabase sont ajoutées.
 try{const r=await fetch('evenements.json',{cache:'no-store'});const fallback=r.ok?await r.json():[];eventData=[...fallback.filter(x=>!events.some(y=>x.title===y.title&&x.start===y.start)),...events];renderEvents()}catch(e){eventData=events;renderEvents()}
 const rr=all.filter(x=>x.kind==='restaurant').map(x=>({name:x.title,category:x.category,description:x.description,place:x.place,address:x.address,price:x.price,url:x.booking_url}));
 try{const r=await fetch('restaurants.json',{cache:'no-store'});const fallback=r.ok?await r.json():[];restaurants=[...fallback.filter(x=>!rr.some(y=>y.name===x.name)),...rr];renderRestaurants()}catch(e){restaurants=rr;renderRestaurants()}
 // Rebuild the Supabase activity subset on every refresh: edits and deletions stay in sync.
 for(let i=activities.length-1;i>=0;i--)if(String(activities[i].id).startsWith('db-'))activities.splice(i,1);
 for(const x of all.filter(x=>x.kind==='activity')){const id='db-'+x.id;activities.push({id,name:x.title,category:x.category,description:x.description,place:x.place,budget:x.price||'À vérifier',setting:'À vérifier',transport:x.transport||'À vérifier',lat:null,lng:null});}renderActivities();
 }
 async function refreshAuth(){const {data:{user:current}}=await client.auth.getUser();user=current;if(recoveryMode){showAuthPanel('reset');return;}el('studioLoginPanel').hidden=!!user;el('studioPrivate').hidden=!user;if(!user){role='user';return}const {data,error}=await client.from('profiles').select('role').eq('id',user.id).single();if(error){status('Impossible de vérifier les droits : '+error.message);el('studioPrivate').hidden=true;return}role=data?.role||'user';if(!['admin','partner'].includes(role)){el('studioPrivate').hidden=true;status('Compte connecté sans accès éditeur.');return}el('studioIdentity').textContent=user.email+' · '+(role==='admin'?'Administrateur':'Partenaire');await reload();status('Connecté. Les publications sont visibles immédiatement après validation.');}
 async function setStatus(id,value){try{const {error}=await client.from('listings').update({status:value,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;await reload();await publicRefresh();status(value==='published'?'Annonce publiée.':'Annonce dépubliée.')}catch(e){status('Erreur : '+e.message)}}
 async function remove(id){if(!confirm('Supprimer définitivement cette annonce ?'))return;try{const {error}=await client.from('listings').delete().eq('id',id);if(error)throw error;await reload();await publicRefresh();status('Annonce supprimée.')}catch(e){status('Erreur : '+e.message)}}
 el('studioForgotLink').addEventListener('click',()=>{el('studioForgotEmail').value=el('studioEmail').value;showAuthPanel('forgot');status('');});
 el('studioBackLogin').addEventListener('click',()=>{showAuthPanel('login');status('');});
 el('studioForgotForm').addEventListener('submit',async e=>{
  e.preventDefault();status('Envoi du lien en cours…');
  const redirectTo=location.origin+location.pathname+'?sortir_recovery=1#admin';
  const {error}=await client.auth.resetPasswordForEmail(el('studioForgotEmail').value.trim(),{redirectTo});
  if(error){status('Envoi impossible : '+error.message);return;}
  status('Si cette adresse correspond à un compte, un email de récupération a été envoyé. Vérifiez aussi les courriers indésirables.');
 });
 el('studioNewPasswordForm').addEventListener('submit',async e=>{
  e.preventDefault();const password=el('studioNewPassword').value;
  if(password!==el('studioConfirmPassword').value){status('Les deux mots de passe ne correspondent pas.');return;}
  const {data:{session},error:sessionError}=await client.auth.getSession();
  if(sessionError||!session){status('Lien expiré ou invalide. Retournez à la connexion et demandez un nouveau lien.');return;}
  status('Enregistrement du mot de passe…');
  const {error}=await client.auth.updateUser({password});
  if(error){status('Impossible de modifier le mot de passe : '+error.message);return;}
  el('studioNewPasswordForm').reset();recoveryMode=false;
  history.replaceState(null,'',location.pathname+'#admin');
  try{await refreshAuth();status('Votre mot de passe a été modifié. Vous êtes connecté à SORTIR+.');}
  catch(err){status('Mot de passe modifié. '+err.message);}
 });
 el('studioLogin').addEventListener('submit',async e=>{e.preventDefault();status('Connexion…');const {error}=await client.auth.signInWithPassword({email:el('studioEmail').value.trim(),password:el('studioPassword').value});el('studioPassword').value='';if(error)return status('Connexion refusée : '+error.message);try{await refreshAuth()}catch(err){status(err.message)}});
 el('studioLogout').addEventListener('click',async()=>{await client.auth.signOut();await refreshAuth();status('Déconnecté.');});el('studioReset').addEventListener('click',reset);el('studioFilter').addEventListener('change',draw);
 el('studioForm').addEventListener('submit',async e=>{e.preventDefault();if(!user)return status('Connectez-vous.');const kind=el('studioKind').value;const row={kind,owner_id:user.id};for(const [k,f] of Object.entries(fields))row[k]=el(f).value.trim()||(k==='starts_on'||k==='ends_on'?null:'');if(kind==='event'&&(!row.starts_on||!row.ends_on))return status('Indique les dates de début et de fin de cet événement.');if(kind==='event'&&row.ends_on<row.starts_on)return status('La date de fin doit suivre la date de début.');if(kind!=='event'){row.starts_on=null;row.ends_on=null}if(row.booking_url&&!/^https:\/\//.test(row.booking_url))return status('Le lien doit commencer par https://');
 try{const id=el('studioId').value;let error;if(id){delete row.owner_id;({error}=await client.from('listings').update({...row,updated_at:new Date().toISOString()}).eq('id',id));}else{row.status=role==='admin'?'published':'pending';({error}=await client.from('listings').insert(row));}if(error)throw error;reset();await reload();await publicRefresh();status(role==='admin'?'Annonce enregistrée.':'Annonce soumise à validation.')}catch(err){status('Enregistrement refusé : '+err.message)}});
 client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){recoveryMode=true;history.replaceState(null,'',location.pathname+'?sortir_recovery=1#admin');showAuthPanel('reset');window.dispatchEvent(new Event('hashchange'));status('Saisissez votre nouveau mot de passe.');} setTimeout(()=>refreshAuth().catch(e=>status(e.message)),0)});
 refreshAuth().catch(e=>status(e.message));publicRefresh().catch(e=>status('Synchronisation indisponible : '+e.message));
 setInterval(()=>publicRefresh().catch(()=>{}),60000);
})();
