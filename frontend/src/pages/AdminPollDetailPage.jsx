import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api";

function getPublicPollUrl(slug) {
  const base = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, "");
  return `${base}/votacao/${slug}`;
}

export default function AdminPollDetailPage() {
  const { pollId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError("");
      try {
        const { data: res } = await api.get(`/polls/${pollId}/report`);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Não foi possível carregar o relatório.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pollId]);

  const copyPublicLink = async (slug) => {
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
        return;
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="admin-report">
        <div className="admin-report-hero admin-report-hero--compact" />
        <div className="container admin-report-main">
          <div className="admin-report-card admin-report-card--error">
            <p className="admin-report-error-msg">{error}</p>
            <Link to="/admin/dashboard" className="admin-report-back">
              ← Voltar ao painel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-report admin-report--loading">
        <div className="admin-report-loading">
          <div className="admin-report-loading__spinner" aria-hidden />
          <p>Carregando relatório…</p>
        </div>
      </div>
    );
  }

  const { poll, ranking, ballots, participants, totalVotes, totalDislikes } = data;
  const isClosed = Boolean(poll.closedAt) || poll.active === false;

  return (
    <div className="admin-report">
      <header className="admin-report-hero">
        <div className="container admin-report-hero__inner">
          <span className="admin-report-hero__badge">Relatório</span>
          <h1 className="admin-report-hero__title">{poll.name}</h1>
          <p className="admin-report-hero__meta">
            Criada em {dayjs(poll.createdAt).format("DD/MM/YYYY [às] HH:mm")}
            {poll.closedAt && ` · Encerrada em ${dayjs(poll.closedAt).format("DD/MM/YYYY [às] HH:mm")}`}
          </p>
          <div className="admin-report-hero__stats">
            <span className="admin-report-stat admin-report-stat--people">{participants} participantes</span>
            <span className="admin-report-stat admin-report-stat--up">{totalVotes} curtidas</span>
            <span className="admin-report-stat admin-report-stat--down">{totalDislikes} não curtidas</span>
            <span className={`admin-report-stat admin-report-stat--status ${isClosed ? "is-off" : "is-on"}`}>
              {isClosed ? "Encerrada" : "Em andamento"}
            </span>
          </div>
          {poll.slug ? (
            <div className="admin-report-hero__link-row">
              <code className="admin-report-url">{getPublicPollUrl(poll.slug)}</code>
              <button type="button" className="admin-report-copy-btn" onClick={() => copyPublicLink(poll.slug)}>
                {copied ? "Copiado!" : "Copiar link"}
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="container admin-report-main">
        <Link to="/admin/dashboard" className="admin-report-back admin-report-back--floating">
          ← Voltar ao painel
        </Link>

        <section className="admin-report-card">
          <div className="admin-report-section-head">
            <h2 className="admin-report-section-title">Ranking</h2>
            <p className="admin-report-section-sub">
              Score = curtidas − não curtidas · ordenado do maior para o menor
            </p>
          </div>
          <ol className="admin-report-ranking">
            {ranking.map((row, idx) => {
              const rank = idx + 1;
              const topClass = rank === 1 ? "is-gold" : rank === 2 ? "is-silver" : rank === 3 ? "is-bronze" : "";
              return (
                <li key={row.songId} className={`admin-report-rank-row ${topClass}`}>
                  <span className="admin-report-rank-pos" aria-label={`Posição ${rank}`}>
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}º`}
                  </span>
                  {row.thumbnail ? (
                    <img src={row.thumbnail} alt="" className="admin-report-rank-thumb" width={88} height={50} />
                  ) : (
                    <div className="admin-report-rank-thumb admin-report-rank-thumb--placeholder" />
                  )}
                  <div className="admin-report-rank-info">
                    <span className="admin-report-rank-name">{row.name}</span>
                    {row.artist ? <span className="admin-report-rank-artist">{row.artist}</span> : null}
                  </div>
                  <div className="admin-report-rank-metrics">
                    <span className="admin-report-metric admin-report-metric--up" title="Curtidas">
                      {row.likes}
                    </span>
                    <span className="admin-report-metric admin-report-metric--down" title="Não curtidas">
                      {row.dislikes}
                    </span>
                    <span className="admin-report-metric admin-report-metric--score" title="Score">
                      {row.score > 0 ? "+" : ""}
                      {row.score}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="admin-report-card">
          <div className="admin-report-section-head">
            <h2 className="admin-report-section-title">Votos registrados</h2>
            <p className="admin-report-section-sub">
              {ballots.length === 0
                ? "Ninguém votou ainda nesta votação."
                : `${ballots.length} participante${ballots.length === 1 ? "" : "s"} · escolhas por música`}
            </p>
          </div>
          {ballots.length === 0 ? (
            <div className="admin-report-empty">Quando houver votos, eles aparecerão aqui com nome, contato e preferências.</div>
          ) : (
            <div className="admin-report-ballots">
              {ballots.map((b) => (
                <article key={b.id} className="admin-report-ballot">
                  <div className="admin-report-ballot__accent" aria-hidden />
                  <div className="admin-report-ballot__main">
                    <div className="admin-report-ballot__top">
                      <span className="admin-report-ballot__avatar" aria-hidden>
                        {(b.name || "?").trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="admin-report-ballot__who">
                        <strong className="admin-report-ballot__name">{b.name}</strong>
                        <span className="admin-report-ballot__when">{dayjs(b.createdAt).format("DD/MM/YYYY HH:mm")}</span>
                      </div>
                    </div>
                    <p className="admin-report-ballot__contact">
                      <span>{b.email}</span>
                      <span className="admin-report-ballot__sep">·</span>
                      <span>{b.instagram}</span>
                    </p>
                    <ul className="admin-report-ballot__choices">
                      {b.choices.map((c, i) => (
                        <li key={`${b.id}-${i}`}>
                          <span className={`admin-report-chip ${c.liked ? "admin-report-chip--like" : "admin-report-chip--dislike"}`}>
                            {c.liked ? "Curtiu" : "Não curtiu"}
                          </span>
                          <span className="admin-report-ballot__song">{c.songName}</span>
                        </li>
                      ))}
                    </ul>
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
