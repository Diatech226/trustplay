import { Button, FileInput, Label, TextInput } from 'flowbite-react';
import { useState } from 'react';
import PageShell from '../../admin/components/PageShell';
import { uploadMediaFile } from '../../utils/uploadImage';
import { resolveMediaUrl } from '../../lib/mediaUrls';

export default function AdminMedia() {
  const [file, setFile] = useState();
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploads, setUploads] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Merci de sélectionner un fichier.');
      return;
    }
    try {
      setUploading(true);
      const uploaded = await uploadMediaFile(file);
      const record = {
        name: title || uploaded.name || file.name,
        url: uploaded.url,
        mime: uploaded.mime || file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} Mo`,
      };
      setUploads((prev) => [record, ...prev.slice(0, 10)]);
      setTitle('');
      setFile(undefined);
    } catch (err) {
      setError(err.message || "L'upload a échoué");
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageShell
      title='Médiathèque'
      description='Uploader, taguer et suivre les usages des médias pour toutes vos pages.'
    >
      {error && (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200'>
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className='mb-6 space-y-4 rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60'>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='media-title'>Nom ou usage</Label>
            <TextInput
              id='media-title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Hero agence, visuel social, bannière...'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='media-file'>Fichier</Label>
            <FileInput
              id='media-file'
              accept='image/*,video/*'
              onChange={(e) => setFile(e.target.files?.[0])}
              helperText='Images et vidéos (max 10Mo)'
            />
          </div>
        </div>
        <div className='flex items-center justify-between'>
          {file && (
            <p className='text-sm text-slate-600 dark:text-slate-300'>
              {file.name} · {(file.size / 1024 / 1024).toFixed(2)} Mo
            </p>
          )}
          <Button type='submit' isProcessing={uploading} disabled={uploading}>
            Uploader
          </Button>
        </div>
      </form>

      <div className='grid gap-4 md:grid-cols-2'>
        {uploads.length === 0 ? (
          <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 md:col-span-2'>
            Aucun média uploadé pour le moment. Ajoutez un fichier pour commencer.
          </div>
        ) : (
          uploads.map((item) => {
            const resolvedUrl = resolveMediaUrl(item.url);
            return (
              <div
                key={item.url}
                className='flex items-center justify-between rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-900/60'
              >
              <div className='space-y-1'>
                <p className='font-semibold text-slate-900 dark:text-white'>{item.name}</p>
                <p className='text-xs text-slate-500'>{item.mime} · {item.size}</p>
                <a href={resolvedUrl} className='text-xs text-primary underline' target='_blank' rel='noreferrer'>
                  Ouvrir dans un nouvel onglet
                </a>
              </div>
              {item.mime?.startsWith('image/') && (
                <img src={resolvedUrl} alt={item.name} className='h-16 w-20 rounded-lg object-cover' />
              )}
              </div>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
