const express = require('express')

const app = express()

app.get('/', (req, res) => {
    res.send('Response from Server 1')
})

app.listen(3001, () => {
    console.log("server 1 running on port 3001")
})