import {FC, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../../store'
import {generateSimilarQuestions, bulkDeleteQuestions} from '../../../../../store/questions/questionsSlice'
import {Modal, Button} from 'react-bootstrap'
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
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        size="sm"
        centered
        backdrop={true}
        keyboard={true}
        dialogClassName="delete-confirmation-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete {selected.length} selected question{selected.length > 1 ? 's' : ''}?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

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