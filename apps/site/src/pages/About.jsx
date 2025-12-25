import { Link } from "react-router-dom";
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Seo from '../components/Seo';

const About = () => {
  return (
    <main className="bg-mist/60 py-10 dark:bg-slate-950">
      <Seo
        title="À propos | Trust Media"
        description="Découvrez Trust, complexe média, événementiel et production audiovisuelle basé à Pissy."
      />
      <PageContainer className="space-y-8">
        <PageHeader
          kicker="Institutionnel"
          title="À propos de Trust"
          description="Trust est un complexe regroupant médias, événementiel et production audiovisuelle, avec un studio basé à Pissy."
        />

        <div className="space-y-8 rounded-2xl bg-white p-8 shadow-subtle ring-1 ring-subtle dark:bg-slate-900 dark:ring-slate-800">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-primary">Trust : un complexe de communication</h2>
            <p className="text-gray-700 dark:text-slate-200">
              Trust est structuré autour de trois pôles complémentaires :
            </p>
            <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-slate-200">
              <li><strong>Trust Media :</strong> articles, podcasts et émissions audiovisuelles sur l’actualité, la culture et l’innovation.</li>
              <li><strong>Trust Event :</strong> agence spécialisée dans la communication événementielle.</li>
              <li><strong>Trust Prod :</strong> production audiovisuelle (films, documentaires, publicités, clips).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-primary">Un studio moderne à Pissy</h2>
            <p className="text-gray-700 dark:text-slate-200">
              Notre studio est équipé de matériel professionnel pour la production vidéo et sonore.
            </p>
            <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-slate-200">
              <li>Enregistrement et mixage audio</li>
              <li>Tournage de vidéos et émissions</li>
              <li>Montage et post-production</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-primary">Notre vision</h2>
            <p className="text-gray-700 dark:text-slate-200">
              Révolutionner la communication et la production audiovisuelle en mettant créativité et expertise au service des entreprises, artistes et institutions.
            </p>
          </section>

          <div className="text-center">
            <Link
              to="/production#contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Contactez-nous
            </Link>
          </div>
        </div>
      </PageContainer>
    </main>
  );
};

export default About;
