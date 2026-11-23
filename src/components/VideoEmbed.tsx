/** Lecteur vidéo : fichier envoyé (mp4/webm), YouTube, Facebook ou TikTok. */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  const tt = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  let src = "";
  if (yt) src = `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  else if (tt) src = `https://www.tiktok.com/embed/v2/${tt[1]}`;
  else if (/facebook\.com|fb\.watch/.test(url)) src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  if (src) {
    return <iframe src={src} title={title} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />;
  }
  return <video src={url} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full bg-black object-cover" aria-label={title} />;
}
