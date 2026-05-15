const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

const TIPOS     = ['cliente','proveedor','empleado','accionista','entidad_publica','otro'];
const REGIMENES = ['responsable_iva','no_responsable','gran_contribuyente','regimen_simple'];

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM tercero ORDER BY razon_social');
  res.render('tercero/list', { pageTitle: 'Terceros', section: 'terceros', terceros: rows });
});

router.get('/nuevo', (req, res) => {
  res.render('tercero/form', {
    pageTitle: 'Nuevo Tercero', section: 'terceros',
    tercero: null, tipos: TIPOS, regimenes: REGIMENES,
    action: '/terceros', method: 'POST'
  });
});

router.post('/', async (req, res) => {
  try {
    const { nit, digito_vf, razon_social, tipo, regimen, email, telefono, direccion, ciudad, departamento } = req.body;
    const activo = req.body.activo ? 1 : 0;
    await db.query(
      `INSERT INTO tercero (nit,digito_vf,razon_social,tipo,regimen,email,telefono,direccion,ciudad,departamento,activo)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [nit, digito_vf || null, razon_social, tipo, regimen,
       email || null, telefono || null, direccion || null, ciudad || null, departamento || null, activo]
    );
    req.flash('success', 'Tercero creado exitosamente');
    res.redirect('/terceros');
  } catch (err) { req.flash('error', err.message); res.redirect('/terceros/nuevo'); }
});

router.get('/:id/editar', async (req, res) => {
  const [[tercero]] = await db.query('SELECT * FROM tercero WHERE id_tercero=?', [req.params.id]);
  if (!tercero) { req.flash('error', 'No encontrado'); return res.redirect('/terceros'); }
  res.render('tercero/form', {
    pageTitle: 'Editar Tercero', section: 'terceros',
    tercero, tipos: TIPOS, regimenes: REGIMENES,
    action: `/terceros/${req.params.id}?_method=PUT`, method: 'POST'
  });
});

router.put('/:id', async (req, res) => {
  try {
    const { nit, digito_vf, razon_social, tipo, regimen, email, telefono, direccion, ciudad, departamento } = req.body;
    const activo = req.body.activo ? 1 : 0;
    await db.query(
      `UPDATE tercero SET nit=?,digito_vf=?,razon_social=?,tipo=?,regimen=?,email=?,
       telefono=?,direccion=?,ciudad=?,departamento=?,activo=? WHERE id_tercero=?`,
      [nit, digito_vf || null, razon_social, tipo, regimen,
       email || null, telefono || null, direccion || null, ciudad || null, departamento || null,
       activo, req.params.id]
    );
    req.flash('success', 'Tercero actualizado');
    res.redirect('/terceros');
  } catch (err) { req.flash('error', err.message); res.redirect(`/terceros/${req.params.id}/editar`); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM tercero WHERE id_tercero=?', [req.params.id]);
    req.flash('success', 'Tercero eliminado');
  } catch (err) { req.flash('error', 'No se puede eliminar: tiene comprobantes o empleados asociados'); }
  res.redirect('/terceros');
});

module.exports = router;
