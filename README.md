# Elite Dev — Plataforma de Eventos e Ingressos

Projeto full-stack desenvolvido originalmente para o **Desafio Técnico Elite Dev / Verzel** e posteriormente evoluído como projeto de portfólio.

A aplicação representa uma plataforma de sessões de cinema com fluxo completo de compra: criação de sessões a partir de um catálogo externo, seleção individual de assentos, reserva, bomboniere, pagamento simulado, emissão de ingressos, compartilhamento público e validação na portaria por QR Code.

O sistema possui três perfis:

* **Organizador**
* **Cliente**
* **Portaria**

O foco da evolução V2 foi aprofundar regras de negócio, concorrência, arquitetura, testes automatizados, experiência visual e separação de responsabilidades.

---

## Demo em produção

* **Frontend:** https://elite-dev-mocha.vercel.app/
* **Backend API:** https://elite-dev-018i.onrender.com

> O backend utiliza infraestrutura gratuita no Render. Após períodos de inatividade, a primeira requisição pode apresentar uma inicialização mais lenta.

---

## Destaques da V2

* seleção individual de assentos;
* disponibilidade autoritativa no servidor;
* proteção contra reservas concorrentes do mesmo assento;
* checkout com bomboniere;
* preços calculados no backend;
* snapshots de preços na reserva;
* pagamento aprovado e recusado simulados;
* emissão de ingressos vinculados aos assentos;
* QR Code individual por ingresso;
* compartilhamento público separado da credencial de entrada;
* validação atômica na portaria;
* prevenção de uso simultâneo do mesmo ingresso;
* controllers finos e regras de negócio isoladas em services;
* validação de entrada com Zod;
* erros de domínio tipados;
* tratamento global de erros;
* TanStack Query para estado remoto no frontend;
* páginas e dependências pesadas carregadas sob demanda;
* scanner ZXing importado somente quando a câmera é ativada;
* testes automatizados dos fluxos críticos;
* identidade visual própria com direção editorial inspirada em cinema.

---

## Fluxo ponta a ponta

```text
Organizador
    ↓
Busca filme no TMDb
    ↓
Cria e publica sessão
    ↓
Assentos são disponibilizados
    ↓
Cliente escolhe sessão
    ↓
Seleciona assentos
    ↓
Cria reserva
    ↓
Adiciona itens da bomboniere
    ↓
Pagamento simulado
    ├── DECLINED → assentos retornam ao estoque
    └── APPROVED
            ↓
       Ingressos emitidos
            ↓
       QR individual
            ↓
   Compartilhamento público
            ↓
      Validação na portaria
            ↓
       VALID → USED
```

---

## Funcionalidades

### Organizador

* autenticação com perfil `ORGANIZER`;
* pesquisa de filmes utilizando o TMDb;
* seleção de filme a partir do catálogo externo;
* criação de sessões;
* definição de:

  * data e horário;
  * local;
  * endereço;
  * capacidade;
  * preço;
* publicação da sessão;
* painel com sessões do organizador;
* edição de informações comerciais;
* alteração de preço;
* adição de novos lugares;
* proteção contra criação acidental de sessões praticamente duplicadas;
* interface operacional dedicada ao gerenciamento da programação.

### Cliente

* visualização de sessões publicadas e futuras;
* busca de eventos;
* página de detalhes;
* seleção visual e individual de assentos;
* limite de lugares por reserva;
* criação de reserva;
* atualização de disponibilidade após conflitos;
* bomboniere no checkout;
* seleção de pipoca, bebidas e combos;
* cálculo dos valores no servidor;
* pagamento simulado:

  * `APPROVED`;
  * `DECLINED`;
* emissão de ingressos após aprovação;
* carteira de ingressos;
* identificação do assento em cada ingresso;
* QR Code individual;
* código manual;
* link público de compartilhamento.

### Portaria

* autenticação com perfil `GATEKEEPER`;
* seleção da sessão;
* leitura de QR Code utilizando a câmera;
* carregamento do scanner somente quando necessário;
* validação manual por código;
* tratamento de:

  * ingresso válido;
  * ingresso utilizado;
  * ingresso inválido;
  * ingresso pertencente a outra sessão;
* proteção contra duas validações simultâneas do mesmo ingresso.

---

## Funcionalidades e opcionais

| Item                                  | Status             |
| ------------------------------------- | ------------------ |
| Busca e filtro de eventos             | ✅ Implementado     |
| Painel do organizador                 | ✅ Implementado     |
| Catálogo externo TMDb                 | ✅ Implementado     |
| Seleção individual de assentos        | ✅ Implementado     |
| Mapa visual de lugares                | ✅ Implementado     |
| Controle concorrente de assentos      | ✅ Implementado     |
| Bomboniere                            | ✅ Implementado     |
| Pagamento simulado                    | ✅ Implementado     |
| QR Code                               | ✅ Implementado     |
| Compartilhamento público              | ✅ Implementado     |
| Scanner pela câmera                   | ✅ Implementado     |
| Testes automatizados                  | ✅ Implementado     |
| Docker Compose                        | ✅ Implementado     |
| Aplicação publicada                   | ✅ Implementado     |
| Cancelamento pós-compra com reembolso | ❌ Não implementado |
| Gateway financeiro real               | ❌ Não implementado |

---

## Tecnologias

### Frontend

* React
* TypeScript
* Vite
* React Router
* TanStack Query
* Axios
* Motion
* `qrcode`
* `@zxing/browser`
* CSS modularizado por fluxo/página

### Backend

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL
* Zod
* JSON Web Token
* bcrypt
* TMDb API
* Vitest
* Supertest

### Infraestrutura

* Docker
* Docker Compose
* PostgreSQL
* Vercel
* Render

---

## Arquitetura

O repositório é dividido em backend e frontend:

```text
elite-dev/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/
│       ├── errors/
│       ├── lib/
│       ├── middlewares/
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       ├── tests/
│       ├── app.ts
│       └── index.ts
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       ├── types/
│       └── utils/
│
├── docker-compose.yml
└── README.md
```

### Backend

As rotas HTTP encaminham as requisições para controllers finos.

Os controllers não concentram as principais regras de negócio. Essas regras ficam nos services responsáveis por autenticação, eventos, reservas, pagamentos, ingressos, catálogo e validação de entrada.

```text
request
   ↓
route
   ↓
middleware
   ↓
schema / validação
   ↓
controller
   ↓
service
   ↓
Prisma
   ↓
PostgreSQL
```

Erros esperados da aplicação são representados por erros de domínio e enviados para um middleware global de tratamento.

### Frontend

O frontend separa:

* páginas;
* componentes;
* hooks;
* services HTTP;
* tipos;
* utilitários;
* estilos específicos por fluxo.

TanStack Query gerencia operações e dados remotos em fluxos como:

* eventos;
* catálogo;
* reservas;
* pagamento;
* produtos;
* ingressos;
* compartilhamento;
* portaria.

A responsabilidade de realizar requisições não fica diretamente espalhada pelas páginas.

---

## Modelagem de dados

### `User`

Representa os usuários da plataforma.

Perfis:

```text
ORGANIZER
CLIENT
GATEKEEPER
```

### `Event`

Representa uma sessão.

Entre seus dados estão:

* organizador;
* referência externa do TMDb;
* título;
* descrição;
* imagem;
* data e horário;
* local;
* endereço;
* capacidade;
* disponibilidade;
* preço;
* status.

### `Seat`

Representa um lugar individual da sessão.

Cada assento possui informações como:

* fileira;
* número;
* identificação visual;
* tipo;
* status.

Os estados distinguem lugares:

```text
AVAILABLE
RESERVED
SOLD
```

### `Reservation`

Representa a intenção de compra do cliente.

Estados principais:

```text
PENDING
PAID
PAYMENT_FAILED
CANCELLED
```

A reserva mantém valores autoritativos calculados pelo servidor:

* preço unitário dos ingressos;
* subtotal dos ingressos;
* subtotal da bomboniere;
* total.

### `Product`

Representa produtos disponíveis no checkout.

Categorias utilizadas:

```text
POPCORN
DRINK
COMBO
```

### `ReservationItem`

Representa um item da bomboniere adicionado à reserva.

O servidor recebe identificador e quantidade do produto e calcula o preço.

O valor não é confiado ao frontend.

### `Ticket`

É criado após um pagamento aprovado.

Cada ingresso é associado a um assento e possui:

* estado;
* QR Code;
* credencial de validação;
* token público de compartilhamento.

Estados:

```text
VALID
USED
CANCELLED
```

---

## Decisões técnicas

### Seleção individual de assentos

A V2 substituiu o fluxo inicial baseado apenas em quantidade por lugares individualmente identificáveis.

Isso tornou possível representar uma sala e impedir que dois clientes adquiram o mesmo lugar.

A interface apresenta o mapa visual, mas o backend continua sendo a fonte definitiva sobre disponibilidade.

---

### Concorrência na reserva

Um dos cenários críticos ocorre quando dois clientes tentam reservar o mesmo último assento ao mesmo tempo.

Essa situação não pode ser solucionada apenas desabilitando um botão no frontend.

O backend utiliza operações condicionais no banco para garantir que apenas uma requisição consiga alterar o assento disponível.

Assim, mesmo com requisições concorrentes, somente uma reserva é concluída.

Esse comportamento possui teste automatizado específico.

---

### Valores monetários em centavos

Valores financeiros são armazenados como inteiros.

Exemplo:

```text
R$ 35,90 → 3590
```

Isso evita problemas de precisão relacionados a ponto flutuante.

---

### Servidor como fonte de verdade

O frontend nunca é considerado autoridade para:

* disponibilidade de assentos;
* preço dos ingressos;
* preço da bomboniere;
* total da reserva;
* validade do ingresso.

Essas informações são validadas ou calculadas no backend.

---

### Snapshots de preços

Reservas e itens armazenam os valores aplicados no momento da compra.

Isso evita que uma alteração futura no preço de um evento ou produto modifique retroativamente uma transação antiga.

---

### Bomboniere

Produtos adicionais fazem parte da mesma reserva.

O cliente envia apenas:

```text
productId
quantity
```

O backend consulta o preço atual, aplica as regras de quantidade e recalcula os subtotais e o total.

Enquanto a reserva estiver `PENDING`, os produtos podem ser alterados.

---

### Pagamento simulado

O projeto não integra uma operadora financeira real.

O backend permite simular:

```text
APPROVED
DECLINED
```

Quando aprovado:

1. a reserva passa para `PAID`;
2. os assentos passam para vendidos;
3. os ingressos são emitidos.

Quando recusado:

1. a reserva passa para `PAYMENT_FAILED`;
2. os lugares anteriormente reservados voltam a ficar disponíveis.

---

### Compartilhamento não é validação

A página pública utiliza um token próprio de compartilhamento.

Essa credencial é diferente do código utilizado para validar entrada.

Assim:

```text
link público ≠ credencial da portaria
```

A página compartilhada pode exibir informações do ingresso sem expor o segredo necessário para utilizá-lo na entrada.

---

### Validação atômica de ingresso

A mudança:

```text
VALID → USED
```

é realizada de forma condicional no banco.

Isso impede que duas requisições simultâneas utilizem o mesmo ingresso.

Em uma disputa concorrente:

```text
requisição A → VALID
requisição B → ALREADY_USED
```

Esse comportamento também possui teste automatizado.

---

### TMDb como catálogo externo

O TMDb fornece os metadados dos filmes.

Na criação da sessão, o backend utiliza o identificador externo para buscar informações diretamente na fonte.

Dessa forma, dados do catálogo não dependem de texto arbitrário enviado pelo navegador.

---

### Sessões próximas duplicadas

Existe uma proteção contra criação acidental do mesmo filme, no mesmo local, em horários extremamente próximos.

A janela utilizada é de aproximadamente 30 minutos.

Essa é uma regra de produto da aplicação.

---

### Capacidade após publicação

O organizador pode adicionar capacidade.

Uma redução irrestrita não é permitida porque poderia invalidar reservas ou ingressos já existentes.

---

## Code splitting e performance

As principais páginas são carregadas sob demanda através de lazy loading.

Isso evita enviar imediatamente código de rotas que o usuário talvez nunca abra.

### Scanner QR

`@zxing/browser` é uma das dependências mais pesadas da aplicação.

Por isso, ela não é importada diretamente no bundle inicial.

O módulo é carregado dinamicamente somente quando o operador da portaria pressiona para ativar a câmera:

```ts
const { BrowserQRCodeReader } = await import("@zxing/browser");
```

No build atual, o chunk do ZXing possui aproximadamente:

```text
435 kB
```

e fica separado do fluxo inicial.

Assim, clientes e organizadores não precisam baixar o scanner da portaria durante a navegação comum.

---

## Segurança e integridade

### Autenticação

A aplicação utiliza JWT.

Rotas protegidas verificam autenticação e perfil no backend.

Exemplos:

* `ORGANIZER` cria e gerencia sessões;
* `CLIENT` realiza reservas e pagamentos;
* `GATEKEEPER` valida ingressos.

---

### Autorização

A interface pode esconder funcionalidades, mas a proteção real acontece no servidor.

Um cliente tentando acessar diretamente uma rota exclusiva de organizador recebe `403 Forbidden`.

Esse cenário possui teste automatizado.

---

### QR Code

A credencial utilizada na portaria é emitida pelo backend.

O banco continua sendo a fonte definitiva sobre o estado do ingresso.

Mesmo possuindo um código válido, um ingresso já marcado como `USED` não pode ser utilizado novamente.

---

### Compartilhamento público

O token público não corresponde à credencial da entrada.

A rota compartilhada foi desenhada apenas para visualização.

---

### Controle de disponibilidade

A disponibilidade mostrada pelo frontend é informativa.

A confirmação final ocorre no backend durante a reserva.

Isso protege o sistema contra estados desatualizados e concorrência.

---

### Sessão expirada

O frontend possui tratamento centralizado para respostas de autenticação inválida ou expirada.

Ao identificar determinados erros `401`, a aplicação consegue reagir de maneira consistente em vez de cada página implementar sua própria regra.

---

## Testes automatizados

O backend utiliza:

* Vitest;
* Supertest.

Estado atual da suíte:

```text
Test Files: 7 passed
Tests:      10 passed
```

### Cenários cobertos

#### Aplicação

* health check.

#### Autorização

* usuário `CLIENT` não consegue acessar rota exclusiva de `ORGANIZER`.

#### Reserva e bomboniere

* preços dos produtos são obtidos no servidor;
* subtotais são calculados no backend;
* total final da reserva é calculado corretamente;
* validações de itens e quantidades.

#### Pagamento recusado

* reserva muda para `PAYMENT_FAILED`;
* disponibilidade é restaurada.

#### Pagamento aprovado

* reserva é concluída;
* ingressos são emitidos.

#### Concorrência de reserva

Duas requisições tentam reservar o mesmo assento simultaneamente.

Resultado esperado:

```text
1 sucesso
1 conflito
```

Nunca duas reservas para o mesmo lugar.

#### Concorrência na portaria

Duas requisições tentam utilizar simultaneamente o mesmo ingresso.

Resultado esperado:

```text
1 VALID
1 ALREADY_USED
```

---

## Identidade visual

A V2 também recebeu uma reformulação completa de interface.

A direção visual evita o padrão genérico de dashboards e produtos SaaS e utiliza uma linguagem inspirada em:

* cartazes de cinema;
* bilheteria;
* programação cultural;
* ingressos físicos;
* grids editoriais.

A interface utiliza:

* fundos escuros;
* tons quentes;
* laranja queimado como destaque;
* tipografia condensada;
* hierarquia editorial;
* poucas bordas arredondadas;
* animações discretas;
* pôsteres como elementos principais.

Fluxos como Home, Organizador, Detalhes, Checkout, Meus Ingressos, Compartilhamento e Portaria possuem layouts próprios.

---

## Pré-requisitos

Para execução local:

* Node.js 22.x;
* npm;
* Docker;
* Docker Compose;
* credencial de leitura da API do TMDb.

---

## Configuração

Clone o repositório:

```bash
git clone <URL-DO-REPOSITORIO>
cd elite-dev
```

Instale o backend:

```bash
cd backend
npm install
```

Instale o frontend:

```bash
cd ../frontend
npm install
```

---

## Banco de dados

O projeto utiliza PostgreSQL.

Na raiz:

```bash
docker compose up -d
```

Confira:

```bash
docker compose ps
```

A configuração padrão local utiliza:

```text
host: localhost
port: 5432
database: elite_dev
user: elite_dev
password: elite_dev
```

URL:

```text
postgresql://elite_dev:elite_dev@localhost:5432/elite_dev
```

> Essas credenciais pertencem exclusivamente ao ambiente local fornecido pelo Docker Compose.

---

## Prisma

Entre no backend:

```bash
cd backend
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Aplique as migrations:

```bash
npx prisma migrate deploy
```

Popule o banco:

```bash
npx prisma db seed
```

Para resetar completamente o banco local:

```bash
npx prisma migrate reset
```

> O reset remove os dados existentes no banco configurado.

---

## Variáveis de ambiente

Segredos reais não devem ser versionados.

### Backend

```bash
cd backend
cp .env.example .env
```

Exemplo:

```env
DATABASE_URL=postgresql://elite_dev:elite_dev@localhost:5432/elite_dev
JWT_SECRET=change-this-secret
TMDB_ACCESS_TOKEN=your-tmdb-read-access-token
PORT=3000
```

Para gerar um segredo local:

```bash
openssl rand -hex 32
```

### Frontend

```bash
cd frontend
cp .env.example .env
```

Exemplo:

```env
VITE_API_URL=http://localhost:3000
```

---

## Seed e usuários de teste

Após:

```bash
cd backend
npx prisma db seed
```

ficam disponíveis:

| Perfil      | E-mail                    | Senha          |
| ----------- | ------------------------- | -------------- |
| Organizador | `organizer@elitedev.test` | `EliteDev123!` |
| Cliente 1   | `cliente1@elitedev.test`  | `EliteDev123!` |
| Cliente 2   | `cliente2@elitedev.test`  | `EliteDev123!` |
| Portaria    | `portaria@elitedev.test`  | `EliteDev123!` |

Essas credenciais são dados exclusivos de demonstração.

O seed também cria dados necessários para facilitar a avaliação da aplicação.

---

## Como executar

### Banco

```bash
docker compose up -d
```

### Backend

```bash
cd backend
npm run dev
```

API local:

```text
http://localhost:3000
```

### Frontend

```bash
cd frontend
npm run dev
```

Normalmente:

```text
http://localhost:5173
```

---

## Fluxos para avaliação

### Organizador

1. entre como `organizer@elitedev.test`;
2. abra o painel;
3. pesquise um filme;
4. selecione um resultado do TMDb;
5. preencha os dados da sessão;
6. publique;
7. confira a sessão na programação;
8. teste o gerenciamento da sessão.

---

### Cliente

1. entre como `cliente1@elitedev.test`;
2. abra uma sessão futura;
3. escolha os assentos;
4. continue para a reserva;
5. selecione itens da bomboniere, se desejar;
6. atualize o pedido;
7. simule pagamento aprovado;
8. abra **Meus Ingressos**;
9. confira assento e QR Code;
10. copie o link público de compartilhamento.

Também é possível criar outra reserva e simular `DECLINED`.

Nesse caso, os assentos devem voltar a ficar disponíveis.

---

### Compartilhamento

1. copie o link público de um ingresso;
2. abra em aba privada;
3. confirme que a página funciona sem autenticação;
4. verifique os dados da sessão e assento;
5. confirme que a credencial de validação não é exposta.

---

### Portaria

1. entre como `portaria@elitedev.test`;
2. selecione a sessão;
3. ative a câmera ou utilize o campo manual;
4. valide um ingresso ainda não utilizado.

Primeiro uso:

```text
VALID
```

Segundo uso do mesmo ingresso:

```text
ALREADY_USED
```

Também podem ser verificados:

```text
INVALID
WRONG_EVENT
```

A câmera depende da permissão do navegador e, em produção, utiliza contexto HTTPS.

---

## Build e validação

### Backend

Build:

```bash
cd backend
npm run build
```

Testes:

```bash
npm test
```

Estado validado da V2:

```text
Test Files  7 passed
Tests       10 passed
```

### Frontend

Build:

```bash
cd frontend
npm run build
```

Lint:

```bash
npm run lint
```

No estado atual, ambos finalizam sem erros.

---

## Deploy

### Frontend

Vercel:

https://elite-dev-mocha.vercel.app/

### Backend

Render:

https://elite-dev-018i.onrender.com

O PostgreSQL de produção também está hospedado no Render.

Variáveis como:

* `DATABASE_URL`;
* `JWT_SECRET`;
* `TMDB_ACCESS_TOKEN`;

permanecem configuradas exclusivamente nos ambientes de hospedagem.

---

## Limitações atuais

Não fazem parte da implementação:

* cancelamento de compra já aprovada com reembolso;
* gateway financeiro real;
* processamento de cartão real;
* emissão fiscal;
* recuperação de senha;
* envio automático de ingresso por e-mail;
* revenda entre usuários;
* aplicativo mobile nativo;
* escolha gráfica de diferentes plantas de sala;
* painel administrativo global.

### Cancelamento

Existe restauração de disponibilidade após um **pagamento recusado**.

Isso não deve ser confundido com cancelamento de uma compra já aprovada.

Um fluxo real de cancelamento exigiria políticas de reembolso, invalidação de ingressos e integração com pagamento.

---

## Uso de Inteligência Artificial

Ferramentas de IA foram utilizadas como apoio de **pair programming** durante o desenvolvimento e a evolução da aplicação.

O uso incluiu:

* discussão de arquitetura;
* revisão de regras de negócio;
* análise de código;
* investigação de erros;
* refatoração;
* sugestões de testes;
* análise de concorrência;
* organização do frontend;
* revisão de segurança;
* otimização de carregamento;
* documentação.

A IA não foi tratada como fonte única de decisão.

O processo envolveu:

* leitura e validação das alterações;
* testes manuais;
* testes automatizados;
* build;
* lint;
* análise dos resultados;
* ajustes manuais;
* revisão da arquitetura antes de integrar mudanças.

Entre as decisões amadurecidas durante a evolução estão:

* separar controllers e regras de negócio;
* validar payloads antes da camada de domínio;
* representar erros esperados de forma tipada;
* utilizar assentos individuais;
* tratar concorrência no servidor;
* manter preços autoritativos no backend;
* utilizar snapshots financeiros;
* separar compartilhamento e validação;
* validar ingresso atomicamente;
* carregar ZXing somente quando necessário;
* decompor páginas grandes em componentes com responsabilidades específicas.

O desenvolvedor permanece responsável pelo entendimento, integração, teste e resultado final do código produzido com auxílio dessas ferramentas.

---

## Evolução da V2

A segunda etapa do projeto surgiu a partir de uma revisão técnica da implementação inicial.

Entre os principais pontos trabalhados estavam:

```text
Backend
├── controllers mais finos
├── services
├── schemas
├── erros tipados
├── middleware global
├── concorrência
└── testes

Frontend
├── decomposição de páginas
├── services
├── hooks
├── TanStack Query
├── code splitting
└── estados de interface

Produto
├── mapa de assentos
├── bomboniere
├── tickets por assento
├── compartilhamento
└── experiência visual
```

Em vez de apenas corrigir pontos isolados, a V2 foi utilizada para aprofundar o projeto como exercício de engenharia de software e produto.

---

## Referências

### Produto

* Ingresso.com
  https://www.ingresso.com/

* Eventim Brasil
  https://www.eventim.com.br/

* Sympla
  https://www.sympla.com.br/

### API externa

* TMDb API
  https://developer.themoviedb.org/

* The Movie Database
  https://www.themoviedb.org/

### Frontend

* React
  https://react.dev/

* Vite
  https://vite.dev/

* TanStack Query
  https://tanstack.com/query

* ZXing Browser
  https://github.com/zxing-js/browser

* qrcode
  https://www.npmjs.com/package/qrcode

### Backend

* Node.js
  https://nodejs.org/

* Express
  https://expressjs.com/

* Prisma ORM
  https://www.prisma.io/docs

* PostgreSQL
  https://www.postgresql.org/docs/

* Zod
  https://zod.dev/

* Vitest
  https://vitest.dev/

* Supertest
  https://github.com/ladjs/supertest

* JSON Web Token
  https://jwt.io/

### Infraestrutura

* Docker
  https://docs.docker.com/

* Docker Compose
  https://docs.docker.com/compose/

---

## Autor

**João Victor**

Projeto desenvolvido originalmente como solução para o **Desafio Técnico Elite Dev / Verzel** e posteriormente expandido como projeto full-stack de portfólio.