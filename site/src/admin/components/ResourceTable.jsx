export default function ResourceTable({ columns = [], data = [], loading = false }) {
  return (
    <div className='overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800'>
      <table className='min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800'>
        <thead className='bg-slate-50 dark:bg-slate-800/60'>
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900/50'>
          {loading && (
            <tr>
              <td className='px-4 py-6 text-center text-slate-500 dark:text-slate-400' colSpan={columns.length || 1}>
                Chargement...
              </td>
            </tr>
          )}
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className='hover:bg-slate-50 dark:hover:bg-slate-800/70'>
              {columns.map((column) => (
                <td key={column.accessor} className='px-4 py-3 text-slate-700 dark:text-slate-200'>
                  {typeof column.cell === 'function' ? column.cell(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                className='px-4 py-6 text-center text-slate-500 dark:text-slate-400'
                colSpan={columns.length || 1}
              >
                Aucun élément pour l'instant. Ajoutez une première entrée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
