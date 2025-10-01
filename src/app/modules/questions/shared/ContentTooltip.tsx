import React, { useState, memo, useRef, useEffect } from 'react'
import { Overlay, Popover } from 'react-bootstrap'
import { hasImages, renderHtmlSafely, getTextPreview, stripHtml } from '../../../../_metronic/helpers/htmlRenderer'

interface ContentTooltipProps {
  children: React.ReactNode
  questionContent: string
  answerContent?: string
  correctOption?: string
  options?: Array<{ option_letter: string; option_text: string }>
  questionType: 'lq' | 'mc'
}

const ContentTooltip: React.FC<ContentTooltipProps> = memo(({
  children,
  questionContent,
  answerContent,
  correctOption,
  options,
  questionType
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const target = useRef(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const renderContent = (content: string, maxLength?: number) => {
    if (!content) return null
    
    if (hasImages(content)) {
      return (
        <div 
          className="d-flex align-items-center"
          dangerouslySetInnerHTML={{ 
            __html: renderHtmlSafely(content, { 
              maxImageWidth: 600, 
              maxImageHeight: 400
            }) 
          }}
        />
      )
    } else {
        return (
          <div style={{ fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {stripHtml(content)}
          </div>
        )
    }
  }

  const getCorrectOptionText = () => {
    if (!correctOption || !options) return 'No correct answer set'
    
    const correctOptionData = options.find(opt => opt.option_letter === correctOption)
    const optionText = correctOptionData?.option_text || 'No option text available'
    
    if (hasImages(optionText)) {
      return (
        <span
          dangerouslySetInnerHTML={{ 
            __html: renderHtmlSafely(optionText, { 
              maxImageWidth: 600, 
              maxImageHeight: 400 
            }) 
          }}
        />
      )
    } else {
      return stripHtml(optionText)
    }
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true)
    }, 300) // 300ms delay before showing
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false)
    }, 100) // 100ms delay before hiding
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <div 
        ref={target}
        className="d-inline-block w-100"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      <Overlay
        target={target.current}
        show={showTooltip}
        placement="top"
        rootClose={false}
        offset={[0, 15]}
      >
        <Popover 
          id="content-tooltip"
          style={{ 
            maxWidth: '700px',
            minWidth: '600px',
            width: '650px'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Popover.Header as="h6" className="fw-bold text-primary">
            Content Preview
          </Popover.Header>
          <Popover.Body style={{ maxHeight: '500px', overflowY: 'auto', padding: '1.5rem' }}>
            {/* Question Content */}
            <div className="mb-3">
              <div 
                className="fw-bold mb-2 text-warning" 
                style={{ 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px' 
                }}
              >
                Question:
              </div>
              {renderContent(questionContent)}
            </div>
            
            {/* Answer Content */}
            {answerContent && (
              <div className="mb-3">
                <div 
                  className="fw-bold mb-2 text-success" 
                  style={{ 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px' 
                  }}
                >
                  Answer:
                </div>
                {renderContent(answerContent)}
              </div>
            )}
            
            {/* Correct Option (for MC questions) */}
            {questionType === 'mc' && (
              <div>
                <div 
                  className="fw-bold mb-2 text-info" 
                  style={{ 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px' 
                  }}
                >
                  Correct Option:
                </div>
                <div>
                  {correctOption ? (
                    <>
                      <span className="fw-bold">[Option {correctOption}]</span>
                      <span className="ms-2">{getCorrectOptionText()}</span>
                    </>
                  ) : (
                    'No correct answer set'
                  )}
                </div>
              </div>
            )}
          </Popover.Body>
        </Popover>
      </Overlay>
    </>
  )
})

ContentTooltip.displayName = 'ContentTooltip'

export { ContentTooltip }
