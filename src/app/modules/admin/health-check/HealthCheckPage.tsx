import { FC, useEffect, useState } from 'react'
import { PageTitle } from '../../../../_metronic/layout/core'
import { KTCard, KTCardBody } from '../../../../_metronic/helpers'
import axios from 'axios'
import { getHeadersWithSchoolSubject } from '../../../../_metronic/helpers/axios'
import { formatApiTimestamp } from '../../../../_metronic/helpers/dateUtils'

const healthCheckBreadcrumbs = [
  {
    title: 'Admin',
    path: '/admin',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Health Check',
    path: '/admin/health-check',
    isSeparator: false,
    isActive: true,
  },
]

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'warning'
  connection?: string
  query_time_ms?: number
  version?: string
  timestamp: string
  details?: any
  redis_info?: {
    server_info: {
      version: string
      uptime_days: number
      uptime_hours: number
      connected_clients: number
      total_commands_processed: number
    }
    memory: {
      used: string
      peak: string
      fragmentation_ratio: number
    }
    keys: {
      total_count: number
      db_size: number
      types: {
        string: number
        set: number
      }
      samples: {
        string: string[]
        set: string[]
      }
    }
    channels: {
      pubsub_channels: string[]
      channel_count: number
    }
    performance: {
      hits: number
      misses: number
      hit_rate: number
    }
  }
  performance?: {
    slow_queries: {
      count: number
      avg_time_ms: number
    }
    overall_stats: {
      total_queries: number
      avg_query_time_ms: number
      max_query_time_ms: number
      total_calls: string
    }
    top_slow_queries: any[]
    max_query: {
      query: string
      mean_time_ms: number
      calls: number
      total_time_ms: number
    }
    database_size: string
    connections: {
      active: number
      max: number
      utilization_percent: number
    }
  }
}

interface BackupStatus {
  status: 'healthy' | 'warning' | 'unhealthy'
  total_backups: number
  total_size_mb: number
  latest_backup: {
    name: string
    size_mb: number
    created: string
    age_hours: number
    is_compressed: boolean
  }
  all_backups: Array<{
    name: string
    size_mb: number
    created: string
    age_hours: number
    is_compressed: boolean
  }>
  is_recent: boolean
  backup_directory: string
  timestamp: string
}

interface SystemStatus {
  status: 'healthy' | 'degraded'
  services: {
    database: HealthStatus
    redis: HealthStatus
    system: {
      cpu: {
        usage_percent: number
        cores: number
        load_average: {
          '1min': number
          '5min': number
          '15min': number
        }
      }
      memory: {
        used_gb: number
        total_gb: number
        usage_percent: number
        available_gb: number
      }
      storage: {
        used_gb: number
        total_gb: number
        usage_percent: number
        free_gb: number
      }
    }
  }
  timestamp: string
}

const HealthCheckPage: FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [databaseStatus, setDatabaseStatus] = useState<HealthStatus | null>(null)
  const [redisStatus, setRedisStatus] = useState<HealthStatus | null>(null)
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const API_URL = import.meta.env.VITE_APP_API_URL
      
      // Fetch all health check data in parallel
      const [systemRes, databaseRes, redisRes, backupRes] = await Promise.all([
        axios.get(`${API_URL}/health-check/status`, {
          headers: getHeadersWithSchoolSubject(`${API_URL}/health-check/status`),
          withCredentials: true
        }),
        axios.get(`${API_URL}/health-check/database`, {
          headers: getHeadersWithSchoolSubject(`${API_URL}/health-check/database`),
          withCredentials: true
        }),
        axios.get(`${API_URL}/health-check/redis`, {
          headers: getHeadersWithSchoolSubject(`${API_URL}/health-check/redis`),
          withCredentials: true
        }),
        axios.get(`${API_URL}/health-check/backup-status`, {
          headers: getHeadersWithSchoolSubject(`${API_URL}/health-check/backup-status`),
          withCredentials: true
        })
      ])

      setSystemStatus(systemRes.data.message)
      setDatabaseStatus(databaseRes.data.message)
      setRedisStatus(redisRes.data.message)
      setBackupStatus(backupRes.data.message)
    } catch (err: any) {
      console.error('Error fetching health data:', err)
      setError(err.response?.data?.message || 'Failed to fetch health check data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success'
      case 'degraded': return 'warning'
      case 'warning': return 'warning'
      case 'unhealthy': return 'danger'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return 'fas fa-check-circle'
      case 'degraded': return 'fas fa-exclamation-triangle'
      case 'warning': return 'fas fa-exclamation-triangle'
      case 'unhealthy': return 'fas fa-times-circle'
      default: return 'fas fa-question-circle'
    }
  }

  if (loading) {
    return (
      <>
        <PageTitle breadcrumbs={healthCheckBreadcrumbs}>Health Check</PageTitle>
        <KTCard>
          <KTCardBody>
            <div className='d-flex justify-content-center align-items-center py-10'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </KTCardBody>
        </KTCard>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle breadcrumbs={healthCheckBreadcrumbs}>Health Check</PageTitle>
        <KTCard>
          <KTCardBody>
            <div className='alert alert-danger'>
              <h4 className='alert-heading'>Error</h4>
              <p>{error}</p>
              <hr />
              <button 
                className='btn btn-primary'
                onClick={fetchHealthData}
              >
                Retry
              </button>
            </div>
          </KTCardBody>
        </KTCard>
      </>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={healthCheckBreadcrumbs}>Health Check</PageTitle>

      {/* System Status */}
      <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
        <div className='col-xl-12'>
          <KTCard>
            <KTCardBody>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>System Status</span>
              </h3>
              <div className='mt-5'>
                {/* System Metrics */}
                {systemStatus?.services.system ? (
                  <div>
                    
                    {/* CPU, Memory, Storage Cards */}
                    <div className='row g-5 mb-5'>
                      {/* CPU Card */}
                      <div className='col-md-4'>
                        <div className='card card-custom bg-light-info'>
                          <div className='card-body p-5'>
                            <div className='d-flex align-items-center mb-3'>
                              <div className='symbol symbol-40px me-3'>
                                <span className='symbol-label bg-info'>
                                  <i className='fas fa-microchip text-white fs-4'></i>
                                </span>
                              </div>
                              <h5 className='fw-bold text-gray-800 m-0'>CPU</h5>
                            </div>
                            <div className='mb-2'>
                              <div className='d-flex justify-content-between align-items-center mb-1'>
                                <span className='text-gray-700 fs-7'>Usage</span>
                                <span className='fw-bold text-gray-800 fs-6'>{systemStatus.services.system.cpu.usage_percent}%</span>
                              </div>
                              <div className='progress h-6px'>
                                <div 
                                  className={`progress-bar ${
                                    systemStatus.services.system.cpu.usage_percent > 80 ? 'bg-danger' :
                                    systemStatus.services.system.cpu.usage_percent > 60 ? 'bg-warning' : 'bg-success'
                                  }`}
                                  style={{ width: `${systemStatus.services.system.cpu.usage_percent}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className='text-gray-700 fs-7 mb-1'>
                              <strong>Cores:</strong> {systemStatus.services.system.cpu.cores}
                            </div>
                            <div className='text-gray-700 fs-7'>
                              <strong>Load Avg:</strong> {systemStatus.services.system.cpu.load_average['1min']} / {systemStatus.services.system.cpu.load_average['5min']} / {systemStatus.services.system.cpu.load_average['15min']}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Memory Card */}
                      <div className='col-md-4'>
                        <div className='card card-custom bg-light-warning'>
                          <div className='card-body p-5'>
                            <div className='d-flex align-items-center mb-3'>
                              <div className='symbol symbol-40px me-3'>
                                <span className='symbol-label bg-warning'>
                                  <i className='fas fa-memory text-white fs-4'></i>
                                </span>
                              </div>
                              <h5 className='fw-bold text-gray-800 m-0'>Memory</h5>
                            </div>
                            <div className='mb-2'>
                              <div className='d-flex justify-content-between align-items-center mb-1'>
                                <span className='text-gray-700 fs-7'>Usage</span>
                                <span className='fw-bold text-gray-800 fs-6'>{systemStatus.services.system.memory.usage_percent}%</span>
                              </div>
                              <div className='progress h-6px'>
                                <div 
                                  className={`progress-bar ${
                                    systemStatus.services.system.memory.usage_percent > 80 ? 'bg-danger' :
                                    systemStatus.services.system.memory.usage_percent > 60 ? 'bg-warning' : 'bg-success'
                                  }`}
                                  style={{ width: `${systemStatus.services.system.memory.usage_percent}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className='text-gray-700 fs-7 mb-1'>
                              <strong>Used:</strong> {systemStatus.services.system.memory.used_gb} GB / {systemStatus.services.system.memory.total_gb} GB
                            </div>
                            <div className='text-gray-700 fs-7'>
                              <strong>Available:</strong> {systemStatus.services.system.memory.available_gb} GB
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Storage Card */}
                      <div className='col-md-4'>
                        <div className='card card-custom bg-light-primary'>
                          <div className='card-body p-5'>
                            <div className='d-flex align-items-center mb-3'>
                              <div className='symbol symbol-40px me-3'>
                                <span className='symbol-label bg-primary'>
                                  <i className='fas fa-hdd text-white fs-4'></i>
                                </span>
                              </div>
                              <h5 className='fw-bold text-gray-800 m-0'>Storage</h5>
                            </div>
                            <div className='mb-2'>
                              <div className='d-flex justify-content-between align-items-center mb-1'>
                                <span className='text-gray-700 fs-7'>Usage</span>
                                <span className='fw-bold text-gray-800 fs-6'>{systemStatus.services.system.storage.usage_percent}%</span>
                              </div>
                              <div className='progress h-6px'>
                                <div 
                                  className={`progress-bar ${
                                    systemStatus.services.system.storage.usage_percent > 80 ? 'bg-danger' :
                                    systemStatus.services.system.storage.usage_percent > 60 ? 'bg-warning' : 'bg-success'
                                  }`}
                                  style={{ width: `${systemStatus.services.system.storage.usage_percent}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className='text-gray-700 fs-7 mb-1'>
                              <strong>Used:</strong> {systemStatus.services.system.storage.used_gb} GB / {systemStatus.services.system.storage.total_gb} GB
                            </div>
                            <div className='text-gray-700 fs-7'>
                              <strong>Free:</strong> {systemStatus.services.system.storage.free_gb} GB
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-5'>
                    <i className='fas fa-exclamation-triangle fs-3x text-warning mb-3'></i>
                    <p className='text-muted'>No system status data available</p>
                  </div>
                )}
              </div>
            </KTCardBody>
          </KTCard>
        </div>
      </div>

      {/* Database Status */}
      <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
        <div className='col-xl-12'>
          <KTCard>
            <KTCardBody>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Database Status</span>
              </h3>
              <div className='mt-5'>
                {databaseStatus ? (
                  <div className='table-responsive'>
                    <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                      <tbody>
                        <tr>
                          <td className='w-25'>
                            <span className='text-gray-800 fw-bold fs-6'>Status</span>
                          </td>
                          <td className='w-75'>
                            <span className={`badge fs-7 fw-bold badge-light-${getStatusColor(databaseStatus.status)}`}>
                              <i className={`${getStatusIcon(databaseStatus.status)} me-1`}></i>
                              {databaseStatus.status}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='w-25'>
                            <span className='text-gray-800 fw-bold fs-6'>Connection</span>
                          </td>
                          <td className='w-75'>
                            <span className='text-gray-800 fw-semibold fs-7'>
                              {databaseStatus.connection || 'N/A'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='w-25'>
                            <span className='text-gray-800 fw-bold fs-6'>Query Time</span>
                          </td>
                          <td className='w-75'>
                            <span className='text-gray-800 fw-semibold fs-7'>
                              {databaseStatus.query_time_ms ? `${databaseStatus.query_time_ms}ms` : 'N/A'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='w-25'>
                            <span className='text-gray-800 fw-bold fs-6'>Version</span>
                          </td>
                          <td className='w-75'>
                            <span className='text-gray-800 fw-semibold fs-7'>
                              {databaseStatus.version || 'N/A'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='w-25'>
                            <span className='text-gray-800 fw-bold fs-6'>Last Check</span>
                          </td>
                          <td className='w-75'>
                            <span className='text-gray-800 fw-semibold fs-7'>
                              {formatApiTimestamp(databaseStatus.timestamp, { format: 'custom' })}
                            </span>
                          </td>
                        </tr>
                        {databaseStatus.performance && (
                          <>
                            <tr>
                              <td colSpan={2}>
                                <div className='separator separator-dashed my-3'></div>
                                <h6 className='text-primary fw-bold mb-3'>Performance Metrics</h6>
                              </td>
                            </tr>
                            <tr>
                              <td className='w-25'>
                                <span className='text-gray-800 fw-bold fs-6'>Database Size</span>
                              </td>
                              <td className='w-75'>
                                <span className='text-gray-800 fw-semibold fs-7'>
                                  {databaseStatus.performance.database_size}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className='w-25'>
                                <span className='text-gray-800 fw-bold fs-6'>Active Connections</span>
                              </td>
                              <td className='w-75'>
                                <span className='text-gray-800 fw-semibold fs-7'>
                                  {databaseStatus.performance.connections.active} / {databaseStatus.performance.connections.max} 
                                  <span className='text-muted ms-2'>({databaseStatus.performance.connections.utilization_percent}% utilization)</span>
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className='w-25'>
                                <span className='text-gray-800 fw-bold fs-6'>Total Queries</span>
                              </td>
                              <td className='w-75'>
                                <span className='text-gray-800 fw-semibold fs-7'>
                                  {databaseStatus.performance.overall_stats.total_queries.toLocaleString()}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className='w-25'>
                                <span className='text-gray-800 fw-bold fs-6'>Avg Query Time</span>
                              </td>
                              <td className='w-75'>
                                <span className='text-gray-800 fw-semibold fs-7'>
                                  {databaseStatus.performance.overall_stats.avg_query_time_ms.toFixed(2)}ms
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className='w-25'>
                                <span className='text-gray-800 fw-bold fs-6'>Max Query Time</span>
                              </td>
                              <td className='w-75'>
                                <span className='text-gray-800 fw-semibold fs-7'>
                                  {databaseStatus.performance.overall_stats.max_query_time_ms.toFixed(2)}ms
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className='w-25'>
                                <span className='text-gray-800 fw-bold fs-6'>Slow Queries</span>
                              </td>
                              <td className='w-75'>
                                <span className={`fw-semibold fs-7 ${
                                  databaseStatus.performance.slow_queries.count > 0 ? 'text-warning' : 'text-success'
                                }`}>
                                  {databaseStatus.performance.slow_queries.count} 
                                  {databaseStatus.performance.slow_queries.count > 0 && 
                                    ` (avg: ${databaseStatus.performance.slow_queries.avg_time_ms.toFixed(2)}ms)`
                                  }
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className='w-25'>
                                <span className='text-gray-800 fw-bold fs-6'>Most Called Query</span>
                              </td>
                              <td className='w-75'>
                                <div className='text-gray-800 fw-semibold fs-7'>
                                  <div className='mb-1'>
                                    <strong>Calls:</strong> {databaseStatus.performance.max_query.calls} | 
                                    <strong> Mean Time:</strong> {databaseStatus.performance.max_query.mean_time_ms.toFixed(2)}ms | 
                                    <strong> Total Time:</strong> {databaseStatus.performance.max_query.total_time_ms.toFixed(2)}ms
                                  </div>
                                  <div className='text-muted small' style={{ wordBreak: 'break-all', fontSize: '11px' }}>
                                    {databaseStatus.performance.max_query.query}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className='text-center py-5'>
                    <i className='fas fa-database fs-3x text-muted mb-3'></i>
                    <p className='text-muted'>No database status data available</p>
                  </div>
                )}
              </div>
            </KTCardBody>
          </KTCard>
        </div>
      </div>

      {/* Redis Status */}
      <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
        <div className='col-xl-12'>
          <KTCard>
            <KTCardBody>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Redis Status</span>
              </h3>
              <div className='mt-5'>
                {redisStatus ? (
                  <div>
                    <div className='table-responsive'>
                      <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                        <tbody>
                          <tr>
                            <td className='w-25'>
                              <span className='text-gray-800 fw-bold fs-6'>Status</span>
                            </td>
                            <td className='w-75'>
                              <span className={`badge fs-7 fw-bold badge-light-${getStatusColor(redisStatus.status)}`}>
                                <i className={`${getStatusIcon(redisStatus.status)} me-1`}></i>
                                {redisStatus.status}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className='w-25'>
                              <span className='text-gray-800 fw-bold fs-6'>Connection</span>
                            </td>
                            <td className='w-75'>
                              <span className='text-gray-800 fw-semibold fs-7'>
                                {redisStatus.connection || 'N/A'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className='w-25'>
                              <span className='text-gray-800 fw-bold fs-6'>Last Check</span>
                            </td>
                            <td className='w-75'>
                              <span className='text-gray-800 fw-semibold fs-7'>
                                {formatApiTimestamp(redisStatus.timestamp, { format: 'custom' })}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Redis Info */}
                    {redisStatus?.redis_info && (
                    <div className='mt-5'>
                      <h4 className='text-gray-800 fw-bold fs-4 mb-4'>Redis Information</h4>
                      
                      {/* Server Info */}
                      <div className='row g-5 mb-5'>
                        <div className='col-md-6'>
                          <div className='card card-custom bg-light-info'>
                            <div className='card-body p-4'>
                              <h5 className='fw-bold text-gray-800 mb-3'>
                                <i className='fas fa-server text-info me-2'></i>
                                Server Info
                              </h5>
                              <div className='table-responsive'>
                                <table className='table table-sm table-borderless'>
                                  <tbody>
                                    <tr>
                                      <td className='fw-bold text-gray-700 fs-7'>Version:</td>
                                      <td className='text-gray-800 fs-7'>{redisStatus.redis_info.server_info?.version || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                      <td className='fw-bold text-gray-700 fs-7'>Uptime:</td>
                                      <td className='text-gray-800 fs-7'>
                                        {redisStatus.redis_info.server_info?.uptime_days || 0}d {redisStatus.redis_info.server_info?.uptime_hours || 0}h
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className='fw-bold text-gray-700 fs-7'>Connected Clients:</td>
                                      <td className='text-gray-800 fs-7'>{redisStatus.redis_info.server_info?.connected_clients || 0}</td>
                                    </tr>
                                    <tr>
                                      <td className='fw-bold text-gray-700 fs-7'>Commands Processed:</td>
                                      <td className='text-gray-800 fs-7'>{(redisStatus.redis_info.server_info?.total_commands_processed || 0).toLocaleString()}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='col-md-6'>
                          <div className='card card-custom bg-light-warning'>
                            <div className='card-body p-4'>
                              <h5 className='fw-bold text-gray-800 mb-3'>
                                <i className='fas fa-memory text-warning me-2'></i>
                                Memory & Performance
                              </h5>
                              <div className='table-responsive'>
                                <table className='table table-sm table-borderless'>
                                  <tbody>
                                    <tr>
                                      <td className='fw-bold text-gray-700 fs-7'>Memory Used:</td>
                                      <td className='text-gray-800 fs-7'>{redisStatus.redis_info.memory?.used || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                      <td className='fw-bold text-gray-700 fs-7'>Peak Memory:</td>
                                      <td className='text-gray-800 fs-7'>{redisStatus.redis_info.memory?.peak || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                      <td className='fw-bold text-gray-700 fs-7'>Fragmentation:</td>
                                      <td className='text-gray-800 fs-7'>{redisStatus.redis_info.memory?.fragmentation_ratio || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                      <td className='fw-bold text-gray-700 fs-7'>Hit Rate:</td>
                                      <td className='text-gray-800 fs-7'>{redisStatus.redis_info.performance?.hit_rate || 0}%</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Keys Information */}
                      <div className='row g-5 mb-5'>
                        <div className='col-md-6'>
                          <div className='card card-custom bg-light-primary'>
                            <div className='card-body p-4'>
                              <h5 className='fw-bold text-gray-800 mb-3'>
                                <i className='fas fa-key text-primary me-2'></i>
                                Keys ({redisStatus.redis_info.keys?.total_count || 0})
                              </h5>
                              <div className='mb-3'>
                                <div className='d-flex justify-content-between mb-2'>
                                  <span className='fw-bold text-gray-700 fs-7'>String Keys:</span>
                                  <span className='text-gray-800 fs-7'>{redisStatus.redis_info.keys?.types?.string || 0}</span>
                                </div>
                                <div className='d-flex justify-content-between mb-2'>
                                  <span className='fw-bold text-gray-700 fs-7'>Set Keys:</span>
                                  <span className='text-gray-800 fs-7'>{redisStatus.redis_info.keys?.types?.set || 0}</span>
                                </div>
                              </div>
                              
                              {redisStatus.redis_info.keys.samples?.string?.length > 0 && (
                                <div className='mb-3'>
                                  <h6 className='fw-bold text-gray-700 fs-7 mb-2'>String Key Samples:</h6>
                                  <div className='bg-light rounded p-2'>
                                    {redisStatus.redis_info.keys.samples.string.slice(0, 3).map((key, index) => (
                                      <div key={index} className='text-gray-800 fs-8 mb-1 font-monospace'>
                                        {key}
                                      </div>
                                    ))}
                                    {redisStatus.redis_info.keys.samples.string.length > 3 && (
                                      <div className='text-muted fs-8'>
                                        +{redisStatus.redis_info.keys.samples.string.length - 3} more...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {redisStatus.redis_info.keys.samples?.set?.length > 0 && (
                                <div>
                                  <h6 className='fw-bold text-gray-700 fs-7 mb-2'>Set Key Samples:</h6>
                                  <div className='bg-light rounded p-2'>
                                    {redisStatus.redis_info.keys.samples.set.map((key, index) => (
                                      <div key={index} className='text-gray-800 fs-8 mb-1 font-monospace'>
                                        {key}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className='col-md-6'>
                          <div className='card card-custom bg-light-success'>
                            <div className='card-body p-4'>
                              <h5 className='fw-bold text-gray-800 mb-3'>
                                <i className='fas fa-broadcast-tower text-success me-2'></i>
                                Channels ({redisStatus.redis_info.channels?.channel_count || 0})
                              </h5>
                              <div className='mb-3'>
                                <div className='d-flex justify-content-between mb-2'>
                                  <span className='fw-bold text-gray-700 fs-7'>Active Channels:</span>
                                  <span className='text-gray-800 fs-7'>{redisStatus.redis_info.channels?.channel_count || 0}</span>
                                </div>
                              </div>
                              
                              {redisStatus.redis_info.channels?.pubsub_channels?.length > 0 && (
                                <div>
                                  <h6 className='fw-bold text-gray-700 fs-7 mb-2'>Pub/Sub Channels:</h6>
                                  <div className='bg-light rounded p-2'>
                                    {redisStatus.redis_info.channels.pubsub_channels.map((channel, index) => (
                                      <div key={index} className='text-gray-800 fs-8 mb-1 font-monospace'>
                                        {channel}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                ) : (
                  <div className='text-center py-5'>
                    <i className='fas fa-memory fs-3x text-muted mb-3'></i>
                    <p className='text-muted'>No Redis status data available</p>
                  </div>
                )}
              </div>
            </KTCardBody>
          </KTCard>
        </div>
      </div>

      {/* Backup Status */}
      <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
        <div className='col-xl-12'>
          <KTCard>
            <KTCardBody>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Backup Status</span>
              </h3>
              {backupStatus ? (
                <div className='mt-5'>
                  {/* Status Overview */}
                  <div className='table-responsive mb-5'>
                    <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                      <tbody>
                        <tr>
                          <td className='w-25'>
                            <span className='text-gray-800 fw-bold fs-6'>Status</span>
                          </td>
                          <td className='w-75'>
                            <span className={`badge fs-7 fw-bold badge-light-${getStatusColor(backupStatus.status)}`}>
                              <i className={`${getStatusIcon(backupStatus.status)} me-1`}></i>
                              {backupStatus.status}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='w-25'>
                            <span className='text-gray-800 fw-bold fs-6'>Backup Directory</span>
                          </td>
                          <td className='w-75'>
                            <span className='text-gray-800 fw-semibold fs-7'>
                              {backupStatus.backup_directory}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='w-25'>
                            <span className='text-gray-800 fw-bold fs-6'>Last Check</span>
                          </td>
                          <td className='w-75'>
                            <span className='text-gray-800 fw-semibold fs-7'>
                              {formatApiTimestamp(backupStatus.timestamp, { format: 'custom' })}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* All Backups Table */}
                  {backupStatus?.all_backups && backupStatus.all_backups.length > 0 && (
                    <div>
                      <div className='table-responsive'>
                        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                          <thead>
                            <tr className='fw-bold text-muted'>
                              <th className='min-w-200px'>Backup Name</th>
                              <th className='min-w-100px'>Size</th>
                              <th className='min-w-150px'>Created</th>
                              <th className='min-w-100px'>Age</th>
                              <th className='min-w-100px'>Compressed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {backupStatus.all_backups.map((backup, index) => (
                              <tr key={index}>
                                <td>
                                  <div className='d-flex align-items-center'>
                                    <div className='symbol symbol-40px me-3'>
                                      <span className='symbol-label bg-light-primary'>
                                        <i className='fas fa-file-archive text-primary fs-6'></i>
                                      </span>
                                    </div>
                                    <div className='d-flex justify-content-start flex-column'>
                                      <span className='text-gray-800 fw-bold fs-6'>{backup.name}</span>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className='text-gray-800 fw-semibold fs-7'>
                                    {backup.size_mb} MB
                                  </span>
                                </td>
                                <td>
                                  <span className='text-gray-800 fw-semibold fs-7'>
                                    {formatApiTimestamp(backup.created, { format: 'custom' })}
                                  </span>
                                </td>
                                <td>
                                  <span className='text-gray-800 fw-semibold fs-7'>
                                    {backup.age_hours.toFixed(2)} hours
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge fs-7 fw-bold ${backup.is_compressed ? 'badge-success' : 'badge-warning'}`}>
                                    {backup.is_compressed ? 'Yes' : 'No'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='text-center py-5'>
                  <i className='fas fa-archive fs-3x text-muted mb-3'></i>
                  <p className='text-muted'>No backup status data available</p>
                </div>
              )}
            </KTCardBody>
          </KTCard>
        </div>
      </div>

      {/* Refresh Button */}
      <div className='d-flex justify-content-end'>
        <button 
          className='btn btn-primary'
          onClick={fetchHealthData}
        >
          <i className='fas fa-sync-alt me-2'></i>
          Refresh
        </button>
      </div>
    </>
  )
}

export default HealthCheckPage
