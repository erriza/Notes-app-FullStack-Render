const Note = require('../models/note')
const User = require('../models/user')

const initialNotes = [
    {
        content: 'HTML is easy',
        important: false
    },
    {
        content: 'Browser can execute only JavaScript',
        important: true
    }
]

const nonExistingId = async () => {
    const note = new Note({ content: 'willremothissoon' })
    await note.save()
    await note.deleteOne()

    return note._id.toString()
}

const notesInDB = async () => {
    const notes = await Note.find({})
    return notes.map(note => note.toJSON())
}

const UsersInDB = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialNotes, nonExistingId, notesInDB, UsersInDB
}