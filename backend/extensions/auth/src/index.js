module.exports = function registerEndpoint(router, { services }) {
  router.get('/exchange-cookie', async (req, res) => {

      const sessionToken = req.cookies['directus_session_token'];
      if (!sessionToken) return res.status(400).json({ error: 'Session manquante' });
      console.log(sessionToken)


  })

};
