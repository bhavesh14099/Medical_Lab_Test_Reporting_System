// bookings.js
let allBookings = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAllBookings();
    initializeEventListeners();
});

function initializeEventListeners() {
    // Search input
    document.getElementById('bookingSearch').addEventListener('keyup', (e) => {
        const searchText = e.target.value.toLowerCase();
        const filteredBookings = allBookings.filter(b =>
            (b.patient_name || '').toLowerCase().includes(searchText) ||
            (b.test_name || '').toLowerCase().includes(searchText)
        );
        renderBookingsTable(filteredBookings);
    });

    // Edit booking form submission
    document.getElementById('editBookingForm').addEventListener('submit', handleEditBooking);

    // Modal close buttons
    document.getElementById('closeEditBookingModal').addEventListener('click', () => {
        document.getElementById('editBookingModal').classList.add('hidden');
    });
    document.getElementById('cancelEditBookingBtn').addEventListener('click', () => {
        document.getElementById('editBookingModal').classList.add('hidden');
    });

    // Event delegation for table actions
    document.getElementById('bookingsTableBody').addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const bookingId = target.getAttribute('data-booking-id');
        const action = target.getAttribute('data-action');

        if (action === 'edit') {
            openEditBookingModal(bookingId);
        } else if (action === 'delete') {
            deleteBooking(bookingId);
        }
    });
}

async function loadAllBookings() {
    try {
        const [bookings, patients, labTests, technicians] = await Promise.all([
            apiGet('bookings'),
            apiGet('patients'),
            apiGet('labtests'),
            apiGet('technicians')
        ]);

        allBookings = bookings.map(booking => {
            const patient = patients.find(p => p.patient_id === booking.patient_id);
            const labTest = labTests.find(t => t.test_id === booking.test_id);
            const technician = technicians.find(t => t.tech_id === booking.tech_id);

            return {
                ...booking,
                patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown',
                test_name: labTest ? labTest.test_name : 'Unknown',
                technician_name: technician ? `${technician.first_name} ${technician.last_name}` : 'Unknown',
                technicians_list: technicians,
            };
        });
        renderBookingsTable(allBookings);
    } catch (err) {
        console.error('Error loading data:', err);
        alert('Failed to load booking data. Check the console for details.');
    }
}

function renderBookingsTable(data) {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-gray-500">No bookings found</td></tr>`;
      return;
    }

    data.forEach(item => {
        let statusColor = 'bg-orange-100 text-orange-800';
        if (item.status === 'Completed') {
            statusColor = 'bg-green-100 text-green-800';
        } else if (item.status === 'Canceled') {
            statusColor = 'bg-red-100 text-red-800';
        }

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';
        tr.innerHTML = `
            <td class="py-4 px-6 font-medium text-gray-900">${item.patient_name}</td>
            <td class="py-4 px-6 text-gray-600">${item.test_name}</td>
            <td class="py-4 px-6 text-gray-600">${item.technician_name}</td>
            <td class="py-4 px-6 text-gray-600">${new Date(item.scheduled_date).toLocaleString()}</td>
            <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                    ${item.status}
                </span>
            </td>
            <td class="py-4 px-6">
                <div class="relative">
                    <button data-booking-id="${item.booking_id}" data-action="edit" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                    <button data-booking-id="${item.booking_id}" data-action="delete" class="text-gray-400 hover:text-gray-600 transition-colors ml-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 00-1-1h-2.618l-.728-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function openEditBookingModal(bookingId) {
    const booking = allBookings.find(b => b.booking_id === parseInt(bookingId));
    if (!booking) {
        alert('Booking not found!');
        return;
    }
    
    // Populate form fields
    document.getElementById('booking_id_edit').value = booking.booking_id;
    document.getElementById('edit_patient_name').value = booking.patient_name;
    document.getElementById('edit_test_name').value = booking.test_name;
    document.getElementById('edit_scheduled_date').value = booking.scheduled_date.slice(0, 16);
    document.getElementById('edit_status').value = booking.status;

    // Populate technicians dropdown
    const techSelect = document.getElementById('edit_tech_id');
    techSelect.innerHTML = '';
    booking.technicians_list.forEach(t => {
        const option = document.createElement('option');
        option.value = t.tech_id;
        option.textContent = `${t.first_name} ${t.last_name}`;
        if (t.tech_id === booking.tech_id) {
            option.selected = true;
        }
        techSelect.appendChild(option);
    });
    
    document.getElementById('editBookingModal').classList.remove('hidden');
}

async function handleEditBooking(e) {
    e.preventDefault();
    const bookingId = document.getElementById('booking_id_edit').value;
    const data = {
        tech_id: parseInt(document.getElementById('edit_tech_id').value),
        scheduled_date: document.getElementById('edit_scheduled_date').value,
        status: document.getElementById('edit_status').value
    };
    try {
        await apiPut(`bookings/${bookingId}`, data);
        document.getElementById('editBookingModal').classList.add('hidden');
        loadAllBookings();
    } catch (err) {
        alert('Failed to update booking.');
    }
}

async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
        await apiDelete(`bookings/${bookingId}`);
        loadAllBookings();
    } catch (err) {
        alert('Failed to delete booking.');
    }
}