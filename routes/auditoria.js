const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT a.*
    FROM auditoria_mov a
    ORDER BY a.momento DESC
    LIMIT 500
  `);
  res.render('auditoria/list', { pageTitle: 'Auditoria de Movimientos', section: 'auditoria', registros: rows });
});

module.exports = router;
