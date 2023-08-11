//this file is not used, just for demonstration of how you can use the mongo connection
const mongoose = require('mongoose')

if(process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.6qfcajm.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        minLength: 5,
        required: true
    },
    important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
    content: 'Mongoose makes things easy',
    date: new Date(),
    important: true,
})

// note.save().then(result => {
//     console.log('note saved!');
//     mongoose.connection.close()
// })
Note.find({}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})