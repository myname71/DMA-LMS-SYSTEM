/**
 * Media URL resolution for lessons.
 * One place that understands YouTube / Vimeo / Google Drive / Google Docs /
 * Office links / direct video files — used by the student dashboard player and
 * the free-course overlay player so both behave identically.
 */

export type VideoEmbed =
  | { kind: 'iframe'; src: string }
  | { kind: 'video'; src: string }
  | { kind: 'none' };

const DIRECT_FILE = /\.(mp4|m4v|webm|ogv|ogg|mov|m3u8|mpd)(\?.*)?$/i;

/** True when the URL points straight at a video file the <video> tag can play. */
export function isDirectVideoFile(url?: string | null): boolean {
  return !!url && DIRECT_FILE.test(url.trim());
}

/**
 * Turn any public video link into something embeddable.
 * - YouTube (watch / youtu.be / embed / shorts / live) → youtube.com/embed/<id>
 * - Vimeo → player.vimeo.com/video/<id>
 * - Google Drive share link → /preview
 * - Google Docs/Slides/Sheets link → /preview
 * - Office / OneDrive / SharePoint → as-is (Office web viewer friendly)
 * - .mp4/.webm/... → native <video>
 * - any other http(s) URL → iframe (works for Loom, hosted players, etc.)
 */
export function resolveVideoEmbed(rawUrl?: string | null, videoSource?: string): VideoEmbed {
  const url = (rawUrl || '').trim();
  if (!url) return { kind: 'none' };

  if (isDirectVideoFile(url)) return { kind: 'video', src: url };

  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([A-Za-z0-9_-]{10,})/);
  if (drive) return { kind: 'iframe', src: `https://drive.google.com/file/d/${drive[1]}/preview` };

  const gdoc = url.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([A-Za-z0-9_-]{10,})/);
  if (gdoc) return { kind: 'iframe', src: `https://docs.google.com/${gdoc[1]}/d/${gdoc[2]}/preview` };

  if (/youtube\.com|youtu\.be/i.test(url) || videoSource === 'youtube') {
    const id = url.match(/(?:v=|embed\/|shorts\/|live\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/)?.[1]
      || (/^[A-Za-z0-9_-]{6,}$/.test(url) ? url : '');
    return id ? { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` } : { kind: 'none' };
  }

  if (/vimeo\.com/i.test(url) || videoSource === 'vimeo') {
    const id = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]
      || (/^\d+$/.test(url) ? url : '');
    return id ? { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` } : { kind: 'none' };
  }

  if (/(officeapps\.live\.com|1drv\.ms|sharepoint\.com)/i.test(url)) return { kind: 'iframe', src: url };

  if (/^https?:\/\//i.test(url)) return { kind: 'iframe', src: url };
  return { kind: 'none' };
}

/** A PDF lesson must point at a public http(s) document. */
export function isPublicDocument(url?: string | null): boolean {
  return !!url && /^https?:\/\//i.test(url.trim());
}

/**
 * Browser PDF viewers (Chrome/Edge/Firefox) honour #page=N, which is what makes
 * the "PDF slider" work without any extra dependency.
 */
export function pdfEmbedUrl(url: string, page = 1): string {
  const base = url.trim().split('#')[0];
  const safe = Math.max(1, Math.floor(page) || 1);
  return `${base}#page=${safe}&view=FitH&toolbar=1&navpanes=0`;
}

/** Best-effort detection of a slide deck we can embed directly. */
export function isSlideEmbed(url?: string | null): boolean {
  if (!url) return false;
  return /docs\.google\.com\/presentation|officeapps\.live\.com|slideshare\.net|\.pptx?(\?|$)/i.test(url);
}
