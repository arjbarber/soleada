require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URL;
const bodyParser = require("body-parser");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(bodyParser.urlencoded({ extended: true }));

// schema setup
const userSchema = new mongoose.Schema({
    username: String,
    password: String, 
    type: Number,
    primaryLang: Number // 0 == eng, 1 == spanish
});

const postSchema = new mongoose.Schema({
    title: String,
    type: Number,
    body: String,
    embeddings: [Number],
    authorId: String
})

const chatSchema = new mongoose.Schema({
    userOne: String,
    userTwo: String,
    messages: [
        {
            user: String,
            contentEnglish: String,
            contentSpanish: String
        }
    ]
})

// create collections

const Posts = new mongoose.model("Posts", postSchema);
const Users = new mongoose.model("Users", userSchema);

// get Stuff

app.get("/login", (req, res) => {
    let usernameGiven = req.body.username;
    let passwordGiven = req.body.password;
    Users.find({username: usernameGiven, password: passwordGiven}, (err,result) => {
        if(!err){
            return res.json({success: true, result: result})
        }else{
            return res.json({success: false, result: null});
        }
    })
});


app.post("/signup", (req, res) => {
    let usernameGiven = req.body.username;
    let passwordGiven = req.body.password;
    let userType = req.body.userType;

    let newUser = new toBeApproved({
        username: usernameGiven,
        password: passwordGiven, 
        type: userType
    });

    new newUser.save().then(() => {
        return res.json(newUser);
    });
})

app.get("/postByAuthorId", (req, res) => {
    let id = req.body.authorId;
    Posts.find({authorId: id}, (err, results) => {
        if(!err){
            return res.json(results);
        }else{
            return res.json([]);
        }
    })
})

app.get("/postByName", (req, res) => {
    let searchTerm = req.body.search;
    searchTerm = searchTerm.toLowerCase();
    let searchDomain = req.body.userType;
    
    Posts.find({name : /searchTerm/}, (err, results) => {
        if(!err){
            return res.json(results);
        }else{
            return res.json([]);
        }
    })
    
});

// create post
app.post("/", (req, res) =>{

});

/*default code*/
async function run() {
  try {
    // Connect the client to the server   (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
