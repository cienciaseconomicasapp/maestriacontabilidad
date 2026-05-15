exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.flash('error', 'Debe iniciar sesion para acceder a esta seccion');
  res.redirect('/auth/login');
};
