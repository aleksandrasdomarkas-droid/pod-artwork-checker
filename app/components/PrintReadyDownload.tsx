import { useState } from "react";

export function PrintReadyDownload({ artworkId, filename }: { artworkId: string; filename: string }) {
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true); setError(undefined);
    try {
      // App Bridge augments same-origin fetches with the embedded session token.
      const response = await fetch(`/app/artwork/${artworkId}/download`);
      if (!response.ok) throw new Error("The print-ready file could not be downloaded.");
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = objectUrl; link.download = filename; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(objectUrl);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Download failed."); }
    finally { setBusy(false); }
  };
  return <p><button type="button" onClick={download} disabled={busy}>{busy ? "Preparing download…" : "Download print-ready PNG"}</button>{error && <span role="alert"> {error}</span>}</p>;
}
