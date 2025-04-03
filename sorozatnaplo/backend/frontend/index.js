const apiUrl = window.location.origin;

async function register() {
    const nev = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const jelszo = document.getElementById('regPassword').value;
    
    const res = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nev, email, jelszo })
    });
    
    const data = await res.json();
    alert(data.message || data.error);
}


async function login() {
    const nev = document.getElementById('loginName').value;
    const jelszo = document.getElementById('loginPassword').value;


    console.log("Bejelentkezési adatok:", { nev, jelszo });
    const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nev, jelszo })
    });

    console.log("Szerver válasza:", res);
    const data = await res.json();
    console.log("Szerver válasz adatai:", data);
    if (data.token) {
        localStorage.setItem('token', data.token);
        
        if (data.isAdmin) {
            loadSeriesForAdmin();
        } else {
            loadSeries();
        }
    
        document.getElementById('login').style.display = 'none';
        document.getElementById('register').style.display = 'none';
        document.getElementById('seriesForm').style.display = 'block';
        document.getElementById('seriesList').style.display = 'block';
    } else {
        alert(data.error);
    }
}

async function addSeries() {
    const cim = document.getElementById('seriesTitle').value;
    const evad = document.getElementById('seriesSeason').value;
    const epizod = document.getElementById('seriesEpisode').value;
    const token = localStorage.getItem('token');
    
    const res = await fetch(`${apiUrl}/sorozat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, cim, evad, epizod })
    });
    
    const data = await res.json();
    alert(data.message || data.error);
    loadSeries();
}

async function loadSeriesForAdmin() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${apiUrl}/admin/sorozatok`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();

    const list = document.getElementById('series');
    list.innerHTML = '';

    data.forEach(series => {
        const item = document.createElement('li');
        item.textContent = `
            Felhasználó: ${series.felhasznalo.nev} (${series.felhasznalo.email}) 
            - Sorozat: ${series.sorozat.cim} 
            - Évad: ${series.epizod_adatok.evad}, Epizód: ${series.epizod_adatok.epizod}
        `;

        list.appendChild(item);
    });
}

async function loadSeries() {
    const token = localStorage.getItem('token');
    
    const res = await fetch(`${apiUrl}/sorozat`, {
        method: 'GET',
        headers: { 'token': token }
    });
    
    const data = await res.json();
    const list = document.getElementById('series');
    list.innerHTML = '';
    
    data.forEach(series => {
        const item = document.createElement('li');
        item.textContent = `${series.cim} - Évad: ${series.evad}, Epizód: ${series.epizod}`;
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Módosítás';
        editButton.onclick = () => editSeries(series.sorozat_azon, series.evad, series.epizod);
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Törlés';
        deleteButton.onclick = () => deleteSeries(series.sorozat_azon);
        
        item.appendChild(editButton);
        item.appendChild(deleteButton);
        list.appendChild(item);
    });
}

async function editSeries(sorozat_azon, evad, epizod) {
    const newEvad = prompt('Új évad száma:', evad);
    const newEpizod = prompt('Új epizód száma:', epizod);
    
    if (newEvad !== null && newEpizod !== null) {
        const token = localStorage.getItem('token');
        
        const res = await fetch(`${apiUrl}/sorozat/${sorozat_azon}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ evad: newEvad, epizod: newEpizod })
        });
        
        const data = await res.json();
        alert(data.message || data.error);
        loadSeries();
    }
}

async function deleteSeries(sorozat_azon) {
    if (confirm('Biztosan törölni szeretnéd ezt a sorozatot?')) {
        const token = localStorage.getItem('token');
        
        const res = await fetch(`${apiUrl}/sorozat/${sorozat_azon}`, {
            method: 'DELETE',
            headers: { 'token': token }
        });
        
        const data = await res.json();
        alert(data.message || data.error);
        loadSeries();
    }
}

function logout() {
    localStorage.removeItem('token');
    document.getElementById('login').style.display = 'block';
    document.getElementById('register').style.display = 'block';
    document.getElementById('seriesForm').style.display = 'none';
    document.getElementById('seriesList').style.display = 'none';
}
