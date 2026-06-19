
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000; // Use 3000 as the main entry point

app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// POST /api/problems — create entry
app.post('/api/problems', (req, res) => {
  const { title, description, category, severity, time_spent_minutes, tags, date } = req.body;
  const id = uuidv4();
  const problemDate = date || new Date().toISOString().split('T')[0];
  
  const stmt = db.prepare(`
    INSERT INTO problems (id, title, description, category, severity, time_spent_minutes, tags, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    stmt.run(id, title, description, category, severity, time_spent_minutes, tags, problemDate);
    const result = db.prepare('SELECT * FROM problems WHERE id = ?').get(id);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create problem entry' });
  }
});

// GET /api/problems — list entries
app.get('/api/problems', (req, res) => {
  const { date, category, tag } = req.query;
  let query = 'SELECT * FROM problems';
  const params = [];
  const filters = [];

  if (date) {
    filters.push('date = ?');
    params.push(date);
  }
  if (category) {
    filters.push('category = ?');
    params.push(category);
  }
  if (tag) {
    filters.push('tags LIKE ?');
    params.push(`%${tag}%`);
  }

  if (filters.length > 0) {
    query += ' WHERE ' + filters.join(' AND ');
  }
  
  query += ' ORDER BY created_at DESC';

  try {
    const problems = db.prepare(query).all(...params);
    res.json(problems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// PATCH /api/problems/:id — update
app.patch('/api/problems/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, category, severity, time_spent_minutes, tags, date, resolved } = req.body;
  
  const updates = [];
  const params = [];

  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (category !== undefined) { updates.push('category = ?'); params.push(category); }
  if (severity !== undefined) { updates.push('severity = ?'); params.push(severity); }
  if (time_spent_minutes !== undefined) { updates.push('time_spent_minutes = ?'); params.push(time_spent_minutes); }
  if (tags !== undefined) { updates.push('tags = ?'); params.push(tags); }
  if (date !== undefined) { updates.push('date = ?'); params.push(date); }
  if (resolved !== undefined) { updates.push('resolved = ?'); params.push(resolved ? 1 : 0); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(id);
  const query = `UPDATE problems SET ${updates.join(', ')} WHERE id = ?`;

  try {
    const result = db.prepare(query).run(...params);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    const updated = db.prepare('SELECT * FROM problems WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update problem entry' });
  }
});

// DELETE /api/problems/:id — delete
app.delete('/api/problems/:id', (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM problems WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete problem entry' });
  }
});

// GET /api/problems/insights — aggregate stats
app.get('/api/problems/insights', (req, res) => {
  try {
    const categoryCounts = db.prepare('SELECT category, COUNT(*) as count FROM problems GROUP BY category').all();
    const severityAvg = db.prepare('SELECT AVG(severity) as avgSeverity FROM problems').get();
    const timeSpentTotal = db.prepare('SELECT SUM(time_spent_minutes) as totalMinutes FROM problems').get();
    
    // Recent trend (last 7 days)
    const trend = db.prepare(`
      SELECT date, COUNT(*) as count 
      FROM problems 
      WHERE date >= date('now', '-7 days')
      GROUP BY date 
      ORDER BY date ASC
    `).all();

    res.json({
      categoryCounts,
      severityAvg: severityAvg.avgSeverity || 0,
      timeSpentTotal: timeSpentTotal.totalMinutes || 0,
      trend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
