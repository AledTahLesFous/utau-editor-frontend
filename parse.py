import os
import json
import pykakasi
import requests

# CONFIG
voicebank_name = "Kasane Teto"
voicebank_path = "Kasane_Teto_Unpacked"  # dossier extrait du .zip
output_json = "kasane_teto_voicebank.json"

kks = pykakasi.kakasi()

def convert_to_romaji(text):
    result = kks.convert(text)
    return ''.join([r['hepburn'] for r in result]) if result else ''

samples = []

# Parcours les sous-dossiers (ex: normal, soft...)
for layer_name in os.listdir(voicebank_path):
    layer_path = os.path.join(voicebank_path, layer_name)
    if not os.path.isdir(layer_path):
        continue

    oto_path = os.path.join(layer_path, "oto.ini")
    if not os.path.exists(oto_path):
        continue

    with open(oto_path, "r", encoding="shift_jis") as f:
        for line in f:
            if "=" not in line:
                continue

            # "_file.wav=alias,offset,consonant,cutoff,preutterance,overlap"
            file_part, param_part = line.strip().split("=")
            parts = param_part.split(",")
            if len(parts) != 6:
                continue

            alias_jp = parts[0].strip()
            alias_romaji = convert_to_romaji(alias_jp)

            sample = {
                "alias_jp": alias_jp,
                "alias_romaji": alias_romaji,
                "filename": file_part.strip(),
                "oto_params": {
                    "offset": float(parts[1]),
                    "consonant": float(parts[2]),
                    "cutoff": float(parts[3]),
                    "preutterance": float(parts[4]),
                    "overlap": float(parts[5])
                },
                "layer": layer_name
            }
            samples.append(sample)

# Export JSON
voicebank_data = {
    "voicebank_name": voicebank_name,
    "samples": samples
}

with open(output_json, "w", encoding="utf-8") as out:
    json.dump(voicebank_data, out, ensure_ascii=False, indent=2)

print(f"✅ Exported {len(samples)} samples to {output_json}")





# Config Directus
DIRECTUS_URL = "http://127.0.0.1:8055"  # adapte si tu es en local
API_TOKEN = "CBhG1Y3VXAzqd6NuHUMKeX9B9v4WcrjN"
VOICEBANK_ID = "bfb580f0-3d8b-4c0d-abdc-f0d5cb2670c6"  # récupérable depuis l'admin

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

for sample in samples:
    payload = {
        "voicebank_id": VOICEBANK_ID,
        "alias_jp": sample["alias_jp"],
        "alias_romaji": sample["alias_romaji"],
        "filename": sample["filename"],
        "layer": sample["layer"],
        "oto_params": sample["oto_params"]
    }

    r = requests.post(f"{DIRECTUS_URL}/items/voicebank_samples", headers=headers, json=payload)
    if r.status_code != 200:
        print(f"❌ Failed: {r.text}")
    else:
        print(f"✅ Imported {sample['alias_romaji']}")
