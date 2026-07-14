// labtests.js
let testEditId = null;
let allLabTests = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchLabTests();
  initializeEventListeners();
});

function initializeEventListeners() {
    const modal = document.getElementById('testModal');
    const form = document.getElementById('testForm');
    const tableBody = document.getElementById('labTestTableBody');

    document.getElementById('addTestBtn').addEventListener('click', () => {
        testEditId = null;
        document.getElementById('testModalTitle').textContent = 'Add Lab Test';
        form.reset();
        modal.classList.remove('hidden');
    });

    document.getElementById('closeTestModal').addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    document.getElementById('cancelTestBtn').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            test_name: document.getElementById('test_name').value,
            test_cost: parseFloat(document.getElementById('test_cost').value) || 0,
            description: document.getElementById('description').value,
            sample_type: document.getElementById('sample_type').value
        };
        try {
            if (testEditId) await apiPut(`labtests/${testEditId}`, data);
            else await apiPost('labtests', data);
            modal.classList.add('hidden');
            fetchLabTests();
        } catch (err) {
            alert('Save failed');
        }
    });

    // Search input
    document.getElementById('testSearch').addEventListener('keyup', (e) => {
        const searchText = e.target.value.toLowerCase();
        const filteredTests = allLabTests.filter(t =>
            (t.test_name).toLowerCase().includes(searchText) ||
            (t.description || '').toLowerCase().includes(searchText) ||
            (t.sample_type || '').toLowerCase().includes(searchText)
        );
        renderLabTestsTable(filteredTests);
    });
    
    // Use event delegation for the dynamically created buttons
    tableBody.addEventListener('click', handleTableActions);
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

    const testId = actionButton.getAttribute('data-id');
    const action = actionButton.getAttribute('data-action');

    switch (action) {
        case 'toggleMenu':
            toggleActionMenu(testId);
            break;
        case 'edit':
            editTest(testId);
            break;
        case 'delete':
            deleteTest(testId);
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


function renderLabTestsTable(tests) {
  const tbody = document.getElementById('labTestTableBody');
  tbody.innerHTML = '';
  tests.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-4 px-6">${t.test_name}</td>
      <td class="py-4 px-6">${t.test_cost}</td>
      <td class="py-4 px-6">${t.description || ''}</td>
      <td class="py-4 px-6">${t.sample_type || ''}</td>
      <td class="py-4 px-6">
        <div class="relative">
          <button data-id="${t.test_id}" data-action="toggleMenu" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </button>
          <div id="actionMenu-${t.test_id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <button data-id="${t.test_id}" data-action="edit" class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100">
              <svg class="w-4 h-4 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Edit
            </button>
            <button data-id="${t.test_id}" data-action="delete" class="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
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

async function fetchLabTests() {
  try {
    const tests = await apiGet('labtests');
    allLabTests = tests;
    renderLabTestsTable(tests);
  } catch (err) {
    console.error(err);
  }
}

async function editTest(id) {
  try {
    const t = await apiGet(`labtests/${id}`);
    testEditId = id;
    document.getElementById('testModalTitle').textContent = 'Edit Lab Test';
    document.getElementById('test_name').value = t.test_name;
    document.getElementById('test_cost').value = t.test_cost;
    document.getElementById('description').value = t.description || '';
    document.getElementById('sample_type').value = t.sample_type || '';
    document.getElementById('testModal').classList.remove('hidden');
  } catch (err) {
    alert('Load failed');
  }
}

async function deleteTest(id) {
  if (!confirm('Delete lab test?')) return;
  try {
    await apiDelete(`labtests/${id}`);
    fetchLabTests();
  } catch (err) {
    alert('Delete failed');
  }
}