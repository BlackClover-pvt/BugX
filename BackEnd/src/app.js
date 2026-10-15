const express = require('express');
const aiRoutes = require('./routes/ai.routes')
const cors = require('cors')
const sessionMiddleware = require('./middleware/session').default
const authRoutes = require('./routes/auth.routes').default

const app = express()

// CORS: allow frontend to send cookies (credentials) cross-origin
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}))

app.use(express.json())

// Session middleware (must come before routes that need req.session)
app.use(sessionMiddleware)

app.get('/', (req, res) => {
    res.send('Hello World')
})

// Routes
app.use('/ai', aiRoutes)
app.use('/auth', authRoutes)

module.exports = app