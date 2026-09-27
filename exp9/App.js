import React, { Component } from 'react';
import { HashRouter, Route, Link } from "react-router-dom";

// Experiment No. 9 - Views
const Home = () => (
  <div style={{ padding: "20px", backgroundColor: "#f0fdf4", borderRadius: "8px", marginTop: "15px" }}>
    <h2>Home Page</h2>
    <p>Welcome to Experiment No. 9: Hosting the Website with Domain Registration Process on GitHub Pages.</p>
    <p>Using <code>HashRouter</code> ensures zero 404 errors on page reload when hosted on GitHub Pages subdirectories.</p>
  </div>
);

const About = () => (
  <div style={{ padding: "20px", backgroundColor: "#eff6ff", borderRadius: "8px", marginTop: "15px" }}>
    <h2>About Page</h2>
    <p>This React Single Page Application (SPA) is deployed using <code>gh-pages</code> to GitHub Pages.</p>
    <p>Domain: <code>https://&lt;username&gt;.github.io/my-react-app/</code></p>
  </div>
);

class App extends Component {
  render() {
    return (
      <HashRouter basename="/">
        <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "Arial, sans-serif", padding: "25px", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <header style={{ borderBottom: "2px solid #3b82f6", paddingBottom: "10px", marginBottom: "20px" }}>
            <h1 style={{ color: "#1e3a8a", margin: 0 }}>Advanced Web Technology Lab</h1>
            <h3 style={{ color: "#64748b", margin: "5px 0" }}>Experiment No. 9: Website Hosting & Routing</h3>
          </header>

          <nav style={{ background: "#1e293b", padding: "12px 20px", borderRadius: "6px" }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: "25px" }}>
              <li>
                <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Home</Link>
              </li>
              <li>
                <Link to="/about" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: "bold" }}>About</Link>
              </li>
            </ul>
          </nav>

          <main>
            <Route exact path="/" component={Home} />
            <Route path="/about" component={About} />
          </main>

          <footer style={{ marginTop: "30px", paddingTop: "15px", borderTop: "1px solid #e2e8f0", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
            <p>&copy; 2026 Department of Computer Engineering &bull; GitHub Pages Deployment</p>
          </footer>
        </div>
      </HashRouter>
    );
  }
}

export default App;
