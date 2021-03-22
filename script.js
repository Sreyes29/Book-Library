// Getting data from textboxes using DOM manipulation when the Add button is clicked
function addToLibrary() {
    let bookName, bookAuthor, borrow;

    bookName = document.getElementById("BookName").value;
    bookAuthor = document.getElementById("Author").value;
    if(document.getElementById("yes").checked) borrow = true;
    else if(document.getElementById("no").checked) borrow = false;

    if(bookName == "") alert("Please enter the book name!");
    else if(bookAuthor == "") alert("Please enter the book author!");

    else {
        // Inserting the values into the database using xhttp, an AJAX object
        var xhttp =  new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                var result = this.responseText;
                alert(result);

                // Clearing textbox fields
                document.getElementById("BookName").value = "";
                document.getElementById("Author").value = "";

                // loadData();
            }
        }
        xhttp.open("POST", "/insert", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send('{"bookName":"'+bookName+'", "bookAuthor":"'+bookAuthor+'", "borrow":"'+borrow+'"}')
    }
}

function borrowBook() {
    let borrowedBook, borrowerName;

    var xhttp = new XMLHttpRequest();

    borrowedBook = document.getElementById("BorrowBookName").value;
    borrowerName = document.getElementById("BorrowerName").value;
    console.log(borrowedBook, borrowerName);

    if(borrowedBook == "") alert("Please enter the book name!");
    else if(borrowerName == "") alert("Please enter the borrower name!");
    
    else {
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                var result = this.responseText;
                alert(result);

                // Clearing textbox fields
                document.getElementById("BorrowBookName").value = "";
                document.getElementById("BorrowerName").value = "";

                if(result === "Successfully updated borrower name!") {
                }
            }
        }
    
        xhttp.open("POST", "/borrow", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send('{"borrowedBook":"'+borrowedBook+'", "borrowerName":"'+borrowerName+'"}');
    }
}

function createUser() {
    let username, pass;
    var xhttp = new XMLHttpRequest();
    

    username = document.getElementById("RegisterUsername").value;
    pass = document.getElementById("RegisterPassword").value;
    console.log(username, pass);

    if(username == "") alert("Please enter your username!");
    else if(pass == "") alert("Please enter your password!");

    else {
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                var result = this.responseText;
                alert(result);
                window.location.href = "http://127.0.0.1:3000/loginpage";
            }
        }
        xhttp.open("POST", "/createuser", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send('{"Username":"'+username+'", "Password":"'+pass+'"}');
    }
}

function login() {
    let username, pass;
    var xhttp = new XMLHttpRequest();
    

    username = document.getElementById("EnterUsername").value;
    pass = document.getElementById("EnterPassword").value;
    console.log(username, pass);

    if(username == "") alert("Please enter your username!");
    else if(pass == "") alert("Please enter your password!");

    else {
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                var result = this.responseText;
                if(result === "1") {
                    window.location.href = 'http://127.0.0.1:3000/indexpage';
                }
                else {
                    alert("The username or password you have entered is incorrect. Please try again!");
                }
    
            }
        }
        xhttp.open("POST", "/login", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send('{"Username":"'+username+'", "Password":"'+pass+'"}');
    }
}

// Loading the data from the database into the card under List of Books
function loadData() {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {

            document.getElementById('bookInfo').innerHTML = '';
            // Fetching the JSON string sent as a response into an object called result
            var result = this.responseText;
            
            // Parsing this result string into its individual objects and storing them in results
            var results = JSON.parse(result);
            console.log(results);

            var names = [];
            var authors = [];
            var borrowStatus = [];
            var borrowerName = [];

            for(var key in results) {
                if(key === "rows") {
                    for(var ele in results[key]) {
                        for(var maxele in results[key][ele]) {
                            if(maxele === "book_name") {
                                var book_name = results[key][ele][maxele];
                                names.push(book_name);
                            }
                            if(maxele === "book_author") {
                                var book_author = results[key][ele][maxele];
                                authors.push(book_author);
                            }
                            if(maxele === "book_borrowed_status") {
                                var b = results[key][ele][maxele];
                                borrowStatus.push(b);
                            }
                            if(maxele === "borrower_name") {
                                var bname = results[key][ele][maxele];
                                borrowerName.push(bname);
                            }
                        }
                    }
                }
            }
            
            for(var i = 0; i < names.length; i++) {
                var node = document.createElement("div");
                var name = document.createElement("h5");
                var author = document.createElement("h6");
                var borrow = document.createElement("footer");

                node.className = 'card-body';
                name.className = 'card-title';
                author.className = 'card-subtitle text-muted';
                borrow.className = 'blockquote-footer';

                var bookName = document.createTextNode(names[i]);
                var bookAuthor = document.createTextNode(authors[i]);
                var bookBorrow;

                if(borrowStatus[i]) {
                    if(borrowerName[i].length === 0)
                        bookBorrow = document.createTextNode("This book can be borrowed.");
                    else
                        bookBorrow = document.createTextNode(`This book is borrowed by ${borrowerName[i]}.`)
                }
                else {
                    bookBorrow = document.createTextNode("This book 𝗰𝗮𝗻𝗻𝗼𝘁 be borrowed.");
                }

                name.appendChild(bookName);
                author.appendChild(bookAuthor);
                borrow.appendChild(bookBorrow);

                node.appendChild(name);
                node.appendChild(author);
                node.appendChild(document.createElement("br"));
                node.appendChild(borrow);

                // Appending the node which contains all the html elements like h6, h5 and the text of the row in database into bookInfo
                document.getElementById('bookInfo').appendChild(node);
            }
    
        }
    }

    // Creating an xhttp request object, opening it and sending a GET request to /home
    xhttp.open("GET", "/home", true);
    xhttp.send();
}
