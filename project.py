import requests
import uuid

# === CONFIG ===
DIRECTUS_URL = "http://127.0.0.1:8055"
API_TOKEN = "nXS_m3h4uKaGBV5RQuCE2LCdB3FAzFYS"
VOICEBANK_ID = "69c15678-85ab-4a55-98ae-0cf6c49cfd69"  # Ta voicebank Kasane Teto
USER_ID = "b91c601b-ece4-46bc-805e-b3714012e2bb"  # Mets ici l'UUID de ton utilisateur admin dans Directus
# ==============

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# 🎼 Étape 1 : Créer un projet
project_payload = {
    "title": "Projet de test Kasane Teto",
    "key_signature": "C",
    "tempo": 120,
    "status": "draft",
    "user_created": USER_ID,
    "primary_voicebank": VOICEBANK_ID
}

project_res = requests.post(f"{DIRECTUS_URL}/items/projects", headers=headers, json=project_payload)
project = project_res.json().get("data")

if not project:
    print("❌ Échec création projet :", project_res.text)
    exit()

PROJECT_ID = project["id"]
print(f"✅ Projet créé : {PROJECT_ID}")

# 🎶 Étape 2 : Ajouter quelques notes
# Exemple avec les alias_romaji les plus courants (vérifie qu’ils existent dans ta base)
example_notes = [
    {"lyrics": "a", "pitch": 60, "start_time": 0, "duration": 500},
    {"lyrics": "i", "pitch": 62, "start_time": 600, "duration": 500},
    {"lyrics": "u", "pitch": 64, "start_time": 1200, "duration": 500},
]

for index, note in enumerate(example_notes):
    note_payload = {
        "project_id": PROJECT_ID,
        "start_time": note["start_time"],
        "duration": note["duration"],
        "pitch": note["pitch"],
        "lyrics": note["lyrics"],
        "velocity": 100,
        "voicebank_id": VOICEBANK_ID,
        "order_index": index
    }

    r = requests.post(f"{DIRECTUS_URL}/items/notes", headers=headers, json=note_payload)
    if r.status_code != 200:
        print(f"❌ Failed to insert note {note['lyrics']}: {r.text}")
    else:
        print(f"✅ Note ajoutée : {note['lyrics']}")

print("✅ Projet de test prêt à être rendu.")
