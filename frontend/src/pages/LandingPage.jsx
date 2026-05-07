import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-hero">
        <div className="landing-hero__glow" aria-hidden />
        <div className="container landing-hero__inner">
          <span className="landing-badge">Top 20</span>
          <h1 className="landing-title">Votação de músicas para aulas</h1>
          <p className="landing-lede">
            Crie enquetes com faixas do YouTube, compartilhe o link com a turma e acompanhe o ranking em tempo real — curtidas e
            não curtidas, tudo num só lugar.
          </p>
          <div className="landing-cta">
            <Link to="/admin/login" className="landing-btn landing-btn--primary">
              Acessar painel
            </Link>
            <span className="landing-cta-hint">Administradores · login ou cadastro</span>
          </div>
        </div>
      </header>

      <main className="container landing-main">
        <section className="landing-card landing-features">
          <h2 className="landing-section-title">Como funciona</h2>
          <ul className="landing-feature-list">
            <li>
              <strong>Painel admin</strong>
              <span>Monte a votação com links do YouTube; os títulos são buscados automaticamente.</span>
            </li>
            <li>
              <strong>Link público</strong>
              <span>Cada enquete tem uma URL própria para os alunos votarem no celular ou no computador.</span>
            </li>
            <li>
              <strong>Resultado</strong>
              <span>Ranking por score (curtidas − não curtidas) e relatório com cada participante.</span>
            </li>
          </ul>
        </section>

        <section className="landing-card landing-note">
          <p>
            <strong>Participante?</strong> Use o link que seu professor ou organizador enviou (algo como{" "}
            <code className="landing-code">/votacao/nome-da-enquete</code>). Não é necessário criar conta.
          </p>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container landing-footer__inner">
          <span>Top 20 · votação para aulas</span>
          <Link to="/admin/login" className="landing-footer__link">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
