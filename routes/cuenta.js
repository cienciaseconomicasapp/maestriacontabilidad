const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

const TIPOS = [
  'activo_corriente','activo_no_corriente',
  'pasivo_corriente','pasivo_no_corriente',
  'patrimonio',
  'ingreso_operacional','ingreso_no_operacional',
  'gasto_operacional','gasto_no_operacional',
  'costo_ventas'
];

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM cuenta ORDER BY codigo');
    res.render('cuenta/list', { pageTitle: 'Plan de Cuentas', section: 'cuentas', cuentas: rows });
  } catch (err) { next(err); }
});

router.get('/nueva', async (req, res) => {
  const [padres] = await db.query('SELECT codigo, nombre FROM cuenta ORDER BY codigo');
  res.render('cuenta/form', {
    pageTitle: 'Nueva Cuenta', section: 'cuentas',
    cuenta: null, padres, tipos: TIPOS,
    action: '/cuentas', method: 'POST'
  });
});

router.post('/', async (req, res) => {
  try {
    const { codigo, nombre, clase, tipo, naturaleza, nivel, cuenta_padre } = req.body;
    const acepta_mov = req.body.acepta_mov ? 1 : 0;
    const activa     = req.body.activa     ? 1 : 0;
    await db.query(
      `INSERT INTO cuenta (codigo,nombre,clase,tipo,naturaleza,nivel,cuenta_padre,acepta_mov,activa)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [codigo, nombre, clase, tipo, naturaleza, nivel, cuenta_padre || null, acepta_mov, activa]
    );
    req.flash('success', 'Cuenta creada exitosamente');
    res.redirect('/cuentas');
  } catch (err) { req.flash('error', err.message); res.redirect('/cuentas/nueva'); }
});

router.get('/:id/editar', async (req, res) => {
  try {
    const [[cuenta]] = await db.query('SELECT * FROM cuenta WHERE id_cuenta=?', [req.params.id]);
    if (!cuenta) { req.flash('error', 'Cuenta no encontrada'); return res.redirect('/cuentas'); }
    const [padres] = await db.query('SELECT codigo, nombre FROM cuenta WHERE id_cuenta!=? ORDER BY codigo', [req.params.id]);
    res.render('cuenta/form', {
      pageTitle: 'Editar Cuenta', section: 'cuentas',
      cuenta, padres, tipos: TIPOS,
      action: `/cuentas/${req.params.id}?_method=PUT`, method: 'POST'
    });
  } catch (err) { req.flash('error', err.message); res.redirect('/cuentas'); }
});

router.put('/:id', async (req, res) => {
  try {
    const { codigo, nombre, clase, tipo, naturaleza, nivel, cuenta_padre } = req.body;
    const acepta_mov = req.body.acepta_mov ? 1 : 0;
    const activa     = req.body.activa     ? 1 : 0;
    await db.query(
      `UPDATE cuenta SET codigo=?,nombre=?,clase=?,tipo=?,naturaleza=?,nivel=?,
       cuenta_padre=?,acepta_mov=?,activa=? WHERE id_cuenta=?`,
      [codigo, nombre, clase, tipo, naturaleza, nivel, cuenta_padre || null, acepta_mov, activa, req.params.id]
    );
    req.flash('success', 'Cuenta actualizada');
    res.redirect('/cuentas');
  } catch (err) { req.flash('error', err.message); res.redirect(`/cuentas/${req.params.id}/editar`); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cuenta WHERE id_cuenta=?', [req.params.id]);
    req.flash('success', 'Cuenta eliminada');
  } catch (err) { req.flash('error', 'No se puede eliminar: tiene movimientos o presupuestos asociados'); }
  res.redirect('/cuentas');
});

module.exports = router;
