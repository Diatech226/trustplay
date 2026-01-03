import { Alert, Button } from 'flowbite-react';
import { useState } from 'react';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoPages } from '../../admin/config/mockData';

export default function AdminPages() {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <PageShell
      title='Pages & landing'
      description='Construisez des pages modulaires (hero, services, témoignages, CTA) avec ordre des sections.'
      actions={
        <Button size='sm' onClick={() => setShowNotice(true)}>
          Nouvelle page
        </Button>
      }
    >
      {showNotice && (
        <Alert className='mb-4' color='info' onDismiss={() => setShowNotice(false)}>
          Le module Pages est en préparation. Ajoutez une page via la roadmap ou connectez un endpoint dédié.
        </Alert>
      )}
      <ResourceTable
        columns={[
          { header: 'Titre', accessor: 'title' },
          { header: 'Sections', accessor: 'sections' },
          { header: 'Statut', accessor: 'status' },
        ]}
        data={demoPages}
      />
    </PageShell>
  );
}
