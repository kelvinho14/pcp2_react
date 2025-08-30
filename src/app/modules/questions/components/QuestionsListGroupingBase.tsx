import React from 'react'
import { KTIcon } from '../../../../_metronic/helpers'
import { ConfirmationDialog } from '../../../../_metronic/helpers/ConfirmationDialog'
import AIGenerateSimilarModal from './AIGenerateSimilarModal'
import AIGeneratedQuestionsModal from './AIGeneratedQuestionsModal'
import AssignToExerciseModal from './AssignToExerciseModal'
import { useQuestionsListGrouping } from '../hooks/useQuestionsListGrouping'

type QuestionType = 'mc' | 'lq' // Will extend to 'tf' | 'matching' later

interface QuestionsListGroupingBaseProps {
  questionType: QuestionType
  useListViewHook: () => { selected: any[], clearSelected: () => void }
}

const QuestionsListGroupingBase: React.FC<QuestionsListGroupingBaseProps> = ({ questionType, useListViewHook }) => {
  const {
    selected,
    generatedQuestions,
    generatingSimilarQuestions,
    creatingMultipleQuestions,
    creating,
    deleting,
    questions,
    showDeleteDialog,
    showAIGenerateModal,
    showGeneratedQuestionsModal,
    showAssignToExerciseModal,
    handleAIGenerateSimilar,
    handleAcceptGeneratedQuestions,
    handleAcceptSingleQuestion,
    handleDismissGeneratedQuestions,
    handleBulkDelete,
    handleAIGenerateClick,
    handleAssignToExerciseClick,
    setShowDeleteDialog,
    setShowAIGenerateModal,
    setShowAssignToExerciseModal
  } = useQuestionsListGrouping(questionType, useListViewHook)

  return (
    <>
      <div className='d-flex justify-content-end align-items-center' data-kt-question-table-toolbar='selected'>
        <div className='fw-bolder me-5'>
          <span className='me-2'>{selected.length}</span> selected
        </div>

        <button 
          type='button' 
          className='btn btn-sm btn-primary me-3'
          onClick={handleAIGenerateClick}
        >
          <i className='fas fa-robot me-1 btn-sm'></i>
          AI Generate Similar
        </button>

        <button 
          type='button' 
          className='btn btn-sm btn-success me-3'
          onClick={handleAssignToExerciseClick}
        >
          <i className='fas fa-tasks me-1 btn-sm'></i>
          Assign to Exercise
        </button>

        <button 
          type='button' 
          className={`btn btn-danger btn-sm ${deleting ? 'btn-loading' : ''}`}
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleting}
        >
          {deleting ? (
            <>
              <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
              Deleting...
            </>
          ) : (
            <>
              <KTIcon iconName='trash' className='fs-2' />
              Delete Selected
            </>
          )}
        </button>
      </div>

      <ConfirmationDialog
        show={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Delete Questions"
        message={`Are you sure you want to delete ${selected.length} selected question(s)? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      <AIGenerateSimilarModal
        show={showAIGenerateModal}
        onHide={() => setShowAIGenerateModal(false)}
        onGenerate={handleAIGenerateSimilar}
        defaultQuestionType={questionType}
        isLoading={generatingSimilarQuestions}
      />

      <AIGeneratedQuestionsModal
        show={showGeneratedQuestionsModal}
        onHide={handleDismissGeneratedQuestions}
        onAccept={handleAcceptGeneratedQuestions}
        onAcceptSingle={handleAcceptSingleQuestion}
        questions={generatedQuestions}
        isLoading={generatingSimilarQuestions || creatingMultipleQuestions || creating}
        questionType={generatedQuestions.length > 0 ? generatedQuestions[0].type : questionType}
      />

      <AssignToExerciseModal
        show={showAssignToExerciseModal}
        onHide={() => setShowAssignToExerciseModal(false)}
        questionIds={selected.filter((id: any) => id !== undefined && id !== null).map((id: any) => String(id))}
        questionType={questionType}
        questions={questions}
      />
    </>
  )
}

export default QuestionsListGroupingBase
