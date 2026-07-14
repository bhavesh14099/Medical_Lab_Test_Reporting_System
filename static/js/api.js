// api.js - helper to call /api endpoints
async function apiGet(endpoint) {
    const res = await fetch(`/api/${endpoint}`);
    if (!res.ok) throw new Error('API GET failed');
    return res.json();
}
async function apiPost(endpoint, data) {
    const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}
async function apiPut(endpoint, data) {
    const res = await fetch(`/api/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}
async function apiDelete(endpoint) {
    const res = await fetch(`/api/${endpoint}`, { method: 'DELETE' });
    return res.json();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored auth tokens
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        // Redirect to login page
        window.location.href = '/';
    }
}