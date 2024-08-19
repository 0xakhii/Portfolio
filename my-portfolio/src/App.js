import React from 'react';
import './App.css';
import Navbar from './components/navbar';
import Home from './components/home';
import Projects from './components/projects';
import About from './components/about';
import Contact from './components/contact';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Portfolio</h1>
      </header>
      <Navbar />
      <Home />
      <Projects />
      <About />
      <Contact />
    </div>
  );
}

export default App;
