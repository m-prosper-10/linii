const backendBase = () =>
  (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000').replace(
    /\/$/,
    ''
  );

export function resolveChatMediaUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase()}${path}`;
}

export async function downloadChatFile(
  url: string,
  suggestedName: string
): Promise<void> {
  const resolved = resolveChatMediaUrl(url);
  try {
    const res = await fetch(resolved, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(resolved, '_blank', 'noopener,noreferrer');
  }
}

export function fileNameFromUrl(url: string): string {
  try {
    const path = url.split('?')[0] || url;
    return decodeURIComponent(path.split('/').pop() || 'file');
  } catch {
    return 'file';
  }
}
