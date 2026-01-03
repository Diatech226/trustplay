import { FaFacebookF, FaWhatsapp, FaXTwitter, FaLinkedinIn, FaLink } from 'react-icons/fa6';
import { logShare } from '../lib/analytics';

const shareOptions = [
  { label: 'Facebook', icon: FaFacebookF, url: (link, title) => `https://www.facebook.com/sharer/sharer.php?u=${link}&t=${title}` },
  { label: 'WhatsApp', icon: FaWhatsapp, url: (link, title) => `https://api.whatsapp.com/send?text=${title}%20${link}` },
  { label: 'X/Twitter', icon: FaXTwitter, url: (link, title) => `https://twitter.com/intent/tweet?text=${title}&url=${link}` },
  { label: 'LinkedIn', icon: FaLinkedinIn, url: (link) => `https://www.linkedin.com/sharing/share-offsite/?url=${link}` },
];

export default function ShareButtons({ title, url }) {
  const shareLink = url || window.location.href;

  const trackShare = (channel) => {
    logShare({ channel, page: shareLink, slug: url, metadata: { title } });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareLink });
      } catch (error) {
        console.error('Share cancelled', error);
      }
    }
  };

  return (
    <div className='flex flex-wrap items-center gap-2 text-sm font-semibold text-primary'>
      <button
        onClick={() => {
          navigator.clipboard.writeText(shareLink);
          trackShare('copy');
        }}
        className='flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-primary transition hover:-translate-y-0.5 hover:bg-primary hover:text-white'
      >
        <FaLink />
        Copier le lien
      </button>
      <button
        onClick={() => {
          handleNativeShare();
          trackShare('native');
        }}
        className='rounded-full border border-primary/40 px-3 py-2 text-primary transition hover:-translate-y-0.5 hover:bg-primary hover:text-white'
      >
        Partage natif
      </button>
      {shareOptions.map((option) => (
        <a
          key={option.label}
          href={option.url(encodeURIComponent(shareLink), encodeURIComponent(title))}
          target='_blank'
          rel='noreferrer'
          onClick={() => trackShare(option.label)}
          className='flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-primary shadow-subtle transition hover:-translate-y-0.5 hover:bg-primary hover:text-white dark:bg-slate-900/80'
        >
          <option.icon />
          <span className='hidden sm:inline'>{option.label}</span>
        </a>
      ))}
    </div>
  );
}
