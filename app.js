const express = require("express");     // получаем express
const app = express();                  // создаем объект приложения
const bodyParser = require("body-parser");      // получаем парсер
const urlencodedParser = bodyParser.urlencoded({ extended: false });    // тоже парсер
const mysql = require("mysql2");        // получаем mysql драйвер
const smth = require("./smth");         // получаем данные о бд

//-----------------------------------------------------------------

function insert(connection, login, password) {
    const sql = `INSERT INTO users(login, password) VALUES (?, ?)`;
    const filter = [login, password];

    connection.query(sql, filter, function (err, results) {
        if (err) throw err;

        console.log(results);
    });
}

//---------------------- маршрутизация по get-запросам -------------
app.get("(/index.html)?", function (request, response) {
    response.sendFile(__dirname + "/views/index.html");
});

app.get("/register(.html)?", function (request, response) {
    response.sendFile(__dirname + "/views/register.html");
});

app.use("/forum(.html)?", function (request, response) {
    response.sendFile(__dirname + "/views/forum.html");
});

//---------------------- обработка post-запросов -----------
// ------------- авторизация -------
app.post("/loginhandler", urlencodedParser, function (request, response) {
    if (!request.body)                                          // проверка на то, есть ли хоть что-то в запросе
        return response.sendStatus(400);                        // если нет, то выбрасываем 400

    // получаем введеные логин и пароль
    let login = request.body.login;
    let pass = request.body.pass;

    // подключаемся к бд
    const connection = mysql.createConnection({
        host: smth.host,
        user: smth.user,
        password: smth.pass,
        database: smth.db
    });

    const sql = `SELECT * FROM users WHERE login=? AND password=?`;     // sql-строка с заглушками
    const filter = [login, pass];                       // то, что будет вместо заглушек

    // sql-запрос
    connection.query(sql, filter, function (err, results) {
        if (results.length === 0) {         // если нет подходящего логина
            // сделать сообщение об ошибке
            connection.destroy();   //  отключаемся от бд принудительно
            response.redirect("/index.html");   // редирект на страницу авторизации
            return;
        }

        // получаем первый подходящий результат и еще одна проверка, если прошла, то перенаправляем на страницу с контентом
        const matched = results[0];
        if (login == matched.login) {
            response.redirect("/forum.html");
        }
    });
    
});

//-------------- регистрация ---------------
app.post("/registerhandling", urlencodedParser, function (request, response) {
    if (!request.body)                                          // проверка на то, есть ли хоть что-то в запросе
        return response.sendStatus(400);                        // если нет, то выбрасываем 400

    // получаем введеные логин и пароль
    let login = request.body.login;
    let pass = request.body.pass;

    // подключаемся к бд
    const connection = mysql.createConnection({
        host: smth.host,
        user: smth.user,
        password: smth.pass,
        database: smth.db
    });

    const sql = `SELECT * FROM users WHERE login=?`;     // sql-строка с заглушкой
    const filter = [login];                       // то, что будет вместо заглушки

    connection.query(sql, filter, function (err, results) {
        if (results.length === 0) {
            insert(connection, login, pass);
            response.redirect("/index.html");
        } else {
            response.redirect("/register");
            response.send("This login is already taken");
        }
    });

});

// прослушивание по порту
app.listen(3000, () => {
    console.log("Server started listening at 3000");
});