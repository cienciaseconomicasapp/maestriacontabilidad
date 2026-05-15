const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT m.*,
           c.nombre AS cuenta_nombre, c.codigo AS cuenta_codigo,
           cp.prefijo, cp.numero AS comp_numero, cp.tipo AS comp_tipo, cp.fecha AS comp_fecha,
           cc.nombre AS cc_nombre
    FROM movimiento m
    JOIN cuenta      c  ON m.id_cuenta = c.id_cuenta
    JOIN comprobante cp ON m.id_comp   = cp.id_comp
    LEFT JOIN centro_costo cc ON m.id_cc = cc.id_cc
    ORDER BY m.id_comp, m.id_mov
  `);
  res.render('movimiento/list', { pageTitle: 'Movimientos Contables', section: 'movimientos', movimientos: rows });
});

router.get('/nuevo', async (req, res) => {
  const [cuentas]      = await db.query('SELECT id_cuenta,codigo,nombre FROM cuenta WHERE acepta_mov=1 AND activa=1 ORDER BY codigo');
  const [comprobantes] = await db.query('SELECT id_comp,prefijo,numero,tipo,fecha,concepto FROM comprobante ORDER BY fecha DESC,id_comp DESC LIMIT 200');
  const [centros]      = await db.query('SELECT id_cc,codigo,nombre FROM centro_costo WHERE activo=1 ORDER BY codigo');
  res.render('movimiento/form', {
    pageTitle: 'Nuevo Movimiento', section: 'movimientos',
    movimiento: null, cuentas, comprobantes, centros,
    action: '/movimientos', method: 'POST'
  });
});

router.post('/', async (req, res) => {
  try {
    const { id_comp, id_cuenta, id_cc, descripcion } = req.body;
    const debito  = parseFloat(req.body.debito)  || 0;
    const credito = parseFloat(req.body.credito) || 0;
    if (debito > 0 && credito > 0)
      throw new Error('Un movimiento no puede tener debito y credito simultaneos');
    await db.query(
      'INSERT INTO movimiento (id_comp,id_cuenta,id_cc,debito,credito,descripcion) VALUES (?,?,?,?,?,?)',
      [id_comp, id_cuenta, id_cc || null, debito, credito, descripcion || null]
    );
    req.flash('success', 'Movimiento registrado');
    res.redirect('/movimientos');
  } catch (err) { req.flash('error', err.message); res.redirect('/movimientos/nuevo'); }
});

router.get('/:id/editar', async (req, res) => {
  try {
    const [[mov]]        = await db.query('SELECT * FROM movimiento WHERE id_mov=?', [req.params.id]);
    if (!mov) { req.flash('error', 'No encontrado'); return res.redirect('/movimientos'); }
    const [cuentas]      = await db.query('SELECT id_cuenta,codigo,nombre FROM cuenta WHERE acepta_mov=1 AND activa=1 ORDER BY codigo');
    const [comprobantes] = await db.query('SELECT id_comp,prefijo,numero,tipo,fecha,concepto FROM comprobante ORDER BY fecha DESC,id_comp DESC LIMIT 200');
    const [centros]      = await db.query('SELECT id_cc,codigo,nombre FROM centro_costo WHERE activo=1 ORDER BY codigo');
    res.render('movimiento/form', {
      pageTitle: 'Editar Movimiento', section: 'movimientos',
      movimiento: mov, cuentas, comprobantes, centros,
      action: `/movimientos/${req.params.id}?_method=PUT`, method: 'POST'
    });
  } catch (err) { req.flash('error', err.message); res.redirect('/movimientos'); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id_comp, id_cuenta, id_cc, descripcion } = req.body;
    const debito  = parseFloat(req.body.debito)  || 0;
    const credito = parseFloat(req.body.credito) || 0;
    if (debito > 0 && credito > 0)
      throw new Error('Un movimiento no puede tener debito y credito simultaneos');
    await db.query(
      'UPDATE movimiento SET id_comp=?,id_cuenta=?,id_cc=?,debito=?,credito=?,descripcion=? WHERE id_mov=?',
      [id_comp, id_cuenta, id_cc || null, debito, credito, descripcion || null, req.params.id]
    );
    req.flash('success', 'Movimiento actualizado');
    res.redirect('/movimientos');
  } catch (err) { req.flash('error', err.message); res.redirect(`/movimientos/${req.params.id}/editar`); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM movimiento WHERE id_mov=?', [req.params.id]);
    req.flash('success', 'Movimiento eliminado');
  } catch (err) { req.flash('error', err.message); }
  res.redirect('/movimientos');
});

module.exports = router;
