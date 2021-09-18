let express = require('express')
let mongodb = require('mongodb')
let app = express()
let db
let port = process.env.PORT
if (port == null || port == "") {
    port = 2000
}
let sanitizeHTML = require('sanitize-html')

app.use(express.static('public')) // Helped to access browser.js

let connectionString = 'mongodb+srv://Username:Password@cluster0.qpwfw.mongodb.net/TodoAppDb?retryWrites=true&w=majority'

mongodb.connect(connectionString, { useNewUrlParser: true }, function(err, client) {
    db = client.db()
    app.listen(port)
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

function passwordProtected(req, res, next) {

    res.set('WWW-Authenticate', 'Basic realm="Simple To-Do App"')
    console.log(req.headers.authorization)
    if (req.headers.authorization == "Basic SGF6emFuOkFqb2tlbWk=") {
        next()
    } else {
        res.status(401).send("Authentication required")
    }

}

app.use(passwordProtected) // This method or function tells our app to use this for all our urls

app.get('/', function(req, res) {
    // To collect items from database
    db.collection('items').find().toArray(function(err, items) {
        //console.log(items) Not needed anymore 
        res.send(`
        <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple To-Do App</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
      <link rel ="stylesheet" type="text/css" href="fact.css">
      </head>
    <body>
      <div class="container">

        <h1 class="display-4 text-center py-1">To-Do App</h1>
        <hr style="height:2px;width:1085px;background-color:green">
        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action = "/create-Item" method ="POST">
            <div class="d-flex align-items-center">
              <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul id="item-list" class="list-group pb-5">
        </ul>

      </div>

      <hr style="height:2px;width:1085px;background-color:green">
      <style> body {background-color:white;width:1100px;box-shadow: 10px 10px 5px grey;}</style> 

      <script>
      let items = ${JSON.stringify(items)}
      </script>
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      <script src="/browser.js"></script>
    
      <p style="color:black; font-family:italic; text-align:center;"><b>App Developer: Mr. Ajao Hazzan</b>
    </body>
    </html>  
        `)
    })
})

app.post('/create-Item', function(req, res) {
    let safeText = sanitizeHTML(req.body.text, { allowedTags: [], allowedAttributes: {} })
    db.collection('items').insertOne({ text: safeText }, function(err, info) {
        res.json(info.ops[0])
    })
})

app.post('/update-item', function(req, res) {
    let safeText = sanitizeHTML(req.body.text, { allowedTags: [], allowedAttributes: {} })
    db.collection('items').findOneAndUpdate({ _id: new mongodb.ObjectId(req.body.id) }, { $set: { text: safeText } }, function() {
        res.send("Successful!")
    })
})

app.post('/delete-item', function(req, res) {
    db.collection('items').deleteOne({ _id: new mongodb.ObjectId(req.body.id) }, function() {
        res.send("Successful")
    })

})
