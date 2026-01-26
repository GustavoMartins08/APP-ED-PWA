## Especificação Técnica Completa

### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    N8N WORKFLOW ENGINE                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Schedule Trigger] ──┬─> 7:00  ─┐                          │
│   (Cron: 0 7,11,15,19 * * *)     │                          │
│                       ├─> 11:00 ─┤                          │
│                       ├─> 15:00 ─┤                          │
│                       └─> 19:00 ─┘                          │
│                           │                                   │
│                           ▼                                   │
│  ┌─────────────────────────────────────────┐                │
│  │  CONTENT DISCOVERY LAYER (Parallel)     │                │
│  ├─────────────────────────────────────────┤                │
│  │ [Reddit API] ─┐                          │                │
│  │ [YouTube API] ├─> [Aggregate] ─> [AI    │                │
│  │ [LinkedIn]    │                 Ranking] │                │
│  │ [Web Scrape]  ┘                          │                │
│  └─────────────────────────────────────────┘                │
│                           │                                   │
│                           ▼                                   │
│  ┌─────────────────────────────────────────┐                │
│  │  CONTENT GENERATION (Gemini AI)         │                │
│  ├─────────────────────────────────────────┤                │
│  │ • Verificação de duplicação             │                │
│  │ • Geração de notícia (Gemini 2.0 Flash)│                │
│  │ • Extração de C-Levels mencionados      │                │
│  │ • Validação editorial                   │                │
│  └─────────────────────────────────────────┘                │
│                           │                                   │
│                ┌──────────┴──────────┐                       │
│                ▼                     ▼                       │
│  ┌──────────────────┐   ┌──────────────────┐               │
│  │ PUBLISH CONTENT  │   │ C-LEVEL ENRICHMENT│               │
│  ├──────────────────┤   ├──────────────────┤               │
│  │ • CMS/Database   │   │ [IF] C-Level?    │               │
│  │ • Site ED        │   │  ├─Yes: Lusha API│               │
│  │ • Notificação    │   │  │   └> SharpSpring│               │
│  └──────────────────┘   │  │       └> Email  │               │
│                          │  └─No: Skip       │               │
│                          └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Tecnologias e APIs

| Componente | Tecnologia | Propósito | Custo Estimado |
|------------|------------|-----------|----------------|
| Automação | N8N (self-hosted) | Orquestração de workflows | Gratuito (open-source) |
| Content Discovery | Reddit API | Buscar posts trending em r/business, r/startups, r/technology | Gratuito (100 req/min) [6] |
| | YouTube Data API v3 | Videos trending em categorias News, Science & Tech | Gratuito (10k units/dia) [7][8] |
| | Bright Data/Apify | Scraping LinkedIn + Web geral | $500-1000/mês |
| Content Generation | Google Gemini 2.0 Flash | Escrita de notícias 1500-2000 tokens | $0.075/1M tokens input [9] |
| C-Level Enrichment | Lusha API | Enriquecimento de contatos | $99-499/mês (plan-based) [5] |
| CRM/Email | SharpSpring | Gestão de leads + automação email | Incluso no plano atual [5] |
| Database | Supabase (PostgreSQL) | Armazenamento de notícias + deduplicação | Gratuito até 500MB |

## Documentação de APIs

### 1. Reddit API

**Endpoint**: `https://oauth.reddit.com/r/{subreddit}/hot`

**Autenticação**: OAuth2 (client_credentials)[6]

**Rate Limit**: 60 requisições/minuto

**Filtros para ED**:
```json
{
  "subreddits": ["business", "startups", "entrepreneur", "technology", "artificial", "venturecapital", "SaaS"],
  "time_filter": "day",
  "limit": 25,
  "score_threshold": 100
}
```

**Exclusões**: Posts com flair "Politics", "Opinion", keywords como "Trump", "Biden", "election"

### 2. YouTube Data API v3

**Endpoint**: `https://www.googleapis.com/youtube/v3/search`

**Autenticação**: API Key[7][10]

**Quota**: 10,000 units/dia (1 search = 100 units = 100 buscas/dia)

**Parâmetros N8N**:
```javascript
{
  "part": "snippet",
  "maxResults": 10,
  "order": "viewCount",
  "publishedAfter": "{{DateTime.now().minus({hours: 6}).toISO()}}",
  "q": "AI OR startups OR business news OR technology trends",
  "regionCode": "BR",
  "relevanceLanguage": "pt",
  "type": "video",
  "videoCategoryId": "28" // Science & Technology
}
```

**Análise de Engagement**:
```javascript
// Node Code para calcular score
const viewCount = $input.item.json.statistics.viewCount;
const likeCount = $input.item.json.statistics.likeCount;
const commentCount = $input.item.json.statistics.commentCount;

const engagementScore = (likeCount * 2 + commentCount * 3) / viewCount * 10000;
return { ...item, engagementScore };
```

### 3. LinkedIn Content Discovery

**Método**: Web Scraping via Google Custom Search API[11][12]

**Endpoint**: `https://www.googleapis.com/customsearch/v1`

**Query Pattern**:
```
"(CEO OR CTO OR CFO OR founder) (startup OR tecnologia OR IA OR inovação) site:linkedin.com/posts"
```

**N8N Implementation**:[12]
```json
{
  "method": "GET",
  "url": "https://www.googleapis.com/customsearch/v1",
  "qs": {
    "key": "{{$credentials.googleApiKey}}",
    "cx": "{{$credentials.searchEngineId}}",
    "q": "{{$json.searchQuery}}",
    "num": 10,
    "dateRestrict": "d1"
  }
}
```

**Importante**: Respeita termos de uso (apenas dados públicos)[12]

### 4. Gemini API 2.0 Flash

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

**Autenticação**: API Key no header ou query param[9]

**Rate Limit**: 1000 requests/minuto (tier gratuito)

**Prompt Engineering para Notícias**:
```javascript
{
  "contents": [{
    "parts": [{
      "text": `Você é um jornalista experiente da Revista Empresário Digital, especializado em notícias para C-levels brasileiros.

CONTEXTO DA FONTE:
Plataforma: ${sourcePlatform}
Título original: ${originalTitle}
Link: ${sourceUrl}
Resumo: ${contentSummary}

DIRETRIZES EDITORIAIS:
- Público: CEOs, CTOs, CFOs, CMOs e empreendedores
- Tom: Estratégico, direto, sem jargões desnecessários
- Tamanho: 800-1200 palavras
- Foco: Impacto nos negócios, tendências, decisões estratégicas
- Proibido: Conteúdo político, opinião pessoal
- Sempre mencionar a fonte original

ESTRUTURA OBRIGATÓRIA:
1. Título chamativo (60-80 caracteres)
2. Subtítulo explicativo (120-150 caracteres)
3. Lead (primeiro parágrafo - resumo dos 5Ws)
4. Desenvolvimento (2-3 parágrafos)
5. Impacto/Análise (1 parágrafo)
6. Conclusão/Próximos passos

IDENTIFICAÇÃO DE C-LEVELS:
Se a notícia mencionar executivos, liste no formato:
EXECUTIVOS_MENCIONADOS: [
  {nome: "João Silva", cargo: "CEO", empresa: "TechCorp"}
]

Escreva a notícia em português brasileiro:`
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 2048
  }
}
```

**Extração de C-Levels via Regex**:
```javascript
// Node Code após Gemini
const text = $input.item.json.candidates[0].content.parts[0].text;
const execPattern = /EXECUTIVOS_MENCIONADOS:\s*\[([\s\S]*?)\]/;
const match = text.match(execPattern);

if (match) {
  const executives = JSON.parse('[' + match[1] + ']');
  return executives.map(exec => ({
    ...exec,
    needsEnrichment: true
  }));
}
return [];
```

### 5. Lusha API

**Endpoint**: `https://api.lusha.com/person`[3][5]

**Autenticação**: Header `api_key: YOUR_API_KEY`[5]

**Rate Limits**: 
- 25 requests/segundo[5]
- Daily quota conforme plano

**Enrich Single Contact**:[4][3]
```json
{
  "method": "POST",
  "url": "https://api.lusha.com/person",
  "headers": {
    "api_key": "{{$credentials.lushaApiKey}}",
    "Content-Type": "application/json"
  },
  "body": {
    "data": [{
      "firstName": "{{$json.nome.split(' ')[0]}}",
      "lastName": "{{$json.nome.split(' ').slice(1).join(' ')}}",
      "company": "{{$json.empresa}}",
      "property": {
        "revealEmails": true,
        "revealPhones": true
      }
    }]
  }
}
```

**Response Mapping**:
```javascript
// Extrair dados para SharpSpring
const lushaData = $input.item.json.data[0];
return {
  firstName: lushaData.firstName,
  lastName: lushaData.lastName,
  email: lushaData.emailAddress?.[0],
  phone: lushaData.phoneNumber?.[0],
  company: lushaData.property.current[0].company,
  title: lushaData.property.current[0].title,
  linkedinUrl: lushaData.socialProfiles?.linkedin,
  source: "Revista ED - Automação"
};
```

**Error Handling**:[5]
- 429: Implementar exponential backoff (2s, 4s, 8s)
- 451: Bloqueio GDPR - registrar e pular
- 404: Contato não encontrado - marcar como "low_priority"

### 6. SharpSpring API

**Endpoint**: `https://api.sharpspring.com/pubapi/v1.2/`[5]

**Autenticação**: JSON-RPC com accountID + secretKey[5]

**Create/Update Lead**:
```json
{
  "method": "createLeads",
  "params": {
    "accountID": "{{$credentials.accountId}}",
    "secretKey": "{{$credentials.secretKey}}",
    "objects": [{
      "emailAddress": "{{$json.email}}",
      "firstName": "{{$json.firstName}}",
      "lastName": "{{$json.lastName}}",
      "companyName": "{{$json.company}}",
      "title": "{{$json.title}}",
      "phoneNumber": "{{$json.phone}}",
      "linkedinUrl": "{{$json.linkedinUrl}}",
      "leadSource": "Revista ED - Notícia Automática",
      "leadStatus": "New - C-Level Mention",
      "customField_NewsUrl": "{{$json.newsUrl}}",
      "customField_MentionDate": "{{DateTime.now().toISO()}}"
    }]
  },
  "id": "{{$runIndex}}"
}
```

**Send Email Campaign**:[5]
```json
{
  "method": "sendEmails",
  "params": {
    "accountID": "{{$credentials.accountId}}",
    "secretKey": "{{$credentials.secretKey}}",
    "campaignID": "ED_CLEVEL_MENTION_TEMPLATE",
    "emailID": "{{$response.data[0].id}}",
    "leadIDs": ["{{$json.leadId}}"]
  }
}
```

**Template de Email Personalizado**:
```html
Olá {{firstName}},

Notamos que você foi mencionado em uma notícia recente publicada pela Revista Empresário Digital:

"{{articleTitle}}"
{{articleUrl}}

Como {{title}} da {{companyName}}, acreditamos que este reconhecimento reflete o impacto do seu trabalho no setor.

Gostaríamos de convidá-lo(a) para:
• Comentar sobre a matéria em nossas redes sociais
• Participar de futuras edições como colunista
• Conectar-se com nossa comunidade de 75mil+ C-levels

Fico à disposição para conversarmos.

Atenciosamente,
Marco Marcelino
Publisher - Revista Empresário Digital
```

## Fluxo N8N Completo - JSON

Devido à complexidade, vou estruturar o workflow em módulos:

### Módulo 1: Content Discovery & Aggregation

```json
{
  "name": "ED - Content Discovery Pipeline",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{"field": "cronExpression", "expression": "0 7,11,15,19 * * *"}]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://oauth.reddit.com/r/{{$json.subreddit}}/hot",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "redditOAuth2Api",
        "qs": {
          "limit": 25,
          "t": "day"
        }
      },
      "name": "Reddit - Fetch Hot Posts",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 200]
    },
    {
      "parameters": {
        "url": "=https://www.googleapis.com/youtube/v3/search",
        "qs": {
          "part": "snippet",
          "maxResults": 10,
          "order": "viewCount",
          "publishedAfter": "={{DateTime.now().minus({hours: 6}).toISO()}}",
          "q": "startups OR tecnologia OR inovação -política",
          "regionCode": "BR",
          "type": "video",
          "key": "={{$credentials.youtubeApiKey}}"
        }
      },
      "name": "YouTube - Trending Videos",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 320]
    },
    {
      "parameters": {
        "url": "https://www.googleapis.com/customsearch/v1",
        "qs": {
          "key": "={{$credentials.googleApiKey}}",
          "cx": "={{$credentials.searchEngineId}}",
          "q": "(CEO OR founder) (startup OR IA) site:linkedin.com/posts",
          "num": 10,
          "dateRestrict": "d1"
        }
      },
      "name": "LinkedIn - Via Google Search",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 440]
    },
    {
      "parameters": {
        "mode": "combine",
        "combinationMode": "multiplex"
      },
      "name": "Aggregate All Sources",
      "type": "n8n-nodes-base.merge",
      "position": [680, 320]
    },
    {
      "parameters": {
        "jsCode": "// AI Ranking Algorithm\nconst items = $input.all();\n\nconst scored = items.map(item => {\n  let score = 0;\n  \n  // Platform weight\n  if (item.json.platform === 'reddit') score += item.json.score * 0.01;\n  if (item.json.platform === 'youtube') score += item.json.viewCount * 0.0001;\n  if (item.json.platform === 'linkedin') score += 50;\n  \n  // Recency bonus\n  const hoursOld = DateTime.now().diff(DateTime.fromISO(item.json.publishedAt), 'hours').hours;\n  score += Math.max(0, 100 - hoursOld * 10);\n  \n  // ED Keywords match\n  const edKeywords = ['startup', 'IA', 'CEO', 'inovação', 'investimento', 'tecnologia'];\n  const text = (item.json.title + ' ' + item.json.description).toLowerCase();\n  const matches = edKeywords.filter(kw => text.includes(kw.toLowerCase())).length;\n  score += matches * 20;\n  \n  // Political filter (negative)\n  const politicalKw = ['trump', 'biden', 'eleição', 'política', 'governo'];\n  if (politicalKw.some(kw => text.includes(kw))) score -= 1000;\n  \n  return { ...item, rankScore: score };\n});\n\n// Sort & take top 6\nconst top6 = scored\n  .sort((a, b) => b.rankScore - a.rankScore)\n  .slice(0, 6);\n\nreturn top6;"
      },
      "name": "AI Ranking & Filter",
      "type": "n8n-nodes-base.code",
      "position": [900, 320]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [[
        {"node": "Reddit - Fetch Hot Posts", "type": "main", "index": 0},
        {"node": "YouTube - Trending Videos", "type": "main", "index": 0},
        {"node": "LinkedIn - Via Google Search", "type": "main", "index": 0}
      ]]
    },
    "Reddit - Fetch Hot Posts": {
      "main": [["node": "Aggregate All Sources", "type": "main", "index": 0]]
    },
    "YouTube - Trending Videos": {
      "main": [[{"node": "Aggregate All Sources", "type": "main", "index": 0}]]
    },
    "LinkedIn - Via Google Search": {
      "main": [[{"node": "Aggregate All Sources", "type": "main", "index": 0}]]
    },
    "Aggregate All Sources": {
      "main": [[{"node": "AI Ranking & Filter", "type": "main", "index": 0}]]
    }
  }
}
```

### Módulo 2: Deduplication Check

```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "=SELECT url FROM published_news WHERE url = '{{$json.sourceUrl}}' AND published_at > NOW() - INTERVAL '48 hours'",
        "options": {}
      },
      "name": "Supabase - Check Duplicates",
      "type": "n8n-nodes-base.postgres",
      "credentials": {
        "postgres": "supabasePostgres"
      },
      "position": [1120, 320]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.rowCount}}",
              "operation": "equal",
              "value2": 0
            }
          ]
        }
      },
      "name": "IF Not Duplicate",
      "type": "n8n-nodes-base.if",
      "position": [1340, 320]
    }
  ]
}
```

### Módulo 3: Content Generation (Gemini)

```json
{
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        "qs": {
          "key": "={{$credentials.geminiApiKey}}"
        },
        "bodyParametersJson": "={\n  \"contents\": [{\n    \"parts\": [{\n      \"text\": \"Você é um jornalista experiente da Revista Empresário Digital.\\n\\nCONTEXTO DA FONTE:\\nPlataforma: {{$json.platform}}\\nTítulo: {{$json.title}}\\nLink: {{$json.sourceUrl}}\\n\\nEscreva uma notícia de 800-1200 palavras seguindo o estilo editorial da revista. Foco em C-levels brasileiros, tom estratégico.\\n\\nSe houver executivos mencionados, liste no final:\\nEXECUTIVOS_MENCIONADOS: [{nome, cargo, empresa}]\"\n    }]\n  }],\n  \"generationConfig\": {\n    \"temperature\": 0.7,\n    \"maxOutputTokens\": 2048\n  }\n}",
        "options": {}
      },
      "name": "Gemini - Generate Article",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1560, 240]
    },
    {
      "parameters": {
        "jsCode": "// Extract generated article & C-levels\nconst response = $input.item.json;\nconst fullText = response.candidates[0].content.parts[0].text;\n\n// Split article from executives list\nconst execMatch = fullText.match(/EXECUTIVOS_MENCIONADOS:\\s*\\[(.*?)\\]/s);\nconst article = fullText.replace(/EXECUTIVOS_MENCIONADOS:[\\s\\S]*$/, '').trim();\n\nlet executives = [];\nif (execMatch) {\n  try {\n    executives = JSON.parse('[' + execMatch[1] + ']');\n  } catch(e) {}\n}\n\nreturn [{\n  json: {\n    article,\n    executives,\n    sourceUrl: $input.item.json.sourceUrl,\n    sourcePlatform: $input.item.json.platform,\n    generatedAt: DateTime.now().toISO()\n  }\n}];"
      },
      "name": "Parse Article & Executives",
      "type": "n8n-nodes-base.code",
      "position": [1780, 240]
    }
  ]
}
```

### Módulo 4: C-Level Enrichment Pipeline

```json
{
  "nodes": [
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.executives.length}}",
              "operation": "larger",
              "value2": 0
            }
          ]
        }
      },
      "name": "IF Has C-Levels",
      "type": "n8n-nodes-base.if",
      "position": [2000, 240]
    },
    {
      "parameters": {
        "fieldToSplitOut": "executives",
        "options": {}
      },
      "name": "Split Executives",
      "type": "n8n-nodes-base.splitOut",
      "position": [2220, 180]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.lusha.com/person",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "api_key",
              "value": "={{$credentials.lushaApiKey}}"
            }
          ]
        },
        "sendBody": true,
        "bodyParametersJson": "={\n  \"data\": [{\n    \"firstName\": \"{{$json.nome.split(' ')[0]}}\",\n    \"lastName\": \"{{$json.nome.split(' ').slice(1).join(' ')}}\",\n    \"company\": \"{{$json.empresa}}\",\n    \"property\": {\n      \"revealEmails\": true,\n      \"revealPhones\": true\n    }\n  }]\n}",
        "options": {
          "retry": {
            "enabled": true,
            "maxTries": 3,
            "waitBetweenTries": 2000
          }
        }
      },
      "name": "Lusha - Enrich Contact",
      "type": "n8n-nodes-base.httpRequest",
      "position": [2440, 180]
    },
    {
      "parameters": {
        "jsCode": "// Map Lusha response to SharpSpring format\nconst lushaData = $input.item.json.data?.[0];\n\nif (!lushaData || !lushaData.emailAddress) {\n  return []; // Skip if no email found\n}\n\nreturn [{\n  json: {\n    firstName: lushaData.firstName,\n    lastName: lushaData.lastName,\n    email: lushaData.emailAddress[0],\n    phone: lushaData.phoneNumber?.[0] || '',\n    company: lushaData.property?.current?.[0]?.company || $input.item.json.empresa,\n    title: lushaData.property?.current?.[0]?.title || $input.item.json.cargo,\n    linkedinUrl: lushaData.socialProfiles?.linkedin || '',\n    newsUrl: $('Parse Article & Executives').item.json.sourceUrl,\n    articleTitle: $('Parse Article & Executives').item.json.article.split('\\n')[0]\n  }\n}];"
      },
      "name": "Transform for CRM",
      "type": "n8n-nodes-base.code",
      "position": [2660, 180]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.sharpspring.com/pubapi/v1.2/",
        "sendBody": true,
        "bodyParametersJson": "={\n  \"method\": \"createLeads\",\n  \"params\": {\n    \"accountID\": \"{{$credentials.sharpspringAccountId}}\",\n    \"secretKey\": \"{{$credentials.sharpspringSecretKey}}\",\n    \"objects\": [{\n      \"emailAddress\": \"{{$json.email}}\",\n      \"firstName\": \"{{$json.firstName}}\",\n      \"lastName\": \"{{$json.lastName}}\",\n      \"companyName\": \"{{$json.company}}\",\n      \"title\": \"{{$json.title}}\",\n      \"phoneNumber\": \"{{$json.phone}}\",\n      \"leadSource\": \"Revista ED - Automação\",\n      \"leadStatus\": \"New - C-Level Mention\"\n    }]\n  },\n  \"id\": \"{{$runIndex}}\"\n}",
        "options": {}
      },
      "name": "SharpSpring - Create Lead",
      "type": "n8n-nodes-base.httpRequest",
      "position": [2880, 180]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.sharpspring.com/pubapi/v1.2/",
        "sendBody": true,
        "bodyParametersJson": "={\n  \"method\": \"sendEmails\",\n  \"params\": {\n    \"accountID\": \"{{$credentials.sharpspringAccountId}}\",\n    \"secretKey\": \"{{$credentials.sharpspringSecretKey}}\",\n    \"campaignID\": \"ED_CLEVEL_MENTION\",\n    \"leadIDs\": [\"{{$json.result.lead[0].id}}\"]\n  }\n}",
        "options": {}
      },
      "name": "SharpSpring - Send Email",
      "type": "n8n-nodes-base.httpRequest",
      "position": [3100, 180]
    }
  ]
}
```

### Módulo 5: Publish & Store

```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "insert",
        "schema": "public",
        "table": "published_news",
        "columns": "title, content, source_url, source_platform, published_at, executives_count",
        "additionalFields": {
          "values": "={{$json.article.split('\\n')[0]}}, {{$json.article}}, {{$json.sourceUrl}}, {{$json.sourcePlatform}}, {{$json.generatedAt}}, {{$json.executives.length}}"
        }
      },
      "name": "Supabase - Save Article",
      "type": "n8n-nodes-base.postgres",
      "position": [2000, 360]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{$env.CMS_WEBHOOK_URL}}",
        "sendBody": true,
        "bodyParametersJson": "={\n  \"title\": \"{{$json.article.split('\\n')[0]}}\",\n  \"content\": \"{{$json.article}}\",\n  \"source\": \"{{$json.sourceUrl}}\",\n  \"category\": \"{{$json.sourcePlatform}}\",\n  \"status\": \"published\",\n  \"author\": \"Automação ED\"\n}",
        "options": {}
      },
      "name": "Publish to Website",
      "type": "n8n-nodes-base.httpRequest",
      "position": [2220, 360]
    },
    {
      "parameters": {
        "channel": "#editorial",
        "text": "=✅ Nova notícia publicada!\n\n*Título:* {{$json.article.split('\\n')[0]}}\n*Fonte:* {{$json.sourcePlatform}}\n*C-Levels identificados:* {{$json.executives.length}}\n*Link:* {{$env.SITE_URL}}/noticias/{{$json.id}}",
        "otherOptions": {}
      },
      "name": "Slack Notification",
      "type": "n8n-nodes-base.slack",
      "position": [2440, 360]
    }
  ]
}
```

## Guia de Implementação Passo a Passo

### Fase 1: Setup Inicial (Semana 1)

1. **Instalar N8N**[1]
   ```bash
   npm install n8n -g
   n8n start
   # Acesse http://localhost:5678
   ```

2. **Configurar Credenciais**:
   - Reddit OAuth2 App: https://www.reddit.com/prefs/apps
   - YouTube Data API: Google Cloud Console
   - Gemini API Key: https://ai.google.dev/
   - Lusha API Key: https://www.lusha.com/api-settings
   - SharpSpring accountID + secretKey: Admin panel[5]
   - Supabase Database: https://supabase.com

3. **Criar Database Schema**:
```sql
CREATE TABLE published_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT UNIQUE NOT NULL,
  source_platform VARCHAR(50),
  published_at TIMESTAMP DEFAULT NOW(),
  executives_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_source_url ON published_news(source_url);
CREATE INDEX idx_published_at ON published_news(published_at);
```

### Fase 2: Implementação por Módulos (Semana 2-3)

1. Importar workflows JSON no N8N
2. Testar cada módulo isoladamente
3. Conectar módulos em pipeline completo
4. Executar testes com Schedule desabilitado (trigger manual)

### Fase 3: Otimização & QA (Semana 4)

1. **Monitoramento**:
   - Criar dashboard Looker Studio com métricas[2]
   - Alertas via Slack para erros críticos
   - Tracking de custos de API (especialmente Gemini/Lusha)

2. **Validação Editorial**:
   - Revisar primeiras 50 notícias geradas
   - Ajustar prompts Gemini conforme feedback
   - Refinar filtros de ranking

3. **Fine-tuning**:
   - Ajustar thresholds de ranking
   - Otimizar keywords de busca
   - Calibrar frequência (pode aumentar/diminuir)

## Estimativa de Custos Mensais

| Item | Custo |
|------|-------|
| N8N (self-hosted) | $0 (servidor próprio) |
| Reddit API | $0 |
| YouTube Data API | $0 (dentro quota gratuita) |
| Google Custom Search | $5/mês (100 queries/dia) |
| Gemini API | ~$15/mês (18 notícias/dia × 30 dias × 2k tokens × $0.075/1M) |
| Lusha API | $199/mês (plano Pro - até 480 créditos/mês) |
| SharpSpring | Incluso no plano atual |
| Supabase | $0 (free tier) |
| **TOTAL** | **~$219/mês** |

## Recomendações de Consultoria

### Prioridade ALTA

1. **Implementar Revisão Humana nos Primeiros 30 Dias**: Mesmo com IA, ter um jornalista revisando as primeiras notícias evita publicações inadequadas que danifiquem credibilidade.[2]

2. **Criar Processo de Opt-Out C-Levels**: Permitir que executivos solicitem exclusão da base, compliance com LGPD.[5]

3. **Diversificar Fontes Além de Redes Sociais**: Integrar RSS feeds de sites como TechCrunch, Exame, Startups para melhor cobertura.[2]

4. **Template de Email mais Consultivo**: O email atual está muito "cold outreach". Recomendar abordagem "você foi destaque, quer contribuir?" ao invés de venda direta.[5]

### Prioridade MÉDIA

5. **A/B Testing de Horários**: Testar diferentes horários de publicação (7h/11h/15h/19h vs 8h/12h/16h/20h) e medir engajamento.[2]

6. **Criar Feedback Loop**: Botão "Notícia Relevante/Irrelevante" no site para treinar algoritmo de ranking.[1]

7. **Integrar com LinkedIn Oficial (quando disponível)**: Atualmente usando scraping, mas API oficial seria mais confiável.[11]

### Prioridade BAIXA

8. **Explorar Gemini Pro para Análises Mais Profundas**: Após validar Flash, considerar Pro para artigos mensais longos.[9]

9. **Criar Workflow de "Trending Topics"**: Dashboard separado mostrando temas em ascensão para equipe editorial.[2]

## Próximos Passos Imediatos

1. ✅ **Revisar esta especificação** com time técnico e editorial
2. 🔧 **Configurar ambientes de desenvolvimento** (sandbox N8N + test APIs)
3. 📝 **Criar Custom Fields no SharpSpring** para campos adicionais (newsUrl, mentionDate)
4. 🧪 **Implementar Módulo 1 (Content Discovery)** e testar coleta por 3 dias
5. 🤖 **Fine-tune Prompt Gemini** com 10 exemplos reais de notícias ED existentes
6. 🚀 **Lançamento Beta** com publicação manual (automação roda mas não publica automaticamente)
7. 📊 **Após 2 semanas**: Análise de dados e decisão sobre full automation
