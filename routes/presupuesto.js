const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.*, c.codigo AS cuenta_codigo, c.nombre AS cuenta_nombre,
           cc.codigo AS cc_codigo, cc.nombre AS cc_nombre
    FROM presupuesto p
    JOIN cuenta       c  ON p.id_cuenta = c.id_cuenta
    JOIN centro_costo cc ON p.id_cc     = cc.id_cc
    ORDER BY p.periodo DESC, c.codigo
  `);
  res.render('presupuesto/list', { pageTitle: 'Presupuesto', section: 'presupuesto', presupuestos: rows });
});

router.get('/nuevo', async (req, res) => {
  const [cuentas] = await db.query('SELECT id_cuenta,codigo,nombre FROM cuenta WHERE acepta_mov=1 ORDER BY codigo');
  const [centros] = await db.query('SELECT id_cc,codigo,nombre FROM centro_costo WHERE activo=1 ORDER BY codigo');
  res.render('presupuesto/form', {
    pageTitle: 'Nuevo Presupuesto', section: 'presupuesto',
    presupuesto: null, cuentas, centros,
    action: '/presupuesto', method: 'POST'
  });
});

router.post('/', async (req, res) => {
  try {
    const { id_cuenta, id_cc, periodo, valor_pres } = req.body;
    await db.query(
      'INSERT INTO presupuesto (id_cuenta,id_cc,periodo,valor_pres) VALUES (?,?,?,?)',
      [id_cuenta, id_cc, periodo, valor_pres]
    );
    req.flash('success', 'Presupuesto creado');
    res.redirect('/presupuesto');
  } catch (err) { req.flash('error', err.message); res.redirect('/presupuesto/nuevo'); }
});

router.get('/:id/editar', async (req, res) => {
  try {
    const [[pres]] = await db.query('SELECT * FROM presupuesto WHERE id_pres=?', [req.params.id]);
    if (!pres) { req.flash('error', 'No encontrado'); return res.redirect('/presupuesto'); }
    const [cuentas] = await db.query('SELECT id_cuenta,codigo,nombre FROM cuenta WHERE acepta_mov=1 ORDER BY codigo');
    const [centros] = await db.query('SELECT id_cc,codigo,nombre FROM centro_costo WHERE activo=1 ORDER BY codigo');
    res.render('presupuesto/form', {
      pageTitle: 'Editar Presupuesto', section: 'presupuesto',
      presupuesto: pres, cuentas, centros,
      action: `/presupuesto/${req.params.id}?_method=PUT`, method: 'POST'
    });
  } catch (err) { req.flash('error', err.message); res.redirect('/presupuesto'); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id_cuenta, id_cc, periodo, valor_pres } = req.body;
    await db.query(
      'UPDATE presupuesto SET id_cuenta=?,id_cc=?,periodo=?,valor_pres=? WHERE id_pres=?',
      [id_cuenta, id_cc, periodo, valor_pres, req.params.id]
    );
    req.flash('success', 'Presupuesto actualizado');
    res.redirect('/presupuesto');
  } catch (err) { req.flash('error', err.message); res.redirect(`/presupuesto/${req.params.id}/editar`); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM presupuesto WHERE id_pres=?', [req.params.id]);
    req.flash('success', 'Presupuesto eliminado');
  } catch (err) { req.flash('error', err.message); }
  res.redirect('/presupuesto');
});

module.exports = router;
