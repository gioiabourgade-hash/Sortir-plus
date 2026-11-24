/* SORTIR+ Studio V15 — navigateur, aucune clé secrète. Autorisations appliquées par Supabase RLS. */
(() => {
 const el=id=>document.getElementById(id);
 const status=msg=>{if(el('studioStatus'))el('studioStatus').textContent=msg};
 const url=window.SORTIR_SUPABASE_URL, key=window.SORTIR_SUPABASE_KEY;
 if(!window.supabase || !url || !key || key.includes('COLLER_ICI')) {status('Configuration en attente : renseignez la clé publique dans supabase-config.js. Le catalogue V14 reste disponible.');return;}
 const client=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 window.sortirRevenueClient=client;
 let user=null, role='user', rows=[];
 const query=new URLSearchParams(location.search);
 const recoveryRequested=query.get('sortir_recovery')==='1'||query.has('code')||query.has('token_hash')||location.hash.includes('type=recovery');
 let recoveryReady=false;
 let recoveryProblem='';
 // Ne pas supprimer les jetons de l'URL avant que Supabase les ait traités.
 const recoveryInit=client.auth.initialize().then(async()=>{
  if(query.has('token_hash') && query.get('type')==='recovery'){
   const {error}=await client.auth.verifyOtp({token_hash:query.get('token_hash'),type:'recovery'});
   if(error)throw error;
  }
  const {data,error}=await client.auth.getSession();
  if(error)throw error;
  recoveryReady=!!data.session;
 }).catch(err=>{recoveryProblem=err.message||String(err)});
 let recoveryMode=recoveryRequested;
 function showAuthPanel(which){
  el('studioLoginPanel').hidden=which!=='login';
  el('studioForgotPanel').hidden=which!=='forgot';
  el('studioSignupPanel').hidden=which!=='signup';
  el('studioNewPasswordPanel').hidden=which!=='reset';
  if(which!=='private')el('studioPrivate').hidden=true;
 }
 if(recoveryRequested){showAuthPanel('reset');setTimeout(()=>{document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));el('page-admin')?.classList.add('active');},0);}

 const fields={title:'studioTitle',category:'studioCategory',description:'studioDescription',place:'studioPlace',address:'studioAddress',starts_on:'studioStart',ends_on:'studioEnd',hours:'studioHours',price:'studioPrice',booking:'studioBooking',booking_url:'studioUrl',transport:'studioTransport'};
 const kindLabels={event:'Événement',restaurant:'Restaurant',activity:'Activité'};
 const statusLabels={pending:'En attente',published:'Publiée',rejected:'Refusée'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let photoPreviewObjectUrl=null;
 function updatePhotoPreview(url){
  if(photoPreviewObjectUrl){URL.revokeObjectURL(photoPreviewObjectUrl);photoPreviewObjectUrl=null;}
  const preview=el('studioPhotoPreview'),img=el('studioPhotoPreviewImg');
  preview.hidden=!url;
  if(url)img.src=url;else img.removeAttribute('src');
 }
 el('studioPhoto').addEventListener('change',()=>{
  const file=el('studioPhoto').files[0];
  if(file){updatePhotoPreview(null);photoPreviewObjectUrl=URL.createObjectURL(file);el('studioPhotoPreview').hidden=false;el('studioPhotoPreviewImg').src=photoPreviewObjectUrl;el('studioRemovePhoto').checked=false;}
  else{const row=rows.find(r=>r.id===el('studioId').value);updatePhotoPreview(!el('studioRemovePhoto').checked?row?.photo_url:null);}
 });
 el('studioPhotoRemoveButton').addEventListener('click',()=>{
  const hasExisting=!!rows.find(r=>r.id===el('studioId').value)?.photo_url;
  el('studioPhoto').value='';el('studioRemovePhoto').checked=hasExisting;
  updatePhotoPreview(null);
  el('studioPhotoHint').textContent=hasExisting?'La photo sera retirée après l’enregistrement de l’annonce.':'Photo sélectionnée retirée. Aucune photo ne sera envoyée.';
 });
 function reset(){updatePhotoPreview(null);el('studioForm').reset();el('studioRemovePhoto').checked=false;el('studioId').value='';el('studioFormTitle').textContent='Nouvelle annonce';el('studioPhotoHint').textContent='La photo sera envoyée uniquement lors de l’enregistrement de la fiche.';}
 function edit(id){const row=rows.find(r=>r.id===id);if(!row)return;el('studioId').value=id;el('studioRemovePhoto').checked=false;el('studioPhoto').value='';updatePhotoPreview(row.photo_url||null);el('studioKind').value=row.kind;for(const [k,f] of Object.entries(fields))el(f).value=row[k]||'';el('studioFormTitle').textContent='Modifier une annonce';el('studioPhotoHint').textContent=row.photo_url?'Une photo est déjà enregistrée. Choisissez un fichier pour la remplacer.':'Aucune photo enregistrée.';el('studioForm').scrollIntoView({behavior:'smooth',block:'start'});}
 function draw(){const type=el('studioFilter').value;const selected=rows.filter(r=>(type==='all'||r.kind===type)&&(role==='admin'||r.owner_id===user?.id));el('studioList').replaceChildren();if(!selected.length){el('studioList').textContent='Aucune annonce pour le moment.';return;}
 for(const r of selected){const box=document.createElement('div');box.className='studio-item';const name=document.createElement('div');name.innerHTML=`<strong>${esc(r.title)}</strong><small>${esc(kindLabels[r.kind]||r.kind)} · ${esc(statusLabels[r.status]||r.status)} · ${esc(r.place)}</small>`;const actions=document.createElement('div');actions.className='studio-item-actions';const editBtn=document.createElement('button');editBtn.textContent='Modifier';editBtn.onclick=()=>edit(r.id);actions.append(editBtn);
 if(role==='admin'&&r.status!=='published'){const pub=document.createElement('button');pub.textContent='Publier';pub.onclick=()=>setStatus(r.id,'published');actions.append(pub)}
 if(role==='admin'&&r.status==='published'){const unpub=document.createElement('button');unpub.textContent='Dépublier';unpub.onclick=()=>setStatus(r.id,'pending');actions.append(unpub)}
 const del=document.createElement('button');del.textContent='Supprimer';del.onclick=()=>remove(r.id);actions.append(del);box.append(name,actions);el('studioList').append(box)} }
 async function reload(){const {data,error}=await client.from('listings').select('*').order('created_at',{ascending:false});if(error)throw error;rows=data||[];draw()}
 async function publicRefresh(){const {data,error}=await client.from('listings').select('*').eq('status','published');if(error)throw error;
 const all=data||[];const events=all.filter(x=>x.kind==='event').map(x=>({title:x.title,category:x.category,description:x.description,place:x.place,start:x.starts_on,end:x.ends_on,hours:x.hours,price:x.price,booking:x.booking,bookingUrl:x.booking_url,photo_url:x.photo_url,transport:x.transport}));
 // Les fiches V14 restent visibles jusqu'à migration ; les annonces Supabase sont ajoutées.
 try{const r=await fetch('evenements.json',{cache:'no-store'});const fallback=r.ok?await r.json():[];eventData=[...fallback.filter(x=>!events.some(y=>x.title===y.title&&x.start===y.start)),...events];renderEvents()}catch(e){eventData=events;renderEvents()}
 const rr=all.filter(x=>x.kind==='restaurant').map(x=>({name:x.title,category:x.category,description:x.description,place:x.place,address:x.address,price:x.price,url:x.booking_url,photo_url:x.photo_url}));
 try{const r=await fetch('restaurants.json',{cache:'no-store'});const fallback=r.ok?await r.json():[];restaurants=[...fallback.filter(x=>!rr.some(y=>y.name===x.name)),...rr];renderRestaurants()}catch(e){restaurants=rr;renderRestaurants()}
 // Rebuild the Supabase activity subset on every refresh: edits and deletions stay in sync.
 for(let i=activities.length-1;i>=0;i--)if(String(activities[i].id).startsWith('db-'))activities.splice(i,1);
 for(const x of all.filter(x=>x.kind==='activity')){const id='db-'+x.id;activities.push({id,name:x.title,category:x.category,description:x.description,place:x.place,budget:x.price||'À vérifier',setting:'À vérifier',transport:x.transport||'À vérifier',photo_url:x.photo_url,lat:null,lng:null});}renderActivities();
 }
 async function refreshAuth(){const {data:{user:current}}=await client.auth.getUser();user=current;el('revenueAdmin').hidden=true;if(recoveryMode){showAuthPanel('reset');return;}el('studioLoginPanel').hidden=!!user;el('studioPrivate').hidden=!user;if(!user){role='user';return}const {data,error}=await client.from('profiles').select('role').eq('id',user.id).single();if(error){status('Impossible de vérifier les droits : '+error.message);el('studioPrivate').hidden=true;return}role=data?.role||'user';if(role==='admin'){el('revenueAdmin').hidden=false;window.dispatchEvent(new Event('sortir-revenue-admin'));}el('studioListTitle').textContent=role==='admin'?'Gestion des annonces':'Mes annonces';if(!['admin','partner'].includes(role)){el('studioPrivate').hidden=true;status('Votre profil professionnel n’est pas encore activé. Contactez SORTIR+ si le problème persiste.');return}el('studioIdentity').textContent=user.email+' · '+(role==='admin'?'Administrateur':'Partenaire');await reload();status('Connecté. Les publications sont visibles immédiatement après validation.');}
 async function setStatus(id,value){try{const {error}=await client.from('listings').update({status:value,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;await reload();await publicRefresh();status(value==='published'?'Annonce publiée.':'Annonce dépubliée.')}catch(e){status('Erreur : '+e.message)}}
 async function remove(id){if(!confirm('Supprimer définitivement cette annonce ?'))return;try{const {error}=await client.from('listings').delete().eq('id',id);if(error)throw error;await reload();await publicRefresh();status('Annonce supprimée.')}catch(e){status('Erreur : '+e.message)}}
 el('studioSignupLink').addEventListener('click',()=>{el('studioSignupEmail').value=el('studioEmail').value;showAuthPanel('signup');status('');});
 el('studioSignupBack').addEventListener('click',()=>{showAuthPanel('login');status('');});
 el('studioSignupForm').addEventListener('submit',async e=>{
  e.preventDefault();const email=el('studioSignupEmail').value.trim().toLowerCase();const password=el('studioSignupPassword').value;
  if(password!==el('studioSignupConfirm').value)return status('Les deux mots de passe ne correspondent pas.');
  const business=el('studioBusinessName').value.trim();if(!business)return status('Indiquez le nom de votre établissement.');
  status('Création de votre compte…');
  const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname+'#admin',data:{business_name:business}}});
  if(error)return status('Inscription impossible : '+error.message);
  el('studioSignupPassword').value='';el('studioSignupConfirm').value='';
  if(data?.session){showAuthPanel('login');try{await refreshAuth()}catch(err){status('Compte créé, mais ouverture du studio impossible : '+err.message)}return;}
  showAuthPanel('login');el('studioEmail').value=email;
  status('Inscription reçue. Si votre compte nécessite une confirmation, ouvrez le dernier email reçu et cliquez sur le lien, puis connectez-vous ici.');
 });
 el('studioForgotLink').addEventListener('click',()=>{el('studioForgotEmail').value=el('studioEmail').value;showAuthPanel('forgot');status('');});
 el('studioBackLogin').addEventListener('click',()=>{showAuthPanel('login');status('');});
 el('studioForgotForm').addEventListener('submit',async e=>{
  e.preventDefault();status('Envoi du lien en cours…');
  const redirectTo=location.origin+location.pathname+'?sortir_recovery=1';
  const {error}=await client.auth.resetPasswordForEmail(el('studioForgotEmail').value.trim(),{redirectTo});
  if(error){status('Envoi impossible : '+error.message);return;}
  status('Si cette adresse correspond à un compte, un email de récupération a été envoyé. Vérifiez aussi les courriers indésirables.');
 });
 el('studioNewPasswordForm').addEventListener('submit',async e=>{
  e.preventDefault();const password=el('studioNewPassword').value;
  if(password!==el('studioConfirmPassword').value){status('Les deux mots de passe ne correspondent pas.');return;}
  await recoveryInit;
  const {data,error:sessionError}=await client.auth.getSession();
  const session=data?.session;
  if(sessionError||!session){status('Impossible de valider le lien de récupération'+(recoveryProblem?' : '+recoveryProblem:'')+'. Ouvrez uniquement le dernier email reçu, dans le même navigateur.');return;}
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
 try{const id=el('studioId').value;let error;
 if(id){const existing=rows.find(x=>x.id===id);if(!existing||role!=='admin'&&(existing.owner_id!==user.id||existing.status!=='pending'))return status('Cette fiche ne peut plus être modifiée : contactez SORTIR+ pour une modification après validation.');}
 const photo=el('studioPhoto').files[0];
 if(el('studioRemovePhoto').checked && !photo && id)row.photo_url=null;
 if(el('studioRemovePhoto').checked && !id)return status('La suppression de photo est disponible lors de la modification d’une annonce.');
 if(photo){
  if(!['image/jpeg','image/png','image/webp'].includes(photo.type)||photo.size>3*1024*1024) return status('Photo refusée : JPG, PNG ou WebP, 3 Mo maximum.');
  const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[photo.type];
  const path=user.id+'/'+crypto.randomUUID()+'.'+extension;
  status('Envoi de la photo…');
  const {error:uploadError}=await client.storage.from('listing-photos').upload(path,photo,{contentType:photo.type,upsert:false});
  if(uploadError)throw uploadError;
  row.photo_url=client.storage.from('listing-photos').getPublicUrl(path).data.publicUrl;
 }
 if(id){delete row.owner_id;({error}=await client.from('listings').update({...row,updated_at:new Date().toISOString()}).eq('id',id));}else{row.status=role==='admin'?'published':'pending';({error}=await client.from('listings').insert(row));}if(error)throw error;reset();await reload();await publicRefresh();status(role==='admin'?'Annonce enregistrée.':'Annonce soumise à validation.')}catch(err){status('Enregistrement refusé : '+err.message)}});
 client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){recoveryMode=true;recoveryReady=true;showAuthPanel('reset');status('Saisissez votre nouveau mot de passe.');} setTimeout(()=>refreshAuth().catch(e=>status(e.message)),0)});
 recoveryInit.then(()=>{if(recoveryMode){showAuthPanel('reset');if(!recoveryReady)status('Le lien ne permet pas encore une session valide'+(recoveryProblem?' : '+recoveryProblem:'')+'. Vérifiez que vous ouvrez le dernier email reçu.');}});
 refreshAuth().catch(e=>status(e.message));publicRefresh().catch(e=>status('Synchronisation indisponible : '+e.message));
 setInterval(()=>publicRefresh().catch(()=>{}),60000);
})();
