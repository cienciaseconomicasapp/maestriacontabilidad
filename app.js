require('dotenv').config();
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'asc-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

const { requireAuth } = require('./middleware/auth');

app.use('/auth',          require('./routes/auth'));
app.use('/cuentas',       requireAuth, require('./routes/cuenta'));
app.use('/centros-costo', requireAuth, require('./routes/centroCosto'));
app.use('/terceros',      requireAuth, require('./routes/tercero'));
app.use('/empleados',     requireAuth, require('./routes/empleado'));
app.use('/comprobantes',  requireAuth, require('./routes/comprobante'));
app.use('/movimientos',   requireAuth, require('./routes/movimiento'));
app.use('/presupuesto',   requireAuth, require('./routes/presupuesto'));
app.use('/auditoria',     requireAuth, require('./routes/auditoria'));

app.get('/', requireAuth, async (req, res) => {
  const db = require('./config/db');
  try {
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM cuenta WHERE activa = 1)   AS cuentas,
        (SELECT COUNT(*) FROM tercero WHERE activo = 1)  AS terceros,
        (SELECT COUNT(*) FROM comprobante)               AS comprobantes,
        (SELECT COUNT(*) FROM movimiento)                AS movimientos,
        (SELECT COALESCE(SUM(debito), 0)  FROM movimiento) AS total_debitos,
        (SELECT COALESCE(SUM(credito), 0) FROM movimiento) AS total_creditos
    `);
    const [ultimosComp] = await db.query(`
      SELECT c.*, t.razon_social, cc.nombre AS cc_nombre
      FROM comprobante c
      LEFT JOIN tercero t      ON c.id_tercero = t.id_tercero
      LEFT JOIN centro_costo cc ON c.id_cc = cc.id_cc
      ORDER BY c.creado_en DESC, c.id_comp DESC
      LIMIT 8
    `);
    res.render('index', { pageTitle: 'Dashboard', section: 'dashboard', stats, ultimosComp });
  } catch (err) {
    res.render('index', { pageTitle: 'Dashboard', section: 'dashboard', stats: {}, ultimosComp: [], dbError: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
