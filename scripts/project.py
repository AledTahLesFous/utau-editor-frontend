import requests
import uuid

# === CONFIG ===
DIRECTUS_URL = "http://127.0.0.1:8055"
API_TOKEN = "nXS_m3h4uKaGBV5RQuCE2LCdB3FAzFYS"
VOICEBANK_ID = "e2c87d46-a184-4431-aa72-eb6b66112c52"  # Ta voicebank Kasane Teto
PHONEME_ID = "130"
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
example_notes = []

PITCH_START = 48
PITCH_END = 71
NOTE_DURATION = 500  # ms
NOTE_SPACING = 100   # ms between notes (to avoid overlap)
START_TIME = 0

for i, pitch in enumerate(range(PITCH_START, PITCH_END + 1)):
    note = {
        "lyrics": "u",
        "pitch": pitch,
        "start_time": START_TIME + i * (NOTE_DURATION + NOTE_SPACING),
        "duration": NOTE_DURATION
    }
    example_notes.append(note)

for index, note in enumerate(example_notes):
    note_payload = {
        "project_id": PROJECT_ID,
        "start_time": note["start_time"],
        "duration": note["duration"],
        "pitch": note["pitch"],
        "lyrics": note["lyrics"],
        "velocity": 100,
        "voicebank_id": VOICEBANK_ID,
        "phoneme_id": PHONEME_ID,
        "order_index": index
    }

    r = requests.post(f"{DIRECTUS_URL}/items/notes", headers=headers, json=note_payload)
    if r.status_code != 200:
        print(f"❌ Failed to insert note {note['lyrics']}: {r.text}")
    else:
        print(f"✅ Note ajoutée : {note['lyrics']}")

print("✅ Projet de test prêt à être rendu.")
