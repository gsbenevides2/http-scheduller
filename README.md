# HTTP Scheduler

Sistema CRUD para agendar a execução de requisições HTTP com suporte a cron expressions, datas específicas, telemetria e integração com Authentik SSO.

## Tecnologias

- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router e output standalone
- **[Bun](https://bun.sh/)** - Runtime JavaScript ultra-rápido
- **[ElysiaJS](https://elysiajs.com/)** - Framework backend minimalista e type-safe
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM type-safe para PostgreSQL
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Redis](https://redis.io/)** - Cache para tokens de autenticação
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[TailwindCSS v4](https://tailwindcss.com/)** + **[DaisyUI v5](https://daisyui.com/)** - Estilização
- **[Eden Treaty](https://elysiajs.com/eden/treaty/overview.html)** - Cliente type-safe para APIs Elysia
- **[TanStack React Query](https://tanstack.com/query)** - Gerenciamento de estado assíncrono
- **[Zod](https://zod.dev/)** - Validação de schemas
- **[jose](https://github.com/panva/jose)** - Assinatura e verificação de JWT
- **[Authentik](https://goauthentik.io/)** - Integração SSO via OAuth2 client_credentials

## Funcionalidades

- Criar agendamentos HTTP com diferentes métodos (GET, POST, PUT, DELETE, PATCH)
- Agendar por cron expression ou data específica
- Visualizar todos os agendamentos em uma interface intuitiva
- Ver detalhes completos de cada agendamento (headers, body, etc.)
- Excluir agendamentos com confirmação
- Execução automática baseada no trigger configurado
- Botão de teste para executar um agendamento imediatamente e ver o resultado
- Integração opcional com Authentik SSO (client_credentials por hostname)
- Gerenciamento de Client IDs para mapear hostnames a client IDs do Authentik
- Dashboard de telemetria com histórico de execuções, filtros e estatísticas
- Cache de tokens de autenticação via Redis
- Exclusão automática após execução (configurável)
- API REST com documentação OpenAPI/Scalar integrada
- CI/CD com GitHub Actions (build, review por IA, release + deploy via Coolify)

## Pré-requisitos

- [Bun](https://bun.sh/) >= 1.0
- [PostgreSQL](https://www.postgresql.org/) em execução
- [Redis](https://redis.io/) (opcional, necessário para cache de tokens Authentik)

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/gsbenevides2/http-scheduller.git
cd http-scheduller
```

2. Instale as dependências:

```bash
bun install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.local .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/http-scheduller
PORT=3000
TZ=America/Sao_Paulo

# Opcional: Authentik SSO
AUTHENTIK_USERNAME=http-scheduller-service-account
AUTHENTIK_PASSWORD=sua-senha
AUTHENTIK_URL=https://sso.seudominio.com

# Opcional: Redis Cache
REDIS_CACHE_URL=redis://localhost:6379
```

4. Sincronize o schema do banco de dados:

```bash
bun run db:sync
```

5. Execute o servidor de desenvolvimento:

```bash
bun run dev
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000)

## Docker

Para executar com Docker:

```bash
docker build -t http-scheduler .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://usuario:senha@host.docker.internal:5432/http-scheduller \
  http-scheduler
```

## Uso

### Interface Web

Acesse `http://localhost:3000` para gerenciar seus agendamentos:

- **Visualizar**: Lista todos os agendamentos na tabela principal
- **Detalhes**: Clique em qualquer linha para ver todos os campos
- **Testar**: Execute um agendamento imediatamente e veja o resultado
- **Excluir**: Use o botão de exclusão e confirme a ação
- **Telemetria**: Acesse `/telemetry` para ver o histórico de execuções com filtros e estatísticas
- **Client IDs**: Acesse `/client-ids` para gerenciar mapeamentos hostname → client ID do Authentik

### API REST

A documentação OpenAPI está disponível via Scalar UI em:

```
http://localhost:3000/api/scalar
```

#### Endpoints principais:

**Schedulled Requests**

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/schedulled_requests` | Listar agendamentos |
| POST | `/api/schedulled_requests` | Criar agendamentos |
| DELETE | `/api/schedulled_requests` | Excluir agendamentos |
| POST | `/api/schedulled_requests/execute` | Executar um agendamento |

**Telemetry**

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/telemetry` | Listar execuções (com paginação) |
| GET | `/api/telemetry/stats` | Estatísticas de execuções |
| DELETE | `/api/telemetry` | Excluir registros |
| DELETE | `/api/telemetry/clear` | Limpar toda a telemetria |

**Client IDs**

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/client_ids` | Listar client IDs |
| POST | `/api/client_ids` | Criar client ID |
| DELETE | `/api/client_ids` | Excluir client IDs |

## Estrutura do Projeto

```
http-scheduller/
├── app/                              # Frontend Next.js
├── server/                           # Backend Elysia
├── packages/
│   └── types/                        # Pacote de tipos da API
│       ├── src/index.ts              # Re-exporta o tipo App
│       ├── package.json              # Configuração do pacote
│       └── dist/                     # Declaration files gerados
└── .github/workflows/               # CI/CD
```

### Pacote de Tipos (@gsbenevides2/http-scheduller-types)

O projeto publica um pacote npm no GitHub Container Registry (ghcr.io) com os tipos da API Elysia, permitindo consumo type-safe via Eden Treaty em outros projetos.

#### Instalação

```bash
# npm
npm install @gsbenevides2/http-scheduller-types@latest

# bun
bun add @gsbenevides2/http-scheduller-types@latest
```

#### Uso com Eden Treaty

```typescript
import { treaty } from '@elysia/eden'
import type { App } from '@gsbenevides2/http-scheduller-types'

const client = treaty<App>('http://localhost:3000')

// Type-safe: autocomplete, erros em compile-time
const { data } = await client.api.schedulled_requests.get()
```

> **Nota**: O consumidor precisa ter `elysia` como peer dependency (>=1.0.0).

## Modelo de Dados

### schedulled_requests

```typescript
interface HttpScheduler {
  externalId: string;               // ID único (UUID auto-gerado)
  triggerType: "date" | "cron";    // Tipo de trigger
  triggerValue: string;             // Cron expression ou ISO date
  url: string;                      // URL do request
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers: Record<string, string>;  // Headers customizados
  body: string | null;              // Body do request
  excludeBeforeExecution: boolean;  // Excluir após executar
  useAuthentikServiceAccount: boolean; // Usar Authentik para autenticação
  createdAt: Date;
}
```

### telemetry

```typescript
interface Telemetry {
  id: number;
  schedulerExternalId: string | null;
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody: string | null;
  responseBody: string | null;
  responseStatus: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
  success: boolean;
  executedAt: Date;
}
```

### client_ids

```typescript
interface ClientId {
  hostname: string;    // Hostname (PK)
  clientId: string;    // Client ID do Authentik
  createdAt: Date;
}
```

### Exemplos de Trigger Value

**Cron expressions:**

- `0 0 * * *` - Todo dia à meia-noite
- `*/5 * * * *` - A cada 5 minutos
- `0 9 * * 1-5` - Dias úteis às 9h

**Data específica:**

- `2026-12-31T23:59:59Z` - Data e hora em ISO 8601

## Scripts Disponíveis

```bash
bun run dev        # Servidor de desenvolvimento
bun run build      # Build de produção
bun run start      # Servidor de produção
bun run lint       # Linter ESLint
bun run db:sync    # Sincronizar schema do banco com Drizzle
bun run db:studio  # Abrir Drizzle Studio (GUI do banco)
```

## CI/CD

O projeto utiliza GitHub Actions com os seguintes workflows:

- **PR Build** (`pr-build.yml`): Verifica build e lint em pull requests
- **PR Agent Review** (`pr-agent-review.yml`): Review automatizada por IA
- **Release** (`release.yml`):
  - Build e push da imagem Docker para ghcr.io
  - Publicação do pacote de tipos `@gsbenevides2/http-scheduller-types` no ghcr.io
  - Deploy via Coolify

## Licença

MIT License - veja [LICENSE](LICENSE) para mais detalhes.

## Autor

**Guilherme da Silva Benevides**

- Email: git@gui.dev.br
- GitHub: [@gsbenevides2](https://github.com/gsbenevides2)

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
