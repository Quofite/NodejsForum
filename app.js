const express = require("express");     // geting express
const app = express();                  // creating app object
const bodyParser = require("body-parser");      // getting parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });    // parser too
const mysql = require("mysql2");        // getting mysql driver
const smth = require("./smth");         // getting db data
var autorizationCheck = false;          // used to prevent from entering the forum without loginig

//-----------------------------------------------------------------

function insert(connection, login, password) {  // getting connection(db data) and entered user-wrote data
    const sql = `INSERT INTO users(login, password) VALUES (?, ?)`; // sql-string w/ plugs
    const filter = [login, password];       // things to be instead of the plugs

    //sql-query
    connection.query(sql, filter, function (err, results) {
        if (err) throw err;

        console.log(results);
    });
}

//---------------------- routing by get-requests -------------
// actualy nothing interesting, just sending html-files, maybe some hbs views later
app.get("(/index.html)?", function (request, response) {
    response.sendFile(__dirname + "/views/index.html");
});

app.get("/register(.html)?", function (request, response) {
    response.sendFile(__dirname + "/views/register.html");
});

app.get("/forum", function (request, response) {
    if (autorizationCheck)
        response.sendFile(__dirname + "/views/forum.html");
    else
        response.sendFile(__dirname + "/views/oops.html");
});

app.get("/getdata", function (request, response) {
    const connection = mysql.createConnection({ // getting db connection
        host: smth.host,
        user: smth.user,
        password: smth.pass,
        database: smth.db
    });

    const sql = `SELECT * FROM messages`;   
    var result = "";

    // sql-query
    connection.query(sql, function (err, results) {
        if (err) throw err;

        var intermediate = results; // variable where all sql results writed

        // outputing messages in reverse order (higher = newer)
        for (var i = intermediate.length - 1; i >= 0; i--) {
            result += `<b>${intermediate[i].login}:</b> ${intermediate[i].message}<hr>`;
        }

        response.send(result);
    });

    setTimeout(() => {
        connection.end();
    }, 3000);
});

//---------------------- handling of post-requests -----------
// ------------- autorization -------
app.post("/loginhandler", urlencodedParser, function (request, response) {
    if (!request.body)                                          // checking if anything is in the request
        return response.sendStatus(400);

    // getting entered login and password
    let login = request.body.login;
    let pass = request.body.pass;

    // connecting to db
    const connection = mysql.createConnection({
        host: smth.host,
        user: smth.user,
        password: smth.pass,
        database: smth.db
    });

    const sql = `SELECT * FROM users WHERE login=? AND password=?`;     // sql-string with plugs
    const filter = [login, pass];                       // thing to be instead of plug

    // sql-query
    connection.query(sql, filter, function (err, results) {
        if (results.length === 0) {         // if there are no such record
            // DO NOT FORGET TO MAKE SOME MESSAGES
            response.redirect("/index.html");   // redirect to index.html
            return;
        }

        autorizationCheck = true;
        response.redirect("/forum");   // if everything is ok, redirect to forum
    });

    setTimeout(() => {      // ending of the connection after 1 second after the sql-query
        connection.end();
    }, 1000);
});

//-------------- registration ---------------
app.post("/registerhandling", urlencodedParser, function (request, response) {
    if (!request.body)                                          // checking if anythins in request
        return response.sendStatus(400);

    // getting entered data
    let login = request.body.login;
    let pass = request.body.pass;

    // connecting to db
    const connection = mysql.createConnection({
        host: smth.host,
        user: smth.user,
        password: smth.pass,
        database: smth.db
    });

    const sql = `SELECT * FROM users WHERE login=?`;     // sql-string with plig
    const filter = [login];                       // thing to be instead of the plug

    //sql-guery
    connection.query(sql, filter, function (err, results) {
        if (results.length === 0) {         // if there are no such record, we calling insert-function(see the first function, after the reqs)
            insert(connection, login, pass);
            response.redirect("/index.html");       // and redirecting after the sql-request
        } else {
            //DO NOT FORHET TO MAKE SOME MESSAGES ABOUT MISTAKES
            response.redirect("/register");         // if there is any such record, redirecting back to register form
            return;
        }
    });

    setTimeout(() => {      //ending the connection after 1 second after sql-request
        connection.end();
    }, 1000);
});

// listening by port
app.listen(3000, () => {
    console.log("Server started listening at 3000");
});