import React, { useEffect, useState, FC } from 'react'
import { Modal, Button, Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../../store'
import { fetchExercises, linkQuestionsToExercises, Exercise } from '../../../../store/exercises/exercisesSlice'
import { fetchQuestionsByIds, Question } from '../../../../store/questions/questionsSlice'
import { toast } from '../../../../_metronic/helpers/toast'
import Select from 'react-select'
import { hasImages, renderHtmlSafely, getTextPreview } from '../../../../_metronic/helpers/htmlRenderer'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface AssignToExerciseModalProps {
  show: boolean
  onHide: () => void
  questionIds: string[]
  questionType: 'mc' | 'lq'
  questions: Question[] // Pass questions data directly
}

// Sortable Row Component for @dnd-kit
const SortableRow: FC<{ question: Question; index: number; onRemove: (questionId: string) => void }> = ({ 
  question, 
  index, 
  onRemove 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.q_id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    position: isDragging ? 'relative' : 'static',
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'table-active dragging' : ''}
    >
      <td className="text-center">
        <div {...attributes} {...listeners}>
          <i className="fas fa-grip-vertical text-muted"></i>
        </div>
      </td>
      <td className="text-center fw-bold">{index + 1}</td>
      <td className="text-center">
        {question.type === 'mc' ? 
          <span className="badge badge-light-primary">MC</span> : 
          <span className="badge badge-light-info">LQ</span>
        }
      </td>
      <td>
        <div style={{ maxWidth: '400px' }}>
          {hasImages(question.question_content) ? (
            <div 
              className="d-flex align-items-center"
              dangerouslySetInnerHTML={{ __html: renderHtmlSafely(question.question_content, { maxImageWidth: 439, maxImageHeight: 264 }) }}
            />
          ) : (
            <div className="text-muted">
              {getTextPreview(question.question_content, 100)}
            </div>
          )}
        </div>
      </td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-light-danger"
          onClick={() => onRemove(question.q_id)}
          title="Remove question"
        >
          <i className="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  )
}

const AssignToExerciseModal: React.FC<AssignToExerciseModalProps> = ({
  show,
  onHide,
  questionIds,
  questionType,
  questions
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { exercises, loading, linking } = useSelector((state: RootState) => state.exercises)
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [sortedQuestionIds, setSortedQuestionIds] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter questions based on selected IDs
  const selectedQuestions = questions.filter(q => questionIds.includes(q.q_id))

  useEffect(() => {
    if (show) {
      // Don't fetch exercises automatically - wait for user to search
      setSearchTerm('')
      setHasSearched(false)
      // Set initial sorted order
      if (questionIds.length > 0) {
        setSortedQuestionIds([...questionIds])
      }
    }
  }, [show, questionIds])

  const handleAssign = async () => {
    if (selectedExercises.length === 0) {
      toast.error('Please select at least one exercise', 'Error')
      return
    }

    try {
      const exerciseIds = selectedExercises.map(exercise => exercise.exercise_id)
      await dispatch(linkQuestionsToExercises({ 
        questionIds: sortedQuestionIds, 
        exerciseIds 
      })).unwrap()
      
      onHide()
      setSelectedExercises([])
    } catch (error) {
      console.error('Error linking questions to exercises:', error)
      // Error toast is handled by the thunk
    }
  }

  const handleClose = () => {
    setSelectedExercises([])
    setSearchTerm('')
    setHasSearched(false)
    setSortedQuestionIds([])
    setActiveId(null)
    onHide()
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedQuestionIds.findIndex(id => id === active.id)
    const newIndex = sortedQuestionIds.findIndex(id => id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(sortedQuestionIds, oldIndex, newIndex)
    setSortedQuestionIds(newOrder)
  }

  const handleRemoveQuestion = (questionId: string) => {
    setSortedQuestionIds(prev => prev.filter(id => id !== questionId))
  }

  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue)
    
    // Only search if user types at least 3 characters
    if (inputValue.length >= 3) {
      setHasSearched(true)
      dispatch(fetchExercises({ 
        page: 1, 
        items_per_page: 100, 
        search: inputValue,
        all: 1
      }))
    } else if (inputValue.length === 0) {
      // Clear results when search is empty
      setHasSearched(false)
    }
  }

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="xl"
      centered
      backdrop={true}
      keyboard={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>Assign to Exercise(s)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <p className="text-muted">
            Select one or more exercises to assign {questionIds.length} selected {questionType.toUpperCase()} question(s) to:
          </p>
        </div>

        {/* Questions Table */}
        <div className="mb-4">
          {selectedQuestions.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedQuestionIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}></th>
                        <th style={{ width: '50px' }}>#</th>
                        <th style={{ width: '80px' }}>Type</th>
                        <th>Content</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedQuestionIds.map((questionId, index) => {
                        const question = selectedQuestions.find(q => q.q_id === questionId)
                        if (!question) return null
                        
                        return (
                          <SortableRow
                            key={questionId}
                            question={question}
                            index={index}
                            onRemove={handleRemoveQuestion}
                          />
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </SortableContext>
              {/* DragOverlay for better drag appearance */}
              <DragOverlay>
                {activeId ? (
                  (() => {
                    const q = selectedQuestions.find(q => q.q_id === activeId)
                    return q ? (
                      <table style={{width: '100%'}}>
                        <tbody>
                          <SortableRow
                            question={q}
                            index={0}
                            onRemove={() => {}}
                          />
                        </tbody>
                      </table>
                    ) : null
                  })()
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="text-center py-3">
              <p className="text-muted">No questions loaded</p>
            </div>
          )}
        </div>

        <div>
          <label className="form-label">Select Exercise(s)</label>
          <Select
            options={exercises.map((exercise) => ({
              value: exercise.exercise_id,
              label: `${exercise.title} (${exercise.question_count} questions)`,
              data: exercise
            }))}
            isMulti
            onChange={(selectedOptions: any) => {
              const selected = selectedOptions ? selectedOptions.map((option: any) => option.data) : []
              setSelectedExercises(selected)
            }}
            onInputChange={handleInputChange}
            inputValue={searchTerm}
            placeholder={!hasSearched ? "Type at least 3 characters to search exercises..." : "Search exercises..."}
            isLoading={loading}
            isClearable
            isSearchable
            isDisabled={linking}
            className="mb-3"
            noOptionsMessage={() => {
              if (!hasSearched) {
                return "Type at least 3 characters to search..."
              }
              if (loading) {
                return "Searching..."
              }
              return `No exercises found for "${searchTerm}"`
            }}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={linking}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAssign}
          disabled={selectedExercises.length === 0 || linking || loading}
          className={linking ? 'spinner' : ''}
        >
          {linking ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Linking...
            </>
          ) : (
            'Assign to Exercise(s)'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AssignToExerciseModal 