"""
Script famoronana données de test:
- 30 mpianatra
- Matières (9)
- Notes (250+)
- Présence
- Excel modèle + Excel test
- JSON backup
"""
import sqlite3
import json
import random
from datetime import datetime, date, timedelta
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

DB = "fanirintsoa.db"
random.seed(42)

def connect():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

# ============================================================
# 1. CLASSES + GROUPES
# ============================================================
def create_classes():
    c = connect()
    classes = [
        ("Classe A", "Première année"),
        ("Classe B", "Deuxième année"),
        ("Classe C", "Troisième année"),
    ]
    for nom, desc in classes:
        try:
            c.execute("INSERT INTO classes (nom, description) VALUES (?,?)", (nom, desc))
        except sqlite3.IntegrityError:
            pass
    # Groupes
    groupes = [("Groupe 1", 1), ("Groupe 2", 1), ("Groupe 1", 2),
               ("Groupe 2", 2), ("Groupe 1", 3), ("Groupe 2", 3)]
    for nom, classe_id in groupes:
        c.execute("INSERT INTO groupes (nom, classe_id) VALUES (?,?)", (nom, classe_id))
    c.commit()
    c.close()
    print("✅ 3 classes + 6 groupes")

# ============================================================
# 2. MATIÈRES
# ============================================================
def create_matieres():
    c = connect()
    matieres = [
        ("Malagasy", 3, None),
        ("Français", 3, None),
        ("Mathématiques", 4, None),
        ("Sciences Physiques", 2, None),
        ("SVT", 2, None),
        ("Histoire-Géographie", 2, None),
        ("Anglais", 2, None),
        ("EPS", 1, None),
        ("Informatique", 2, None),
    ]
    for nom, coef, cid in matieres:
        c.execute("INSERT INTO matieres (nom, coefficient, classe_id) VALUES (?,?,?)",
                  (nom, coef, cid))
    c.commit()
    c.close()
    print(f"✅ {len(matieres)} matières")

# ============================================================
# 3. 30 MPIANATRA
# ============================================================
def create_students():
    noms = [
        ("RAKOTO", "Jean"), ("RANDRIA", "Marie"), ("RAZAFY", "Pierre"),
        ("ANDRIANINA", "Sophie"), ("RAKOTOMALALA", "Paul"), ("RASOAMANANA", "Hery"),
        ("RAHARISON", "Lalao"), ("RAKOTOARISOA", "Fidy"), ("RANDRIANASOLO", "Tiana"),
        ("RAVELO", "Njaka"), ("RAZANADRAKOTO", "Vola"), ("RABEMANANJARA", "Tahiry"),
        ("RANDRIAMAMPIONONA", "Fara"), ("RAKOTONDRABE", "Mamy"), ("RASOLOFOSON", "Andry"),
        ("RAJAONARIVELO", "Fenitra"), ("RAKOTOVAO", "Tovo"), ("RANOROSOA", "Lova"),
        ("RABE", "Tsiory"), ("RATSIMBAZAFY", "Nomena"), ("RANDRIANARISOA", "Fandresena"),
        ("RAHERIMANANA", "Tantely"), ("RAKOTOMANGA", "Fy"), ("RASOANAIVO", "Miora"),
        ("RANDRIANIRINA", "Feno"), ("RAKOTOMAVO", "Hanta"), ("RAZAFIMAHATRATRA", "Fidy"),
        ("RASOLOFO", "Fanja"), ("RAKOTOBE", "Tiana"), ("RANDRIA", "Soa"),
    ]
    lieux = ["Antananarivo", "Antsirabe", "Fianarantsoa", "Toliara", "Mahajanga", "Toamasina"]
    situations = ["", "Boursier", "Demi-boursier", "", "", "Redoublant", ""]

    c = connect()
    year = datetime.now().year
    count = 0
    for i, (nom, prenom) in enumerate(noms, 1):
        try:
            matricule = f"ELV-{year}-{i:04d}"
            sexe = "F" if prenom in ["Marie", "Sophie", "Lalao", "Tiana", "Vola", "Tahiry",
                                      "Fara", "Andry", "Fenitra", "Lova", "Nomena",
                                      "Tantely", "Miora", "Hanta", "Fanja", "Soa"] else "M"
            ddn = f"{2010 + (i % 3)}-{(i % 12) + 1:02d}-{(i % 28) + 1:02d}"
            age = datetime.now().year - int(ddn.split("-")[0])
            classe_id = (i % 3) + 1
            groupe_id = ((i % 2) + 1) + ((classe_id - 1) * 2)

            c.execute("""INSERT OR IGNORE INTO students
                (matricule, nom, prenom, date_naissance, age, sexe, lieu,
                 telephone, parent_nom, parent_telephone, classe_id, groupe_id, situation)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (matricule, nom, prenom, ddn, age, sexe,
                 random.choice(lieux),
                 f"03{random.randint(10000000, 99999999)}",
                 f"RABE {nom[0]}", f"03{random.randint(10000000, 99999999)}",
                 classe_id, groupe_id, random.choice(situations)))
            count += 1
        except sqlite3.IntegrityError:
            pass
    c.commit()
    c.close()
    print(f"✅ {count} mpianatra")

# ============================================================
# 4. NOTES
# ============================================================
def create_notes():
    c = connect()
    students = c.execute("SELECT id FROM students").fetchall()
    matieres = c.execute("SELECT id, coefficient FROM matieres").fetchall()

    types = ["devoir", "interrogation", "examen", "oral", "tp"]
    total_notes = 0

    for s in students:
        for m in matieres:
            # 2-3 notes par matière par trimestre
            for trimestre in [1, 2, 3]:
                nb_notes = random.randint(1, 3)
                for _ in range(nb_notes):
                    # Notes entre 5 et 20 (moyenne ~13)
                    note = round(random.uniform(5, 20) * 4) / 4
                    type_note = random.choice(types)
                    date_note = f"2024-{(trimestre - 1) * 3 + random.randint(1, 3):02d}-{random.randint(1, 28):02d}"
                    c.execute("""INSERT INTO notes
                        (student_id, matiere_id, note, type, trimestre, date, remarque)
                        VALUES (?,?,?,?,?,?,?)""",
                        (s["id"], m["id"], note, type_note, trimestre, date_note, ""))
                    total_notes += 1
    c.commit()
    c.close()
    print(f"✅ {total_notes} notes")

# ============================================================
# 5. PRÉSENCE (30 andro farany)
# ============================================================
def create_attendance():
    c = connect()
    students = c.execute("SELECT id FROM students").fetchall()
    total = 0

    for d in range(30, 0, -1):
        day = (datetime.now() - timedelta(days=d)).strftime("%Y-%m-%d")
        for s in students:
            # 85% présence, 10% retard, 5% absent
            r = random.random()
            if r < 0.85:
                statut = "present"
                h = random.randint(7, 8)
                heure = f"{h:02d}:{random.randint(0, 59):02d}:00"
            elif r < 0.95:
                statut = "retard"
                heure = f"08:{random.randint(15, 59):02d}:00"
            else:
                statut = "absent"
                heure = None
            c.execute("""INSERT INTO attendance
                (student_id, date, heure_arrivee, statut, methode)
                VALUES (?,?,?,?,?)""",
                (s["id"], day, heure, statut, "qr"))
            total += 1
    c.commit()
    c.close()
    print(f"✅ {total} présence")

# ============================================================
# 6. EXCEL MODÈLE
# ============================================================
def create_excel_template():
    wb = Workbook()
    ws = wb.active
    ws.title = "Eleves"
    headers = ["matricule", "nom", "prenom", "date_naissance", "age", "sexe",
               "lieu", "parent_nom", "parent_telephone", "telephone", "classe"]
    ws.append(headers)

    fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    font = Font(color="FFFFFF", bold=True)
    for i in range(1, len(headers) + 1):
        c = ws.cell(row=1, column=i)
        c.fill = fill
        c.font = font
        c.alignment = Alignment(horizontal="center")

    for i, w in enumerate([15, 15, 15, 15, 6, 6, 18, 18, 18, 15, 12], 1):
        ws.column_dimensions[chr(64 + i)].width = w

    ws.append(["", "Rakoto", "Jean", "2010-05-15", 15, "M", "Antananarivo",
               "Rabe", "0341234567", "0341111111", "Classe A"])

    wb.save("modele_eleves.xlsx")
    print("✅ modele_eleves.xlsx")

# ============================================================
# 7. EXCEL 30 MPIANATRA
# ============================================================
def create_excel_30():
    wb = Workbook()
    ws = wb.active
    ws.title = "Eleves"
    headers = ["matricule", "nom", "prenom", "date_naissance", "age", "sexe",
               "lieu", "parent_nom", "parent_telephone", "telephone", "classe"]
    ws.append(headers)

    fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    font = Font(color="FFFFFF", bold=True)
    for i in range(1, len(headers) + 1):
        c = ws.cell(row=1, column=i)
        c.fill = fill
        c.font = font
        c.alignment = Alignment(horizontal="center")

    for i, w in enumerate([15, 15, 15, 15, 6, 6, 18, 18, 18, 15, 12], 1):
        ws.column_dimensions[chr(64 + i)].width = w

    students = [
        ["RAKOTO", "Jean", "2010-05-15", 15, "M", "Antananarivo", "RABE Jean", "0341234567", "0341111111", "Classe A"],
        ["RANDRIA", "Marie", "2011-03-22", 14, "F", "Antananarivo", "RANDRIA Paul", "0342345678", "0342222222", "Classe A"],
        ["RAZAFY", "Pierre", "2010-08-10", 15, "M", "Antsirabe", "RAZAFY Luc", "0343456789", "0343333333", "Classe A"],
        ["ANDRIANINA", "Sophie", "2011-01-18", 14, "F", "Fianarantsoa", "ANDRIANINA Marc", "0344567890", "0344444444", "Classe A"],
        ["RAKOTOMALALA", "Paul", "2010-11-30", 14, "M", "Toliara", "RAKOTOMALALA Henri", "0345678901", "0345555555", "Classe A"],
        ["RASOAMANANA", "Hery", "2011-07-04", 14, "M", "Antananarivo", "RASOAMANANA Guy", "0346789012", "0346666666", "Classe B"],
        ["RAHARISON", "Lalao", "2010-09-12", 15, "F", "Mahajanga", "RAHARISON Albert", "0347890123", "0347777777", "Classe B"],
        ["RAKOTOARISOA", "Fidy", "2011-02-28", 14, "M", "Antananarivo", "RAKOTOARISOA Bruno", "0348901234", "0348888888", "Classe B"],
        ["RANDRIANASOLO", "Tiana", "2010-06-20", 15, "F", "Antananarivo", "RANDRIANASOLO Eric", "0349012345", "0349999999", "Classe B"],
        ["RAVELO", "Njaka", "2011-04-15", 14, "M", "Antsirabe", "RAVELO Jean", "0340123456", "0340000000", "Classe B"],
        ["RAZANADRAKOTO", "Vola", "2010-10-25", 14, "F", "Toamasina", "RAZANADRAKOTO Hery", "0341111112", "0341122334", "Classe C"],
        ["RABEMANANJARA", "Tahiry", "2011-05-08", 14, "M", "Antananarivo", "RABEMANANJARA Solofo", "0341222223", "0342233445", "Classe C"],
        ["RANDRIAMAMPIONONA", "Fara", "2010-12-03", 14, "F", "Antananarivo", "RANDRIAMAMPIONONA Guy", "0341333334", "0343344556", "Classe C"],
        ["RAKOTONDRABE", "Mamy", "2011-08-19", 14, "M", "Fianarantsoa", "RAKOTONDRABE Luc", "0341444445", "0344455667", "Classe C"],
        ["RASOLOFOSON", "Andry", "2010-07-11", 15, "M", "Antananarivo", "RASOLOFOSON Paul", "0341555556", "0345566778", "Classe C"],
        ["RAJAONARIVELO", "Fenitra", "2011-11-27", 13, "F", "Antananarivo", "RAJAONARIVELO Bruno", "0341666667", "0346677889", "Classe A"],
        ["RAKOTOVAO", "Tovo", "2010-02-14", 15, "M", "Toliara", "RAKOTOVAO Henri", "0341777778", "0347788990", "Classe A"],
        ["RANOROSOA", "Lova", "2011-09-30", 14, "F", "Antsirabe", "RANOROSOA Marc", "0341888889", "0348899001", "Classe A"],
        ["RABE", "Tsiory", "2010-04-07", 15, "M", "Antananarivo", "RABE Eric", "0341999990", "0349900112", "Classe B"],
        ["RATSIMBAZAFY", "Nomena", "2011-06-16", 14, "F", "Mahajanga", "RATSIMBAZAFY Albert", "0342000001", "0340011223", "Classe B"],
        ["RANDRIANARISOA", "Fandresena", "2010-03-09", 15, "M", "Antananarivo", "RANDRIANARISOA Guy", "0342111112", "0341122335", "Classe B"],
        ["RAHERIMANANA", "Tantely", "2011-10-21", 14, "F", "Antananarivo", "RAHERIMANANA Solofo", "0342222223", "0342233446", "Classe C"],
        ["RAKOTOMANGA", "Fy", "2010-01-05", 15, "M", "Fianarantsoa", "RAKOTOMANGA Bruno", "0342333334", "0343344557", "Classe C"],
        ["RASOANAIVO", "Miora", "2011-12-12", 13, "F", "Antananarivo", "RASOANAIVO Luc", "0342444445", "0344455668", "Classe C"],
        ["RANDRIANIRINA", "Feno", "2010-08-28", 15, "M", "Toamasina", "RANDRIANIRINA Paul", "0342555556", "0345566779", "Classe A"],
        ["RAKOTOMAVO", "Hanta", "2011-02-02", 14, "F", "Antananarivo", "RAKOTOMAVO Henri", "0342666667", "0346677890", "Classe A"],
        ["RAZAFIMAHATRATRA", "Fidy", "2010-05-25", 15, "M", "Antsirabe", "RAZAFIMAHATRATRA Marc", "0342777778", "0347788991", "Classe B"],
        ["RASOLOFO", "Fanja", "2011-07-17", 14, "F", "Antananarivo", "RASOLOFO Eric", "0342888889", "0348899002", "Classe B"],
        ["RAKOTOBE", "Tiana", "2010-11-08", 14, "M", "Mahajanga", "RAKOTOBE Albert", "0342999990", "0349900113", "Classe C"],
        ["RANDRIA", "Soa", "2011-03-30", 14, "F", "Antananarivo", "RANDRIA Guy", "0343000001", "0340011224", "Classe C"],
    ]
    for s in students:
        ws.append([""] + s)

    wb.save("eleves_30.xlsx")
    print(f"✅ eleves_30.xlsx ({len(students)} élèves)")

# ============================================================
# 8. JSON BACKUP FENO
# ============================================================
def create_backup_json():
    c = connect()
    data = {
        "version": "2.0",
        "date": datetime.now().isoformat(),
        "classes": [dict(r) for r in c.execute("SELECT * FROM classes").fetchall()],
        "groupes": [dict(r) for r in c.execute("SELECT * FROM groupes").fetchall()],
        "students": [dict(r) for r in c.execute("SELECT * FROM students").fetchall()],
        "matieres": [dict(r) for r in c.execute("SELECT * FROM matieres").fetchall()],
        "notes": [dict(r) for r in c.execute("SELECT * FROM notes").fetchall()],
        "attendance": [dict(r) for r in c.execute("SELECT * FROM attendance").fetchall()],
        "sessions": [dict(r) for r in c.execute("SELECT * FROM attendance_sessions").fetchall()],
    }
    c.close()

    with open("backup_test.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ backup_test.json")
    print(f"   • {len(data['students'])} élèves")
    print(f"   • {len(data['matieres'])} matières")
    print(f"   • {len(data['notes'])} notes")
    print(f"   • {len(data['attendance'])} présences")
    print(f"   • {len(data['classes'])} classes")

# ============================================================
# MAIN
# ============================================================
if __name__ == "__main__":
    print("=" * 50)
    print("🎓 Fanirintsoa — Données de test")
    print("=" * 50)
    print()

    # Fafao ny données taloha
    c = connect()
    for t in ["notes", "attendance", "attendance_sessions", "matieres",
              "students", "groupes", "classes"]:
        c.execute(f"DELETE FROM {t}")
    c.commit()
    c.close()

    create_classes()
    create_matieres()
    create_students()
    create_notes()
    create_attendance()
    print()
    create_excel_template()
    create_excel_30()
    print()
    create_backup_json()

    print()
    print("=" * 50)
    print("✅ VITA! Ny fichiers noforonina:")
    print("=" * 50)
    print("📊 modele_eleves.xlsx   ← Modèle Excel (foana)")
    print("📊 eleves_30.xlsx       ← 30 élèves ho import")
    print("💾 backup_test.json     ← Backup JSON feno")
    print()
    print("🚀 Alefaso ny backend: python app.py")
    print("🌐 Alefaso ny frontend: npm run dev")
    print("📥 Ampidiro ny eleves_30.xlsx ao amin'ny Import Excel")
