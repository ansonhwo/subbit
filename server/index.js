const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())

// Get all accounts associated with each linked institution
// !! Need to store the resulting access token into the database
app.post('/accounts', (req, res) => {
  console.log('POST /accounts')
})

app.listen(9999, () => console.log('Listening on 9999'))
