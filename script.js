document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('obsForm');
  const successBox = document.getElementById('successBox');
  const shareUrl = document.getElementById('shareUrl');
  const submitBtn = document.getElementById('submitBtn');

  // 🔧 METS TON NUMÉRO WHATSAPP ICI (format international sans +)
  // Ex: RDC 243 8XX XXX XXX -> 2438XXXXXXXX
  const ADMIN_WHATSAPP = "243834209244"

  const validators = {
    nom: v => v.trim().length >= 3 || "Min 3 caractères",
    whatsapp: v => /^\+?[0-9\s]{8,15}$/.test(v.replace(/\s/g,'')) || "Numéro invalide",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Email invalide",
    ville: v => v.trim().length >= 2 || "Ville requise",
    niveau: v => !!v || "Choisis ton niveau",
    objectifs: () => {
      const c = document.querySelectorAll('input[name="objectifs"]:checked');
      if (c.length === 0) return "Au moins 1 objectif";
      if (c.length > 3) return "Max 3";
      return true;
    },
    dispo: () => document.querySelector('input[name="dispo"]:checked') ? true : "Choisis une dispo"
  };

  function showError(id, msg){
    const el = document.getElementById('err-'+id);
    const input = document.getElementById(id);
    if(msg !== true){
      if(el) el.textContent = msg;
      if(input) input.classList.add('input-error');
      return false;
    } else {
      if(el) el.textContent = "";
      if(input) input.classList.remove('input-error');
      return true;
    }
  }

  // validation live
  ['nom','whatsapp','email','ville','niveau'].forEach(id=>{
    const input = document.getElementById(id);
    input.addEventListener('input', ()=> showError(id, validators[id](input.value)));
  });

  // ---- SAUVEGARDE LOCALE ----
  function getInscriptions(){
    return JSON.parse(localStorage.getItem('obs_inscriptions') || '[]');
  }
  function saveInscription(data){
    const list = getInscriptions();
    list.push({...data, date: new Date().toISOString(), id: Date.now()});
    localStorage.setItem('obs_inscriptions', JSON.stringify(list));
    console.log("Toutes les inscriptions:", list);
  }

  // ---- SUBMIT ----
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    let ok = true;
    for(let k of ['nom','whatsapp','email','ville','niveau']){
      if(!showError(k, validators[k](document.getElementById(k).value))) ok=false;
    }
    if(!showError('objectifs', validators.objectifs())) ok=false;
    if(!showError('dispo', validators.dispo())) ok=false;
    if(!ok) return;

    submitBtn.disabled=true;
    submitBtn.textContent="Envoi en cours...";
    await new Promise(r=>setTimeout(r,1000));

    // Récupère les données
    const formData = new FormData(form);
    const objectifs = [...document.querySelectorAll('input[name="objectifs"]:checked')].map(i=>i.value);
    const data = {
      nom: formData.get('nom'),
      whatsapp: formData.get('whatsapp'),
      email: formData.get('email'),
      ville: formData.get('ville'),
      niveau: formData.get('niveau'),
      objectifs: objectifs.join(', '),
      dispo: formData.get('dispo'),
      message: formData.get('message')
    };

    // 1. Sauvegarde
    saveInscription(data);

    // 2. Génère lien
    const token = Math.random().toString(36).slice(2,8).toUpperCase();
    const link = `https://formation-obs.studio/r/${token}`;
    shareUrl.textContent = link;

    // 3. Prépare message WhatsApp
    const msgWA = `🔥 Nouvelle inscription OBS Studio%0A%0A👤 Nom: ${data.nom}%0A📱 WA: ${data.whatsapp}%0A📧 Email: ${data.email}%0A📍 Ville: ${data.ville}%0A📊 Niveau: ${data.niveau}%0A🎯 Objectifs: ${data.objectifs}%0A⏰ Dispo: ${data.dispo}%0A💬 Projet: ${data.message || '-'}%0A%0ALien: ${link}`;
    
    successBox.classList.remove('hidden');
    form.classList.add('hidden');

    // 4. Bouton WhatsApp
    const waBtn = document.createElement('a');
    waBtn.href = `https://wa.me/${ADMIN_WHATSAPP}?text=${msgWA}`;
    waBtn.target = "_blank";
    waBtn.className = "btn-primary";
    waBtn.style.display="block";
    waBtn.style.textAlign="center";
    waBtn.style.marginTop="16px";
    waBtn.style.textDecoration="none";
    waBtn.textContent = "📲 Envoyer sur WhatsApp Admin";
    successBox.appendChild(waBtn);

    // Option: ouvrir auto
    // window.open(waBtn.href, '_blank');
  });
});

function copyLink(){
  const txt = document.getElementById('shareUrl').textContent;
  navigator.clipboard.writeText(txt).then(()=> alert("Lien copié !"));
}

// Fonction bonus: voir toutes les inscriptions dans la console
// Tape dans la console: JSON.parse(localStorage.getItem('obs_inscriptions'))