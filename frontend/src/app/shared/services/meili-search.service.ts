import { Injectable } from '@angular/core';
import { MeiliSearch } from 'meilisearch';

@Injectable({
  providedIn: 'root'
})
export class MeiliSearchService {
  private client = new MeiliSearch({
    host: 'http://127.0.0.1:7700', // host Meilisearch
    apiKey: 'dev' // clé publique ou privée selon usage
  });

  private index = this.client.index('projects'); // juste le nom, l'index doit exister

  async searchProjects(query: string) {
    query = query.trim();
    if (!query) return [];

    try {
      const results = await this.index.search(query, { limit: 5 });
      return results.hits;
    } catch (err) {
      console.error('Erreur lors de la recherche Meilisearch :', err);
      return [];
    }
  }
}
