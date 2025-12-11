import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erreur applicative interceptée', { error, info });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950'>
          <div className='w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-subtle dark:bg-slate-900 dark:ring-slate-800'>
            <p className='text-sm font-semibold uppercase tracking-[0.25em] text-primary'>Oops</p>
            <h1 className='mt-2 text-2xl font-bold text-primary'>Un imprévu est survenu</h1>
            <p className='mt-3 text-slate-600 dark:text-slate-300'>
              Nous avons rencontré un problème lors du chargement de la page. Vous pouvez réessayer ou revenir à
              l&apos;accueil.
            </p>
            <div className='mt-6 flex justify-center gap-3'>
              <button
                type='button'
                onClick={this.handleRetry}
                className='rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg'
              >
                Recharger
              </button>
              <a
                href='/'
                className='rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white'
              >
                Retour à l&apos;accueil
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
