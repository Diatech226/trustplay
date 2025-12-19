import PageShell from '../../admin/components/PageShell';

const media = [
  { id: 1, name: 'hero-agence.jpg', type: 'Image', usage: 'Page accueil', size: '1.2 Mo' },
  { id: 2, name: 'video-demo.mp4', type: 'Vidéo', usage: 'Landing campagne', size: '24 Mo' },
];

export default function AdminMedia() {
  return (
    <PageShell
      title='Médiathèque'
      description='Uploader, taguer et suivre les usages des médias pour toutes vos pages.'
      actions={
        <button className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90'>
          Uploader un média
        </button>
      }
    >
      <div className='grid gap-4 md:grid-cols-2'>
        {media.map((item) => (
          <div key={item.id} className='flex items-center justify-between rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-900/60'>
            <div>
              <p className='font-semibold text-slate-900 dark:text-white'>{item.name}</p>
              <p className='text-sm text-slate-500'>{item.type} · {item.usage}</p>
            </div>
            <span className='text-xs text-slate-500'>{item.size}</span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
