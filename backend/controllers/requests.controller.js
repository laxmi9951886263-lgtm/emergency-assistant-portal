const fs = require('node:fs/promises');
const path = require('node:path');

// Reuse the project's existing db.json file at the project root.
const DB_PATH = path.resolve(__dirname, '..', '..', 'db.json');

async function readRequests() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.requests)) {
      throw new Error('db.json must contain a "requests" array.');
    }
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      const initial = { requests: [] };
      await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2) + '\n');
      return initial;
    }
    throw error;
  }
}

async function writeRequests(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2) + '\n');
}

async function getRequests(req, res, next) {
  try {
    const db = await readRequests();
    res.json(db.requests);
  } catch (error) {
    next(error);
  }
}

async function createRequest(req, res, next) {
  try {
    const { name, phone, type, severity, address, description, location } = req.body ?? {};
    const requiredText = { name, phone, type, severity, address, description };
    const missing = Object.entries(requiredText)
      .filter(([, value]) => typeof value !== 'string' || !value.trim())
      .map(([key]) => key);

    if (missing.length) {
      return res.status(400).json({
        message: 'Required fields are missing or invalid.',
        fields: missing
      });
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be a valid 10-digit Indian mobile number.' });
    }

    const db = await readRequests();
    const nextId = db.requests.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    const saved = {
      id: nextId,
      name: name.trim(),
      phone: phone.trim(),
      type: type.trim(),
      severity: severity.trim(),
      address: address.trim(),
      description: description.trim(),
      ...(location && typeof location === 'object' ? { location } : {}),
      createdAt: new Date().toISOString(),
      status: 'Pending'
    };

    db.requests.push(saved);
    await writeRequests(db);
    return res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
}

module.exports = { getRequests, createRequest };
