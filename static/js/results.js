// results.js
let allDiagnoses = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    initializeEventListeners();
});

function initializeEventListeners() {
    // Add result form submission
    document.getElementById('resultForm').addEventListener('submit', handleAddResult);
    // Edit report form submission
    document.getElementById('editReportForm').addEventListener('submit', handleEditReport);

    // Modal close buttons
    document.getElementById('closeAddResultModal').addEventListener('click', () => {
        document.getElementById('addResultModal').classList.add('hidden');
    });
    document.getElementById('cancelAddResultBtn').addEventListener('click', () => {
        document.getElementById('addResultModal').classList.add('hidden');
    });
    document.getElementById('closeReportModal').addEventListener('click', () => {
        document.getElementById('reportModal').classList.add('hidden');
    });
    document.getElementById('closeEditReportModal').addEventListener('click', () => {
        document.getElementById('editReportModal').classList.add('hidden');
    });
    document.getElementById('cancelEditReportBtn').addEventListener('click', () => {
        document.getElementById('editReportModal').classList.add('hidden');
    });
    document.getElementById('editReportBtn').addEventListener('click', () => {
        const bookingId = document.getElementById('editReportBtn').getAttribute('data-booking-id');
        document.getElementById('reportModal').classList.add('hidden');
        openEditReportModal(bookingId);
    });

    // Search input
    document.getElementById('resultSearch').addEventListener('keyup', (e) => {
        const searchText = e.target.value.toLowerCase();
        const filteredDiagnoses = allDiagnoses.filter(d =>
            (d.patient_name || '').toLowerCase().includes(searchText) ||
            (d.test_name || '').toLowerCase().includes(searchText)
        );
        renderResultsTable(filteredDiagnoses);
    });

    // Event delegation for table actions
    document.getElementById('resultsTableBody').addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const bookingId = target.getAttribute('data-booking-id');
        const action = target.getAttribute('data-action');

        if (action === 'addResult') {
            openAddResultModal(bookingId);
        } else if (action === 'viewReport') {
            openReportModal(bookingId);
        }
    });
}

async function loadAllData() {
    try {
        const [bookings, patients, labTests, diagnoses, results, bills] = await Promise.all([
            apiGet('bookings'),
            apiGet('patients'),
            apiGet('labtests'),
            apiGet('diagnosis'),
            apiGet('results'),
            apiGet('bills')
        ]);

        allDiagnoses = bookings.map(booking => {
            const diagnosis = diagnoses.find(d => d.booking_id === booking.booking_id);
            const patient = patients.find(p => p.patient_id === booking.patient_id);
            const labTest = labTests.find(t => t.test_id === booking.test_id);
            const bill = bills.find(b => b.diagnosis_id === (diagnosis ? diagnosis.diagnosis_id : null));

            return {
                ...booking,
                patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown',
                patient_info: patient,
                test_name: labTest ? labTest.test_name : 'Unknown',
                test_cost: labTest ? labTest.test_cost : 0,
                diagnosis_id: diagnosis ? diagnosis.diagnosis_id : null,
                diagnosis_remarks: diagnosis ? diagnosis.remarks : null,
                results: results.filter(r => r.diagnosis_id === (diagnosis ? diagnosis.diagnosis_id : null)),
                bill: bill
            };
        });
        renderResultsTable(allDiagnoses);
    } catch (err) {
        console.error('Error loading data:', err);
        alert('Failed to load all data. Check the console for details.');
    }
}

function renderResultsTable(data) {
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-gray-500">No results found</td></tr>`;
      return;
    }

    data.forEach(item => {
        const hasResults = item.results.length > 0;
        let statusText = item.status;
        if (hasResults) {
            statusText = 'Completed';
        }

        let statusColor = 'bg-orange-100 text-orange-800';
        if (statusText === 'Completed') {
            statusColor = 'bg-green-100 text-green-800';
        } else if (statusText === 'Confirmed') {
            statusColor = 'bg-blue-100 text-blue-800';
        } else if (statusText === 'Canceled') {
            statusColor = 'bg-red-100 text-red-800';
        }
        
        let billStatusText = '-';
        let billStatusColor = 'text-gray-500';
        if (item.bill) {
            billStatusText = item.bill.payment_status;
            if (billStatusText === 'Paid') {
                billStatusColor = 'bg-green-100 text-green-800';
            } else {
                billStatusColor = 'bg-red-100 text-red-800';
            }
        }

        let actionButton = '';
        if (statusText === 'Completed') {
            actionButton = `<button data-booking-id="${item.booking_id}" data-action="viewReport" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">View Report</button>`;
        } else if (statusText === 'Confirmed') {
            actionButton = `<button data-booking-id="${item.booking_id}" data-action="addResult" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">Add Result</button>`;
        }

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';
        tr.innerHTML = `
            <td class="py-4 px-6 font-medium text-gray-900">${item.patient_name}</td>
            <td class="py-4 px-6 text-gray-600">${item.test_name}</td>
            <td class="py-4 px-6 text-gray-600">${new Date(item.booking_date).toLocaleDateString()}</td>
            <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                    ${statusText}
                </span>
            </td>
            <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${billStatusColor}">
                    ${billStatusText}
                </span>
            </td>
            <td class="py-4 px-6">${actionButton}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function openAddResultModal(bookingId) {
    const booking = allDiagnoses.find(d => d.booking_id === parseInt(bookingId));

    if (!booking) {
      alert('Booking not found.');
      return;
    }

    if (booking.status !== 'Confirmed') {
        alert('You can only add results for a confirmed booking.');
        return;
    }

    document.getElementById('diagnosis_id_addResult').value = bookingId;
    document.getElementById('addResultModalTitle').textContent = `Add Result for ${booking.patient_name} (${booking.test_name})`;
    document.getElementById('addResultModal').classList.remove('hidden');
    document.getElementById('resultForm').reset();
}

async function handleAddResult(e) {
    e.preventDefault();
    const bookingId = document.getElementById('diagnosis_id_addResult').value;
    const resultData = {
        test_parameter: document.getElementById('test_parameter').value,
        test_value: document.getElementById('test_value').value,
        unit: document.getElementById('unit').value,
        normal_range: document.getElementById('normal_range').value,
        test_comments: document.getElementById('test_comments').value
    };

    if (!resultData.test_parameter) {
        alert('Test Parameter is required.');
        return;
    }
    
    try {
        let booking = allDiagnoses.find(d => d.booking_id === parseInt(bookingId));
        let diagnosisId = booking?.diagnosis_id;
        
        if (!diagnosisId) {
            const diagData = {
                booking_id: parseInt(bookingId),
                remarks: "Results have been entered."
            };
            const diagRes = await apiPost('diagnosis', diagData);
            diagnosisId = diagRes.diagnosis_id;

            const billData = {
                diagnosis_id: diagnosisId,
                total_amt: booking.test_cost,
                payment_status: 'Pending'
            };
            await apiPost('bills', billData);
        }

        resultData.diagnosis_id = diagnosisId;
        await apiPost('results', resultData);

        const updateStatusData = { status: 'Completed' };
        await apiPut(`bookings/${bookingId}`, updateStatusData);

        document.getElementById('resultForm').reset();
        document.getElementById('addResultModal').classList.add('hidden');
        loadAllData();
    } catch (err) {
        alert('Error adding result. Check server logs.');
        console.error(err);
    }
}

async function openReportModal(bookingId) {
    const booking = allDiagnoses.find(d => d.booking_id === parseInt(bookingId));
    
    if (!booking || !booking.diagnosis_id) {
        alert('Report not yet available for this booking.');
        return;
    }

    const editBtn = document.getElementById('editReportBtn');
    editBtn.setAttribute('data-booking-id', bookingId);
    
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = '';

    const patientInfo = booking.patient_info;
    const testResults = booking.results;
    const billInfo = booking.bill;
    const diagnosisRemarks = booking.diagnosis_remarks;

    reportContent.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center">
                <h1 class="text-3xl font-bold text-gray-900">MediChain</h1>
            </div>
            <div class="text-right">
                <h2 class="text-xl font-semibold text-gray-800">Laboratory Report</h2>
                <p class="text-sm text-gray-500">Report ID: ${booking.diagnosis_id}</p>
            </div>
        </div>

        <div class="bg-gray-100 p-6 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div><span class="font-medium text-gray-900">Patient Name:</span> ${patientInfo.first_name} ${patientInfo.last_name}</div>
                <div><span class="font-medium text-gray-900">Patient ID:</span> ${patientInfo.patient_id}</div>
                <div><span class="font-medium text-gray-900">Date of Birth:</span> ${patientInfo.dob || '-'}</div>
                <div><span class="font-medium text-gray-900">Gender:</span> ${patientInfo.gender || '-'}</div>
                <div><span class="font-medium text-gray-900">Date Collected:</span> ${new Date(booking.scheduled_date).toLocaleDateString()}</div>
            </div>
        </div>

        <div class="bg-gray-100 p-6 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Test Results</h3>
            <table class="w-full text-sm text-left text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-200">
                    <tr>
                        <th scope="col" class="py-3 px-6">Test Parameter</th>
                        <th scope="col" class="py-3 px-6">Result</th>
                        <th scope="col" class="py-3 px-6">Normal Range</th>
                        <th scope="col" class="py-3 px-6">Comments</th>
                    </tr>
                </thead>
                <tbody>
                    ${testResults.map(r => `
                        <tr class="bg-white border-b hover:bg-gray-50">
                            <td class="py-4 px-6 font-medium text-gray-900">${r.test_parameter}</td>
                            <td class="py-4 px-6">${r.test_value} ${r.unit || ''}</td>
                            <td class="py-4 px-6">${r.normal_range || ''}</td>
                            <td class="py-4 px-6">${r.test_comments || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="mt-4 text-sm text-gray-600">
                <span class="font-medium text-gray-900">Remarks:</span> ${diagnosisRemarks || '-'}
            </div>
        </div>
        
        <div class="bg-gray-100 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Billing Summary</h3>
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div><span class="font-medium text-gray-900">Test Name:</span> ${booking.test_name}</div>
                <div><span class="font-medium text-gray-900">Amount:</span> ₹${billInfo ? billInfo.total_amt : 'N/A'}</div>
                <div><span class="font-medium text-gray-900">Total Due:</span> ₹${billInfo ? billInfo.total_amt : 'N/A'}</div>
                <div><span class="font-medium text-gray-900">Status:</span> 
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${billInfo?.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${billInfo ? billInfo.payment_status : 'N/A'}
                    </span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('reportModal').classList.remove('hidden');
}


async function openEditReportModal(bookingId) {
    const booking = allDiagnoses.find(d => d.booking_id === parseInt(bookingId));
    if (!booking) {
        alert('Report not found.');
        return;
    }
    
    // Populate hidden IDs
    document.getElementById('diagnosis_id_editReport').value = booking.diagnosis_id;
    if (booking.bill) {
        document.getElementById('bill_id_edit').value = booking.bill.bill_id;
    }

    // Populate diagnosis remarks
    document.getElementById('diagnosis_remarks_edit').value = booking.diagnosis_remarks || '';

    // Populate test results
    const resultsContainer = document.getElementById('editResultsContainer');
    resultsContainer.innerHTML = booking.results.map(r => `
        <div class="grid grid-cols-2 gap-6 p-4 border rounded-lg bg-white relative">
            <input type="hidden" name="result_id" value="${r.result_id}">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Parameter</label>
                <input type="text" name="test_parameter_edit" value="${r.test_parameter}" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <input type="text" name="test_value_edit" value="${r.test_value}" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <input type="text" name="unit_edit" value="${r.unit || ''}" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Normal Range</label>
                <input type="text" name="normal_range_edit" value="${r.normal_range || ''}" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
            </div>
            <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea name="test_comments_edit" rows="2" class="w-full px-4 py-3 border border-gray-300 rounded-lg">${r.test_comments || ''}</textarea>
            </div>
        </div>
    `).join('');

    // Populate billing information
    if (booking.bill) {
        document.getElementById('total_amt_edit').value = booking.bill.total_amt;
        document.getElementById('payment_status_edit').value = booking.bill.payment_status;
    }

    document.getElementById('editReportModal').classList.remove('hidden');
}


async function handleEditReport(e) {
    e.preventDefault();
    const form = e.target;
    const diagnosisId = form.querySelector('#diagnosis_id_editReport').value;
    const billId = form.querySelector('#bill_id_edit').value;
    
    // Update diagnosis remarks
    const diagData = {
        remarks: form.querySelector('#diagnosis_remarks_edit').value
    };
    await apiPut(`diagnosis/${diagnosisId}`, diagData);

    // Update test results
    const resultElements = form.querySelectorAll('#editResultsContainer > div');
    for (const el of resultElements) {
        const resultId = el.querySelector('input[name="result_id"]').value;
        const resultData = {
            test_parameter: el.querySelector('input[name="test_parameter_edit"]').value,
            test_value: el.querySelector('input[name="test_value_edit"]').value,
            unit: el.querySelector('input[name="unit_edit"]').value,
            normal_range: el.querySelector('input[name="normal_range_edit"]').value,
            test_comments: el.querySelector('textarea[name="test_comments_edit"]').value
        };
        await apiPut(`results/${resultId}`, resultData);
    }
    
    // Update billing
    if (billId) {
        const billData = {
            total_amt: form.querySelector('#total_amt_edit').value,
            payment_status: form.querySelector('#payment_status_edit').value
        };
        await apiPut(`bills/${billId}`, billData);
    }

    document.getElementById('editReportModal').classList.add('hidden');
    loadAllData();
}