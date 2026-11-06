// ---- Dynamic participant fields, driven by the selected event ----
const eventName = document.getElementById('eventName');
const teamSizeRow = document.getElementById('teamSizeRow');
const teamSize = document.getElementById('teamSize');
const participantsWrap = document.getElementById('participantsWrap');
const proofWrap = document.getElementById('proofWrap');

function getSelectedEventMeta() {
  const opt = eventName.options[eventName.selectedIndex];
  if (!opt || !opt.value) return null;
  const fixedSize = parseInt(opt.dataset.fixedSize, 10);
  const min = parseInt(opt.dataset.min, 10);
  const max = parseInt(opt.dataset.max, 10);
  return { fixedSize, min, max };
}

function populateTeamSizeOptions(min, max) {
  teamSize.innerHTML = '';
  for (let n = min; n <= max; n++) {
    const o = document.createElement('option');
    o.value = String(n);
    o.textContent = String(n);
    teamSize.appendChild(o);
  }
}

// Rebuilds the participant fields to match the current event + team size.
// Does NOT touch the teamSize <select>'s own options — that only happens
// when the EVENT changes (see onEventChange below). Rebuilding a <select>'s
// options while handling its own "change" event resets selectedIndex, which
// was silently snapping the team size back to the minimum on every pick.
function renderParticipants() {
  participantsWrap.innerHTML = '';
  proofWrap.innerHTML = '';
  const meta = getSelectedEventMeta();
  if (!meta) {
    teamSizeRow.style.display = 'none';
    return;
  }

  let count;
  if (meta.fixedSize && meta.fixedSize > 0) {
    // Fixed team size (e.g. Quiz = 2, Treasure Hunt = 3)
    teamSizeRow.style.display = 'none';
    count = meta.fixedSize;
  } else {
    // Variable range (e.g. Fashion Show 8-12, Reel Making 1-2)
    teamSizeRow.style.display = 'block';
    count = parseInt(teamSize.value, 10) || meta.min;
  }

  for (let i = 1; i <= count; i++) {
    const block = document.createElement('div');
    block.className = 'participant-block';
    const label = count === 1 ? 'Participant' : (i === 1 ? 'Participant 1 (Team Lead)' : 'Participant ' + i);
    block.innerHTML = `
      <h5>${label}</h5>
      <div class="participant-fields">
        <input type="text" name="participant_${i}_name" placeholder="Full name" required />
        <input type="text" name="participant_${i}_idnum" placeholder="College ID number" required />
      </div>
    `;
    participantsWrap.appendChild(block);

    const proof = document.createElement('div');
    proof.className = 'form-row proof-row';
    proof.innerHTML = `
      <label for="proof_${i}">Proof of Payment${count === 1 ? '' : ' for Participant ' + i} *</label>
      <input type="file" id="proof_${i}" name="proof_${i}" accept="image/*,application/pdf" required />
    `;
    proofWrap.appendChild(proof);
  }
}

function onEventChange() {
  const meta = getSelectedEventMeta();
  if (meta && !(meta.fixedSize && meta.fixedSize > 0)) {
    populateTeamSizeOptions(meta.min, meta.max);
  }
  renderParticipants();
}

eventName.addEventListener('change', onEventChange);
teamSize.addEventListener('change', renderParticipants);

// ---- Payment proof helpers ----
// Images are shrunk in the browser before upload so the whole registration
// stays small; PDFs are sent as-is (up to 1.5 MB).
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function fileToPayload(file) {
  if (file.type === 'application/pdf') {
    if (file.size > 1.5 * 1024 * 1024) throw new Error('PDF too large (max 1.5 MB): ' + file.name);
    return { name: file.name, type: file.type, data: await blobToBase64(file) };
  }
  if (!file.type.startsWith('image/')) throw new Error('Please upload an image or PDF: ' + file.name);
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.8));
  return { name: file.name.replace(/\.[^.]+$/, '') + '.jpg', type: 'image/jpeg', data: await blobToBase64(blob) };
}

// ---- Form submission ----
const form = document.getElementById('regForm');
const submitBtn = document.getElementById('submitBtn');
const status = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = '';
  status.className = 'form-status';

  if (typeof GOOGLE_SHEET_ENDPOINT === 'undefined' || !GOOGLE_SHEET_ENDPOINT) {
    status.textContent = "Registration isn't connected yet — the site owner needs to add the Google Sheet endpoint in config.js.";
    status.classList.add('error');
    return;
  }

  const meta = getSelectedEventMeta();
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => { if (!(value instanceof File)) data[key] = value; });

  // teamSize <select> is hidden (but still in the DOM) for fixed-size events,
  // so compute the true participant count from the event itself rather than
  // trusting whatever the hidden field happens to hold.
  if (meta) {
    data.teamSize = String(meta.fixedSize && meta.fixedSize > 0 ? meta.fixedSize : (parseInt(teamSize.value, 10) || meta.min));
  }

  data.submittedAt = new Date().toISOString();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Uploading...';

  try {
    data.proofs = [];
    const proofInputs = form.querySelectorAll('input[type="file"]');
    for (const input of proofInputs) {
      if (input.files[0]) data.proofs.push(await fileToPayload(input.files[0]));
    }

    await fetch(GOOGLE_SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors', // Apps Script web apps don't return CORS headers; response is opaque
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    });

    status.textContent = "You're registered! Save a screenshot of this confirmation. We'll be in touch via the contact details you provided.";
    status.classList.add('success');
    form.reset();
    teamSizeRow.style.display = 'none';
    participantsWrap.innerHTML = '';
    proofWrap.innerHTML = '';
  } catch (err) {
    const known = err && err.message && /^(Please upload|PDF too large)/.test(err.message);
    status.textContent = known ? err.message : 'Something went wrong submitting your registration. Please check your connection and try again, or contact the organisers directly.';
    status.classList.add('error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Registration';
  }
});
