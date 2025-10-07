import {useEffect, useState} from 'react'
import {Outlet, Link} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../_metronic/helpers'

interface Testimony {
  text: string
  name?: string
}

const testimonies: Testimony[] = [
  {
    text: '整體嚟講係唔錯嘅, 個平台整合曬我做過嘅所有嘢, 所以好容易追蹤我較弱嘅範疇. 同時, 我又可以知道我嘅表現相對於全班嘅表現, 令我知道自己仲有進步空間囉,加上有 video.  所以呢個平台真係好方便.'
  },
  {
    text: '我覺得幾好，唔洗成日用google form交嘢，亦都可以隨時睇返自己嘅表現，雖然有時睇得多會覺得壓力有d大（純粹我嘅個人問題💩）但係起碼可以知道能力去到邊，邊到要操練多d，唔洗到臨考先發現，真係唔錯🙈（anyway ，加油！💪🏻XD)'
  },
  {
    
    text: '我認為這個平台對學生或老師都是十分方便的。學生可以在平台上時刻留意老師發布的功課和影片，令自己在家學習更方便更有效率，準確的數據分析除了令學生更加關心自己的學習進度外也讓學生清晰知道自己的弱點，大可對症下藥。對於老師而言，不必向學生天天催收功課，亦可在大家缺席時在此平台發布影片和練習筆記，不必擔心學生進度落後。而其中的直播功能更是在這時的非常時期給予不能出門的我們很大的幫助，以致我們可以善用時間去學習。總而言之，這個平台對所有使用者益處多多，我十分支持其繼續發展下去💪👍😁'
  },
  {
    
    text: 'It\'s quite good as I can know what I\'m weak against just by taking a look at the graph and secondly I can find videos of topics easily'
  }
]

const ROTATE_INTERVAL = 8000 // ms, change this value to adjust rotation speed
const FADE_DURATION = 400 // ms, fade out/in duration

const AuthLayout = () => {
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      root.style.height = '100%'
    }
    return () => {
      if (root) {
        root.style.height = 'auto'
      }
    }
  }, [])

  const [currentTestimony, setCurrentTestimony] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentTestimony((prev) => (prev + 1) % testimonies.length)
        setFade(true)
      }, FADE_DURATION)
    }, ROTATE_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  // Inline CSS for fade effect
  const fadeStyle = {
    opacity: fade ? 1 : 0,
    transition: `opacity ${FADE_DURATION}ms`,
    minHeight: 60
  }

  return (
    <div className='d-flex flex-column flex-lg-row flex-column-fluid h-100'>
      {/* begin::Body */}
      <div className='d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1'>
        {/* begin::Form */}
        <div className='d-flex flex-center flex-column flex-lg-row-fluid'>
          {/* begin::Wrapper */}
          <div className='w-lg-500px p-10'>
            <Outlet />
          </div>
          {/* end::Wrapper */}
        </div>
        {/* end::Form */}

        {/* begin::Footer */}
        <div className='d-flex flex-center flex-wrap px-5'>
          {/* begin::Links */}
          <div className='d-flex fw-semibold text-primary fs-base'>
            <a href='#' className='px-5' target='_blank'>
              Terms
            </a>

            <a href='#' className='px-5' target='_blank'>
              Plans
            </a>

            <a href='#' className='px-5' target='_blank'>
              Contact Us
            </a>
          </div>
          {/* end::Links */}
        </div>
        {/* end::Footer */}
      </div>
      {/* end::Body */}

      {/* begin::Aside */}
      <div
        className='d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2'
        style={{backgroundImage: `url(${toAbsoluteUrl('media/misc/bg-2.jpg')})`}}
      >
        {/* begin::Content */}
        <div className='d-flex flex-column flex-center py-15 px-5 px-md-15 w-100'>
          {/* begin::Logo */}
          <Link to='/' className='mb-12'>
            <img alt='Logo' src={toAbsoluteUrl('media/logos/logo.png')} className='h-250px' />
          </Link>
          {/* end::Logo */}

          {/* begin::Testimony Carousel */}
          <div className='w-100 d-flex flex-column align-items-center justify-content-center' style={{ minHeight: 300 }}>
            <div className='bg-white bg-opacity-25 rounded shadow p-8 mb-6 position-relative' style={{ maxWidth: 420, transition: 'all 0.5s', minHeight: 160 }}>
              {/* Left Arrow */}
              <button
                type='button'
                className='btn btn-sm btn-icon position-absolute top-50 start-0 translate-middle-y ms-4'
                style={{ zIndex: 2 }}
                aria-label='Previous testimony'
                onClick={() => {
                  setFade(false)
                  setTimeout(() => {
                    setCurrentTestimony((prev) => (prev - 1 + testimonies.length) % testimonies.length)
                    setFade(true)
                  }, FADE_DURATION)
                }}
              >
                <i className='fas fa-chevron-left text-white'></i>
              </button>
              {/* Testimony Content */}
              <div className='fs-2 text-grey text-center mb-4 px-8' style={fadeStyle}>
                <i className='fas fa-quote-left me-2 text-warning'></i>
                {testimonies[currentTestimony].text}
                <i className='fas fa-quote-right ms-2 text-warning'></i>
              </div>
              <div className='text-end text-white fw-bold fs-5 px-8'>
                {testimonies[currentTestimony].name && `— ${testimonies[currentTestimony].name}`}
              </div>
              {/* Right Arrow */}
              <button
                type='button'
                className='btn btn-sm btn-icon position-absolute top-50 end-0 translate-middle-y me-4'
                style={{ zIndex: 2 }}
                aria-label='Next testimony'
                onClick={() => {
                  setFade(false)
                  setTimeout(() => {
                    setCurrentTestimony((prev) => (prev + 1) % testimonies.length)
                    setFade(true)
                  }, FADE_DURATION)
                }}
              >
                <i className='fas fa-chevron-right text-white'></i>
              </button>
            </div>
            <div className='d-flex justify-content-center gap-2'>
              {testimonies.map((_, idx) => (
                <span
                  key={idx}
                  className={`rounded-circle bg-white bg-opacity-50 ${idx === currentTestimony ? 'bg-warning' : ''}`}
                  style={{ width: 10, height: 10, display: 'inline-block', transition: 'background 0.3s', cursor: 'pointer' }}
                  onClick={() => {
                    if (idx !== currentTestimony) {
                      setFade(false)
                      setTimeout(() => {
                        setCurrentTestimony(idx)
                        setFade(true)
                      }, FADE_DURATION)
                    }
                  }}
                ></span>
              ))}
            </div>
          </div>
          {/* end::Testimony Carousel */}
        </div>
        {/* end::Content */}
      </div>
      {/* end::Aside */}
    </div>
  )
}

export {AuthLayout}
