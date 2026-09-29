src = open("app.py", encoding="utf-8").read()
if "migrate_approval" in src:
    raise SystemExit("efa nataona")

# 1) register vaovao
a = src.index('@app.route("/auth/register", methods=["POST"])')
b = src.index('@app.route("/auth/login", methods=["POST"])')
new_register = r'''@app.route("/auth/register", methods=["POST"])
def register():
    d = request.json or {}
    u = (d.get("username") or "").strip()
    e = (d.get("email") or "").strip()
    p = d.get("password") or ""
    if not u or not e or not p:
        return jsonify({"error": "Mila anarana, email, teny miafina"}), 400
    if len(p) < 8:
        return jsonify({"error": "Teny miafina: 8 litera farafahakeliny"}), 400
    c = connect()
    if c.execute("SELECT id FROM users WHERE username=? OR email=?", (u, e)).fetchone():
        c.close(); return jsonify({"error": "Efa misy"}), 400
    c.execute("INSERT INTO users (username,email,password_hash,role,active,status,prenom,telephone) VALUES (?,?,?,'user',0,'PENDING',?,?)",
              (u, e, hash_password(p), d.get("prenom", ""), d.get("telephone", "")))
    c.commit(); c.close()
    return jsonify({"message": "Demande envoyée. Votre compte est en attente de validation par l'administrateur."}), 202

'''
src = src[:a] + new_register + src[b:]

# 2) login: hafatra arakaraka ny status
k = src.index('if not user["active"]:')
ls = src.rfind("\n", 0, k) + 1
indent = src[ls:k]
check = (
    indent + 'st = user["status"] or "ACTIVE"\n'
    + indent + 'if st == "PENDING":\n'
    + indent + '    c.close(); return jsonify({"error": "Votre compte est en attente de validation par l\'administrateur."}), 403\n'
    + indent + 'if st == "REJECTED":\n'
    + indent + '    c.close(); return jsonify({"error": "Votre demande de création de compte a été refusée."}), 403\n'
    + indent + 'if st == "SUSPENDED":\n'
    + indent + '    c.close(); return jsonify({"error": "Votre compte est temporairement désactivé."}), 403\n'
)
src = src[:ls] + check + src[ls:]

# 3) migration + endpoints admin
block = r'''# ===== VALIDATION DES INSCRIPTIONS =====
def migrate_approval():
    c = connect()
    for sql in [
        "ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE'",
        "ALTER TABLE users ADD COLUMN approved_at TEXT",
        "ALTER TABLE users ADD COLUMN approved_by INTEGER",
    ]:
        try: c.execute(sql)
        except sqlite3.OperationalError: pass
    c.execute("UPDATE users SET status='ACTIVE' WHERE status IS NULL")
    c.execute("CREATE TABLE IF NOT EXISTS validations_log (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, action TEXT, admin_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
    c.commit(); c.close()

migrate_approval()

def _admin_only():
    uid, err = require_auth(request)
    if err: return None, err
    c = connect()
    u = c.execute("SELECT role FROM users WHERE id=?", (uid,)).fetchone()
    c.close()
    if not u or u["role"] != "admin":
        return None, (jsonify({"error": "Admin ihany"}), 403)
    return uid, None

@app.route("/admin/demandes")
def admin_demandes():
    uid, err = _admin_only()
    if err: return err
    c = connect()
    rows = c.execute("SELECT id,username,email,prenom,telephone,status,created_at,approved_at FROM users WHERE status IN ('PENDING','REJECTED') ORDER BY created_at DESC").fetchall()
    c.close()
    return jsonify([dict(r) for r in rows])

def _decide(admin_id, user_id, status, action, role=None):
    c = connect()
    t = c.execute("SELECT id FROM users WHERE id=?", (user_id,)).fetchone()
    if not t:
        c.close(); return jsonify({"error": "Tsy hita"}), 404
    if status == "ACTIVE":
        c.execute("UPDATE users SET status='ACTIVE', active=1, role=?, approved_at=CURRENT_TIMESTAMP, approved_by=? WHERE id=?",
                  (role or "user", admin_id, user_id))
    else:
        c.execute("UPDATE users SET status=?, active=0, approved_at=CURRENT_TIMESTAMP, approved_by=? WHERE id=?",
                  (status, admin_id, user_id))
    c.execute("INSERT INTO validations_log (user_id, action, admin_id) VALUES (?,?,?)", (user_id, action, admin_id))
    c.commit(); c.close()
    return jsonify({"ok": True, "status": status})

@app.route("/admin/demandes/<int:user_id>/approve", methods=["POST"])
def admin_approve(user_id):
    uid, err = _admin_only()
    if err: return err
    d = request.json or {}
    return _decide(uid, user_id, "ACTIVE", "APPROVE", d.get("role"))

@app.route("/admin/demandes/<int:user_id>/reject", methods=["POST"])
def admin_reject(user_id):
    uid, err = _admin_only()
    if err: return err
    return _decide(uid, user_id, "REJECTED", "REJECT")

@app.route("/admin/validations")
def admin_validations():
    uid, err = _admin_only()
    if err: return err
    c = connect()
    rows = c.execute("SELECT v.id, v.action, v.created_at, u.username AS utilisateur, a.username AS admin FROM validations_log v LEFT JOIN users u ON u.id=v.user_id LEFT JOIN users a ON a.id=v.admin_id ORDER BY v.id DESC LIMIT 200").fetchall()
    c.close()
    return jsonify([dict(r) for r in rows])

'''
m = src.index('if __name__ == "__main__":')
src = src[:m] + block + src[m:]
open("app.py", "w", encoding="utf-8").write(src)
print("vita")
