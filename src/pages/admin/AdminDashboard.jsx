import DashboardComp from '../../components/DashboardComp';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';

// CMS: dashboard home
export default function AdminDashboard() {
  return (
    <div className='space-y-6'>
      <AdminSectionHeader
        title='Tableau de bord'
        subtitle="Suivez l'activité éditoriale en un coup d'œil"
      />
      <DashboardComp />
    </div>
  );
}
