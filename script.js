// ---- Dynamic participant fields ----
const regType = document.getElementById('regType');
const teamSizeRow = document.getElementById('teamSizeRow');
const teamSize = document.getElementById('teamSize');
const participantsWrap = document.getElementById('participantsWrap');

function renderParticipants() {
  participantsWrap.innerHTML = '';
  let count = 1;

  if (regType.value === 'Solo') {
    count = 1;
  } else if (regType.value === 'Team') {
    count = parseInt(teamSize.value, 10) || 2;
  } else {
    return;
  }

  for (let i = 1; i <= count; i++) {
    const block = document.createElement('div');
    block.className = 'participant-block';
    block.innerHTML = `
      <h5>${regType.value === 'Solo' ? 'Participant' : (i === 1 ? 'Participant 1 (Team Lead)' : 'Participant ' + i)}</h5>
      <div class="participant-fields">
        <input type="text" name="participant_${i}_name" placeholder="Full name" required />
        <input type="text" name="participant_${i}_idnum" placeholder="College ID number" required />
      </div>
    `;
    participantsWrap.appendChild(block);
  }
}

regType.addEventListener('change', () => {
  teamSizeRow.style.display = regType.value === 'Team' ? 'block' : 'none';
  renderParticipants();
});
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
    status.textContent = 'Registration isn\'t connected yet — the site owner needs to add the Google Sheet endpoint in config.js.';
    status.classList.add('error');
    return;
  }

  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => { data[key] = value; });
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
