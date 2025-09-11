import { FC } from 'react'
import { KTCardBody } from '../../../../../../../_metronic/helpers'

const MigrationsListLoading: FC = () => {
  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'>
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              <th className='min-w-125px'>Migration</th>
              <th className='min-w-125px'>Status</th>
              <th className='min-w-125px'>Time</th>
              <th className='min-w-125px'>Details</th>
              <th className='min-w-125px'>Error</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, index) => (
              <tr key={index}>
                <td>
                  <div className='d-flex flex-column'>
                    <div className='placeholder-glow'>
                      <span className='placeholder col-8 mb-1'></span>
                      <span className='placeholder col-6'></span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className='placeholder-glow'>
                    <span className='placeholder col-6'></span>
                  </div>
                </td>
                <td>
                  <div className='placeholder-glow'>
                    <span className='placeholder col-8 mb-1'></span>
                    <span className='placeholder col-6'></span>
                  </div>
                </td>
                <td>
                  <div className='placeholder-glow'>
                    <span className='placeholder col-7 mb-1'></span>
                    <span className='placeholder col-5'></span>
                  </div>
                </td>
                <td>
                  <div className='placeholder-glow'>
                    <span className='placeholder col-4'></span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </KTCardBody>
  )
}

export { MigrationsListLoading }


