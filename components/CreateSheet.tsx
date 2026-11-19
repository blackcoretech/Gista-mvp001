"use client";
import { ImagePlus, Mic, Type, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateSheet({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const choose = (mode: "voice" | "text" | "photo") => {
    onClose();
    router.push("/create?mode=" + mode);
  };
  return <div className="create-sheet-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="create-sheet" role="dialog" aria-modal="true" aria-labelledby="create-sheet-title">
      <div className="create-sheet-handle" />
      <div className="create-sheet-heading">
        <div><h2 id="create-sheet-title">Create a Gist</h2><p>What would you like to create?</p></div>
        <button type="button" onClick={onClose} aria-label="Close create options"><X size={21} /></button>
      </div>
      <div className="create-sheet-options">
        <button type="button" onClick={() => choose("voice")}><span className="create-option-icon"><Mic size={23} /></span><span><strong>Talk</strong><small>Record a voice post</small></span></button>
        <button type="button" onClick={() => choose("text")}><span className="create-option-icon"><Type size={23} /></span><span><strong>Type</strong><small>Write what is on your mind</small></span></button>
        <button type="button" onClick={() => choose("photo")}><span className="create-option-icon"><ImagePlus size={23} /></span><span><strong>Photo</strong><small>Share a photo with a caption</small></span></button>
      </div>
    </section>
  </div>;
}
