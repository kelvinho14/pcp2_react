import { FC } from 'react'
import { Migration } from '../../../../../../../store/admin/migrationsSlice'
  
import { renderHtmlSafely, nl2br } from '../../../../../../../_metronic/helpers/htmlRenderer'
type Props = {
  migration: Migration
}

const MigrationInfoCell: FC<Props> = ({ migration }) => {
  return (
    <div className='d-flex flex-column'>
              <div className='text-gray-800 text-hover-primary mb-1 fw-bold'>
          <span dangerouslySetInnerHTML={{ 
            __html: renderHtmlSafely(migration.migration_file, { 
              maxImageWidth: 600, 
              maxImageHeight: 400,
              nl2br: true 
            }) 
          }} />
        </div>
        {migration.description && (
          <div 
            className='text-muted fs-7'
            style={{ 
              lineHeight: '1.5',
              wordWrap: 'break-word',
              maxWidth: '600px'
            }}
            dangerouslySetInnerHTML={{ 
              __html: renderHtmlSafely(migration.description, { 
                maxImageWidth: 600, 
                maxImageHeight: 400,
                nl2br: true 
              }) 
            }}
          />
        )}
    </div>
  )
}

export { MigrationInfoCell }

