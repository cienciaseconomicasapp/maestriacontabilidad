const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/login', { pageTitle: 'Iniciar Sesion' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USER || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'admin2024';
  if (username === validUser && password === validPass) {
    req.session.user = { username };
    res.redirect('/');
  } else {
    req.flash('error', 'Usuario o contrasena incorrectos');
    res.redirect('/auth/login');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/auth/login'));
});

module.exports = router;
