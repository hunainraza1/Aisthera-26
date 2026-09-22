// ---- Dynamic participant fields, driven by the selected event ----
const eventName = document.getElementById('eventName');
const teamSizeRow = document.getElementById('teamSizeRow');
const teamSize = document.getElementById('teamSize');
const participantsWrap = document.getElementById('participantsWrap');

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

function renderParticipants() {
  participantsWrap.innerHTML = '';
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
    populateTeamSizeOptions(meta.min, meta.max);
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
  }
}

eventName.addEventListener('change', renderParticipants);
teamSize.addEventListener('change', renderParticipants);

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
  formData.forEach((value, key) => { data[key] = value; });

  // teamSize <select> is hidden (but still in the DOM) for fixed-size events,
  // so compute the true participant count from the event itself rather than
  // trusting whatever the hidden field happens to hold.
  if (meta) {
    data.teamSize = String(meta.fixedSize && meta.fixedSize > 0 ? meta.fixedSize : (parseInt(teamSize.value, 10) || meta.min));
  }

  data.submittedAt = new Date().toISOString();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
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
  } catch (err) {
    status.textContent = 'Something went wrong submitting your registration. Please check your connection and try again, or contact the organisers directly.';
    status.classList.add('error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Registration';
  }
});
