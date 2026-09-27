const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    const homePage = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Library Management System</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            background-color: #f4f4f4;
            color: #333;
        }

        header {
            background-color: #2c3e50;
            color: white;
            text-align: center;
            padding: 25px;
        }

        header h1 {
            margin: 0;
        }

        .welcome {
            text-align: center;
            background-color: #3498db;
            color: white;
            padding: 40px;
        }

        .welcome h2 {
            margin: 0 0 10px;
        }

        .container {
            width: 80%;
            margin: 30px auto;
            text-align: center;
        }

        .card {
            background-color: white;
            width: 250px;
            margin: 20px auto;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 6px #ccc;
        }

        .card h3 {
            color: #3498db;
        }

        footer {
            background-color: #2c3e50;
            color: white;
            text-align: center;
            padding: 15px;
            margin-top: 40px;
        }
    </style>
</head>

<body>

    <header>
        <h1>Library Management System</h1>
        <p>Advanced Web Technology Lab</p>
    </header>

    <section class="welcome">
        <h2>Welcome to Our Library</h2>
        <p>Manage your library easily and efficiently.</p>
    </section>

    <div class="container">

        <h2>Library Services</h2>

        <div class="card">
            <h3>📚 Books</h3>
            <p>Manage and view library books.</p>
        </div>

        <div class="card">
            <h3>👨‍🎓 Students</h3>
            <p>Manage student library records.</p>
        </div>

        <div class="card">
            <h3>🔄 Issue & Return</h3>
            <p>Track issued and returned books.</p>
        </div>

    </div>

    <footer>
        <p>&copy; 2026 Library Management System</p>
    </footer>

</body>

</html>
    `;

    res.end(homePage);
});

server.listen(PORT, () => {
    console.log("Library Management System running at http://localhost:3000");
});