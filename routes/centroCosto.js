const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM centro_costo ORDER BY codigo');
  res.render('centro_costo/list', { pageTitle: 'Centros de Costo', section: 'centros-costo', centros: rows });
});

router.get('/nuevo', (req, res) => {
  res.render('centro_costo/form', {
    pageTitle: 'Nuevo Centro de Costo', section: 'centros-costo',
    centro: null, action: '/centros-costo', method: 'POST'
  });
});

router.post('/', async (req, res) => {
  try {
    const { codigo, nombre, descripcion } = req.body;
    const activo = req.body.activo ? 1 : 0;
    await db.query(
      'INSERT INTO centro_costo (codigo,nombre,descripcion,activo) VALUES (?,?,?,?)',
      [codigo, nombre, descripcion || null, activo]
    );
    req.flash('success', 'Centro de costo creado');
    res.redirect('/centros-costo');
  } catch (err) { req.flash('error', err.message); res.redirect('/centros-costo/nuevo'); }
});

router.get('/:id/editar', async (req, res) => {
  const [[centro]] = await db.query('SELECT * FROM centro_costo WHERE id_cc=?', [req.params.id]);
  if (!centro) { req.flash('error', 'No encontrado'); return res.redirect('/centros-costo'); }
  res.render('centro_costo/form', {
    pageTitle: 'Editar Centro de Costo', section: 'centros-costo',
    centro, action: `/centros-costo/${req.params.id}?_method=PUT`, method: 'POST'
  });
});

router.put('/:id', async (req, res) => {
  try {
    const { codigo, nombre, descripcion } = req.body;
    const activo = req.body.activo ? 1 : 0;
    await db.query(
      'UPDATE centro_costo SET codigo=?,nombre=?,descripcion=?,activo=? WHERE id_cc=?',
      [codigo, nombre, descripcion || null, activo, req.params.id]
    );
    req.flash('success', 'Centro de costo actualizado');
    res.redirect('/centros-costo');
  } catch (err) { req.flash('error', err.message); res.redirect(`/centros-costo/${req.params.id}/editar`); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM centro_costo WHERE id_cc=?', [req.params.id]);
    req.flash('success', 'Centro de costo eliminado');
  } catch (err) { req.flash('error', 'No se puede eliminar: tiene registros asociados'); }
  res.redirect('/centros-costo');
});

module.exports = router;
