import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api";

const blankSong = { youtubeUrl: "" };

function getPublicPollUrl(slug) {
  const base = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, "");
  return `${base}/votacao/${slug}`;
}

function logout() {
  localStorage.removeItem("top20_token");
  window.location.href = "/admin/login";
}

export default function AdminDashboardPage() {
  const [polls, setPolls] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    endDate: "",
    songs: [blankSong],
  });
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedPollId, setCopiedPollId] = useState(null);

  const loadPolls = async () => {
    const { data } = await api.get("/polls");
    setPolls(data);
  };

  useEffect(() => {
    loadPolls().catch(() => setNotice("Não foi possível carregar as votações."));
  }, []);

  const onCreatePoll = async (e) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    try {
      await api.post("/polls", form);
      setForm({ name: "", description: "", endDate: "", songs: [blankSong] });
      await loadPolls();
      setNotice("Votação criada com sucesso.");
      window.setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || "Erro ao criar votação.");
    } finally {
      setCreating(false);
    }
  };

  const activePolls = useMemo(() => polls.filter((p) => p.stats?.active), [polls]);
  const closedPolls = useMemo(() => polls.filter((p) => !p.stats?.active), [polls]);

  const copyPollUrl = async (pollId, slug) => {
    const url = getPublicPollUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        setNotice("Não foi possível copiar o link.");
        window.setTimeout(() => setNotice(""), 4000);
        return;
      }
    }
    const id = String(pollId);
    setCopiedPollId(id);
    window.setTimeout(() => {
      setCopiedPollId((cur) => (cur === id ? null : cur));
    }, 2000);
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-dash-hero">
        <div className="container admin-dash-hero__inner">
          <div className="admin-dash-hero__text">
            <span className="admin-dash-hero__badge">Top 20</span>
            <h1 className="admin-dash-hero__title">Painel administrativo</h1>
            <p className="admin-dash-hero__lede">
              Crie votações, copie o link público e acompanhe resultados. Você vê apenas o que criou nesta conta.
            </p>
          </div>
          <button type="button" className="admin-dash-logout" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <div className="container admin-dash-main">
        {notice ? (
          <div className="admin-dash-notice" role="status">
            {notice}
          </div>
        ) : null}

        <form className="admin-dash-card admin-dash-form" onSubmit={onCreatePoll}>
          <div className="admin-dash-card__head">
            <h2 className="admin-dash-card__title">Nova votação</h2>
            <p className="admin-dash-card__sub">Preencha os dados e os links das músicas no YouTube.</p>
          </div>

          <div className="admin-dash-fields">
            <label className="admin-dash-field">
              <span>Nome da votação</span>
              <input
                placeholder="Ex.: Top 20 — Maio 2026"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={creating}
                required
              />
            </label>
            <label className="admin-dash-field admin-dash-field--full">
              <span>Descrição</span>
              <textarea
                placeholder="Texto exibido na página pública…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={creating}
                rows={3}
                required
              />
            </label>
            <label className="admin-dash-field">
              <span>Encerra em</span>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                disabled={creating}
                required
              />
            </label>
          </div>

          <div className="admin-dash-songs">
            <p className="admin-dash-songs__hint">
              Cole apenas a URL de cada vídeo; o título será obtido automaticamente no YouTube.
            </p>
            {form.songs.map((song, idx) => (
              <label key={idx} className="admin-dash-field admin-dash-field--full">
                <span>Música {idx + 1}</span>
                <input
                  placeholder="https://www.youtube.com/watch?v=…"
                  value={song.youtubeUrl}
                  onChange={(e) => {
                    const songs = [...form.songs];
                    songs[idx] = { ...songs[idx], youtubeUrl: e.target.value };
                    setForm({ ...form, songs });
                  }}
                  disabled={creating}
                  required
                />
              </label>
            ))}
          </div>

          <div className="admin-dash-form-actions">
            <button
              type="button"
              className="admin-dash-btn admin-dash-btn--secondary"
              onClick={() => setForm({ ...form, songs: [...form.songs, blankSong] })}
              disabled={creating}
            >
              + Adicionar música
            </button>
            <button type="submit" className="admin-dash-btn admin-dash-btn--primary" disabled={creating}>
              {creating ? "Criando…" : "Criar votação"}
            </button>
          </div>

          {formError ? (
            <div className="admin-dash-form-error" role="alert">
              {formError}
            </div>
          ) : null}
        </form>

        <section className="admin-dash-card">
          <div className="admin-dash-section-head">
            <div>
              <h2 className="admin-dash-card__title admin-dash-card__title--sm">Em andamento</h2>
              <p className="admin-dash-card__sub">Votações abertas até a data de encerramento.</p>
            </div>
            <span className="admin-dash-pill admin-dash-pill--live">{activePolls.length}</span>
          </div>
          {activePolls.length === 0 ? (
            <p className="admin-dash-empty">Nenhuma votação ativa no momento.</p>
          ) : (
            <div className="admin-dash-poll-list">
              {activePolls.map((poll) => (
                <article key={poll._id} className="admin-dash-poll">
                  <div className="admin-dash-poll__top">
                    <h3 className="admin-dash-poll__name">{poll.name}</h3>
                    <div className="admin-dash-poll__stats">
                      <span className="admin-dash-mini-pill">{poll.stats.totalVotes} curtidas</span>
                      <span className="admin-dash-mini-pill">{poll.stats.participants} participantes</span>
                    </div>
                  </div>
                  <p className="admin-dash-poll__meta">Criada em {dayjs(poll.createdAt).format("DD/MM/YYYY HH:mm")}</p>
                  <div className="poll-actions-row">
                    <div className="poll-link-row poll-link-row--grow">
                      <code className="poll-url">{getPublicPollUrl(poll.slug)}</code>
                      <button
                        type="button"
                        className="btn-copy"
                        onClick={() => copyPollUrl(poll._id, poll.slug)}
                      >
                        {copiedPollId === String(poll._id) ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                    <Link to={`/admin/polls/${poll._id}`} className="btn-detail">
                      Detalhes
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-dash-card">
          <div className="admin-dash-section-head">
            <div>
              <h2 className="admin-dash-card__title admin-dash-card__title--sm">Finalizadas</h2>
              <p className="admin-dash-card__sub">Encerradas ou após a data limite.</p>
            </div>
            <span className="admin-dash-pill admin-dash-pill--muted">{closedPolls.length}</span>
          </div>
          {closedPolls.length === 0 ? (
            <p className="admin-dash-empty">Nenhuma votação finalizada ainda.</p>
          ) : (
            <div className="admin-dash-poll-list">
              {closedPolls.map((poll) => (
                <article key={poll._id} className="admin-dash-poll admin-dash-poll--done">
                  <div className="admin-dash-poll__top">
                    <h3 className="admin-dash-poll__name">{poll.name}</h3>
                    <div className="admin-dash-poll__stats">
                      <span className="admin-dash-mini-pill">{poll.stats.totalVotes} curtidas</span>
                      <span className="admin-dash-mini-pill">{poll.stats.totalDislikes} não curtidas</span>
                    </div>
                  </div>
                  <p className="admin-dash-poll__meta">
                    Encerrada em: {poll.closedAt ? dayjs(poll.closedAt).format("DD/MM/YYYY HH:mm") : "—"}
                  </p>
                  <div className="poll-actions-row">
                    <div className="poll-link-row poll-link-row--grow">
                      <code className="poll-url">{getPublicPollUrl(poll.slug)}</code>
                      <button
                        type="button"
                        className="btn-copy"
                        onClick={() => copyPollUrl(poll._id, poll.slug)}
                      >
                        {copiedPollId === String(poll._id) ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                    <Link to={`/admin/polls/${poll._id}`} className="btn-detail">
                      Detalhes
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
