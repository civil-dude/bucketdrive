import React from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import RoutePage from './pages/RoutePage';

// react router
//import { Link } from 'react-router-dom';

const date = new Date;

function App() {
  return (
    <>
    <div className='App'>
    <header className="App-header">
       <Link to='/'>
       <h1>Bucket Drive</h1> 
       </Link>
          </header>
     <main>
     <RoutePage />
  
     </main>
     <footer style={{ position:'relative', marginTop: '10vh', bottom:0,width: '100%', textAlign:'center'}}>
      &copy; {date.getFullYear()}, Project by Adhrit 
      </footer> 
    </div>
    </>
  );
}

export default App;
