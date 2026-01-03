import { Footer } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsYoutube, BsWhatsapp, BsTiktok } from 'react-icons/bs';
import { FaRss } from 'react-icons/fa6';
import { useState } from 'react';

export default function FooterCom() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("Merci, votre inscription est bien prise en compte (mock).");
    setNewsletterEmail('');
  };

  return (
    <Footer container className='border-t-4 border-primary bg-white/90 backdrop-blur dark:bg-slate-950'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10'>
        <div className='grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]'>
          <div className='space-y-4'>
            <Link
              to='/'
              className='inline-flex items-center gap-3 text-xl font-semibold text-primary dark:text-white'
            >
              <span className='px-3 py-1 bg-gradient-to-r from-ocean via-primary to-secondary rounded-xl text-white shadow-subtle'>
                Trust
              </span>
              <span className='tracking-tight'>Média</span>
            </Link>
            <p className='max-w-md text-sm text-slate-600 dark:text-slate-300'>
              Un média pluridisciplinaire dédié aux informations vérifiées, aux grands reportages et aux événements qui comptent.
            </p>
            <div className='flex flex-wrap gap-3 text-sm text-slate-700 dark:text-slate-200'>
              <span className='rounded-full bg-subtle px-3 py-1 dark:bg-slate-800'>News</span>
              <span className='rounded-full bg-subtle px-3 py-1 dark:bg-slate-800'>Politique</span>
              <span className='rounded-full bg-subtle px-3 py-1 dark:bg-slate-800'>Science/Tech</span>
              <span className='rounded-full bg-subtle px-3 py-1 dark:bg-slate-800'>Sport</span>
              <span className='rounded-full bg-subtle px-3 py-1 dark:bg-slate-800'>Cinéma</span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-2'>
            <div>
              <Footer.Title title='À propos' />
              <Footer.LinkGroup col>
                <Footer.Link href='/about'>Notre vision</Footer.Link>
                <Footer.Link href='/production'>Trust Production</Footer.Link>
                <Footer.Link href='/events'>Trust Events</Footer.Link>
                <Footer.Link href='/news' className='flex items-center gap-2'>
                  <FaRss className='text-primary' /> RSS News
                </Footer.Link>
                <Footer.Link href='/politique' className='flex items-center gap-2'>
                  <FaRss className='text-primary' /> RSS Politique
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title='Contact' />
              <Footer.LinkGroup col>
                <Footer.Link href='mailto:contact@trustmedia.com'>contact@trustmedia.com</Footer.Link>
                <Footer.Link href='/production'>Devenir partenaire</Footer.Link>
                <Footer.Link href='/sign-in'>Espace rédacteur</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title='Légal' />
              <Footer.LinkGroup col>
                <Footer.Link href='/privacy-policy'>Politique de confidentialité</Footer.Link>
                <Footer.Link href='/terms'>Termes &amp; Conditions</Footer.Link>
                <Footer.Link href='/science' className='flex items-center gap-2'>
                  <FaRss className='text-primary' /> RSS Science/Tech
                </Footer.Link>
                <Footer.Link href='/sport' className='flex items-center gap-2'>
                  <FaRss className='text-primary' /> RSS Sport
                </Footer.Link>
                <Footer.Link href='/cinema' className='flex items-center gap-2'>
                  <FaRss className='text-primary' /> RSS Cinéma
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div className='md:col-span-2'>
              <Footer.Title title='Newsletter par rubrique' />
              <form onSubmit={handleSubscribe} className='flex flex-col gap-3 rounded-2xl bg-white/60 p-4 shadow-subtle ring-1 ring-subtle dark:bg-slate-900/70 dark:ring-slate-800 sm:flex-row sm:items-center'>
                <input
                  type='email'
                  className='w-full rounded-xl border border-subtle px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary dark:bg-slate-800'
                  placeholder='votre@email.com'
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <button
                  type='submit'
                  className='rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-subtle transition hover:-translate-y-0.5 hover:bg-ocean'
                >
                  S’abonner
                </button>
              </form>
              {newsletterStatus && <p className='mt-2 text-sm text-primary'>{newsletterStatus}</p>}
            </div>
          </div>
        </div>
        <Footer.Divider />
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <Footer.Copyright
            href='#'
            by='Diaexpress@SARL'
            year={new Date().getFullYear()}
          />
          <div className='flex gap-4'>
            <Footer.Icon href='#' icon={BsFacebook} />
            <Footer.Icon href='#' icon={BsYoutube} />
            <Footer.Icon href='#' icon={BsInstagram} />
            <Footer.Icon href='#' icon={BsWhatsapp} />
            <Footer.Icon href='#' icon={BsTiktok} />
          </div>
        </div>
      </div>
    </Footer>
  );
}
