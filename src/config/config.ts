const isDevelopment = import.meta.env.MODE === 'development'

export default {
  isDevelopment,
  baseUrl: import.meta.env.VITE_BASE_URL
}
