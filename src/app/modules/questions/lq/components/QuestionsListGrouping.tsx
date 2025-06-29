import {FC, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../../store'
import {generateSimilarQuestions, bulkDeleteQuestions} from '../../../../../store/questions/questionsSlice'
import AIGenerateSimilarModal from '../../components/AIGenerateSimilarModal'
import {useListView} from '../questions-list/core/ListViewProvider'

interface Props {
  list: any[]
}

const QuestionsListGrouping: FC<Props> = ({list}) => {
  const {selected, clearSelected} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false)

  const handleAIGenerate = (questionType: 'mc' | 'lq', difficulty: 'easy' | 'medium' | 'hard' | 'challenging', count: number) => {
    const questionIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
    dispatch(generateSimilarQuestions({questionIds, questionType, difficulty, count}))
    setShowAIGenerateModal(false)
  }

  const handleDelete = async () => {
    try {
      const questionIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
      await dispatch(bulkDeleteQuestions(questionIds)).unwrap()
      clearSelected()
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting questions:', error)
    }
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      <div className={`modal fade ${showDeleteConfirm ? 'show d-block' : ''}`} style={{ backgroundColor: showDeleteConfirm ? 'rgba(0, 0, 0, 0.5)' : 'transparent' }}>
        <div className='modal-dialog modal-dialog-centered'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Confirm Delete</h5>
              <button 
                type='button' 
                className='btn-close' 
                onClick={() => setShowDeleteConfirm(false)}
              ></button>
            </div>
            <div className='modal-body'>
              <p>Are you sure you want to delete {selected.length} selected question{selected.length > 1 ? 's' : ''}?</p>
            </div>
            <div className='modal-footer'>
              <button 
                type='button' 
                className='btn btn-secondary' 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                type='button' 
                className='btn btn-danger' 
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generate Similar Questions Modal */}
      <AIGenerateSimilarModal
        show={showAIGenerateModal}
        onHide={() => setShowAIGenerateModal(false)}
        onGenerate={handleAIGenerate}
        defaultQuestionType='lq'
      />
    </>
  )
} 