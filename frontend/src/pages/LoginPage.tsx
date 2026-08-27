import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

const testAccounts: Array<{
  label: string;
  email: string;
  role: UserRole;
}> = [
  {
    label: "Cliente",
    email: "cliente1@elitedev.test",
    role: "CLIENT",
  },
  {
    label: "Organizador",
    email: "organizer@elitedev.test",
    role: "ORGANIZER",
  },
  {
    label: "Portaria",
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
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
    <main>
      <section>
        <p>ELITE / TICKETS</p>

        <h1>Seu próximo evento começa aqui.</h1>

        <p>
          Entre como cliente, organizador ou portaria para percorrer os
          diferentes fluxos da plataforma.
        </p>

        <div>
          {testAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => selectAccount(account.email)}
            >
              {account.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <small>
          Contas demonstrativas disponíveis para facilitar a avaliação.
        </small>
      </section>
    </main>
  );
}
