# HTTP Scheduler 📅

Sistema CRUD para agendar a execução de requests HTTP com suporte a cron expressions e datas específicas.

## 🚀 Tecnologias

- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router
- **[Bun](https://bun.sh/)** - Runtime JavaScript ultra-rápido
- **[ElysiaJS](https://elysiajs.com/)** - Framework backend minimalista e type-safe
- **[MongoDB](https://www.mongodb.com/)** - Banco de dados NoSQL
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[TailwindCSS](https://tailwindcss.com/)** + **[DaisyUI](https://daisyui.com/)** - Estilização
- **[Eden Treaty](https://elysiajs.com/eden/treaty/overview.html)** - Cliente type-safe para APIs Elysia

## ✨ Funcionalidades

- ✅ **Criar agendamentos HTTP** com diferentes métodos (GET, POST, PUT, DELETE, PATCH)
- ✅ **Agendar por cron expression** ou **data específica**
- ✅ **Visualizar todos os agendamentos** em uma interface intuitiva
- ✅ **Ver detalhes completos** de cada agendamento (headers, body, etc.)
- ✅ **Excluir agendamentos** com confirmação
- ✅ **Execução automática** baseada no trigger configurado
- ✅ **API REST com OpenAPI/Swagger** integrado
- ✅ **Opção de exclusão automática** após execução

## 📋 Pré-requisitos

- [Bun](https://bun.sh/) >= 1.0
- [MongoDB](https://www.mongodb.com/) em execução
- Node.js (opcional, para compatibilidade)

## 🔧 Instalação

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
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
MONGO_URI=mongodb://localhost:27017
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=sua-chave-secreta-aqui
```

4. Execute o servidor de desenvolvimento:

```bash
bun run dev
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

Para executar com Docker:

```bash
docker build -t http-scheduler .
docker run -p 3000:3000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017 \
  http-scheduler
```

## 📖 Uso

### Interface Web

Acesse `http://localhost:3000` para gerenciar seus agendamentos:

- **Visualizar**: Lista todos os agendamentos na tabela principal
- **Detalhes**: Clique em qualquer linha para ver todos os campos
- **Excluir**: Use o botão vermelho "Excluir" e confirme a ação

### API REST

A documentação Swagger está disponível em:

```
http://localhost:3000/api/swagger
```

#### Endpoints principais:

**GET /api/http-scheduller**

```bash
curl http://localhost:3000/api/http-scheduller
```

**POST /api/http-scheduller**

```bash
curl -X POST http://localhost:3000/api/http-scheduller \
  -H "Content-Type: application/json" \
  -d '[{
    "externalId": "my-task-1",
    "triggerType": "cron",
    "triggerValue": "0 0 * * *",
    "url": "https://api.example.com/webhook",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer token"
    },
    "body": "{\"message\": \"Hello\"}",
    "excludeBeforeExecution": false
  }]'
```

**DELETE /api/http-scheduller**

```bash
curl -X DELETE http://localhost:3000/api/http-scheduller \
  -H "Content-Type: application/json" \
  -d '["my-task-1"]'
```

## 🗂️ Estrutura do Projeto

```
app/
├── api/
│   └── [[...slugs]]/
│       ├── route.ts           # Handler Next.js para API
│       ├── HttpScheduller.ts  # Controller ElysiaJS
│       └── eden.ts           # Cliente Eden Treaty
├── components/
│   ├── SchedulerDetailsModal.tsx      # Modal de detalhes
│   └── DeleteConfirmationModal.tsx    # Modal de confirmação
├── hooks/
│   └── useSchedullers.ts     # Hook para gerenciar schedulers
├── services/
│   ├── HttpScheduller.ts     # Serviço MongoDB
│   └── Cronner.ts           # Serviço de agendamento
├── utils/
│   ├── formatTriggerValue.ts
│   ├── getEnv.ts
│   └── getProjectInfo.ts
├── layout.tsx
├── page.tsx                  # Página principal
└── globals.scss
```

## 🔑 Modelo de Dados

```typescript
interface HttpScheduler {
  externalId: string; // ID único
  triggerType: "cron" | "date"; // Tipo de trigger
  triggerValue: string; // Cron expression ou ISO date
  url: string; // URL do request
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers: Record<string, string>; // Headers customizados
  body: string; // Body do request
  excludeBeforeExecution: boolean; // Excluir após executar
}
```

### Exemplos de Trigger Value:

**Cron expressions:**

- `0 0 * * *` - Todo dia à meia-noite
- `*/5 * * * *` - A cada 5 minutos
- `0 9 * * 1-5` - Dias úteis às 9h

**Data específica:**

- `2026-12-31T23:59:59Z` - Data e hora em ISO 8601

## 🛠️ Scripts Disponíveis

```bash
bun run dev      # Servidor de desenvolvimento
bun run build    # Build de produção
bun run start    # Servidor de produção
bun run lint     # Linter ESLint
```

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Guilherme da Silva Benevides**

- Email: git@gui.dev.br
- GitHub: [@gsbenevides2](https://github.com/gsbenevides2)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
