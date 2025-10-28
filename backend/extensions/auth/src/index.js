const cookieParser = require('cookie-parser');

module.exports = function registerEndpoint(router, { services, exceptions }) {
  // Assurez-vous que Directus utilise cookie-parser
  router.use(cookieParser());

  router.get('/exchange-cookie', async (req, res) => {
    try {
      // 1️⃣ Récupérer le cookie session Directus
      const sessionToken = req.cookies['directus_session_token'];
      if (!sessionToken) return res.status(400).json({ error: 'Session manquante' });

      // 2️⃣ AuthService pour récupérer la session
      const { AuthService } = services;
      const authService = new AuthService({ schema: req.schema });
      const session = await authService.getSession(sessionToken);

      if (!session) return res.status(401).json({ error: 'Session invalide ou expirée' });

      // 3️⃣ Générer un JWT standard à partir de la session
      const jwt = await authService.createToken({ user: { id: session.user.id }, role: session.user.role });

      // 4️⃣ Renvoi du JWT au frontend
      res.json({ access_token: jwt.access_token, user: session.user });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur serveur lors de l’échange cookie → JWT' });
    }
  });
};
