\*\*#

## Demo em produção

-   **Frontend:** https://elite-dev-mocha.vercel.app/
-   **Backend API:** https://elite-dev-018i.onrender.com

> O backend utiliza infraestrutura gratuita no Render. A primeira
> requisição após um período de inatividade pode apresentar uma
> inicialização mais lenta.

Elite Dev --- Plataforma de Eventos e Ingressos\*\*

Projeto desenvolvido para o **\*\*Desafio Técnico Elite Dev /
Verzel\*\***, com foco em uma plataforma de criação, venda,
compartilhamento e validação de ingressos para eventos.

A aplicação implementa três perfis distintos ---
**\*\*Organizador\*\***, **\*\*Cliente\*\*** e **\*\*Portaria\*\*** ---
e cobre o fluxo principal de ponta a ponta: criação de sessão a partir
de um catálogo externo, reserva de ingressos, pagamento simulado,
emissão de QR Code, compartilhamento do ingresso e validação na entrada.

---

**\## Sumário**

\- \[Visão geral\](#visão-geral)

\- \[Funcionalidades\](#funcionalidades)

\- \[Opcionais do desafio\](#opcionais-do-desafio)

\- \[Tecnologias\](#tecnologias)

\- \[Arquitetura\](#arquitetura)

\- \[Modelagem de dados\](#modelagem-de-dados)

\- \[Decisões técnicas\](#decisões-técnicas)

\- \[Segurança e integridade\](#segurança-e-integridade)

\- \[Pré-requisitos\](#pré-requisitos)

\- \[Configuração do projeto\](#configuração-do-projeto)

\- \[Banco de dados\](#banco-de-dados)

\- \[Variáveis de ambiente\](#variáveis-de-ambiente)

\- \[Seed e usuários de teste\](#seed-e-usuários-de-teste)

\- \[Como executar\](#como-executar)

\- \[Fluxos para avaliação\](#fluxos-para-avaliação)

\- \[Build e validação\](#build-e-validação)

\- \[Limitações e itens não
implementados\](#limitações-e-itens-não-implementados)

\- \[Uso de Inteligência Artificial\](#uso-de-inteligência-artificial)

\- \[Referências\](#referências)

---

**\## Visão geral**

A proposta do projeto é representar uma plataforma de eventos com
separação clara de responsabilidades:

\- **\*\*Organizador:\*\*** busca filmes em um catálogo externo, cria
sessões e gerencia informações comerciais.

\- **\*\*Cliente:\*\*** visualiza eventos publicados, escolhe uma
quantidade de ingressos, realiza uma reserva, simula o pagamento e
recebe seus ingressos.

\- **\*\*Portaria:\*\*** valida ingressos por QR Code utilizando a
câmera ou, como alternativa, por código manual.

A aplicação utiliza o **\*\*TMDb\*\*** como fonte externa de filmes. O
organizador escolhe um filme retornado pela API e então informa os dados
específicos da sessão, como data, local, capacidade e preço.

*\> O TMDb é utilizado apenas como catálogo externo de conteúdo.
Sessões, disponibilidade, reservas, pagamentos simulados e ingressos são
entidades próprias da aplicação.*

---

**\## Funcionalidades**

**\### Organizador**

\- Autenticação com perfil \`ORGANIZER\`.

\- Busca de filmes pelo TMDb.

\- Seleção de filme a partir do catálogo externo.

\- Criação de sessão com:

\- data e horário;

\- local;

\- endereço;

\- capacidade;

\- preço.

\- Publicação da sessão.

\- Painel com as sessões pertencentes ao organizador.

\- Alteração do preço da sessão.

\- Adição de novos lugares à capacidade.

\- Proteção contra criação acidental de sessões praticamente duplicadas
do mesmo filme, local e horário.

**\### Cliente**

\- Visualização dos eventos publicados e futuros.

\- Busca de eventos.

\- Página de detalhes da sessão.

\- Escolha da quantidade de ingressos.

\- Reserva com controle de disponibilidade.

\- Checkout com pagamento simulado:

\- aprovado;

\- recusado.

\- Emissão de ingressos após aprovação.

\- Visualização dos próprios ingressos.

\- QR Code individual por ingresso.

\- Código manual de validação.

\- Link público de compartilhamento do ingresso.

**\### Portaria**

\- Autenticação com perfil \`GATEKEEPER\`.

\- Seleção do evento a ser validado.

\- Leitura de QR Code pela câmera.

\- Validação manual por código.

\- Respostas distintas para:

\- ingresso válido;

\- ingresso já utilizado;

\- ingresso inválido;

\- ingresso pertencente a outro evento.

---

**\## Opcionais do desafio**

\| Item opcional \| Status \| Observação \|

\| --- \| --- \| --- \|

\| Busca e filtro de eventos \| ✅ Implementado \| Busca disponível na
programação \|

\| Painel do organizador \| ✅ Implementado \| Criação e gerenciamento
das próprias sessões \|

\| Cancelamento com devolução ao estoque \| ❌ Não implementado \| O
fluxo de pagamento recusado devolve o estoque, mas cancelamento
posterior de compra não foi implementado \|

\| Mapa de assentos em tempo real \| ❌ Não implementado \| Foi adotado
o modelo de pista/quantidade \|

\| Docker Compose \| ✅ Implementado \| PostgreSQL local configurado por
container \|

\| Testes automatizados \| ❌ Não implementado até o momento \| Os
fluxos principais foram validados manualmente \|

\| Aplicação publicada \| ✅ Implementado \| Frontend na Vercel e
API/banco no Render \|

---

**\## Tecnologias**

**\### Frontend**

\- React

\- TypeScript

\- Vite

\- Axios

\- React Router

\- \`qrcode\` para geração visual dos QR Codes

\- \`@zxing/browser\` para leitura de QR Code pela câmera

**\### Backend**

\- Node.js

\- TypeScript

\- Express

\- Prisma ORM

\- PostgreSQL

\- JSON Web Token (JWT)

\- bcrypt

\- TMDb API

**\### Infraestrutura**

\- Docker

\- Docker Compose

\- PostgreSQL 16 no ambiente local

-   Vercel para publicação do frontend

-   Render para publicação da API e PostgreSQL em produção

---

**\## Arquitetura**

O projeto está dividido em duas aplicações principais:

\`\`\`text

elite-dev/

├── backend/

│ ├── prisma/

│ │ ├── migrations/

│ │ ├── schema.prisma

│ │ └── seed.ts

│ ├── src/

│ │ ├── controllers/

│ │ ├── generated/

│ │ ├── lib/

│ │ ├── middlewares/

│ │ ├── routes/

│ │ ├── services/

│ │ └── index.ts

│ ├── .env.example

│ └── package.json

├── frontend/

│ ├── src/

│ │ ├── context/

│ │ ├── pages/

│ │ ├── services/

│ │ └── types/

│ ├── .env.example

│ └── package.json

├── docker-compose.yml

└── README.md

\`\`\`

O frontend se comunica com o backend através de uma API HTTP. O backend
concentra autenticação, autorização, regras de negócio, integração com o
TMDb e acesso ao PostgreSQL.

As regras críticas não dependem apenas da interface. Permissões de
perfil, controle de estoque e validação de ingresso são aplicados no
backend.

---

**\## Modelagem de dados**

As entidades principais são:

**\### \`User\`**

Representa os usuários da plataforma.

Perfis disponíveis:

\`\`\`text

ORGANIZER

CLIENT

GATEKEEPER

\`\`\`

**\### \`Event\`**

Representa uma sessão publicada pelo organizador.

Entre os principais campos estão:

\- organizador;

\- identificador externo do TMDb;

\- título;

\- descrição;

\- imagem;

\- data e horário;

\- local;

\- capacidade total;

\- ingressos disponíveis;

\- preço em centavos;

\- status.

**\### \`Reservation\`**

Representa uma reserva realizada por um cliente.

Estados utilizados:

\`\`\`text

PENDING

PAID

PAYMENT_FAILED

CANCELLED

\`\`\`

**\### \`Ticket\`**

Representa um ingresso emitido após um pagamento aprovado.

Estados utilizados:

\`\`\`text

VALID

USED

CANCELLED

\`\`\`

Cada ingresso possui também um token próprio de compartilhamento.

---

**\## Decisões técnicas**

**\### Quantidade em vez de mapa de assentos**

O desafio permitia tanto um fluxo baseado em assentos quanto um fluxo de
pista/setor por quantidade.

Foi escolhido o modelo de **\*\*quantidade\*\***, inspirado em
plataformas de eventos nas quais o cliente escolhe quantos ingressos
deseja adquirir em um determinado setor.

Por isso, não existe uma identidade individual de cadeira na aplicação.
A regra equivalente a "não vender o mesmo lugar duas vezes" é garantir
que a quantidade vendida nunca ultrapasse a capacidade disponível.

Essa garantia é tratada no backend, e não apenas na interface.

**\### Valores monetários em centavos**

Os preços são persistidos como números inteiros em centavos.

Exemplo:

\`\`\`text

R\$ 35,90 -\> 3590

\`\`\`

Isso evita erros comuns de precisão envolvendo valores monetários em
ponto flutuante.

**\### TMDb como catálogo externo**

O frontend não envia livremente título, descrição e imagem como fonte
definitiva do evento.

Ao criar uma sessão, o backend utiliza o identificador do filme e
consulta o TMDb para recuperar dados do catálogo. Dessa forma, os dados
externos utilizados na sessão vêm de uma fonte confiável e conhecida
pelo servidor.

**\### Sessões próximas duplicadas**

Foi adicionada uma proteção para impedir que o mesmo organizador
publique acidentalmente o mesmo filme no mesmo local em horários
extremamente próximos.

Atualmente, a aplicação considera conflitante uma sessão do mesmo filme
e local dentro de uma janela aproximada de **\*\*30 minutos\*\***.

Essa é uma regra de produto adotada para evitar duplicidade acidental, e
não uma limitação imposta pelo TMDb.

**\### Capacidade do evento**

Após a publicação, o painel permite **\*\*adicionar capacidade\*\***,
mas não reduzir livremente a capacidade total.

Essa escolha evita criar inconsistências quando já existem reservas ou
ingressos vendidos.

Uma redução segura exigiria regras adicionais sobre reservas existentes,
cancelamentos e possíveis reembolsos, que não fazem parte do escopo
obrigatório.

**\### Pagamento simulado**

O checkout não integra um gateway financeiro real.

A API permite simular dois resultados:

\`\`\`text

APPROVED

DECLINED

\`\`\`

Quando aprovado:

1\. a reserva passa para \`PAID\`;

2\. os ingressos são emitidos.

Quando recusado:

1\. a reserva passa para \`PAYMENT_FAILED\`;

2\. a quantidade anteriormente reservada é devolvida ao estoque.

**\### Compartilhamento não é validação**

O token utilizado na URL pública de compartilhamento **\*\*não é o mesmo
dado utilizado para validar a entrada\*\***.

Isso foi feito propositalmente para separar:

\- uma credencial de visualização/compartilhamento;

\- uma credencial de validação na portaria.

Assim, compartilhar a página pública do ingresso não transforma
automaticamente aquela URL em uma credencial de entrada.

---

**\## Segurança e integridade**

**\### Autenticação**

A aplicação utiliza JWT para autenticação.

Rotas sensíveis são protegidas no backend e também verificam o perfil
necessário.

Exemplos:

\- somente \`ORGANIZER\` pode criar sessões;

\- somente \`CLIENT\` pode criar reservas e pagar;

\- somente \`GATEKEEPER\` pode validar ingressos.

**\### QR Code assinado**

O conteúdo utilizado no QR Code é um JWT assinado pelo backend
utilizando \`JWT_SECRET\`.

O payload identifica o ingresso e o evento correspondente.

Uma alteração manual no conteúdo invalida a assinatura, impedindo que um
usuário simplesmente fabrique um QR Code válido alterando um
identificador.

Além da assinatura, o banco continua sendo a fonte de verdade para o
estado do ingresso.

**\### QR sem expiração arbitrária**

O token do ingresso não recebe uma expiração fixa como 30 dias.

A validade real depende do ingresso persistido no banco, evitando que um
ingresso legítimo para um evento distante expire apenas porque o evento
está marcado para mais de 30 dias no futuro.

**\### Validação única**

Na entrada, a alteração de \`VALID\` para \`USED\` é realizada de forma
atômica.

Isso evita que duas requisições simultâneas consigam consumir o mesmo
ingresso com sucesso.

Uma nova tentativa recebe o resultado \`ALREADY_USED\`.

**\### Código manual**

A portaria também pode utilizar o UUID completo do ingresso como código
manual.

Foi utilizado o identificador completo para evitar depender de um
prefixo curto que poderia gerar ambiguidades.

**\### Controle de estoque**

A reserva reduz a disponibilidade do evento no banco de dados.

O controle foi implementado para impedir que requisições concorrentes
consigam vender uma quantidade superior ao estoque existente.

O frontend exibe a disponibilidade ao usuário, mas a validação
definitiva acontece no backend.

---

**\## Pré-requisitos**

Para executar o projeto localmente:

\- Node.js 22.x recomendado;

\- npm;

\- Docker;

\- Docker Compose;

\- uma credencial de leitura da API do TMDb.

O desenvolvimento foi realizado com Node.js 22.

---

**\## Configuração do projeto**

Clone o repositório:

\`\`\`bash

git clone \<URL-DO-REPOSITORIO\>

cd elite-dev

\`\`\`

Instale as dependências do backend:

\`\`\`bash

cd backend

npm install

\`\`\`

Instale as dependências do frontend:

\`\`\`bash

cd ../frontend

npm install

\`\`\`

---

**\## Banco de dados**

O banco escolhido foi **\*\*PostgreSQL\*\***.

Para facilitar a avaliação local, o repositório inclui um
\`docker-compose.yml\` que cria uma instância PostgreSQL já compatível
com a configuração de desenvolvimento.

**\### Subir o PostgreSQL**

Na raiz do projeto:

\`\`\`bash

docker compose up -d

\`\`\`

Caso a sua instalação utilize o comando legado:

\`\`\`bash

docker-compose up -d

\`\`\`

Confira os containers:

\`\`\`bash

docker compose ps

\`\`\`

A configuração local utiliza:

\`\`\`text

host: localhost

port: 5432

database: elite_dev

user: elite_dev

password: elite_dev

\`\`\`

A URL correspondente é:

\`\`\`text

postgresql://elite_dev:elite_dev@localhost:5432/elite_dev

\`\`\`

*\> Essas credenciais existem apenas para o ambiente local de
desenvolvimento definido no Docker Compose.*

**\### Aplicar migrations**

Entre no backend:

\`\`\`bash

cd backend

\`\`\`

Gere o Prisma Client:

\`\`\`bash

npx prisma generate

\`\`\`

Aplique as migrations existentes:

\`\`\`bash

npx prisma migrate deploy

\`\`\`

**\### Popular o banco**

Execute:

\`\`\`bash

npx prisma db seed

\`\`\`

Isso cria usuários de teste e eventos iniciais para facilitar a
avaliação.

**\### Reset local opcional**

Caso seja necessário recriar completamente o banco de desenvolvimento:

\`\`\`bash

npx prisma migrate reset

\`\`\`

*\> Atenção: esse comando apaga os dados existentes no banco
configurado.*

---

**\## Variáveis de ambiente**

Nenhum segredo real é versionado.

Use os arquivos \`.env.example\` como base.

**\### Backend**

Crie:

\`\`\`bash

cd backend

cp .env.example .env

\`\`\`

Exemplo:

\`\`\`env

DATABASE_URL=postgresql://elite_dev:elite_dev@localhost:5432/elite_dev

JWT_SECRET=change-this-secret

TMDB_ACCESS_TOKEN=your-tmdb-read-access-token

PORT=3000

\`\`\`

**\#### \`DATABASE_URL\`**

String de conexão com o PostgreSQL.

**\#### \`JWT_SECRET\`**

Segredo utilizado para assinatura dos tokens JWT.

Para gerar um valor local:

\`\`\`bash

openssl rand -hex 32

\`\`\`

Não publique esse valor no Git.

**\#### \`TMDB_ACCESS_TOKEN\`**

Read Access Token obtido no painel de desenvolvedor do TMDb.

A aplicação utiliza esse token no backend para pesquisar e consultar
filmes.

**\### Frontend**

Crie:

\`\`\`bash

cd frontend

cp .env.example .env

\`\`\`

Exemplo:

\`\`\`env

VITE_API_URL=http://localhost:3000

\`\`\`

---

**\## Seed e usuários de teste**

Após executar:

\`\`\`bash

npx prisma db seed

\`\`\`

os seguintes usuários estarão disponíveis:

\| Perfil \| E-mail \| Senha \|

\| --- \| --- \| --- \|

\| Organizador \| \`organizer@elitedev.test\` \| \`EliteDev123!\` \|

\| Cliente 1 \| \`cliente1@elitedev.test\` \| \`EliteDev123!\` \|

\| Cliente 2 \| \`cliente2@elitedev.test\` \| \`EliteDev123!\` \|

\| Portaria \| \`portaria@elitedev.test\` \| \`EliteDev123!\` \|

Essas credenciais são exclusivamente dados de demonstração criados pelo
seed.

O seed também cria ao menos um evento publicado para permitir a
navegação inicial sem que o avaliador precise criar tudo do zero.

---

**\## Como executar**

**\### 1. Banco**

Na raiz:

\`\`\`bash

docker compose up -d

\`\`\`

**\### 2. Backend**

Em outro terminal:

\`\`\`bash

cd backend

npm run dev

\`\`\`

Por padrão:

\`\`\`text

http://localhost:3000

\`\`\`

**\### 3. Frontend**

Em outro terminal:

\`\`\`bash

cd frontend

npm run dev

\`\`\`

O Vite exibirá no terminal a URL utilizada pelo frontend.

Normalmente:

\`\`\`text

http://localhost:5173

\`\`\`

---

**\## Fluxos para avaliação**

**\### Fluxo do organizador**

1\. Entre com \`organizer@elitedev.test\`.

2\. Acesse o painel do organizador.

3\. Pesquise um filme pelo nome.

4\. Escolha um resultado do TMDb.

5\. Informe data, horário, local, capacidade e preço.

6\. Publique a sessão.

7\. Confira a nova sessão na programação.

8\. No painel, teste a alteração de preço ou adição de lugares.

**\### Fluxo do cliente**

1\. Entre com \`cliente1@elitedev.test\`.

2\. Acesse a programação.

3\. Pesquise ou selecione um evento.

4\. Escolha a quantidade.

5\. Crie a reserva.

6\. No checkout, selecione pagamento aprovado.

7\. Acesse "Meus ingressos".

8\. Visualize o QR Code.

9\. Copie o código manual.

10\. Gere/abra o link público de compartilhamento.

Também é possível realizar uma nova reserva e simular pagamento recusado
para verificar a devolução da quantidade ao estoque.

**\### Fluxo da portaria**

1\. Abra a aplicação em outro navegador, aba privada ou após logout.

2\. Entre com \`portaria@elitedev.test\`.

3\. Selecione o evento correto.

4\. Escaneie com a câmera o QR Code exibido pelo cliente.

5\. A primeira leitura deve retornar \`VALID\`.

6\. Leia novamente o mesmo ingresso.

7\. A resposta deve ser \`ALREADY_USED\`.

Também podem ser testados:

\- um conteúdo inexistente -\> \`INVALID\`;

\- ingresso válido selecionando outro evento -\> \`WRONG_EVENT\`;

\- UUID completo do ingresso pelo campo manual.

*\> A leitura por câmera depende da permissão de câmera do navegador. Em
produção, navegadores normalmente exigem contexto seguro (HTTPS) para
acesso à câmera.*

---

**\## Build e validação**

**\### Backend**

Validar o schema Prisma:

\`\`\`bash

cd backend

npx prisma validate

\`\`\`

Build:

\`\`\`bash

npm run build

\`\`\`

**\### Frontend**

Lint:

\`\`\`bash

cd frontend

npm run lint

\`\`\`

Build de produção:

\`\`\`bash

npm run build

\`\`\`

No estado atual do projeto, os comandos acima finalizam sem erros.

O build do frontend pode informar que o bundle principal ultrapassa 500
kB. Esse é um **\*\*warning de otimização\*\***, principalmente
relacionado às dependências utilizadas no fluxo de leitura de QR Code, e
não impede a compilação ou execução da aplicação.

Uma evolução futura seria realizar code splitting do módulo de leitura
por câmera.

---

**\## Limitações e itens não implementados**

Os seguintes itens não fazem parte da implementação atual:

\- mapa visual de assentos;

\- seleção individual de cadeira;

\- cancelamento pós-compra com reembolso;

\- gateway de pagamento real;

\- nota fiscal;

\- revenda entre usuários;

\- aplicativo mobile nativo;

\- recuperação de senha;

\- envio de ingresso por e-mail;

\- testes automatizados.

Alguns desses itens são explicitamente opcionais ou estão fora do escopo
solicitado.

**\### Sobre cancelamento**

Existe devolução de estoque quando um **\*\*pagamento simulado é
recusado\*\***, mas não foi implementado um fluxo de cancelamento de uma
compra já aprovada.

Essa diferença é intencionalmente documentada para não apresentar uma
funcionalidade parcial como se fosse cancelamento completo.

**\### Sobre mapa de assentos**

Foi escolhido o modelo de compra por quantidade/pista. Portanto, mapa de
assentos em tempo real não é aplicável ao fluxo implementado.

---

**\## Uso de Inteligência Artificial**

Ferramentas de IA foram utilizadas durante o desenvolvimento como apoio
de **\*\*pair programming\*\***.

O uso incluiu principalmente:

\- discussão e revisão da arquitetura;

\- apoio na estruturação de controllers, rotas e componentes;

\- análise de erros de TypeScript, Prisma, React e ESLint;

\- revisão de regras de negócio;

\- sugestões de estratégias para concorrência e consistência de estoque;

\- apoio na integração com TMDb e leitura de QR Code;

\- revisão de segurança envolvendo JWT, QR Code e compartilhamento;

\- apoio na organização da documentação.

A IA não foi tratada como fonte única de decisão ou como substituta da
validação do sistema.

Durante o desenvolvimento:

\- o código sugerido foi integrado e ajustado manualmente;

\- decisões de produto e escopo foram avaliadas antes de serem adotadas;

\- incompatibilidades de bibliotecas foram investigadas e corrigidas;

\- os fluxos foram executados manualmente;

\- comportamentos inadequados encontrados durante os testes foram
alterados;

\- funcionalidades opcionais foram descartadas quando sua implementação
parcial poderia gerar inconsistências.

Exemplos de decisões tomadas durante esse processo incluem:

\- usar compra por quantidade em vez de mapa de assentos;

\- separar o token público de compartilhamento da credencial utilizada
na portaria;

\- não utilizar uma expiração arbitrária de 30 dias no QR de ingresso;

\- impedir redução insegura de capacidade após vendas;

\- utilizar o banco como fonte de verdade para a validade do ingresso;

\- priorizar consistência de estoque e validação atômica;

\- manter cancelamento pós-compra fora do escopo em vez de entregar um
fluxo incompleto.

O histórico de commits do repositório também foi mantido de forma
incremental para registrar a evolução do projeto.

---

**\## Referências**

**\### Referências de produto sugeridas pelo desafio**

As plataformas abaixo foram utilizadas como referência conceitual de
fluxo, sem reprodução de suas interfaces ou implementação:

\- **\*\*Ingresso.com\*\*** --- referência para experiência de compra de
cinema e seleção de lugares.

\- https://www.ingresso.com/

\- **\*\*Eventim Brasil\*\*** --- referência para eventos com
setores/pista e compra por quantidade.

\- https://www.eventim.com.br/

\- **\*\*Sympla\*\*** --- referência para criação de eventos e checkout.

\- https://www.sympla.com.br/

**\### API externa**

\- **\*\*TMDb --- documentação da API\*\***

\- https://developer.themoviedb.org/

\- **\*\*TMDb --- Getting Started\*\***

\- https://developer.themoviedb.org/reference/intro/getting-started

\- **\*\*TMDb --- Search Movie\*\***

\- https://developer.themoviedb.org/reference/search-movie

\- **\*\*The Movie Database\*\***

\- https://www.themoviedb.org/

**\### Frontend**

\- **\*\*React\*\***

\- https://react.dev/

\- **\*\*Vite\*\***

\- https://vite.dev/

\- **\*\*ZXing for JS --- Browser\*\***

\- https://github.com/zxing-js/browser

\- **\*\*qrcode\*\***

\- https://www.npmjs.com/package/qrcode

**\### Backend e banco**

\- **\*\*Node.js\*\***

\- https://nodejs.org/

\- **\*\*Express\*\***

\- https://expressjs.com/

\- **\*\*Prisma ORM\*\***

\- https://www.prisma.io/docs

\- **\*\*Prisma com PostgreSQL\*\***

\- https://www.prisma.io/docs/orm/overview/databases/postgresql

\- **\*\*PostgreSQL\*\***

\- https://www.postgresql.org/docs/

\- **\*\*JSON Web Token\*\***

\- https://jwt.io/

**\### Infraestrutura**

\- **\*\*Docker\*\***

\- https://docs.docker.com/

\- **\*\*Docker Compose\*\***

\- https://docs.docker.com/compose/

---

**\## Autor**

**\*\*João Victor\*\***

Projeto desenvolvido como solução para o **\*\*Desafio Técnico Elite Dev
/ Verzel\*\***.
