import { MigrationsListSearchComponent } from './MigrationsListSearchComponent'

type Props = {
  setSearch: (value: string) => void
}

const MigrationsListHeader: React.FC<Props> = ({ setSearch }) => {
  return (
    <div className='card-header border-0 pt-6'>
      <MigrationsListSearchComponent setSearch={setSearch} />
    </div>
  )
}

export { MigrationsListHeader }

