const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')

const Note = require('../models/note')

beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes)
})

describe('when there is initially some notes saved', () => {
    test('notes are returned as json', async () => {
        await api
            .get('/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all notes are returned', async () => {
        const response = await api.get('/notes')

        expect(response.body).toHaveLength(helper.initialNotes.length)
    })

    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/notes')

        const contents = response.body.map(r => r.content)
        expect(contents).toContain(
            'Browser can execute only JavaScript'
            )
    })

    test('a valid note can be added', async () => {
        const newNote = {
            content: 'async/await simplifies making async calls',
            important: true,
        }

        await api
            .post('/notes')
            .send(newNote)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const notesAtEnd = await helper.notesInDB()
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

        const contents = notesAtEnd.map(n => n.content)
        expect(contents).toContain(
            'async/await simplifies making async calls'
        )
    })
})

describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
        const notesAtStart = await helper.notesInDB()

        const noteToView = notesAtStart[0]

        const resultNote = await api
            .get(`/notes/${noteToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(resultNote.body).toEqual(noteToView)
    })

    test('failed with status code 400 if id is invalid', async () => {
        const invalidId = '5a3d5da59070081a82a3445'

        await api
            .get(`/notes/${invalidId}`)
            .expect(400)
    })
})

describe('addition of a new note', () => {
    test('succeeds with valid data', async () => {
        const newNote = {
            content: 'async/await simplifies making async calls',
            important: true,
        }

        await api
            .post('/notes')
            .send(newNote)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const notesAtEnd = await helper.notesInDB()
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

        const contents = notesAtEnd.map(n => n.content)
        expect(contents).toContain(
            'async/await simplifies making async calls'
        )
    })

    test('fails with status 400 if data invalid', async () => {
        const newNote = {
            important: true
        }
        await api
            .post('/notes')
            .send(newNote)
            .expect(400)

        const notesAtEnd = await helper.notesInDB()
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
    })
})

describe('deletion of a note', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const notesAtStart = await helper.notesInDB()
        const noteToDelete = notesAtStart[0]

        await api
            .delete(`/notes/${noteToDelete.id}`)
            .expect(204)

        const notesAtEnd = await helper.notesInDB()

        expect(notesAtEnd).toHaveLength(
            helper.initialNotes.length - 1
        )

        const content = notesAtEnd.map(r => r.content)

        expect(content).not.toContain(noteToDelete.content)
    })
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.UsersInDB()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.UsersInDB()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.UsersInDB()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('expected `username` to be unique')

        const usersAtEnd = await helper.UsersInDB()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
