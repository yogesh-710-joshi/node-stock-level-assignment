import * as express from 'express'
import app from './app.ts'

const port = 3001

app.listen(port, () => console.log(`Server running on port : ${port}`))