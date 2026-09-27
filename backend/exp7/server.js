const express = require('express');

const app = express();
const PORT = 3001;

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));

// Home page - display form
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Library Management System</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f2f4f7;
        }

        header {
            background-color: #243447;
            color: white;
            text-align: center;
            padding: 25px;
        }

        header h1 {
            margin: 0 0 8px;
        }

        nav {
            background-color: #34495e;
            text-align: center;
            padding: 12px;
        }

        nav a {
            color: white;
            text-decoration: none;
            margin: 0 20px;
            font-weight: bold;
        }

        .container {
            width: 90%;
            max-width: 600px;
            margin: 40px auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        h2 {
            text-align: center;
            color: #243447;
            margin-bottom: 25px;
        }

        label {
            display: block;
            margin-top: 15px;
            margin-bottom: 6px;
            font-weight: bold;
        }

        input, select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 15px;
        }

        button {
            width: 100%;
            margin-top: 25px;
            padding: 13px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }

        button:hover {
            background-color: #2980b9;
        }

        footer {
            text-align: center;
            background-color: #243447;
            color: white;
            padding: 15px;
            margin-top: 50px;
        }
    </style>
</head>

<body>

    <header>
        <h1>Library Management System</h1>
        <p>Advanced Web Technology Lab</p>
    </header>

    <nav>
        <a href="/">Home</a>
        <a href="/books">Books</a>
    </nav>

    <div class="container">

        <h2>📚 Add New Book</h2>

        <form action="/submit" method="POST">

            <label for="bookId">Book ID</label>
            <input
                type="text"
                id="bookId"
                name="bookId"
                placeholder="Enter Book ID"
                required
            >

            <label for="bookName">Book Name</label>
            <input
                type="text"
                id="bookName"
                name="bookName"
                placeholder="Enter Book Name"
                required
            >

            <label for="author">Author Name</label>
            <input
                type="text"
                id="author"
                name="author"
                placeholder="Enter Author Name"
                required
            >

            <label for="category">Category</label>
            <select id="category" name="category" required>
                <option value="">Select Category</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Programming">Programming</option>
                <option value="Database">Database</option>
                <option value="Networking">Networking</option>
                <option value="Other">Other</option>
            </select>

            <label for="quantity">Quantity</label>
            <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                placeholder="Enter Quantity"
                required
            >

            <button type="submit">Add Book</button>

        </form>

    </div>

    <footer>
        <p>&copy; 2026 Library Management System</p>
    </footer>

</body>
</html>
    `);
});


// POST route - process submitted form
app.post('/submit', (req, res) => {

    const bookId = req.body.bookId;
    const bookName = req.body.bookName;
    const author = req.body.author;
    const category = req.body.category;
    const quantity = req.body.quantity;

    res.send(`
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Book Added</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f2f4f7;
            text-align: center;
            padding: 50px;
        }

        .result {
            background-color: white;
            max-width: 600px;
            margin: auto;
            padding: 35px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        h1 {
            color: #27ae60;
        }

        table {
            width: 100%;
            margin-top: 25px;
            border-collapse: collapse;
        }

        th, td {
            padding: 12px;
            border: 1px solid #ddd;
        }

        th {
            background-color: #34495e;
            color: white;
        }

        a {
            display: inline-block;
            margin-top: 25px;
            padding: 12px 20px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>

<body>

    <div class="result">

        <h1>✓ Book Added Successfully</h1>

        <p>The following book details were received by the server:</p>

        <table>

            <tr>
                <th>Book ID</th>
                <td>${bookId}</td>
            </tr>

            <tr>
                <th>Book Name</th>
                <td>${bookName}</td>
            </tr>

            <tr>
                <th>Author</th>
                <td>${author}</td>
            </tr>

            <tr>
                <th>Category</th>
                <td>${category}</td>
            </tr>

            <tr>
                <th>Quantity</th>
                <td>${quantity}</td>
            </tr>

        </table>

        <a href="/">← Add Another Book</a>

    </div>

</body>
</html>
    `);
});


// Start server
app.listen(PORT, () => {
    console.log('======================================');
    console.log('Library Management System');
    console.log('Express Server Started Successfully');
    console.log('Server running at: http://localhost:' + PORT);
    console.log('======================================');
});
