const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongourl = 'mongodb+srv://s1345005:DAL@cluster0.bfggpbi.mongodb.net/?retryWrites=true&w=majority'; 
const dbName = 'test';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('cookie-session');
const SECRETKEY = '1234';

var usersinfo = new Array(
    {name: "ryan", password: "1234"},
    {name: "bryan", password: "1234"},
    {name: "sam", password: "1234"}
);

var documents = {};
function isAuthenticated(req, res, next) {
    if(!req.session.authenticated){
        console.log("Not authenticated; Redirecting to login page");
        res.redirect("/login");
    }else{
    	next();
    }
    console.log("Hello, welcome back");
}

function NotAuthenticated(req, res, next) {
    if(!req.session.authenticated){
        next();
    }else{
    	console.log("Not authenticated; Redirecting to login page");
        res.redirect("/home");
    }
    console.log("Hello, welcome back");
}
//Main Body
app.set('view engine', 'ejs');
app.use(session({
    userid: "session",  
    keys: [SECRETKEY],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static('public'));

const createDocument = function(db, createddocuments, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to the MongoDB database server.");
        const db = client.db(dbName);

        db.collection('inventoryitem').insertOne(createddocuments, function(error, results){
            if(error){
            	throw error
            };
            console.log(results);
            return callback();
        });
    });
}

const findDocument =  function(db, criteria, callback){
    let cursor = db.collection('inventoryitem').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray(function(err, docs){
        assert.equal(err, null);
        console.log(`findDocument: ${docs.length}`);
        return callback(docs);
    });
}

const handle_Find = function(res, criteria){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        findDocument(db, criteria, function(docs){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('display', {nItems: docs.length, items: docs});
        });
    });
}

const handle_Edit = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let documentID = {};
        documentID['_id'] = ObjectID(criteria._id)
        let cursor = db.collection('inventoryitem').find(documentID);
        cursor.toArray(function(err,docs) {
            client.close();
            assert.equal(err,null);
            res.status(200).render('edit',{item: docs[0]});

        });
    });
}

const handle_Details = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let documentID = {};
        documentID['_id'] = ObjectID(criteria._id)
        findDocument(db, documentID, function(docs){ 
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('details', {item: docs[0]});
        });
    });
}

const updateDocument = function(criteria, updatedocument, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        console.log(criteria);
	console.log(updatedocument);
	
        db.collection('inventoryitem').updateOne(criteria,{
                $set: updatedocument
            }, function(err, results){
                client.close();
                assert.equal(err, null);
                return callback(results);
            }
        );
    });
}

const deleteDocument = function(db, criteria, callback){
console.log(criteria);
	db.collection('inventoryitem').deleteOne(criteria, function(err, results){
	assert.equal(err, null);
	console.log(results);
	return callback();
	});

};

const handle_Delete = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        console.log("Connected successfully to server");
        const db = client.db(dbName);
	
	let deldocument = {};
	
        deldocument["_id"] = ObjectID(criteria._id);
        deldocument["ownerID"] = criteria.ownerID;
        console.log(deldocument["_id"]);
        console.log(deldocument["ownerID"]);
        
        deleteDocument(db, deldocument, function(results){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('info', {message: "Item is successfully deleted."});
        })     
    });
}

app.get('/', function(req, res){
    if(!req.session.authenticated){
        console.log("Not authenticated; Redirecting to login page");
        res.redirect("/login");
    }else{
    	res.redirect("/login");
    }
    console.log("Hello, welcome back");
});

//login
app.get('/login', NotAuthenticated, function(req, res){
    console.log("Welcome to login page.")
    res.sendFile(__dirname + '/public/login.html');
    return res.status(200).render("login");
});

app.post('/login', NotAuthenticated, function(req, res){
    console.log("Handling your login request");
    for (var i=0; i<usersinfo.length; i++){
        if (usersinfo[i].name == req.body.username && usersinfo[i].password == req.body.password) {
        req.session.authenticated = true;
        req.session.userid = usersinfo[i].name;
        console.log(req.session.userid);
        return res.status(200).redirect("/home");
        }
    }
        console.log("Error username or password.");
        return res.redirect("/");
});

app.get('/logout', function(req, res){
    req.session = null;
    req.authenticated = false;
    res.redirect('/login');
});

app.get('/home', isAuthenticated, function(req, res){
    console.log("Welcome to the home page!");
    return res.status(200).render("home");
});

app.get('/list', isAuthenticated, function(req, res){
    console.log("Displaying all items information! ");
    handle_Find(res,req.query.docs);
    
});

app.get('/find', isAuthenticated, function(req, res){
    return res.status(200).render("searchitem");
});

app.post('/searchitem', isAuthenticated, function(req, res){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
    
    var searchID={};
    searchID[req.body.criteria] = req.body.inputvalue;

    if (searchID[req.body.criteria]){
    console.log("...Searching the Item");
    findDocument(db, searchID, function(docs){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('display', {nItems: docs.length, items: docs});
        });
    }
    else{
    console.log("Selected criteria or input value invalid. Please try again.");
    res.status(200).redirect('/find');
    }         	
	});
});

app.get('/details', isAuthenticated, function(req,res){
    handle_Details(res, req.query);
});

app.get('/createitem', isAuthenticated, function(req, res){
    return res.status(200).render("createitem");
});

app.post('/createitem', isAuthenticated, function(req, res){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected to inventory system successfully..");
        const db = client.db(dbName);
        
        documents["_id"] = ObjectID;        
        documents["itemID"] = req.body.itemID;	
        documents['itemname']= req.body.itemname;
        documents['type']= req.body.type;
        documents['quantity']= req.body.quantity;
        documents["ownerID"] = `${req.session.userid}`;
        
        if(documents.itemID){
            console.log("...Creating the document");
            createDocument(db, documents, function(docs){
                client.close();
                console.log("Closed DB connection");
                return res.status(200).render('info', {message: "Item is inserted successfully."});
            });
        } else{
            client.close();
            console.log("Closed DB connection");
            return res.status(200).render('info', {message: "Invalid input. Please try again."});
        }
    });
});

app.get('/edit', isAuthenticated, function(req,res) {
    handle_Edit(res, req.query);
})


app.post('/update', isAuthenticated, function(req, res){
    var updatedocument={};
    const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("Connected successfully to server");
            
            if(req.body.itemname){
                updatedocument['itemname']= req.body.itemname;
                updatedocument['type']= req.body.itemtype;
                updatedocument['quantity']= req.body.itemquantity;

        	    let updateDoc = {};
                updateDoc['itemID'] = req.body.itemID;
                console.log(updateDoc);
                console.log(updatedocument);

                updateDocument(updateDoc, updatedocument, function(docs) {
                    client.close();
                    console.log("Closed DB connection");
                    return res.render('info', {message: "Item detail is updated successfully."});
                    
                })
            }
            else{
            	return res.render('info', {message: "Invalid input. Update fail."});
            }
    });
    
});

app.get('/delete', isAuthenticated, function(req, res){
    console.log(req.query.ownerID)
    console.log(req.session.userid)
    if(req.query.ownerID == req.session.userid){
        console.log("...Hello !");
        handle_Delete(res, req.query);
    }else{
        return res.status(200).render('info', {message: "You don't have the permission to delete this item."}); 
    }
});

//Restful
//insert
//curl -X POST -H "Content-Type: application/json" -d '{"key1": "value1", "key2": "value2"}' http://localhost:8099/api/insert
app.post('/api/insert', function(req,res) {
    const jsonData = req.body;
    if (jsonData.itemID) {
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("Connected to inventory system successfully..");
            const db = client.db(dbName);
            
            documents["_id"] = ObjectID;        
            documents["itemID"] = jsonData.itemID;	
            documents['itemname']= jsonData.itemname;
            documents['type']= jsonData.type;
            documents['quantity']= jsonData.quantity;
            documents["ownerID"] = jsonData.ownerid;
            
            if(documents.itemID){
                console.log("...Creating the document");
                createDocument(db, documents, function(docs){
                    client.close();
                    console.log("Closed DB connection");
                    res.status(200).json({message: "Item is inserted successfully."});
                });
            } else{
                client.close();
                console.log("Closed DB connection");
                res.status(200).json({message: "Invalid input. Please try again."});
            }
        });
    }else {
        res.status(500).json({message: "Please enter all info"});
    }
});

//search
// curl -X GET localhost:8099/api/search/:itemID
app.get('/api/search/:itemID', function(req,res) {
    if (req.params.itemID) {
        let criteria = {};
        criteria['itemID'] = req.params.itemID;
        const client = new MongoClient(mongourl);
        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, function(docs){
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({message: "Wrong item ID."}); 
    }
})

//delete
// curl -X DELETE localhost:8099/api/delete/:objectID/:ownerID
app.delete('/api/delete/:_id/:ownerID', function(req,res){
    console.log(req.params.itemID);
    if (req.params._id) {
        const client = new MongoClient(mongourl);
        client.connect(function(err) {
            console.log("Connected successfully to server");
            const db = client.db(dbName);
        
        let deldocument = {};
        
            deldocument["_id"] = ObjectID(req.params._id);
            deldocument["ownerID"] = req.params.ownerID;
            console.log(deldocument["_id"]);
            console.log(deldocument["ownerID"]);
            
            deleteDocument(db, deldocument, function(results){
                client.close();
                console.log("Closed DB connection");
                res.status(200).json({message: "Item is successfully deleted."});
            })     
        });
    } else {
        res.status(500).json({message: "Wrong item ID."});      
    }
});

//update
//curl -X POST -H "Content-Type: application/json" -d '{"key1": "value1", "key2": "value2"}' http://localhost:8099/api/update
app.post('/api/update', (req, res) => {
  const jsonData = req.body;

  console.log('Received JSON data:', jsonData);
  console.log(jsonData.itemID);
  console.log(jsonData.itemName);
  console.log(jsonData.type);
  console.log(jsonData.quantity);

  var updatedocument={};
    const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("Connected successfully to server");
            
            if(jsonData.itemID){
                updatedocument['itemname']= jsonData.itemName;
                updatedocument['type']= jsonData.type;
                updatedocument['quantity']= jsonData.quantity;

        	    let updateDoc = {};
                updateDoc['itemID'] = jsonData.itemID;
                console.log(updateDoc);
                console.log(updatedocument);

                updateDocument(updateDoc, updatedocument, function(docs) {
                    client.close();
                    console.log("Closed DB connection");
                    res.status(200).json({ message: 'Item detail is updated successfully' });
                    
                })
            }
            else{
            	res.status(500).json({message: "Wrong item ID"});
            }
    });
});


app.listen(app.listen(process.env.PORT || 8099));
