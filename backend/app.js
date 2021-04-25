// http is a library in nodejs which we will use to host our web app
const http = require('http');

// fs is a library which helps us with the file handling and importing data from an external html file/webpage
const fs = require('fs');

// Specify a port on which the server will listen to for requests and responses
const port = process.env.PORT || 3000;
const hostname = '127.0.0.1';

// Importing Node to Postregsql module and creating a pool object
const { Client } = require('pg');
const pool = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'library',
    password: '*****',
    port: 5432,
});

// Used for Parameterized SQL Queries to prevent SQL Injection
var format = require('pg-format');

/* This function createServer takes another function with request and response as parameters. Since we are passing
    another function as a parameter, we use the arrow function syntax. */
const server = http.createServer((req, res) => {
    if(req.url === '/') {
        // Writing the status code into the http response as 200, which means successful
        res.writeHead(200, {'Content-Type': 'text/html'});

        fs.readFile('./login.html', (error, data) => {
            if(error) {
                // Error 404
                res.writeHead(404);
                res.write("Error: File not found!");
            }
            else {
                // Writing the data into login.html
                res.write(data);
            }
            res.end();
        });
    }
    else if(req.url === '/listpage') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        fs.readFile('./list.html', (error, data) => {
            if(error) {
                res.writeHead(404);
                res.write("Error: File not found!");
            }
            else {
                res.write(data);
            }
            res.end();
        });
    }
    else if(req.url === '/borrowpage') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        fs.readFile('./borrow.html', (error, data) => {
            if(error) {
                res.writeHead(404);
                res.write("Error: File not found!");
            }
            else {
                res.write(data);
            }
            res.end();
        });
    }
    else if(req.url === '/registerpage') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        fs.readFile('./register.html', (error, data) => {
            if(error) {
                res.writeHead(404);
                res.write("Error: File not found!");
            }
            else {
                res.write(data);
            }
            res.end();
        });
    }
    else if(req.url === '/loginpage') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        fs.readFile('./login.html', (error, data) => {
            if(error) {
                res.writeHead(404);
                res.write("Error: File not found!");
            }
            else {
                res.write(data);
            }
            res.end();
        });
    }
    else if(req.url === '/indexpage') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        fs.readFile('./index.html', (error, data) => {
            if(error) {
                res.writeHead(404);
                res.write("Error: File not found!");
            }
            else {
                res.write(data);
            }
            res.end();
        });
    }
    else if(req.url === '/script.js') {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        fs.readFile('./script.js', (error, data) => {
            if(error) {
                res.writeHead(404);
                res.write("Error: File not found!");
            }
            else {
                res.write(data);
            }
            res.end();
        });
    }
    else if(req.method == 'GET' && req.url == '/home') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        // Connecting to the SQL Database and retrieving the data
        pool.connect(function(err) {
            let sql = `SELECT * FROM books`;
            pool.query(sql, function(error, result, fields) {
                // Turning the row from the database into a JSON string, and sending the string as a response
                var bookData = JSON.stringify(result);
                res.end(bookData);
            });

        });
    }
    else if(req.method == 'POST' && req.url == '/insert') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');

        var content = '';
        req.on('data', function(data) {
            content += data;
            
            var obj = JSON.parse(content);

            console.log(`The book name is ${obj.bookName} and the book author is ${obj.bookAuthor}.`);
            pool.connect(function(err) {
                let sql = format(`INSERT INTO %I(book_name, book_borrowed_status, book_author, book_reserved_status, borrower_name, price, edition) VALUES (%L, %s, %L, false, '', %L, %L);`, 'books', obj.bookName, obj.borrow, obj.bookAuthor, obj.price, obj.edition);
                console.log(sql);
                pool.query(sql, function(error, result, fields) {
                });
            });
        });
        res.end("Successfully added book into library!");
    }
    else if(req.method == 'POST' && req.url == '/borrow') {
        let sql;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');

        var content = '';
        req.on('data', function(data) {
            content += data;
            
            var obj = JSON.parse(content);

            pool.connect(function(err) {
                sql = format('SELECT * FROM %I WHERE book_name = %L', 'books', obj.borrowedBook);
                console.log(sql);
                pool.query(sql, function(error, r, fields) {
                    var results = r.rows;

                    // This is checking whether the book can be borrowed or not
                    if(results[0].book_borrowed_status) {
                        pool.connect(function(err) {
                            sql = format('UPDATE %I SET borrower_name = %L WHERE book_name = %L', 'books', obj.borrowerName, obj.borrowedBook);
                            pool.query(sql, function(error, result, fields) {
                            });
                        });
                        res.end("Successfully updated borrower name!");
                        console.log(obj.borrowerName + " is now borrowing " + obj.borrowedBook);
                    }
                    else res.end("This book cannot be borrowed! Please try another book.");
                });
            });
        });
    }
    else if(req.method == 'POST' && req.url == '/createuser') {
        var bcrypt = require('bcrypt');

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');

        var content = '';
        req.on('data', function(data) {
            content += data;
            
            var obj = JSON.parse(content);

            console.log(obj.Username, obj.Password, obj.Email, obj.Phone);

            bcrypt.hash(obj.Password, 10, function(err, hash) {
                pool.connect(function(err) {
                    let sql = format(`INSERT INTO %I(borrower_name, password, email, phone) VALUES (%L, %L, %L, %L);`, 'login', obj.Username, hash, obj.Email, obj.Phone);
                    console.log(sql);
                    pool.query(sql, function(error, result, fields) {
                    });
                });
            });
    
        });
        res.end("Successfully created user!");
    }
    else if(req.method == 'POST' && req.url == '/login') {
        let bool;

        var bcrypt = require('bcrypt');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');

        var content = '';
        req.on('data', function(data) {
            content += data;
            var obj = JSON.parse(content);

            console.log(obj.Username, obj.Password);

            pool.connect(function(err) {
                sql = format('SELECT * FROM %I where borrower_name = %L', 'login', obj.Username);
                pool.query(sql, function(error, r, fields) {
                    if (error) throw error;
                    var results = r.rows;

                    bcrypt.compare(obj.Password, results[0].password, function(err, result) {
                        console.log(result);
                        // This is checking whether the user exists in the database
                        if(result) {
                            console.log("MATCH");
                            res.end("1");
                        }
                        else res.end("0");
                    });
                });
            });
        });
    }
});

server.listen({ port: port }, (error) => {
    if(error) console.log(error);
    else console.log(`Server is listening on port ${port}.`);
});