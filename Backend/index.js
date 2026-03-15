const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors());

let conn = null;

const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'sportsdb',
        port: 3306
    });
    console.log('✅ Connected to MySQL');
};

// GET /events
app.get('/events', async (req, res) => {
    try {
        const [results] = await conn.query(`
            SELECT e.*, COUNT(r.id) AS current_participants
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            GROUP BY e.id
            ORDER BY e.event_date ASC
        `);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
});

// GET /events/:id
app.get('/events/:id', async (req, res) => {
    try {
        const [results] = await conn.query(`
            SELECT e.*, COUNT(r.id) AS current_participants
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            WHERE e.id = ?
            GROUP BY e.id
        `, [req.params.id]);

        if (results.length === 0) return res.status(404).json({ message: 'ไม่พบกิจกรรม' });
        res.json(results[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching event', error: error.message });
    }
});

// POST /events
app.post('/events', async (req, res) => {
    try {
        const { title, description, sport_type, event_date, location, max_participants } = req.body;

        const errors = [];
        if (!title)            errors.push('กรุณากรอกชื่อกิจกรรม');
        if (!sport_type)       errors.push('กรุณาระบุประเภทกีฬา');
        if (!event_date)       errors.push('กรุณาระบุวันที่');
        if (!location)         errors.push('กรุณาระบุสถานที่');
        if (!max_participants) errors.push('กรุณาระบุจำนวนสูงสุด');

        if (errors.length > 0) return res.status(400).json({ message: 'ข้อมูลไม่ครบ', errors });

        const [result] = await conn.query('INSERT INTO events SET ?', {
            title, description, sport_type, event_date,
            location, max_participants: parseInt(max_participants)
        });

        res.status(201).json({ message: 'สร้างกิจกรรมสำเร็จ', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
});

// DELETE /events/:id
app.delete('/events/:id', async (req, res) => {
    try {
        const [result] = await conn.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบกิจกรรม' });
        res.json({ message: 'ลบกิจกรรมสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
});

// GET /events/:id/participants
app.get('/events/:id/participants', async (req, res) => {
    try {
        const [results] = await conn.query(
            'SELECT * FROM registrations WHERE event_id = ? ORDER BY registered_at ASC',
            [req.params.id]
        );
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching participants', error: error.message });
    }
});

// POST /events/:id/register
app.post('/events/:id/register', async (req, res) => {
    try {
        const eventId = req.params.id;
        const { first_name, last_name, student_id, faculty, phone } = req.body;

        const errors = [];
        if (!first_name)  errors.push('กรุณากรอกชื่อ');
        if (!last_name)   errors.push('กรุณากรอกนามสกุล');
        if (!student_id)  errors.push('กรุณากรอกรหัสนักศึกษา');
        if (!faculty)     errors.push('กรุณาระบุคณะ');

        if (errors.length > 0) return res.status(400).json({ message: 'ข้อมูลไม่ครบ', errors });

        const [eventRows] = await conn.query(`
            SELECT e.*, COUNT(r.id) AS current_participants
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            WHERE e.id = ? GROUP BY e.id
        `, [eventId]);

        if (eventRows.length === 0) return res.status(404).json({ message: 'ไม่พบกิจกรรม' });
        if (eventRows[0].current_participants >= eventRows[0].max_participants) {
            return res.status(400).json({ message: 'กิจกรรมนี้เต็มแล้ว' });
        }

        const [dup] = await conn.query(
            'SELECT id FROM registrations WHERE event_id = ? AND student_id = ?',
            [eventId, student_id]
        );
        if (dup.length > 0) return res.status(400).json({ message: 'ลงทะเบียนไปแล้ว' });

        await conn.query('INSERT INTO registrations SET ?', {
            event_id: eventId, first_name, last_name, student_id, faculty, phone
        });

        res.status(201).json({ message: 'ลงทะเบียนสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering', error: error.message });
    }
});

// DELETE /registrations/:id
app.delete('/registrations/:id', async (req, res) => {
    try {
        const [result] = await conn.query('DELETE FROM registrations WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบรายการ' });
        res.json({ message: 'ยกเลิกสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling', error: error.message });
    }
});

app.listen(port, async () => {
    await initMySQL();
    console.log(`🚀 Server running at http://localhost:${port}`);
});