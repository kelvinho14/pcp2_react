import { createRoot } from 'react-dom/client'
// Axios
import axios from 'axios'
import { Chart, registerables } from 'chart.js'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
// Redux
import { Provider } from 'react-redux'
import { store } from './store'
// Apps
import { MetronicI18nProvider } from './_metronic/i18n/Metronici18n'
import './_metronic/assets/sass/style.react.scss'
import './_metronic/assets/fonticon/fonticon.css'
import './_metronic/assets/keenicons/duotone/style.css'
import './_metronic/assets/keenicons/outline/style.css'
import './_metronic/assets/keenicons/solid/style.css'
import './_metronic/assets/sass/style.scss'
import { AppRoutes } from './app/routing/AppRoutes'
import { AuthProvider, setupAxios } from './app/modules/auth'

setupAxios(axios)
Chart.register(...registerables)

const queryClient = new QueryClient()
const container = document.getElementById('root')
if (container) {
  createRoot(container).render(
    <QueryClientProvider client={queryClient}>
      <MetronicI18nProvider>
        <Provider store={store}> {/* 🔥 ADD Redux Provider */}
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </Provider>
      </MetronicI18nProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
