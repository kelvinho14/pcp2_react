import React, { FC, useState } from 'react';
import { renderHtmlSafely } from '../../../../_metronic/helpers/htmlRenderer';
import { formatApiTimestamp, getUserTimezone } from '../../../../_metronic/helpers/dateUtils';
import ImageModal from '../../../../components/Modal/ImageModal';
import { ASSIGNMENT_STATUS } from '../../../constants/assignmentStatus';

import { Question } from './types';

import { StudentAnswer } from './types';

interface QuestionsViewProps {
  allQuestions: Question[];
  getStudentAnswersForQuestion: (questionId: string) => StudentAnswer[];
  getQuestionTypeBadge: (type: string) => React.ReactNode;
  getQuestionStatusBadge: (status: number) => React.ReactNode;
  formatDate: (dateString?: string) => string;
  hasQuestionChange?: (questionId: string) => boolean;
  hasStudentChange?: (studentId: string) => boolean;
}

const QuestionsView: FC<QuestionsViewProps> = ({
  allQuestions,
  getStudentAnswersForQuestion,
  getQuestionTypeBadge,
  getQuestionStatusBadge,
  formatDate,
  hasQuestionChange,
  hasStudentChange,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Helper to extract image src from HTML or URL
  const getImageSrc = (question_content: string): string | null => {
    if (!question_content) return null;
    // If it's a direct image URL
    if (/https?:\/\/.*\.(png|jpe?g|gif|svg)$/i.test(question_content)) {
      return question_content;
    }
    // If it contains an <img> tag, extract src
    const match = question_content.match(/<img[^>]*src=["']?([^>"']+)["']?[^>]*>/i);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  // Helper to render question text (excluding image)
  const getQuestionText = (question_content: string): string | null => {
    if (!question_content) return null;
    // Remove <img> tags
    return question_content.replace(/<img[^>]*>/gi, '').trim();
  };

  // Helper to make images clickable
  const makeImagesClickable = (htmlContent: string): string => {
    return htmlContent.replace(
      /<img([^>]*)>/gi,
      '<img$1 style="cursor: pointer; max-width: 100%; height: auto;" onclick="window.dispatchEvent(new CustomEvent(\'imageClick\', {detail: this.src}))" />'
    );
  };

  // Helper to check if student has started (has any answer)
  const hasStudentStarted = (answer: any): boolean => {
    return !!(answer.student_answer || answer.student_option || answer.answered_at);
  };

  // Helper to render tag score badges for MC and LQ
  const renderTagScores = (question: any, answer: any, isMC: boolean) => {
    if (!answer.tag_scores || answer.tag_scores.length === 0) {
      return <span className='text-muted fs-7'>—</span>;
    }

    const tagBadges = answer.tag_scores.map((tagScore: any) => (
      <span
        key={tagScore.tag_id}
        className={`badge ${tagScore.is_correct ? 'badge-success' : 'badge-danger'} fs-7`}
      >
        {tagScore.tag_name} {tagScore.score}/{tagScore.max_score}
      </span>
    ));

    const totalScore = answer.tag_total?.score || 0;
    const totalMax = answer.tag_total?.maxScore || 0;
    
    let totalColor = 'text-danger';
    if (totalScore === totalMax && totalMax > 0) totalColor = 'text-success';
    else if (totalScore > 0) totalColor = 'text-warning';

    return (
      <div className='d-flex flex-wrap gap-2 align-items-center'>
        {tagBadges}
        <span className={`fw-bold fs-7 ms-4 ${totalColor}`}>
          <i className='fas fa-calculator me-1'></i>Total: {totalScore}/{totalMax}
        </span>
      </div>
    );
  };

  // Add event listener for image clicks
  React.useEffect(() => {
    const handleImageClick = (event: CustomEvent) => {
      setSelectedImage(event.detail);
    };

    window.addEventListener('imageClick', handleImageClick as EventListener);
    return () => {
      window.removeEventListener('imageClick', handleImageClick as EventListener);
    };
  }, []);

  return (
    <div className='questions-view'>
      {allQuestions.map((question, questionIndex) => {
        const studentAnswers = getStudentAnswersForQuestion(question.question_id);
        const isMC = question.question_type === 'mc';
        const imageSrc = getImageSrc(question.question_content);
        const questionText = getQuestionText(question.question_content);
        const hasChanges = hasQuestionChange ? hasQuestionChange(question.question_id) : false;
        return (
          <div 
            key={question.question_id} 
            className={`card mb-6 question-row ${hasChanges ? 'has-changes' : ''}`}
          >
            <div className='card-header py-3'>
              <div className='d-flex justify-content-between align-items-center'>
                <div className='d-flex align-items-center gap-3'>
                  <span className='badge badge-light-primary fs-6'>Q{questionIndex + 1}</span>
                </div>
                <div>{getQuestionTypeBadge(question.question_type)}</div>
              </div>
            </div>
            <div className='card-body'>
              <div className='question-content mb-4'>
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt='Question'
                    style={{
                      maxWidth: 400,
                      maxHeight: 250,
                      width: 'auto',
                      height: 'auto',
                      borderRadius: 8,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                      border: '1px solid #e1e3ea',
                      background: '#fff',
                      display: 'block',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedImage(imageSrc)}
                  />
                ) : (
                  <div 
                    className='card-title mb-0'
                    dangerouslySetInnerHTML={{ 
                      __html: makeImagesClickable(renderHtmlSafely(question.question_content || '', { maxImageWidth: 400, maxImageHeight: 250 }))
                    }}
                  />
                )}
              </div>
              <div className='mb-4'>
                <strong>Correct Answer:</strong>
                <div className='mt-2 p-3 bg-light-success rounded'>
                  {question.question_type === 'mc' && question.correct_option ? (
                    <>
                      <span className='badge badge-light-primary me-2'>Option {question.correct_option}</span>
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: renderHtmlSafely(question.correct_answer || '', { maxImageWidth: 300, maxImageHeight: 200 }) 
                        }}
                      />
                    </>
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: renderHtmlSafely(question.correct_answer || '', { maxImageWidth: 300, maxImageHeight: 200 }) 
                      }}
                    />
                  )}
                </div>
              </div>
              <div className='border rounded p-4 bg-light'>
                <h6 className='mb-3'>Student Answers:</h6>
              {studentAnswers.length > 0 ? (
                <div className='table-responsive'>
                  <table className='table table-sm'>
                    <thead>
                      <tr className='fw-bold text-muted'>
                        <th>Student</th>
                        <th>Answer</th>
                        <th>Score</th>
                        {/* Only show Status column for LQ */}
                        {!isMC && <th>Status</th>}
                        <th>Answered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentAnswers.map((answer) => {
                        const studentHasChanges = hasStudentChange ? hasStudentChange(answer.student_id) : false;
                        return (
                          <tr 
                            key={answer.student_id} 
                            className={`student-row ${studentHasChanges ? 'has-changes' : ''}`}
                          >
                          <td>
                            <div className='d-flex align-items-center'>
                              <div>
                                <div className='fw-bold fs-7'>{answer.student_name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className='max-width-300'>
                              {!hasStudentStarted(answer) ? (
                                <span className='text-muted fs-7'>—</span>
                              ) : isMC ? (
                                answer.student_option ? (
                                  <div className={`p-2 rounded ${answer.student_option === question.correct_option ? 'bg-light-success' : 'bg-light-danger'}`}>
                                    <span className='badge badge-light-primary me-2'>Option {answer.student_option}</span>
                                    <div 
                                      dangerouslySetInnerHTML={{ 
                                        __html: renderHtmlSafely(answer.student_answer || '', { maxImageWidth: 300, maxImageHeight: 200 }) 
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className='text-muted fs-7'>No answer</span>
                                )
                              ) : answer.student_answer ? (
                                // For LQ, show different content based on status
                                answer.status === ASSIGNMENT_STATUS.SUBMITTED || answer.status === ASSIGNMENT_STATUS.GRADED ? (
                                  // Completed - show grade button
                                  <button
                                    type='button'
                                    className='btn btn-sm btn-primary'
                                    onClick={() => {
                                      // TODO: Open grading modal
                                      console.log('Open grading modal for student:', answer.student_id, 'question:', question.question_id);
                                    }}
                                  >
                                    <i className='fas fa-star me-1'></i>
                                    Grade Answer
                                  </button>
                                ) : (
                                  // In progress - show the answer
                                  <div className='p-2 bg-light rounded'>
                                    <div 
                                      dangerouslySetInnerHTML={{ 
                                        __html: renderHtmlSafely(answer.student_answer, { maxImageWidth: 300, maxImageHeight: 200 }) 
                                      }}
                                    />
                                  </div>
                                )
                              ) : (
                                <span className='text-muted fs-7'>No answer</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {/* MC and LQ: show tag badges if tags exist; else, show score as before */}
                            {!hasStudentStarted(answer) ? (
                              <span className='text-muted fs-7'>—</span>
                            ) : question.tags ? (
                              renderTagScores(question, answer, isMC)
                            ) : answer.score !== undefined ? (
                              <span className='fw-bold fs-7 text-success'>{answer.score}%</span>
                            ) : (
                              <span className='text-muted fs-7'>N/A</span>
                            )}
                          </td>
                          {/* Only show Status column for LQ */}
                          {!isMC && (
                            <td>
                              {getQuestionStatusBadge(answer.status)}
                            </td>
                          )}
                          <td>
                            <span className='text-muted fs-7'>
                              {!hasStudentStarted(answer) ? '—' : formatDate(answer.answered_at)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='text-center text-muted py-4'>
                  <i className='fas fa-inbox fs-2 mb-3'></i>
                  <div>No students have answered this question yet.</div>
                </div>
              )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Image Modal */}
      <ImageModal
        isOpen={!!selectedImage}
        imageSrc={selectedImage}
        onClose={() => setSelectedImage(null)}
        title="Question Image"
      />
    </div>
  );
};

export default QuestionsView; 