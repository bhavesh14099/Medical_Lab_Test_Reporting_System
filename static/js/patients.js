// patients.js - Modern Patients Management
let editPatientId = null;
let bookingPatientId = null;
let allPatients = [];

document.addEventListener('DOMContentLoaded', function() {
    loadPatients();
    initializeEventListeners();
});

function initializeEventListeners() {
    // Add Patient Button
    document.getElementById('addPatientBtn').addEventListener('click', openAddPatientModal);
    
    // Modal Close Buttons
    document.getElementById('closeModal').addEventListener('click', closePatientModal);
    document.getElementById('cancelBtn').addEventListener('click', closePatientModal);
    document.getElementById('closeBooking').addEventListener('click', closeBookingModal);
    
    // Form Submissions
    document.getElementById('patientForm').addEventListener('submit', handlePatientSubmit);
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    
    // Search input
    document.getElementById('patientSearch').addEventListener('keyup', (e) => {
        const searchText = e.target.value.toLowerCase();
        const filteredPatients = allPatients.filter(p =>
            (p.first_name + ' ' + p.last_name).toLowerCase().includes(searchText) ||
            (p.phone || '').toLowerCase().includes(searchText) ||
            (p.blood_group || '').toLowerCase().includes(searchText)
        );
        renderPatientsTable(filteredPatients);
    });

    // Use event delegation for the dynamically created buttons
    document.getElementById('patientsTableBody').addEventListener('click', handleTableActions);
}

function handleTableActions(event) {
    const target = event.target;
    // Find the button or its parent with a data-action attribute
    const actionButton = target.closest('button[data-action]');

    if (!actionButton) {
        // If a button with a data-action attribute was not clicked,
        // and a menu is open, close it.
        if (!target.closest('[id^="actionMenu-"]')) {
            document.querySelectorAll('[id^="actionMenu-"]').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
        return;
    }

    const patientId = actionButton.getAttribute('data-id');
    const action = actionButton.getAttribute('data-action');
    const fullName = actionButton.getAttribute('data-name');

    switch (action) {
        case 'toggleMenu':
            toggleActionMenu(patientId);
            break;
        case 'bookTest':
            openBookingModal(patientId, fullName);
            break;
        case 'edit':
            editPatient(patientId);
            break;
        case 'delete':
            deletePatient(patientId, fullName);
            break;
    }
}


async function loadPatients() {
    try {
        const patients = await apiGet('patients');
        allPatients = patients;
        renderPatientsTable(patients);
    } catch (error) {
        console.error('Error loading patients:', error);
        showError('Failed to load patients');
    }
}

function renderPatientsTable(patients) {
    const tbody = document.getElementById('patientsTableBody');
    
    if (patients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-12 text-gray-500">
                    <div class="flex flex-col items-center">
                        <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        <p>No patients found</p>
                        <p class="text-sm mt-1">Add your first patient to get started</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = patients.map(patient => {
        const initials = (patient.first_name?.[0] || '') + (patient.last_name?.[0] || '');
        const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
        const dob = patient.dob ? new Date(patient.dob).toLocaleDateString() : '';
        const age = patient.age ? `${patient.age}+` : '';
        const displayAge = age || (patient.dob ? calculateAge(patient.dob) + '+' : '');
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-4 px-6">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-4">
                            ${initials}
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${fullName}</div>
                            <div class="text-sm text-gray-500">${displayAge}</div>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-6">
                    ${patient.gender ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        patient.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }">${patient.gender}</span>` : '-'}
                </td>
                <td class="py-4 px-6 text-gray-600">${dob || '-'}</td>
                <td class="py-4 px-6 text-gray-600">${patient.phone || '-'}</td>
                <td class="py-4 px-6">
                    <div class="relative">
                        <button data-id="${patient.patient_id}" data-action="toggleMenu" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                            </svg>
                        </button>
                        <div id="actionMenu-${patient.patient_id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button data-id="${patient.patient_id}" data-action="bookTest" data-name="${fullName}" class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100">
                                <svg class="w-4 h-4 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                Book Test
                            </button>
                            <button data-id="${patient.patient_id}" data-action="edit" class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100">
                                <svg class="w-4 h-4 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                Edit
                            </button>
                            <button data-id="${patient.patient_id}" data-action="delete" data-name="${fullName}" class="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                <svg class="w-4 h-4 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// --- Helper Functions (Provided for completeness) ---

function openAddPatientModal() {
    editPatientId = null;
    document.getElementById('modalTitle').textContent = 'Add Patient';
    document.getElementById('patientForm').reset();
    document.getElementById('patientModal').classList.remove('hidden');
}

function closePatientModal() {
    document.getElementById('patientModal').classList.add('hidden');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.add('hidden');
}

async function handlePatientSubmit(e) {
    e.preventDefault();
    const data = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        phone: document.getElementById('phone').value,
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        gender: document.getElementById('gender').value,
        dob: document.getElementById('dob').value,
        blood_group: document.getElementById('blood_group').value
    };
    try {
        if (editPatientId) {
            await apiPut(`patients/${editPatientId}`, data);
        } else {
            await apiPost('patients', data);
        }
        closePatientModal();
        loadPatients();
    } catch (err) {
        showError('Error saving patient');
    }
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    const data = {
        patient_id: bookingPatientId,
        test_id: parseInt(document.getElementById('test_id').value),
        tech_id: parseInt(document.getElementById('tech_id').value),
        scheduled_date: document.getElementById('scheduled_date').value
    };
    try {
        await apiPost('bookings', data);
        closeBookingModal();
        alert('Booking created');
    } catch (err) {
        showError('Booking error');
    }
}

function toggleActionMenu(id) {
    const menu = document.getElementById(`actionMenu-${id}`);
    document.querySelectorAll('[id^="actionMenu-"]').forEach(m => {
        if (m.id !== `actionMenu-${id}`) {
            m.classList.add('hidden');
        }
    });
    menu.classList.toggle('hidden');
}

async function openBookingModal(patient_id, patientName) {
    bookingPatientId = patient_id;
    try {
        const tests = await apiGet('labtests');
        const testSelect = document.getElementById('test_id');
        testSelect.innerHTML = '';
        tests.forEach(t => {
            const o = document.createElement('option');
            o.value = t.test_id;
            o.text = `${t.test_name} (₹${t.test_cost})`;
            testSelect.appendChild(o);
        });

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
        showError('Failed to open booking');
    }
}

async function editPatient(id) {
    try {
        const p = await apiGet(`patients/${id}`);
        editPatientId = id;
        document.getElementById('modalTitle').textContent = 'Edit Patient';
        document.getElementById('first_name').value = p.first_name || '';
        document.getElementById('last_name').value = p.last_name || '';
        document.getElementById('phone').value = p.phone || '';
        document.getElementById('street').value = p.street || '';
        document.getElementById('city').value = p.city || '';
        document.getElementById('state').value = p.state || '';
        document.getElementById('gender').value = p.gender || '';
        document.getElementById('dob').value = p.dob || '';
        document.getElementById('blood_group').value = p.blood_group || '';
        document.getElementById('patientModal').classList.remove('hidden');
    } catch (err) {
        showError('Load failed');
    }
}

async function deletePatient(id, name) {
    if (!confirm(`Are you sure you want to delete patient ${name}?`)) return;
    try {
        await apiDelete(`patients/${id}`);
        loadPatients();
    } catch (err) {
        showError('Delete failed');
    }
}

function showError(message) {
    alert(message);
}

function calculateAge(dobString) {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}