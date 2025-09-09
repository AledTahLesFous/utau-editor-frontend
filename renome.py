import os
import pykakasi

# Chemin du dossier contenant les fichiers .wav
folder_path = "./teto"

# Initialisation du convertisseur
kks = pykakasi.kakasi()
kks.setMode("H", "a")  # Hiragana → ascii
kks.setMode("K", "a")  # Katakana → ascii
kks.setMode("J", "a")  # Kanji → ascii
kks.setMode("r", "Hepburn")  # système Hepburn
converter = kks.getConverter()

# Pour éviter les doublons de nom
def get_unique_name(existing_names, name, ext):
    base = name
    counter = 1
    while f"{name}{ext}" in existing_names:
        name = f"{base}_{counter}"
        counter += 1
    return name

# Liste des noms déjà utilisés pour éviter les conflits
used_names = set()

# Parcours des fichiers du dossier
for filename in os.listdir(folder_path):
    file_path = os.path.join(folder_path, filename)

    if not os.path.isfile(file_path):
        continue

    name, ext = os.path.splitext(filename)
    new_name = converter.do(name).strip().replace(" ", "_")

    if not new_name:
        print(f"⚠️ Impossible de convertir: {filename}")
        continue

    new_name = get_unique_name(used_names, new_name, ext)
    used_names.add(f"{new_name}{ext}")

    new_path = os.path.join(folder_path, f"{new_name}{ext}")
    os.rename(file_path, new_path)

    print(f"✅ {filename} → {new_name}{ext}")
