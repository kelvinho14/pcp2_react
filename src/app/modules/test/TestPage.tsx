import {FC} from 'react'
import {PageTitle} from '../../../_metronic/layout/core'
import TinyMCEEditor from '../../../components/Editor/TinyMCEEditor'

const TestPage: FC = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Test Page</PageTitle>
      <div className='card'>
        <div className='card-body'>
          <TinyMCEEditor
            initialValue='<p>This is a test page with TinyMCE editor</p>'
            onChange={(content) => {
              console.log('Editor content:', content)
            }}
            height={400}
            placeholder='Start writing your content...'
          />
        </div>
      </div>
    </>
  )
}

export default TestPage 