export interface Projet {
  id: string | number;
  title: string;
  description: string;
  tempo: string | number;
  key_signature?: string;
  duration?: number;
  status?: string;
  user_created: string;
  cover_image?: string;
  primary_voicebank?: string;
  tags?: any[];
  // adapte selon ta structure dans Directus
}