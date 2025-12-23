import { Alert, Button } from 'flowbite-react';
import { useState } from 'react';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoEvents } from '../../admin/config/mockData';

export default function AdminEvents() {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <PageShell
      title='Événements'
      description='Gérez dates, lieux, inscriptions et exports CSV.'
      actions={
        <Button size='sm' onClick={() => setShowNotice(true)}>
          Nouvel événement
        </Button>
      }
    >
      {showNotice && (
        <Alert className='mb-4' color='info' onDismiss={() => setShowNotice(false)}>
          La gestion d’événements est en cours de raccordement API. Utilisez les articles TrustEvent en attendant.
        </Alert>
      )}
      <ResourceTable
        columns={[
          { header: 'Nom', accessor: 'name' },
          { header: 'Date', accessor: 'date' },
          { header: 'Lieu', accessor: 'location' },
          { header: 'Places', accessor: 'seats' },
        ]}
        data={demoEvents}
      />
    </PageShell>
  );
}
