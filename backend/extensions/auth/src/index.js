require('dotenv').config();
const fetch = require('node-fetch');
const axios = require('axios');
const crypto = require('crypto');
const { getSchema } = require('@directus/api/dist/database/index.js');
const { AuthenticationService } = require('@directus/api/dist/services/authentication/index.js');

module.exports = function registerEndpoint(router) {
  router.use(require('express').json());

  router.post('/exchange-code', async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ error: 'Code GitHub manquant' });

      const directusUrl = 'http://localhost:8055';
      const adminToken = process.env.DIRECTUS_ADMIN_TOKEN;

      // 1️⃣ Échanger le code GitHub contre token
      const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.AUTH_GITHUB_CLIENT_ID,
          client_secret: process.env.AUTH_GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: 'http://localhost:4200/auth/callback',
        }),
      });
      const tokenData = await tokenResp.json();
      if (!tokenData.access_token)
        return res.status(400).json({ error: 'Impossible d’obtenir token GitHub', details: tokenData });

      const githubToken = tokenData.access_token;

      // 2️⃣ Récupérer infos utilisateur GitHub
      const userResp = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${githubToken}` },
      });
      const githubUser = await userResp.json();

      // 2️⃣bis — récupérer email si privé
      if (!githubUser.email) {
        const emailResp = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `token ${githubToken}` },
        });
        const emails = await emailResp.json();
        githubUser.email = emails.find(e => e.primary)?.email;
      }

      const email = githubUser.email || `${githubUser.login}@github.com`;

      // 3️⃣ Chercher utilisateur Directus
      let directusUser;
      const getUser = await axios.get(`${directusUrl}/users?filter[email][_eq]=${email}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      directusUser = getUser.data.data[0];

      let access_token;

      if (!directusUser) {
        // 4️⃣ Nouvel utilisateur → mot de passe aléatoire + login pour JWT
        const password = crypto.randomBytes(16).toString('hex');
        const createUser = await axios.post(
          `${directusUrl}/users`,
          {
            email,
            role: process.env.AUTH_GITHUB_DEFAULT_ROLE || 'authenticated',
            first_name: githubUser.name || githubUser.login,
            password,
          },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        directusUser = createUser.data.data;

        // Login pour récupérer JWT
        const loginResp = await axios.post(`${directusUrl}/auth/login`, {
          email: directusUser.email,
          password,
        });
        access_token = loginResp.data.data.access_token;
      } else {
        // 5️⃣ Utilisateur existant → générer JWT interne
        const schema = await getSchema();
        const authService = new AuthenticationService({ schema });
        const tokenDataInternal = await authService.createTokenForUser(directusUser.id);
        access_token = tokenDataInternal.access_token;
      }

      // 6️⃣ Retour JWT + user au frontend
      res.json({
        access_token,
        user: directusUser,
      });
    } catch (err) {
      console.error('Erreur OAuth GitHub:', err.response?.data || err.message);
      res.status(500).json({ error: 'Impossible de connecter l’utilisateur' });
    }
  });
};
