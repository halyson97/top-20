import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api";

const VOTE_STORAGE_PREFIX = "top20_voted_poll_";

function getVotedStorageKey(pollId) {
  return `${VOTE_STORAGE_PREFIX}${pollId}`;
}

function readHasVoted(pollId) {
  if (!pollId) return false;
  try {
    return localStorage.getItem(getVotedStorageKey(pollId)) === "1";
  } catch {
    return false;
  }
}

function persistHasVoted(pollId) {
  if (!pollId) return;
  try {
    localStorage.setItem(getVotedStorageKey(pollId), "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export default function PublicPollPage() {
  const { slug } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [participant, setParticipant] = useState({ name: "", email: "", instagram: "" });
  const [votes, setVotes] = useState({});

  useEffect(() => {
    async function load() {
      const pollRes = await api.get(`/polls/${slug}`);
      setPoll(pollRes.data);
      setLoading(false);
    }
    load().catch(() => {
      setMessage({ text: "Votação não encontrada.", type: "error" });
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (!poll?._id) return;
    setAlreadyVoted(readHasVoted(poll._id));
  }, [poll]);

  const votingOpen = useMemo(() => {
    if (!poll) return false;
    return poll.active !== false && new Date(poll.endDate) > new Date();
  }, [poll]);

  const votesCount = useMemo(() => Object.keys(votes).length, [votes]);

  const setVote = (songId, liked) => {
    setVotes((prev) => ({ ...prev, [songId]: liked }));
    setMessage({ text: "", type: "" });
  };

  const onVote = async (e) => {
    e.preventDefault();
    if (!poll) return;
    if (!votingOpen) {
      setMessage({ text: "Esta votação está encerrada.", type: "error" });
      return;
    }
    if (!participant.name.trim() || !participant.email.trim() || !participant.instagram.trim()) {
      setMessage({ text: "Preencha nome, email e Instagram.", type: "error" });
      return;
    }
    const payloadVotes = Object.entries(votes).map(([songId, liked]) => ({ songId, liked }));
    if (payloadVotes.length === 0) {
      setMessage({ text: "Avalie pelo menos uma música com curtir ou não curtir.", type: "error" });
      return;
    }

    try {
      await api.post("/vote", { pollId: poll._id, ...participant, votes: payloadVotes });
      persistHasVoted(poll._id);
      setAlreadyVoted(true);
      setMessage({ text: "", type: "" });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Erro ao enviar voto.", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="public-poll public-poll--loading">
        <div className="public-loading">
          <div className="public-loading__spinner" aria-hidden />
          <p>Carregando votação…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-poll">
      <header className="public-hero">
        <div className="public-hero__inner container">
          <span className="public-badge">Top 20</span>
          {poll ? (
            <>
              <h1 className="public-hero__title">{poll.name}</h1>
              {poll.description !== poll.name && !!poll.description && (
                <p className="public-hero__desc" dangerouslySetInnerHTML={{ __html: poll.description }} />
              )}
              <div className="public-hero__meta">
                <span className="public-pill">
                  Encerra em {dayjs(poll.endDate).format("DD/MM/YYYY [às] HH:mm")}
                </span>
                <span className={`public-pill public-pill--status ${alreadyVoted ? "is-voted" : votingOpen ? "is-open" : "is-closed"}`}>
                  {alreadyVoted ? "Você já votou" : votingOpen ? "Votação aberta" : "Votação encerrada"}
                </span>
              </div>
            </>
          ) : (
            <h1 className="public-hero__title">Votação indisponível</h1>
          )}
        </div>
      </header>

      <main className="container public-main">
        {message.text && (
          <div className={`public-toast public-toast--${message.type}`} role="status">
            {message.text}
          </div>
        )}

        {poll && alreadyVoted && (
          <div className="public-card public-card--thanks" role="status">
            <div className="public-thanks-icon" aria-hidden>
              ✓
            </div>
            <h2 className="public-section-title">Obrigado pela sua participação!</h2>
            <p className="public-thanks-text">
              Seu voto nesta votação foi registrado com sucesso. Você já enviou sua resposta neste dispositivo.
            </p>
          </div>
        )}

        {poll && !alreadyVoted && (
          <form className="public-form-stack" onSubmit={onVote}>
            <section className="public-card public-card--identity">
              <h2 className="public-section-title">Quem está votando</h2>
              <p className="public-section-sub">Um voto por email nesta votação.</p>
              <div className="public-fields">
                <label className="public-field">
                  <span>Nome</span>
                  <input
                    placeholder="Seu nome"
                    value={participant.name}
                    onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
                    disabled={!votingOpen}
                    autoComplete="name"
                    required
                  />
                </label>
                <label className="public-field">
                  <span>Email</span>
                  <input
                    placeholder="seu@email.com"
                    type="email"
                    value={participant.email}
                    onChange={(e) => setParticipant({ ...participant, email: e.target.value })}
                    disabled={!votingOpen}
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="public-field">
                  <span>Instagram</span>
                  <input
                    placeholder="@seuusuario"
                    value={participant.instagram}
                    onChange={(e) => setParticipant({ ...participant, instagram: e.target.value })}
                    disabled={!votingOpen}
                    autoComplete="username"
                    required
                  />
                </label>
              </div>
            </section>

            <section className="public-songs-section">
              <div className="public-songs-head">
                <h2 className="public-section-title">Músicas</h2>
                <p className="public-section-sub">
                  Ouça o trecho e escolha <strong>curtir</strong> ou <strong>não curtir</strong> em cada faixa.
                </p>
              </div>
              <div className="public-song-grid">
                {poll.songs.map((song) => {
                  const choice = votes[song._id];
                  return (
                    <article key={song._id} className="public-song-card">
                      <div className="public-song-card__body">
                        <h3 className="public-song-card__title">{song.name}</h3>
                        {song.artist ? <p className="public-song-card__artist">{song.artist}</p> : null}
                        <div className="public-song-card__player">
                          <iframe title={song.name} src={song.embedUrl} className="player" allowFullScreen />
                        </div>
                        <div className="public-vote-actions">
                          <button
                            type="button"
                            className={`public-btn public-btn--like ${choice === true ? "is-selected" : ""}`}
                            onClick={() => setVote(song._id, true)}
                            disabled={!votingOpen}
                          >
                            Curtir
                          </button>
                          <button
                            type="button"
                            className={`public-btn public-btn--dislike ${choice === false ? "is-selected" : ""}`}
                            onClick={() => setVote(song._id, false)}
                            disabled={!votingOpen}
                          >
                            Não curtir
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <div className="public-submit-bar">
              <p className="public-submit-hint">
                {votesCount === 0
                  ? "Nenhuma música avaliada ainda."
                  : `${votesCount} ${votesCount === 1 ? "música avaliada" : "músicas avaliadas"}.`}
              </p>
              <button type="submit" className="public-btn public-btn--primary" disabled={!votingOpen}>
                Enviar meu voto
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
