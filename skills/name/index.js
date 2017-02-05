const fs = require('fs')

const NAME_FILE = 'config/name.json'

const intent = () => ({
    keywords: ['your new name is q', 'i\'m going to call you q', 'set name to q', "you're now called q",
    "you're called q", "What are you called?", "What's your name?"],
    module: 'name'
})

let name = 'Brain'
let socket_io = null

function * name_resp(query) {
    query = query.toLowerCase()
    if (query.includes('who') || query.includes('what')) {
        if (query.toLowerCase().includes('what') && query.toLowerCase().includes('are')) {
            return {text: `I'm name ${name}, your Brain.`, name}
        } else {
            return {text: `I'm called ${name}.`, name}
        }
    } else {
        const words = query.split(' ')
        name = words[words.length - 1]
        name = name.charAt(0).toUpperCase() + name.slice(1)

        fs.writeFile(NAME_FILE, JSON.stringify({name}, null, 2), err => {
            if (err) {
                return console.log(err)
            }
        })

        socket_io.emit('set_name', {name})

        return {text: `You can now call me ${name}.`, name}
    }
}

function * register(app, io) {
    try {
        const nameJson = JSON.parse(fs.readFileSync(NAME_FILE))
        name = nameJson.name
        console.log(`Name loaded from file: ${name}`)
    } catch (err) {
        // Ignore and use the default name.
    }
    app.get('/', (req, res) => {
        res.json({name})
    })
    socket_io = io
}

function * registerClient(socket) {
    socket.on('get_name', msg => {
        socket.emit('get_name', {name: name})
    })
    socket.emit('set_name', {name})
}

const examples = () => (
    ["I'm going to call you Boba Fet", "Your new name is Dave.", "Set mame to Bob.", "You're now called Computer.",
    "What's your name?", "What are you called?", "You're called Strange.", "I'm going to call you David"]
)

module.exports = {
    get: name_resp,
    register,
    registerClient,
    intent,
    examples
}
