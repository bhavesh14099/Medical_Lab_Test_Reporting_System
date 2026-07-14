// technicians.js
let techEditId = null;
let allTechnicians = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchTechs();
  initializeEventListeners();
});

function initializeEventListeners() {
    const modal = document.getElementById('techModal');
    const form = document.getElementById('techForm');
    const tableBody = document.getElementById('techTableBody');

    document.getElementById('addTechBtn').addEventListener('click', () => {
        techEditId = null;
        document.getElementById('techModalTitle').textContent = 'Add Technician';
        form.reset();
        modal.classList.remove('hidden');
    });

    document.getElementById('closeTechModal').addEventListener('click', () => {
        modal.classList.add('hidden');
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
            qualification: document.getElementById('qualification').value,
            specialization: document.getElementById('specialization').value
        };
        try {
            if (techEditId) await apiPut(`technicians/${techEditId}`, data);
            else await apiPost('technicians', data);
            modal.classList.add('hidden');
            fetchTechs();
        } catch (err) {
            alert('Save error');
        }
    });
    
    // Search input
    document.getElementById('techSearch').addEventListener('keyup', (e) => {
        const searchText = e.target.value.toLowerCase();
        const filteredTechs = allTechnicians.filter(t =>
            (t.first_name + ' ' + t.last_name).toLowerCase().includes(searchText) ||
            (t.phone || '').toLowerCase().includes(searchText) ||
            (t.qualification || '').toLowerCase().includes(searchText) ||
            (t.specialization || '').toLowerCase().includes(searchText)
        );
        renderTechsTable(filteredTechs);
    });

    // Use event delegation for table actions
    tableBody.addEventListener('click', handleTableActions);
}

function handleTableActions(event) {
    const target = event.target;
    // Find the button or its parent with a data-action attribute
    const actionButton = target.closest('button[data-action]');
    
    if (!actionButton) return;

    const techId = actionButton.getAttribute('data-id');
    const action = actionButton.getAttribute('data-action');

    switch (action) {
        case 'toggleMenu':
            toggleActionMenu(techId);
            break;
        case 'edit':
            editTech(techId);
            break;
        case 'delete':
            deleteTech(techId);
            break;
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

async function fetchTechs() {
  try {
    const techs = await apiGet('technicians');
    allTechnicians = techs;
    renderTechsTable(techs);
  } catch (err) {
    console.error(err);
  }
}

function renderTechsTable(techs) {
    const tbody = document.getElementById('techTableBody');
    tbody.innerHTML = '';

    if (techs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-12 text-gray-500">No technicians found</td></tr>`;
      return;
    }

    techs.forEach(t => {
      const tr = document.createElement('tr');
      const fullName = `${t.first_name || ''} ${t.last_name || ''}`.trim();
      const initials = (t.first_name?.[0] || '') + (t.last_name?.[0] || '');
      
      tr.innerHTML = `
        <td class="py-4 px-6">
            <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium mr-4">
                    ${initials}
                </div>
                <div>
                    <div class="font-medium text-gray-900">${fullName}</div>
                    <div class="text-sm text-gray-500">${t.specialization || ''}</div>
                </div>
            </div>
        </td>
        <td class="py-4 px-6 text-gray-600">${t.phone || '-'}</td>
        <td class="py-4 px-6 text-gray-600">${t.qualification || '-'}</td>
        <td class="py-4 px-6 text-gray-600">${t.specialization || '-'}</td>
        <td class="py-4 px-6">
          <div class="relative">
            <button data-id="${t.tech_id}" data-action="toggleMenu" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>
            <div id="actionMenu-${t.tech_id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button data-id="${t.tech_id}" data-action="edit" class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100">
                <svg class="w-4 h-4 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
              <button data-id="${t.tech_id}" data-action="delete" class="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <svg class="w-4 h-4 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </td>`;
      tbody.appendChild(tr);
    });
}


async function editTech(id) {
  try {
    const t = await apiGet(`technicians/${id}`);
    techEditId = id;
    document.getElementById('techModalTitle').textContent = 'Edit Technician';
    document.getElementById('first_name').value = t.first_name || '';
    document.getElementById('last_name').value = t.last_name || '';
    document.getElementById('phone').value = t.phone || '';
    document.getElementById('street').value = t.street || '';
    document.getElementById('city').value = t.city || '';
    document.getElementById('state').value = t.state || '';
    document.getElementById('qualification').value = t.qualification || '';
    document.getElementById('specialization').value = t.specialization || '';
    document.getElementById('techModal').classList.remove('hidden');
  } catch (err) {
    alert('Load failed');
  }
}

async function deleteTech(id) {
  if (!confirm('Delete technician?')) return;
  try {
    await apiDelete(`technicians/${id}`);
    fetchTechs();
  } catch (err) {
    alert('Delete failed');
  }
}