require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const Note = require('./models/note')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

//no longer used because its already connected to mongo db
// let notes = [
//   {
//     id: 1,
//     content: "HTML is easy isnt it?",
//     date: "2019-05-30T17:30:31.098Z",
//     important: true
//   },
//   {
//     id: 2,
//     content: "Browser can execute only Javascript",
//     date: "2019-05-30T18:39:34.091Z",
//     important: false
//   },
//   {
//     id: 3,
//     content: "GET and POST are the most important methods of HTTP protocol",
//     date: "2019-05-30T19:20:14.298Z",
//     important: true
//   }
// ]

app.get('/', (request, response) => {
    response.send('<h1>Hello from notes</h1>')
    response.status(200).end()
})

app.get('/notes', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes)
    })
})


app.get('/notes/:id', (request, response) => {
  const id = request.params.id
  Note.findById(id).then(note => {
    response.json(note)
  })
  .catch(error => {
    response.status(500).json({error: error})
  })
    // const id = Number(request.params.id)
    // const note = notes.find(note => note.id === id)
    // if (note) {
    //     response.json(note)
    // } else {
    //     response.status(400).end()
    // }

})

app.delete('/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})

//doesnt need generateId anymore, mongo deals with the new ids
// const generateId = () => {
//   const MaxId = notes.length > 0
//     ? Math.max(...notes.map(n => n.id))
//     : 0

//   return MaxId + 1
//}

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

//running server in port ${PORT}
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running in port: ${PORT}`);
})
