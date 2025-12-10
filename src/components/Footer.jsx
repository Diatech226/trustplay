import { Footer } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram,  BsYoutube, BsWhatsapp, BsTiktok } from 'react-icons/bs';
export default function FooterCom() {
  return (
    <Footer container className='border border-t-8 border-teal-500'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='grid w-full justify-between sm:flex md:grid-cols-1'>
          <div className='mt-5'>
            <Link
              to='/'
              className='self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white'
            >
            <span className='px-2 py-1 bg-gradient-to-r from-green-500 via-black-500 to-green-500 rounded-lg text-white'>
                Trust
              </span>
      
            </Link>
          </div>
          <div className='grid grid-cols-2 gap-8 mt-4 sm:grid-cols-3 sm:gap-6'>
            <div>
              <Footer.Title title='About' />
              <Footer.LinkGroup col>
                <Footer.Link
                  href='/production'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Trust production
                </Footer.Link>
              
              </Footer.LinkGroup>
            </div>
           
            <div>
              <Footer.Title title='Legal' />
              <Footer.LinkGroup col>
                <Footer.Link href='/privacy-policy'>Politique de confidentialité</Footer.Link>
                <Footer.Link href='Terms'>Termes &amp; Conditions</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider />
        <div className='w-full sm:flex sm:items-center sm:justify-between'>
          <Footer.Copyright
            href='#'
            by="Diaexpress@SARL"
            year={new Date().getFullYear()}
          />
          <div className="flex gap-6 sm:mt-0 mt-4 sm:justify-center">
           <Footer.Icon href='#' icon={BsFacebook}/>
           <Footer.Icon href='#' icon={BsYoutube}/>
            <Footer.Icon href='#' icon={BsInstagram}/>
            <Footer.Icon href='#' icon={BsWhatsapp}/>
            <Footer.Icon href='#' icon={BsTiktok}/>
     

          </div>
        </div>
      </div>
    </Footer>
  );
}
