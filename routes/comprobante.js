const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

const TIPOS   = ['ingreso','egreso','diario','ajuste','apertura','cierre','nota_debito','nota_credito'];
const ESTADOS = ['borrador','contabilizado','anulado'];

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT c.*, t.razon_social, cc.nombre AS cc_nombre
    FROM comprobante c
    LEFT JOIN tercero      t  ON c.id_tercero = t.id_tercero
    LEFT JOIN centro_costo cc ON c.id_cc = cc.id_cc
    ORDER BY c.fecha DESC, c.id_comp DESC
  `);
  res.render('comprobante/list', { pageTitle: 'Comprobantes', section: 'comprobantes', comprobantes: rows });
});

router.get('/nuevo', async (req, res) => {
  const [terceros] = await db.query('SELECT id_tercero,nit,razon_social FROM tercero WHERE activo=1 ORDER BY razon_social');
  const [centros]  = await db.query('SELECT id_cc,codigo,nombre FROM centro_costo WHERE activo=1 ORDER BY codigo');
  res.render('comprobante/form', {
    pageTitle: 'Nuevo Comprobante', section: 'comprobantes',
    comprobante: null, terceros, centros, tipos: TIPOS, estados: ESTADOS,
    action: '/comprobantes', method: 'POST'
  });
});

router.post('/', async (req, res) => {
  try {
    const { tipo, prefijo, numero, fecha, periodo, concepto, id_tercero, id_cc, valor_total, estado, usuario_crea } = req.body;
    await db.query(
      `INSERT INTO comprobante (tipo,prefijo,numero,fecha,periodo,concepto,id_tercero,id_cc,valor_total,estado,usuario_crea)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [tipo, prefijo || 'CC', numero, fecha, periodo, concepto,
       id_tercero || null, id_cc || null, valor_total || 0, estado || 'borrador', usuario_crea || null]
    );
    req.flash('success', 'Comprobante creado');
    res.redirect('/comprobantes');
  } catch (err) { req.flash('error', err.message); res.redirect('/comprobantes/nuevo'); }
});

router.get('/:id/editar', async (req, res) => {
  try {
    const [[comp]] = await db.query('SELECT * FROM comprobante WHERE id_comp=?', [req.params.id]);
    if (!comp) { req.flash('error', 'No encontrado'); return res.redirect('/comprobantes'); }
    const [terceros] = await db.query('SELECT id_tercero,nit,razon_social FROM tercero WHERE activo=1 ORDER BY razon_social');
    const [centros]  = await db.query('SELECT id_cc,codigo,nombre FROM centro_costo WHERE activo=1 ORDER BY codigo');
    res.render('comprobante/form', {
      pageTitle: 'Editar Comprobante', section: 'comprobantes',
      comprobante: comp, terceros, centros, tipos: TIPOS, estados: ESTADOS,
      action: `/comprobantes/${req.params.id}?_method=PUT`, method: 'POST'
    });
  } catch (err) { req.flash('error', err.message); res.redirect('/comprobantes'); }
});

router.put('/:id', async (req, res) => {
  try {
    const { tipo, prefijo, numero, fecha, periodo, concepto, id_tercero, id_cc, valor_total, estado, usuario_crea } = req.body;
    await db.query(
      `UPDATE comprobante SET tipo=?,prefijo=?,numero=?,fecha=?,periodo=?,concepto=?,
       id_tercero=?,id_cc=?,valor_total=?,estado=?,usuario_crea=? WHERE id_comp=?`,
      [tipo, prefijo || 'CC', numero, fecha, periodo, concepto,
       id_tercero || null, id_cc || null, valor_total || 0, estado, usuario_crea || null, req.params.id]
    );
    req.flash('success', 'Comprobante actualizado');
    res.redirect('/comprobantes');
  } catch (err) { req.flash('error', err.message); res.redirect(`/comprobantes/${req.params.id}/editar`); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM comprobante WHERE id_comp=?', [req.params.id]);
    req.flash('success', 'Comprobante eliminado');
  } catch (err) { req.flash('error', 'No se puede eliminar: tiene movimientos asociados'); }
  res.redirect('/comprobantes');
});

module.exports = router;
