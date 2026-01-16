import './App.css';
import Navbar from './components/navbar.jsx';
import Hero from './components/hero.jsx';
import Menu from './components/menu.jsx';

function App(){
  return(
    <div className="App">
      <Navbar/>
      <Hero/>
      <Menu/>

      <footer id="contact" className="footer">
        <p>© 2026 Pizza Palace Demo. Built with React & Vite.</p>
      </footer>
    </div>
  );
}

export default App;