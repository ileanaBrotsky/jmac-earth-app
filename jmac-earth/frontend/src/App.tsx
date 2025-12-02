import NewProjectPage from './pages/NewProjectPage';

export function App() {
  return (
    <div className="app-shell">
      <main>
        <header>
          <p className="page-subtitle">JMAC Earth · Sprint 1</p>
          <h1 className="page-title">Carga tu traza y calcula bombas</h1>
        </header>
        <NewProjectPage />
      </main>
    </div>
  );
}

export default App;
