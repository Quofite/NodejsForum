const express = require("express");     // �������� express
const app = express();                  // ������� ������ ����������
const bodyParser = require("body-parser");      // �������� ������
const urlencodedParser = bodyParser.urlencoded({ extended: false });    // ���� ������
const mysql = require("mysql2");        // �������� mysql �������
const smth = require("./smth");         // �������� ������ � ��

//-----------------------------------------------------------------

function insert(connection, login, password) {
    const sql = `INSERT INTO users(login, password) VALUES (?, ?)`;
    const filter = [login, password];

    connection.query(sql, filter, function (err, results) {
        if (err) throw err;

        console.log(results);
    });
}

//---------------------- ������������� �� get-�������� -------------
app.get("(/index.html)?", function (request, response) {
    response.sendFile(__dirname + "/views/index.html");
});

app.get("/register(.html)?", function (request, response) {
    response.sendFile(__dirname + "/views/register.html");
});

app.use("/forum(.html)?", function (request, response) {
    response.sendFile(__dirname + "/views/forum.html");
});

//---------------------- ��������� post-�������� -----------
// ------------- ����������� -------
app.post("/loginhandler", urlencodedParser, function (request, response) {
    if (!request.body)                                          // �������� �� ��, ���� �� ���� ���-�� � �������
        return response.sendStatus(400);                        // ���� ���, �� ����������� 400

    // �������� �������� ����� � ������
    let login = request.body.login;
    let pass = request.body.pass;

    // ������������ � ��
    const connection = mysql.createConnection({
        host: smth.host,
        user: smth.user,
        password: smth.pass,
        database: smth.db
    });

    const sql = `SELECT * FROM users WHERE login=? AND password=?`;     // sql-������ � ����������
    const filter = [login, pass];                       // ��, ��� ����� ������ ��������

    // sql-������
    connection.query(sql, filter, function (err, results) {
        if (results.length === 0) {         // ���� ��� ����������� ������
            // ������� ��������� �� ������
            connection.destroy();   //  ����������� �� �� �������������
            response.redirect("/index.html");   // �������� �� �������� �����������
            return;
        }

        // �������� ������ ���������� ��������� � ��� ���� ��������, ���� ������, �� �������������� �� �������� � ���������
        const matched = results[0];
        if (login == matched.login) {
            response.redirect("/forum.html");
        }
    });
    
});

//-------------- ����������� ---------------
app.post("/registerhandling", urlencodedParser, function (request, response) {
    if (!request.body)                                          // �������� �� ��, ���� �� ���� ���-�� � �������
        return response.sendStatus(400);                        // ���� ���, �� ����������� 400

    // �������� �������� ����� � ������
    let login = request.body.login;
    let pass = request.body.pass;

    // ������������ � ��
    const connection = mysql.createConnection({
        host: smth.host,
        user: smth.user,
        password: smth.pass,
        database: smth.db
    });

    const sql = `SELECT * FROM users WHERE login=?`;     // sql-������ � ���������
    const filter = [login];                       // ��, ��� ����� ������ ��������

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

// ������������� �� �����
app.listen(3000, () => {
    console.log("Server started listening at 3000");
});