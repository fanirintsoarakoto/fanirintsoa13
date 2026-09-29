src = open("app.py", encoding="utf-8").read()
if "ensure_admin" in src:
    raise SystemExit("efa nataona")

# tsy hamorona 'admin' vaovao raha efa misy admin
src = src.replace("SELECT id FROM users WHERE username='admin'",
                  "SELECT id FROM users WHERE role='admin' LIMIT 1")

block = r'''# ===== ADMIN FIXE =====
def ensure_admin():
    uname = os.environ.get("ADMIN_USERNAME", "fanirintsoa")
    email = os.environ.get("ADMIN_EMAIL", "fanirintsoarakoto4@gmail.com")
    pwd = os.environ.get("ADMIN_PASSWORD", "fanirintsoa")
    c = connect()
    row = c.execute("SELECT id FROM users WHERE email=? OR username=? ORDER BY (role='admin') DESC LIMIT 1",
                    (email, uname)).fetchone()
    if row:
        c.execute("UPDATE users SET username=?, email=?, password_hash=?, role='admin', active=1, status='ACTIVE', login_attempts=0, locked_until=NULL WHERE id=?",
                  (uname, email, hash_password(pwd), row["id"]))
    else:
        c.execute("INSERT INTO users (username,email,password_hash,role,active,status,prenom,telephone,photo) VALUES (?,?,?,'admin',1,'ACTIVE',?,?,'')",
                  (uname, email, hash_password(pwd), "Fanirintsoa", "0382861725"))
    c.commit(); c.close()

ensure_admin()

'''
k = src.index("migrate_approval()\n\n") + len("migrate_approval()\n\n")
src = src[:k] + block + src[k:]
open("app.py", "w", encoding="utf-8").write(src)
print("vita")
