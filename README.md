# Dashboard de Performance — Lojas

Dashboard operacional completo conectado ao Google Sheets, construído com Next.js 14, TypeScript, Tailwind CSS e Recharts.

## Páginas

| Rota | Descrição |
|---|---|
| `/visao-geral` | KPIs executivos, evolução mensal, rankings, alertas |
| `/vendas` | Vendas × metas diária/acumulada/anual com gráficos |
| `/ranking` | 10 rankings automáticos por indicador |
| `/cancelamentos` | Análise completa de cancelamentos Abril × Maio |
| `/indicadores` | Semáforo operacional (cancel, SLA, NSU, ruptura, tempo on) |
| `/perda-venda` | Análise de perda por motivo, matriz de prioridade |
| `/tabela` | Tabela completa, ordenável, buscável, exportável em CSV |

## Configuração

### 1. Google Sheets API

O projeto usa uma **Service Account** para autenticação:

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie ou selecione um projeto
3. Ative a **Google Sheets API**
4. Crie uma Service Account → gere uma chave JSON
5. Compartilhe a planilha com o e-mail da Service Account (permissão de **Visualizador**)

### 2. Credenciais

**Opção A — arquivo local (desenvolvimento):**

Coloque o arquivo `credentials.json` na raiz do projeto. Ele **não deve ser commitado** (já está no `.gitignore`).

**Opção B — variável de ambiente (produção/Vercel):**

```bash
# Cole o conteúdo do credentials.json em uma linha
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"..."}
```

### 3. Instalar e rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev
# Acesse http://localhost:3000

# Build de produção
npm run build
npm start
```

### 4. Variáveis de ambiente

Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

| Variável | Descrição |
|---|---|
| `GOOGLE_CREDENTIALS` | JSON da service account (produção) |

Se preferir usar `credentials.json` local, deixe a variável em branco.

## Estrutura das abas esperadas

| Aba | Dados utilizados |
|---|---|
| `indicadores` | Hierarquia, faturamento histórico, meta, venda, cancelamento, ruptura, tempo online |
| `vendas diarias e mensais` | Meta/venda dia e acumulado, SLA, NSU, cancelamento do mês |
| `vendas anuais` | SLA Preparo, NSU consolidado, faturamento junho |
| `cancelamento` | Cancelamento por origem (cliente/loja/entregador) Abril × Maio |

## Mapeamento de colunas — aba `indicadores`

> **Importante**: o mapeamento de colunas é baseado em engenharia reversa da planilha. Se a estrutura da sua planilha diferir, ajuste o arquivo `src/lib/googleSheets.ts`.

| Coluna | Índice | Campo |
|---|---|---|
| A | 0 | Diretor Divisional |
| B | 1 | Diretor Regional |
| C | 2 | Gerente Regional |
| D | 3 | Código Loja |
| E | 4 | Nome Loja |
| F | 5 | Cidade |
| G | 6 | UF |
| H | 7 | Faturamento Janeiro |
| I | 8 | Faturamento Fevereiro |
| K | 10 | Faturamento Março |
| M | 12 | Faturamento Abril |
| O | 14 | Meta mês atual |
| P | 15 | Crescimento % |
| Q | 16 | Venda acumulada |
| R | 17 | Desvio vs meta |
| S | 18 | Participação % |
| T | 19 | Ticket Médio |
| V | 21 | Cancelamento total % |
| X | 23 | Perda de venda (cancelamento) |
| Y | 24 | Ruptura item % |
| AA | 26 | Perda de venda (ruptura) |
| AB | 27 | % tempo offline (100 - valor = tempo online) |
| AC | 28 | Perda de venda (tempo offline) |

## Regras de status dos indicadores

| Indicador | Verde | Amarelo | Vermelho |
|---|---|---|---|
| Cancelamento | ≤ 5% | ≤ 7% | > 7% |
| SLA Preparo | ≥ 85% | ≥ 75% | < 75% |
| NSU | ≤ 12% | ≤ 13% | > 13% |
| Ruptura Item | ≤ 5% | ≤ 7% | > 7% |
| SLA Entrega | ≥ 85% | ≥ 75% | < 75% |
| Tempo Online | ≥ 95% | ≥ 85% | < 85% |

## Score de Saúde da Loja (0–100)

| Critério | Peso |
|---|---|
| Venda vs Meta | 35 pts |
| Crescimento | 20 pts |
| Cancelamento | 15 pts |
| Ruptura | 10 pts |
| Tempo Online | 10 pts |
| Ticket Médio | 10 pts |

| Faixa | Status |
|---|---|
| 80–100 | Saudável |
| 60–79 | Atenção |
| 0–59 | Crítica |

## Deploy

### Vercel (recomendado)

```bash
npm install -g vercel
vercel
```

Configure a variável `GOOGLE_CREDENTIALS` no painel da Vercel com o conteúdo do JSON da service account.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --production
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Atualização dos dados

Os dados são buscados do Google Sheets com cache de **5 minutos** no servidor. Para forçar atualização, clique no botão **Atualizar** no topo do dashboard.

Para alterar o TTL do cache, edite `CACHE_TTL` em `src/lib/googleSheets.ts`.

## Ajustar colunas da planilha

Se as colunas da sua planilha forem diferentes, edite as funções `parseIndicadores`, `parseVendasDiarias`, `parseVendasAnuais` e `parseCancelamento` em:

```
src/lib/googleSheets.ts
```

Cada função documenta o mapeamento de colunas nos comentários.
