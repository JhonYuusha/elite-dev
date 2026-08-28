import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/useAuth";
import type { UserRole } from "../types/auth";

const testAccounts: Array<{
  label: string;
  description: string;
  email: string;
  role: UserRole;
}> = [
  {
    label: "Cliente",
    description: "Navega, reserva, paga e acessa os ingressos.",
    email: "cliente1@elitedev.test",
    role: "CLIENT",
  },
  {
    label: "Organizador",
    description: "Busca no catálogo TMDb e publica sessões.",
    email: "organizer@elitedev.test",
    role: "ORGANIZER",
  },
  {
    label: "Portaria",
    description: "Valida ingressos na entrada do evento.",
    email: "portaria@elitedev.test",
    role: "GATEKEEPER",
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("cliente1@elitedev.test");
  const [password, setPassword] = useState("EliteDev123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function selectAccount(accountEmail: string) {
    setEmail(accountEmail);
    setPassword("EliteDev123!");
    setError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const user = await login(email, password);

      if (user.role === "ORGANIZER") {
        navigate("/organizer");
        return;
      }

      if (user.role === "GATEKEEPER") {
        navigate("/gate");
        return;
      }

      navigate("/");
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Não foi possível entrar na plataforma.",
        );
      } else {
        setError("Não foi possível entrar na plataforma.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <Link to="/" className="brand">
          ELITE<span>/TICKETS</span>
        </Link>

        <Link to="/" className="back-link">
          ← PROGRAMAÇÃO
        </Link>
      </header>

      <section className="login-layout">
        <div className="login-intro">
          <p className="eyebrow">ACESSO / PLATAFORMA</p>

          <h1>
            ESCOLHA
            <br />
            SEU PAPEL.
          </h1>

          <p>
            O sistema possui três experiências diferentes. Use uma das contas
            demonstrativas para percorrer o fluxo que deseja avaliar.
          </p>

          <div className="account-options">
            {testAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                className={
                  email === account.email
                    ? "account-option account-option-active"
                    : "account-option"
                }
                onClick={() => selectAccount(account.email)}
              >
                <div>
                  <span>{account.label}</span>
                  <strong>{account.description}</strong>
                </div>

                <span>→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="login-panel">
          <div className="login-panel-heading">
            <span>IDENTIFICAÇÃO</span>
            <strong>Entrar na plataforma</strong>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="login-field">
              <span>E-MAIL</span>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="login-field">
              <span>SENHA</span>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "ENTRANDO..." : "ENTRAR"}</span>
              <span>→</span>
            </button>
          </form>

          <div className="demo-note">
            <span>AMBIENTE DE DEMONSTRAÇÃO</span>
            <p>
              As contas já estão preenchidas com dados de teste para facilitar a
              avaliação.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}