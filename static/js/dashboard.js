// dashboard.js - patients + booking
let editId = null;
let bookingPatientId = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchPatients();

  const modal = document.getElementById('patientModal');
  const form = document.getElementById('patientForm');
  const bookingModal = document.getElementById('bookingModal');
  const bookingForm = document.getElementById('bookingForm');

  document.getElementById('addPatientBtn').addEventListener('click', () => {
    editId = null;
    document.getElementById('modalTitle').textContent = 'Add Patient';
    form.reset();
    modal.classList.remove('hidden');
  });

  document.getElementById('closeModal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('closeBooking').addEventListener('click', () => {
    bookingModal.classList.add('hidden');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      first_name: document.getElementById('first_name').value,
      last_name: document.getElementById('last_name').value,
      phone: document.getElementById('phone').value,
      street: document.getElementById('street').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      gender: document.getElementById('gender').value,
      age: parseInt(document.getElementById('age').value) || null,
      blood_group: document.getElementById('blood_group').value
    };
    try {
      if (editId) {
        await apiPut(`patients/${editId}`, data);
      } else {
        await apiPost('patients', data);
      }
      modal.classList.add('hidden');
      fetchPatients();
    } catch (err) {
      alert('Error saving patient');
    }
  });

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      patient_id: bookingPatientId,
      test_id: parseInt(document.getElementById('test_id').value),
      tech_id: parseInt(document.getElementById('tech_id').value),
      scheduled_date: document.getElementById('scheduled_date').value
    };
    try {
      await apiPost('bookings', data);
      bookingModal.classList.add('hidden');
      alert('Booking created');
    } catch (err) {
      alert('Booking error');
    }
  });
});

async function fetchPatients() {
  try {
    const patients = await apiGet('patients');
    const tbody = document.getElementById('patientTableBody');
    tbody.innerHTML = '';
    patients.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-2">${p.patient_id}</td>
        <td class="p-2">${p.first_name} ${p.last_name}</td>
        <td class="p-2">${p.gender || ''}</td>
        <td class="p-2">${p.age || ''}</td>
        <td class="p-2">${p.blood_group || ''}</td>
        <td class="p-2 flex gap-2">
          <button class="bg-blue-500 text-white px-2 rounded" onclick="openBooking(${p.patient_id})">Book</button>
          <button class="bg-yellow-500 text-white px-2 rounded" onclick="openEdit(${p.patient_id})">Edit</button>
          <button class="bg-red-500 text-white px-2 rounded" onclick="removePatient(${p.patient_id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

async function removePatient(id) {
  if (!confirm('Delete patient?')) return;
  try {
    await apiDelete(`patients/${id}`);
    fetchPatients();
  } catch (err) {
    alert('Delete failed');
  }
}

async function openEdit(id) {
  try {
    const p = await apiGet(`patients/${id}`);
    editId = id;
    document.getElementById('modalTitle').textContent = 'Edit Patient';
    document.getElementById('first_name').value = p.first_name || '';
    document.getElementById('last_name').value = p.last_name || '';
    document.getElementById('phone').value = p.phone || '';
    document.getElementById('street').value = p.street || '';
    document.getElementById('city').value = p.city || '';
    document.getElementById('state').value = p.state || '';
    document.getElementById('gender').value = p.gender || '';
    document.getElementById('age').value = p.age || '';
    document.getElementById('blood_group').value = p.blood_group || '';
    document.getElementById('patientModal').classList.remove('hidden');
  } catch (err) {
    alert('Load failed');
  }
}

async function openBooking(patient_id) {
  bookingPatientId = patient_id;
  try {
    // load tests
    const tests = await apiGet('labtests');
    const testSelect = document.getElementById('test_id');
    testSelect.innerHTML = '';
    tests.forEach(t => {
      const o = document.createElement('option');
      o.value = t.test_id;
      o.text = `${t.test_name} (₹${t.test_cost})`;
      testSelect.appendChild(o);
    });
    // load techs
    const techs = await apiGet('technicians');
    const techSelect = document.getElementById('tech_id');
    techSelect.innerHTML = '';
    techs.forEach(t => {
      const o = document.createElement('option');
      o.value = t.tech_id;
      o.text = `${t.first_name} ${t.last_name}`;
      techSelect.appendChild(o);
    });
    document.getElementById('scheduled_date').value = '';
    document.getElementById('bookingModal').classList.remove('hidden');
  } catch (err) {
    alert('Failed to open booking');
  }
}
