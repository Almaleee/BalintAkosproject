require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend')));

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
});

app.post('/register', async (req, res) => {
    const { nev, jelszo, email } = req.body;
    const hashedPassword = await bcrypt.hash(jelszo, 10);
    console.log(hashedPassword);
    try {
        await db.execute('INSERT INTO felhasznalok (nev, jelszo, email) VALUES (?, ?, ?)', [nev, hashedPassword, email]);
        res.status(201).json({ message: 'Sikeres regisztráció!' });
    } catch (error) {
        res.status(500).json({ error: 'A regisztráció sikertelen.' });
    }
});

async function getAllSeriesForAdmin() {
    try {
        const [rows] = await db.execute(`
            SELECT 
                f.nev AS felhasznalok_nev,
                f.email AS felhasznalok_email,
                s.cim AS sorozatok_cim,
                n.evad,
                n.epizod,
                n.azon AS naplok_azon,
                n.felhasznalo_azon,
                n.sorozat_azon
            FROM naplok n
            LEFT JOIN felhasznalok f ON n.felhasznalo_azon = f.azon
            LEFT JOIN sorozatok s ON n.sorozat_azon = s.azon
            ORDER BY f.nev, s.cim, n.evad, n.epizod
        `);

        return rows.map(row => ({
            felhasznalo: {
                azon: row.felhasznalo_azon,
                nev: row.felhasznalok_nev,
                email: row.felhasznalok_email
            },
            sorozat: {
                azon: row.sorozat_azon,
                cim: row.sorozatok_cim
            },
            epizod_adatok: {
                naplok_azon: row.naplok_azon,
                evad: row.evad,
                epizod: row.epizod
            }
        }));
    } catch (error) {
        throw new Error(`Nem sikerült lekérdezni a sorozatokat: ${error.message}`);
    }
}

app.get('/admin/sorozatok', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.isAdmin) {
            return res.status(403).json({ error: 'Csak admin érheti el ezt a végpontot!' });
        }

        const eredmeny = await getAllSeriesForAdmin();
        res.json(eredmeny);
    } catch (error) {
        console.error("Hiba az admin lekérdezés során:", error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Érvénytelen token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Lejárt token' });
        }

        res.status(500).json({
            error: 'Szerverhiba',
            details: error.message
        });
    }
});

app.post('/login', async (req, res) => {
    const { nev, jelszo } = req.body;
    console.log("Bejelentkezési kérelem:", { nev, jelszo });

    try {
        if (nev === 'admin') {
            if (jelszo === process.env.ADMIN_PASSWORD) {
                const token = jwt.sign({ felhasznalo_azon: null, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
                return res.json({ token, isAdmin: true });
            } else {
                console.log("Hibás admin jelszó.");
                return res.status(400).json({ error: 'Hibás admin jelszó.' });
            }
        }

        const [rows] = await db.execute('SELECT * FROM felhasznalok WHERE nev = ?', [nev]);
        if (rows.length === 0) {
            console.log("Felhasználó nem található.");
            return res.status(400).json({ error: 'Hibás felhasználónév vagy jelszó.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(jelszo, user.jelszo);

        console.log("Jelszó egyezés:", isMatch);
        if (!isMatch) {
            console.log("Hibás jelszó.");
            return res.status(400).json({ error: 'Hibás felhasználónév vagy jelszó.' });
        }

        const token = jwt.sign({ felhasznalo_azon: user.azon, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, isAdmin: false });
    } catch (error) {
        console.error("Hiba a bejelentkezés során:", error);
        res.status(500).json({ error: 'Szerverhiba.' });
    }
});


app.post('/sorozat', async (req, res) => {
    const { token, cim, evad, epizod } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [sorozat] = await db.execute('SELECT azon FROM sorozatok WHERE cim = ?', [cim]);
        let sorozat_azon;
        
        if (sorozat.length === 0) {
            const [inserted] = await db.execute('INSERT INTO sorozatok (cim) VALUES (?)', [cim]);
            sorozat_azon = inserted.insertId;
        } else {
            sorozat_azon = sorozat[0].azon;
        }
        
        await db.execute('INSERT INTO naplok (felhasznalo_azon, sorozat_azon, evad, epizod) VALUES (?, ?, ?, ?)', [decoded.felhasznalo_azon, sorozat_azon, evad, epizod]);
        res.json({ message: 'Sorozat sikeresen hozzáadva!' });
    } catch (error) {
        res.status(401).json({ error: 'Hozzáférés megtagadva.' });
    }
});

app.get('/sorozat', async (req, res) => {
    const { token } = req.headers;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await db.execute(`
            SELECT sorozatok.cim, naplok.evad, naplok.epizod, naplok.sorozat_azon 
            FROM naplok 
            JOIN sorozatok ON naplok.sorozat_azon = sorozatok.azon 
            WHERE naplok.felhasznalo_azon = ?`, [decoded.felhasznalo_azon]);
        res.json(rows);
    } catch (error) {
        res.status(401).json({ error: 'Hozzáférés megtagadva.' });
    }
});

app.put('/sorozat/:sorozat_azon', async (req, res) => {
    const { sorozat_azon } = req.params;
    const { evad, epizod } = req.body;
    const token = req.headers['token'];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await db.execute(
            'UPDATE naplok SET evad = ?, epizod = ? WHERE sorozat_azon = ? AND felhasznalo_azon = ?',
            [evad, epizod, sorozat_azon, decoded.felhasznalo_azon]
        );
        res.json({ message: 'Sorozat sikeresen módosítva!' });
    } catch (error) {
        res.status(401).json({ error: 'Hozzáférés megtagadva.' });
    }
});

app.delete('/sorozat/:sorozat_azon', async (req, res) => {
    const { sorozat_azon } = req.params;
    const token = req.headers['token'];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await db.execute(
            'DELETE FROM naplok WHERE sorozat_azon = ? AND felhasznalo_azon = ?',
            [sorozat_azon, decoded.felhasznalo_azon]
        );
        res.json({ message: 'Sorozat sikeresen törölve!' });
    } catch (error) {
        res.status(401).json({ error: 'Hozzáférés megtagadva.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}));

app.listen(3000, () => console.log('A szerver fut a 3000-es porton.'));
