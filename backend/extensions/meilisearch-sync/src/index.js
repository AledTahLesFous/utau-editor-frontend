import MeiliSearch from 'meilisearch';

export default ({ filter, action }) => {
  const client = new MeiliSearch({
    host: 'http://127.0.0.1:7700',
    apiKey: 'dev',
  });

  const index = client.index('projects'); // juste le nom de l'index

  // Création d'un projet
  action('projects.items.create', async ({ payload }) => {
    if (payload) {
      const doc = {
        id: payload.id,
        title: payload.title || '',
        searchable_content: `${payload.title || ''} ${payload.description || ''}`,
        tempo: payload.tempo,
        key_signature: payload.key_signature,
        duration: payload.duration,
        likes: parseInt(payload.likes) || 0,
        plays: parseInt(payload.plays) || 0,
        creator_id: payload.user_created || null,
        status: payload.status,
        collection: 'projects',
        date_created: payload.date_created
      };
      await index.addDocuments([doc]);
    }
  });

  // Mise à jour d'un projet
  action('projects.items.update', async ({ payload }) => {
    if (payload) {
      const doc = {
        id: payload.id,
        title: payload.title || '',
        searchable_content: `${payload.title || ''} ${payload.description || ''}`,
        tempo: payload.tempo,
        key_signature: payload.key_signature,
        duration: payload.duration,
        likes: parseInt(payload.likes) || 0,
        plays: parseInt(payload.plays) || 0,
        creator_id: payload.user_created || null,
        status: payload.status,
        collection: 'projects',
        date_created: payload.date_created
      };
      await index.addDocuments([doc]);
    }
  });

  // Suppression d'un ou plusieurs projets
  action('projects.items.delete', async ({ payload }) => {
    if (Array.isArray(payload) && payload.length) {
      await index.deleteDocuments(payload); // payload = [id1, id2, ...]
    }
  });
};
