const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT e.*, t.nit, t.razon_social, t.email, t.telefono, t.ciudad
    FROM empleado e JOIN tercero t ON e.id_tercero = t.id_tercero
    ORDER BY t.razon_social
  `);
  res.render('empleado/list', { pageTitle: 'Empleados', section: 'empleados', empleados: rows });
});

router.get('/nuevo', async (req, res) => {
  const [terceros] = await db.query(
    "SELECT id_tercero, nit, razon_social FROM tercero WHERE tipo='empleado' ORDER BY razon_social"
  );
  res.render('empleado/form', {
    pageTitle: 'Nuevo Empleado', section: 'empleados',
    empleado: null, terceros,
    action: '/empleados', method: 'POST'
  });
});

router.post('/', async (req, res) => {
  try {
    const { id_tercero, cargo, area, salario_base, fecha_ingreso, fecha_retiro } = req.body;
    const activo = req.body.activo ? 1 : 0;
    await db.query(
      `INSERT INTO empleado (id_tercero,cargo,area,salario_base,fecha_ingreso,fecha_retiro,activo)
       VALUES (?,?,?,?,?,?,?)`,
      [id_tercero, cargo, area || null, salario_base, fecha_ingreso, fecha_retiro || null, activo]
    );
    req.flash('success', 'Empleado registrado');
    res.redirect('/empleados');
  } catch (err) { req.flash('error', err.message); res.redirect('/empleados/nuevo'); }
});

router.get('/:id/editar', async (req, res) => {
  try {
    const [[empleado]] = await db.query(`
      SELECT e.*, t.nit, t.razon_social
      FROM empleado e JOIN tercero t ON e.id_tercero = t.id_tercero
      WHERE e.id_empleado=?
    `, [req.params.id]);
    if (!empleado) { req.flash('error', 'No encontrado'); return res.redirect('/empleados'); }
    const [terceros] = await db.query(
      "SELECT id_tercero, nit, razon_social FROM tercero WHERE tipo='empleado' ORDER BY razon_social"
    );
    res.render('empleado/form', {
      pageTitle: 'Editar Empleado', section: 'empleados',
      empleado, terceros,
      action: `/empleados/${req.params.id}?_method=PUT`, method: 'POST'
    });
  } catch (err) { req.flash('error', err.message); res.redirect('/empleados'); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id_tercero, cargo, area, salario_base, fecha_ingreso, fecha_retiro } = req.body;
    const activo = req.body.activo ? 1 : 0;
    await db.query(
      `UPDATE empleado SET id_tercero=?,cargo=?,area=?,salario_base=?,fecha_ingreso=?,
       fecha_retiro=?,activo=? WHERE id_empleado=?`,
      [id_tercero, cargo, area || null, salario_base, fecha_ingreso, fecha_retiro || null, activo, req.params.id]
    );
    req.flash('success', 'Empleado actualizado');
    res.redirect('/empleados');
  } catch (err) { req.flash('error', err.message); res.redirect(`/empleados/${req.params.id}/editar`); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM empleado WHERE id_empleado=?', [req.params.id]);
    req.flash('success', 'Empleado eliminado');
  } catch (err) { req.flash('error', 'No se puede eliminar'); }
  res.redirect('/empleados');
});

module.exports = router;
