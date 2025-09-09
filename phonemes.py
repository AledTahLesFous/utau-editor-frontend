import requests

# Configuration
DIRECTUS_URL = "http://127.0.0.1:8055"
ADMIN_TOKEN = "nXS_m3h4uKaGBV5RQuCE2LCdB3FAzFYS"
COLLECTION_NAME = "phonemes"

HEADERS = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json"
}

# Liste complète des phonèmes en romaji (classiques pour UTAU japonais)
PHONEMES = [
    "a", "i", "u", "e", "o",
    "ka", "ki", "ku", "ke", "ko",
    "ga", "gi", "gu", "ge", "go",
    "sa", "shi", "su", "se", "so",
    "za", "ji", "zu", "ze", "zo",
    "ta", "chi", "tsu", "te", "to",
    "da", "di", "du", "de", "do",
    "na", "ni", "nu", "ne", "no",
    "ha", "hi", "fu", "he", "ho",
    "ba", "bi", "bu", "be", "bo",
    "pa", "pi", "pu", "pe", "po",
    "ma", "mi", "mu", "me", "mo",
    "ya", "yu", "yo",
    "ra", "ri", "ru", "re", "ro",
    "wa", "wo", "n",

    # Semi-voyelles et combinaisons utilisées en CVVC ou VCV
    "- a", "- i", "- u", "- e", "- o",
    "a -", "i -", "u -", "e -", "o -",
    "a r", "i r", "u r", "e r", "o r",
    "a R", "i R", "u R", "e R", "o R",
    "- a R", "- i R", "- u R", "- e R", "- o R",
    "kya", "kyu", "kyo",
    "gya", "gyu", "gyo",
    "sha", "shu", "sho",
    "ja", "ju", "jo",
    "cha", "chu", "cho",
    "nya", "nyu", "nyo",
    "hya", "hyu", "hyo",
    "bya", "byu", "byo",
    "pya", "pyu", "pyo",
    "mya", "myu", "myo",
    "rya", "ryu", "ryo",
]

def get_existing_phonemes():
    """Récupère tous les phonèmes déjà présents dans Directus"""
    url = f"{DIRECTUS_URL}/items/{COLLECTION_NAME}?limit=-1"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return [item["name"].lower() for item in response.json().get("data", [])]
    else:
        print("❌ Impossible de récupérer les phonèmes existants")
        return []

def add_phonemes(phoneme_names):
    """Ajoute une liste de phonèmes dans Directus"""
    url = f"{DIRECTUS_URL}/items/{COLLECTION_NAME}"
    payload = [{"name": name} for name in phoneme_names]
    response = requests.post(url, headers=HEADERS, json=payload)
    if response.status_code in [200, 201]:
        print(f"✅ {len(payload)} phonèmes ajoutés avec succès.")
    else:
        print(f"❌ Erreur lors de l’ajout : {response.status_code} — {response.text}")

def main():
    existing = get_existing_phonemes()
    to_add = [p for p in PHONEMES if p.lower() not in existing]

    if not to_add:
        print("✅ Tous les phonèmes sont déjà présents.")
    else:
        print(f"🔄 Ajout de {len(to_add)} nouveaux phonèmes...")
        add_phonemes(to_add)

if __name__ == "__main__":
    main()
