require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const Note = require('./models/note')

/*
 ! Handling errors 
 */
 const unknownEndpoint = (error, request, response, next) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if(error.message === 'CastError') {
    return response.status(400).send({ error:'malformatted id' })
  }

  next(error)
}

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

/*
 * GET for the '/' main page
 */
app.get('/', (request, response) => {
    response.send('<h1>Hello from notes</h1>')
    response.status(200).end()
})

/*
 * GET for the '/' notes page
 */
app.get('/notes', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes)
    })
})

/*
 * GET for the '/notes/id' specific id
 */
app.get('/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findById(id).then(note => {
    if (note) {
      response.json(note)
    } else {
    response.status(404).end()
    }
  })
  .catch(error => next(error))
    // const id = Number(request.params.id)
    // const note = notes.find(note => note.id === id)
    // if (note) {
    //     response.json(note)
    // } else {
    //     response.status(400).end()
    // }

})

/*
 ! DELETE method
 */
app.delete('/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
    //function of deleting ids is dealed with mongo
    // const id = Number(request.params.id)
    // notes = notes.filter(note => note.id !== id)

    // response.status(204).end()
})

//doesnt need generateId anymore, mongo deals with the new ids
// const generateId = () => {
//   const MaxId = notes.length > 0
//     ? Math.max(...notes.map(n => n.id))
//     : 0

//   return MaxId + 1
//}

/*
 * PUT method
 */
app.put('/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findOneAndUpdate(request.params.id, note, { new: true })
    .then(updateNote => {
      response.json(updateNote)
    })
    .catch(error => next(error))
})

/*
 * POST method
 */
app.post('/notes', (request, response) => {
  const body = request.body

  if(!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note ({
    content: body.content,
    important: body.important || false,
    //date: new Date(),
    //id: generateId(),
  })

  //notes = notes.concat(note)
  console.log(note);

   note.save().then(savedNote => {
    response.json(savedNote)
  })
})

//handler of request with result to errors
app.use(errorHandler)
app.use(unknownEndpoint)

//running server in port ${PORT}
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running in port: ${PORT}`);
})
