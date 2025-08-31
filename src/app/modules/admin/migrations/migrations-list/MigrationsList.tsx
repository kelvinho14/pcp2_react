import { ListViewProvider } from './core/ListViewProvider'
import { useState } from 'react'
import { MigrationsListHeader } from './components/header/MigrationsListHeader'
import { MigrationsTable } from './table/MigrationsTable'
import { KTCard } from '../../../../../_metronic/helpers'

const MigrationsList = () => {
  console.log('📋 MigrationsList component rendered')
  const [search, setSearch] = useState('')

  return (
    <>
      <KTCard>
        <MigrationsListHeader setSearch={setSearch} />
        <MigrationsTable search={search} />
      </KTCard>
    </>
  )
}

const MigrationsListWrapper = () => {
  return (
    <ListViewProvider>
      <MigrationsList />
    </ListViewProvider>
  )
}

export { MigrationsListWrapper }

