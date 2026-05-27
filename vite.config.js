import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import createPaymentUrl from './api/create_payment_url.js'

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let body = ''
  req.on('data', chunk => {
    body += chunk
  })
  req.on('end', () => {
    if (!body) return resolve({})
    try {
      resolve(JSON.parse(body))
    } catch (error) {
      reject(error)
    }
  })
  req.on('error', reject)
})

const createVercelResponse = (res) => ({
  status(code) {
    res.statusCode = code
    return this
  },
  json(payload) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(payload))
  },
  redirect(location) {
    res.statusCode = 302
    res.setHeader('Location', location)
    res.end()
  }
})

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      name: 'local-api-routes',
      configureServer(server) {
        server.middlewares.use('/api/create_payment_url', async (req, res) => {
          try {
            req.body = await readJsonBody(req)
            await createPaymentUrl(req, createVercelResponse(res))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ message: 'Local API error', error: error.message }))
          }
        })
      }
    }
  ],
})
