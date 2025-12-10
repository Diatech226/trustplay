import { Footer } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsYoutube, BsWhatsapp, BsTiktok } from 'react-icons/bs';

export default function FooterCom() {
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
                <Footer.Link href='/event'>Trust Events</Footer.Link>
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
                <Footer.Link href='Terms'>Termes &amp; Conditions</Footer.Link>
              </Footer.LinkGroup>
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
