import React, { FC } from 'react';
import { renderHtmlSafely } from '../../../../_metronic/helpers/htmlRenderer';
import { formatApiTimestamp, getUserTimezone } from '../../../../_metronic/helpers/dateUtils';

interface Question {
  question_id: string;
  question_name: string;
  question_type: 'mc' | 'lq';
  correct_answer?: string;
  correct_option?: string;
  options?: { letter: string; text: string }[];
  tags?: { name: string; maxScore: number }[]; // Added tags for MC questions
}

interface StudentAnswer {
  student_id: string;
  student_name: string;
  student_email: string;
  status: number;
  score?: number;
  student_answer?: string;
  student_option?: string;
  answered_at?: string;
  overall_status: number;
  tag_scores?: Array<{
    tag_id: string;
    tag_name: string;
    score: number;
    max_score: number;
    is_correct: boolean;
  }>;
  tag_total?: {
    score: number;
    maxScore: number;
  };
}

interface QuestionsViewProps {
  allQuestions: Question[];
  getStudentAnswersForQuestion: (questionId: string) => StudentAnswer[];
  getQuestionTypeBadge: (type: string) => React.ReactNode;
  getQuestionStatusBadge: (status: number) => React.ReactNode;
  formatDate: (dateString?: string) => string;
}

const QuestionsView: FC<QuestionsViewProps> = ({
  allQuestions,
  getStudentAnswersForQuestion,
  getQuestionTypeBadge,
  getQuestionStatusBadge,
  formatDate,
}) => {
  // Helper to extract image src from HTML or URL
  const getImageSrc = (question_name: string): string | null => {
    if (!question_name) return null;
    // If it's a direct image URL
    if (/https?:\/\/.*\.(png|jpe?g|gif|svg)$/i.test(question_name)) {
      return question_name;
    }
    // If it contains an <img> tag, extract src
    const match = question_name.match(/<img[^>]*src=["']?([^>"']+)["']?[^>]*>/i);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  // Helper to render question text (excluding image)
  const getQuestionText = (question_name: string): string | null => {
    if (!question_name) return null;
    // Remove <img> tags
    return question_name.replace(/<img[^>]*>/gi, '').trim();
  };

  // Helper to render tag score badges for MC and LQ
  const renderTagScores = (question: any, answer: any, isMC: boolean) => {
    if (!answer.tag_scores || answer.tag_scores.length === 0) {
      return <span className='text-muted fs-7'>No tags</span>;
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

  return (
    <div className='questions-view'>
      {allQuestions.map((question, questionIndex) => {
        const studentAnswers = getStudentAnswersForQuestion(question.question_id);
        const isMC = question.question_type === 'mc';
        const imageSrc = getImageSrc(question.question_name);
        const questionText = getQuestionText(question.question_name);
        return (
          <div key={question.question_id} className='card mb-6'>
            <div className='card-header py-5' style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              <div className='d-flex justify-content-between align-items-center'>
                <div className='d-flex align-items-center gap-3'>
                  <span className='badge badge-light-primary fs-6'>Q{questionIndex + 1}</span>
                </div>
                <div>{getQuestionTypeBadge(question.question_type)}</div>
              </div>
              <div className='question-header-content pt-3'>
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
                    }}
                  />
                ) : (
                  <h5 className='card-title mb-0'>{questionText || null}</h5>
                )}
              </div>
            </div>
            <div className='card-body'>
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
                      {studentAnswers.map((answer) => (
                        <tr key={answer.student_id}>
                          <td>
                            <div className='d-flex align-items-center'>
                              <div>
                                <div className='fw-bold fs-7'>{answer.student_name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className='max-width-300'>
                              {isMC ? (
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
                                <div className='p-2 bg-light rounded'>
                                  <div 
                                    dangerouslySetInnerHTML={{ 
                                      __html: renderHtmlSafely(answer.student_answer, { maxImageWidth: 300, maxImageHeight: 200 }) 
                                    }}
                                  />
                                </div>
                              ) : (
                                <span className='text-muted fs-7'>No answer</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {/* MC and LQ: show tag badges if tags exist; else, show score as before */}
                            {question.tags ? (
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
                            <span className='text-muted fs-7'>{formatDate(answer.answered_at)}</span>
                          </td>
                        </tr>
                      ))}
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
        );
      })}
    </div>
  );
};

export default QuestionsView; 