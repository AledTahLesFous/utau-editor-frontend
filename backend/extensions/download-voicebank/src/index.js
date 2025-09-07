import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function registerEndpoint(router, { services }) {
  router.get('/:voicebankId/sample-romaji/*', async (req, res) => {
    const { voicebankId } = req.params;
    const filename = decodeURIComponent(req.path.split('/sample-romaji/')[1]);

    try {
      const { ItemsService } = services;
      const voicebanksService = new ItemsService('voicebanks', {
        schema: req.schema,
        accountability: req.accountability
      });

      const voicebank = await voicebanksService.readOne(voicebankId);

      if (!voicebank || !voicebank.sample_files) {
        return res.status(404).json({ error: 'Voicebank introuvable ou sans fichier ZIP' });
      }

      const zipUrl = `http://127.0.0.1:8055/assets/${voicebank.sample_files}`;
      const response = await axios.get(zipUrl, { responseType: 'arraybuffer' });
      const zipBuffer = Buffer.from(response.data);

      const tmpDir = path.join(__dirname, 'tmp', voicebankId);
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const zip = new AdmZip(zipBuffer);
      zip.extractAllTo(tmpDir, true);

      function findFileByRomaji(dir, targetRomaji) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            const found = findFileByRomaji(fullPath, targetRomaji);
            if (found) return found;
          } else if (file.toLowerCase().includes(targetRomaji.toLowerCase())) {
            return fullPath;
          }
        }
        return null;
      }

      const wavPath = findFileByRomaji(tmpDir, filename);

      if (!wavPath) {
        return res.status(404).json({ error: `Fichier "${filename}" introuvable dans la voicebank` });
      }

      res.sendFile(wavPath);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération du fichier', details: err.message });
    }
  });
}
