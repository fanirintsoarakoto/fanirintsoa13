import { useRef } from "react";
import { API, authHeaders } from "../api";

export default function PhotoUpload({ studentId, current, onUpdate }) {
  const inputRef = useRef(null);

  function pick() { inputRef.current?.click(); }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Lehibe loatra ny sary (max 2 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      try {
        const r = await fetch(`${API}/students/${studentId}/photo`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ photo: base64 }),
        });
        if (r.ok) onUpdate(base64);
      } catch (err) {}
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="photo-upload">
      <div className="photo-preview" onClick={pick}>
        {current ? (
          <img src={current} alt="photo" />
        ) : (
          <div className="photo-placeholder">📷<br />Ampio sary</div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*"
        style={{ display: "none" }} onChange={handleFile} />
      <button type="button" className="btn btn-sm btn-secondary" onClick={pick}>
        {current ? "🔄 Ovay sary" : "📷 Ampio sary"}
      </button>
    </div>
  );
}
