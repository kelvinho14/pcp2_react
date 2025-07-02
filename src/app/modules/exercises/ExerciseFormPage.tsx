import React, {FC, useState, useEffect} from 'react'
import {PageTitle, PageLink} from '../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useNavigate, useParams} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../../store'
import {
  fetchTopics,
  fetchExerciseTypes,
  clearMessages,
  createExercise,
  Topic,
  ExerciseType,
  ExerciseFormData
} from '../../../store/exercise/exerciseSlice'
import {
  fetchExercises,
  updateExercise,
  fetchExerciseWithQuestions,
  updateQuestionPositions,
  unlinkQuestions,
  removeLinkedQuestion,
  Exercise,
  LinkedQuestion
} from '../../../store/exercises/exercisesSlice'
import Select from 'react-select'
import clsx from 'clsx'
import {toast} from '../../../_metronic/helpers/toast'
import { hasImages, renderHtmlSafely, getTextPreview } from '../../../_metronic/helpers/htmlRenderer'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { ConfirmationDialog } from '../../../_metronic/helpers/ConfirmationDialog'

const exerciseValidationSchema = Yup.object().shape({
  title: Yup.string()
    .max(255, 'Maximum 255 characters')
    .required('Exercise title is required'),
  description: Yup.string()
    .max(1000, 'Maximum 1000 characters'),
  topic_ids: Yup.array().of(Yup.string()),
  type: Yup.string().required('Please select an exercise type'),
  status: Yup.number().required('Please select a status'),
})

// MultiSelect Component using react-select
interface MultiSelectProps {
  options: Topic[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder: string
  className?: string
}

const MultiSelect: FC<MultiSelectProps> = ({ options, selectedValues, onChange, placeholder, className }) => {
  // Convert options to react-select format
  const selectOptions = options.map(option => ({
    value: option.id,
    label: option.name
  }))

  // Convert selected values to react-select format
  const selectedOptions = selectOptions.filter(option => 
    selectedValues.includes(option.value)
  )

  const handleChange = (selected: any) => {
    console.log('React-select change:', selected)
    const values = selected ? selected.map((item: any) => item.value) : []
    console.log('New values:', values)
    onChange(values)
  }

  return (
    <Select
      isMulti
      options={selectOptions}
      value={selectedOptions}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      classNamePrefix="select"
      isSearchable={true}
      closeMenuOnSelect={false}
    />
  )
}

const ExerciseFormPage: FC = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)
  const [questionToUnlink, setQuestionToUnlink] = useState<string | null>(null)
  const isEditMode = !!exerciseId
  
  // Redux selectors
  const { topics, exerciseTypes, loading, creating } = useSelector(
    (state: RootState) => state.exercise
  )
  const { exercises, loading: exercisesLoading, updating, updatingPositions, unlinking, currentExercise, linkedQuestions, fetchingExercise } = useSelector(
    (state: RootState) => state.exercises
  )

  // Get current exercise data if in edit mode
  const exerciseFromList = isEditMode ? exercises.find((ex: Exercise) => ex.exercise_id === exerciseId) : null

  // Fetch exercise types and topics on component mount
  useEffect(() => {
    dispatch(fetchExerciseTypes())
    dispatch(fetchTopics())
  }, [dispatch])

  // Fetch exercise with questions if in edit mode
  useEffect(() => {
    if (isEditMode && exerciseId) {
      dispatch(fetchExerciseWithQuestions(exerciseId))
    }
  }, [isEditMode, exerciseId, dispatch])

  // Clear messages on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearMessages())
    }
  }, [dispatch])

  // Update breadcrumbs based on mode
  const breadcrumbs: PageLink[] = isEditMode 
    ? [
        {
          title: 'Home',
          path: '/dashboard',
          isSeparator: false,
          isActive: false,
        },
        {
          title: 'Exercise List',
          path: '/exercises/list',
          isSeparator: false,
          isActive: false,
        }
      ]
    : [
        {
          title: 'Home',
          path: '/dashboard',
          isSeparator: false,
          isActive: false,
        },
        {
          title: 'Exercise List',
          path: '/exercises/list',
          isSeparator: false,
          isActive: false,
        }
      ]

  const formik = useFormik<ExerciseFormData>({
    initialValues: {
      title: '',
      description: '',
      topic_ids: [],
      type: '',
      status: 0, // Default to Inactive
    },
    validationSchema: exerciseValidationSchema,
    enableReinitialize: true, // This allows the form to update when currentExercise changes
    onSubmit: async (values, {setSubmitting}) => {
      setIsSubmitting(true)
      try {
        if (isEditMode && exerciseId) {
          await dispatch(updateExercise({ exerciseId, data: values })).unwrap()
          // Don't navigate - stay on the edit page
        } else {
          await dispatch(createExercise(values)).unwrap()
          navigate('/exercises/list')
        }
      } catch (error) {
        console.error('Error saving exercise:', error)
        // Error handling is done in the thunk
      } finally {
        setIsSubmitting(false)
        setSubmitting(false)
      }
    },
  })

  // Handle update and go to list
  const handleUpdateAndGoToList = async () => {
    if (!formik.isValid || !formik.values.title.trim() || !formik.values.type || formik.values.status === undefined) {
      return
    }
    
    setIsSubmitting(true)
    try {
      if (isEditMode && exerciseId) {
        await dispatch(updateExercise({ exerciseId, data: formik.values })).unwrap()
        navigate('/exercises/list')
      }
    } catch (error) {
      console.error('Error saving exercise:', error)
      // Error handling is done in the thunk
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update form values when exercise data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && (currentExercise || exerciseFromList)) {
      const exercise = currentExercise || exerciseFromList
      formik.setValues({
        title: exercise?.title || '',
        description: exercise?.description || '',
        topic_ids: [], // TODO: Add topic_ids to Exercise type when API supports it
        type: exercise?.type_id || '',
        status: exercise?.status || 0,
      })
    }
  }, [currentExercise, exerciseFromList, isEditMode])

  const handleAIGenerateDescription = () => {
    // TODO: Implement AI description generation
    console.log('AI description generation will be implemented here')
  }

  const getQuestionTypeBadge = (type: string) => {
    return type === 'mc' ? 
      <span className='badge badge-light-primary'>MC</span> : 
      <span className='badge badge-light-info'>LQ</span>
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    try {
      // Create a copy of the linkedQuestions array
      const reorderedQuestions = Array.from(linkedQuestions)
      
      // Remove the dragged item from its original position
      const [draggedQuestion] = reorderedQuestions.splice(result.source.index, 1)
      
      // Insert the dragged item at its new position
      reorderedQuestions.splice(result.destination.index, 0, draggedQuestion)
      
      // Create the question positions array based on the new order
      const questionPositions = reorderedQuestions.map((question, index) => ({
        question_id: question.question_id,
        new_position: index + 1
      }))

      // Call the API to update question positions
      await dispatch(updateQuestionPositions({ 
        exerciseId: exerciseId!, 
        questionPositions 
      })).unwrap()

      // Refresh the exercise data to get updated order
      if (exerciseId) {
        dispatch(fetchExerciseWithQuestions(exerciseId))
      }
    } catch (error) {
      console.error('Error updating question positions:', error)
      // Error toast is handled by the thunk
    }
  }

  const handleUnlinkQuestion = (questionId: string) => {
    setQuestionToUnlink(questionId)
    setShowUnlinkConfirm(true)
  }

  const handleConfirmUnlink = async () => {
    if (!exerciseId || !questionToUnlink) return

    try {
      await dispatch(unlinkQuestions({ 
        exerciseId, 
        questionIds: [questionToUnlink] 
      })).unwrap()

      // Update local state instead of refreshing
      dispatch(removeLinkedQuestion({ questionId: questionToUnlink }))
    } catch (error) {
      console.error('Error unlinking question:', error)
      // Error toast is handled by the thunk
    } finally {
      setShowUnlinkConfirm(false)
      setQuestionToUnlink(null)
    }
  }

  if (loading || (isEditMode && exercisesLoading) || (isEditMode && fetchingExercise)) {
    return (
      <>
        <PageTitle breadcrumbs={breadcrumbs}>
          {isEditMode ? 'Edit Exercise' : 'Create New Exercise'}
        </PageTitle>
        
        <div className='card'>
          <div className='card-body'>
            <div className='d-flex justify-content-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>
        {isEditMode ? 'Edit Exercise' : 'Create New Exercise'}
      </PageTitle>
      
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>{isEditMode ? 'Edit Exercise' : 'Create New Exercise'}</h3>
        </div>
        <div className='card-body'>
          <form onSubmit={formik.handleSubmit} className='form'>
            {/* Exercise Title */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label required fw-bold fs-6'>Exercise Title</label>
              <div className='col-lg-9 fv-row'>
                <input
                  type='text'
                  className={clsx(
                    'form-control form-control-lg form-control-solid',
                    {'is-invalid': formik.touched.title && formik.errors.title},
                    {'is-valid': formik.touched.title && !formik.errors.title}
                  )}
                  placeholder='Enter exercise title'
                  {...formik.getFieldProps('title')}
                />
                {formik.touched.title && formik.errors.title && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.title}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Description for Students */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-bold fs-6'>Description for Students</label>
              <div className='col-lg-9 fv-row'>
                <div className='position-relative'>
                  <textarea
                    className={clsx(
                      'form-control form-control-lg form-control-solid',
                      {'is-invalid': formik.touched.description && formik.errors.description},
                      {'is-valid': formik.touched.description && !formik.errors.description}
                    )}
                    placeholder='Enter description for students'
                    rows={4}
                    {...formik.getFieldProps('description')}
                  />
                  <button
                    type='button'
                    className='btn btn-sm btn-light-primary position-absolute top-0 end-0 mt-2 me-2'
                    onClick={handleAIGenerateDescription}
                    title='Generate description using AI'
                  >
                    <i className='fas fa-magic me-1'></i>
                    AI Generate
                  </button>
                </div>
                {formik.touched.description && formik.errors.description && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.description}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Topic List */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-bold fs-6'>Topics</label>
              <div className='col-lg-9 fv-row'>
                <MultiSelect
                  options={topics}
                  selectedValues={formik.values.topic_ids}
                  onChange={(values) => formik.setFieldValue('topic_ids', values)}
                  placeholder='Select topics (optional)'
                />
                <div className='form-text'>Select one or more topics (optional)</div>
              </div>
            </div>

            {/* Exercise Type */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label required fw-bold fs-6'>Exercise Type</label>
              <div className='col-lg-9 fv-row'>
                <select
                  className={clsx(
                    'form-select form-select-solid form-select-lg',
                    {'is-invalid': formik.touched.type && formik.errors.type},
                    {'is-valid': formik.touched.type && !formik.errors.type && formik.values.type}
                  )}
                  {...formik.getFieldProps('type')}
                >
                  <option value=''>Select an exercise type...</option>
                  {exerciseTypes.map((type: ExerciseType) => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {formik.touched.type && formik.errors.type && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.type}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label required fw-bold fs-6'>Status</label>
              <div className='col-lg-9 fv-row'>
                <select
                  className={clsx(
                    'form-select form-select-solid form-select-lg',
                    {'is-invalid': formik.touched.status && formik.errors.status},
                    {'is-valid': formik.touched.status && !formik.errors.status}
                  )}
                  {...formik.getFieldProps('status')}
                >
                  <option value={0}>Inactive</option>
                  <option value={1}>Active</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.status}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className='row mb-6'>
              <div className='col-lg-9 offset-lg-3'>
                <div className='d-flex gap-3'>
                  {isEditMode ? (
                    <>
                      <button
                        type='submit'
                        className='btn btn-primary btn-lg indicator'
                        data-kt-indicator={isSubmitting || creating || updating ? 'on' : 'off'}
                        disabled={
                          isSubmitting || 
                          creating ||
                          updating ||
                          formik.isSubmitting || 
                          !formik.isValid || 
                          !formik.values.title.trim() || 
                          !formik.values.type ||
                          formik.values.status === undefined
                        }
                      >
                        <span className='indicator-label'>
                          Update
                        </span>
                        <span className='indicator-progress'>
                          Please wait... 
                          <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                        </span>
                      </button>
                      <button
                        type='button'
                        className='btn btn-success btn-lg indicator'
                        data-kt-indicator={isSubmitting || creating || updating ? 'on' : 'off'}
                        onClick={handleUpdateAndGoToList}
                        disabled={
                          isSubmitting || 
                          creating ||
                          updating ||
                          formik.isSubmitting || 
                          !formik.isValid || 
                          !formik.values.title.trim() || 
                          !formik.values.type ||
                          formik.values.status === undefined
                        }
                      >
                        <span className='indicator-label'>
                          Update and go to list
                        </span>
                        <span className='indicator-progress'>
                          Please wait... 
                          <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      type='submit'
                      className='btn btn-primary btn-lg indicator'
                      data-kt-indicator={isSubmitting || creating || updating ? 'on' : 'off'}
                      disabled={
                        isSubmitting || 
                        creating ||
                        updating ||
                        formik.isSubmitting || 
                        !formik.isValid || 
                        !formik.values.title.trim() || 
                        !formik.values.type ||
                        formik.values.status === undefined
                      }
                    >
                      <span className='indicator-label'>
                        Create Exercise
                      </span>
                      <span className='indicator-progress'>
                        Please wait... 
                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                      </span>
                    </button>
                  )}
                  <button
                    type='button'
                    className='btn btn-secondary btn-lg'
                    onClick={() => navigate('/exercises/list')}
                    disabled={isSubmitting || creating || updating}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Linked Questions Table - Only show in edit mode */}
      {isEditMode && (
        <div className='card mt-6'>
          <div className='card-header'>
            <h3 className='card-title'>Linked Questions ({linkedQuestions.length})</h3>
          </div>
          <div className='card-body'>
            {linkedQuestions.length === 0 ? (
              <div className='text-center py-4'>
                <p className='text-muted'>No questions linked to this exercise yet.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="linkedQuestions">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="table-responsive"
                    >
                      <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
                        <thead>
                          <tr className='fw-bold text-muted'>
                            <th className='min-w-50px'>#</th>
                            <th className='min-w-125px'>Type</th>
                            <th className='min-w-125px'>Name</th>
                            <th className='min-w-400px'>Question Content</th>
                            <th className='min-w-125px'>Created</th>
                            <th className='min-w-100px'>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {linkedQuestions.map((question: LinkedQuestion, index: number) => (
                            <Draggable key={question.question_id} draggableId={question.question_id} index={index}>
                              {(provided, snapshot) => (
                                <tr
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={snapshot.isDragging ? 'table-active' : ''}
                                >
                                  <td className="text-center fw-bold" {...provided.dragHandleProps}>
                                    <div className="d-flex align-items-center justify-content-center">
                                      <i className="fas fa-grip-vertical text-muted me-2"></i>
                                      <span>{index + 1}</span>
                                    </div>
                                  </td>
                                  <td>
                                    {getQuestionTypeBadge(question.type)}
                                  </td>
                                  <td>
                                    <div className='d-flex align-items-center'>
                                      <div className='d-flex justify-content-start flex-column'>
                                        <span className='text-dark fw-bold text-hover-primary fs-6'>
                                          {question.name}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className='d-flex flex-column' style={{ maxWidth: '400px' }}>
                                      {hasImages(question.question_content) ? (
                                        <div 
                                          className="d-flex align-items-center"
                                          dangerouslySetInnerHTML={{ __html: renderHtmlSafely(question.question_content, { maxImageWidth: 520, maxImageHeight: 312 }) }}
                                        />
                                      ) : (
                                        <div className="text-dark fw-bold text-hover-primary fs-6">
                                          {getTextPreview(question.question_content, 150)}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div className='text-muted fw-semibold fs-6'>
                                      {new Date(question.created_at).toLocaleDateString()}
                                    </div>
                                  </td>
                                  <td>
                                    <div className='d-flex gap-2'>
                                      <button
                                        type='button'
                                        className='btn btn-sm btn-light-primary'
                                        onClick={() => navigate(`/questions/${question.type}/edit/${question.question_id}`)}
                                      >
                                        <i className='fas fa-edit'></i>
                                      </button>
                                      <button
                                        type='button'
                                        className='btn btn-sm btn-light-danger indicator'
                                        data-kt-indicator={unlinking ? 'on' : 'off'}
                                        onClick={() => handleUnlinkQuestion(question.question_id)}
                                        disabled={unlinking}
                                      >
                                        <span className='indicator-label'>
                                          <i className='fas fa-trash'></i>
                                        </span>
                                        <span className='indicator-progress'>
                                          <span className='spinner-border spinner-border-sm align-middle'></span>
                                        </span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
      )}

      <ConfirmationDialog
        show={showUnlinkConfirm}
        onHide={() => setShowUnlinkConfirm(false)}
        onConfirm={handleConfirmUnlink}
        title="Confirm Unlink"
        message="Are you sure you want to unlink this question from the exercise? This action cannot be undone."
        confirmText={unlinking ? "Unlinking..." : "Unlink"}
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
}

export default ExerciseFormPage 