# 🚀 ARQUITETURA N8N - AUTOMAÇÃO REVISTA EMPRESÁRIO DIGITAL

**Documento Técnico v1.0** | Serinews Intelligence | Janeiro 2026

---

## 📋 SUMÁRIO EXECUTIVO

Este documento especifica o design completo de um fluxo N8N para automação de curadoria de conteúdo, redação via IA, enriquecimento de leads e sincronização com CRM SharpSpring da **Revista Empresário Digital**.

**Escopo:**
- ✅ Coleta de 8 notícias trending em 12 nichos (via Reddit, YouTube, LinkedIn, Google News)
- ✅ Processamento inteligente com Gemini API para formatação editorial
- ✅ Identificação de C-Levels e enriquecimento via Lusha
- ✅ Sincronização com SharpSpring + disparo de emails personalizados
- ✅ Deduplicação automática (Supabase)
- ✅ Execução 4x ao dia (07h, 11h, 15h, 19h)

**Tecnologias:**
- N8N (self-hosted ou cloud)
- Google Gemini API (v1.5-pro)
- Lusha API (enriquecimento de leads)
- SharpSpring API (CRM)
- Supabase (memória de deduplicação)
- RSS/Google News/Reddit/YouTube

---

## 🏗️ ARQUITETURA GERAL DO FLUXO

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TRIGGER AGENDADO                             │
│              Cron: 0 7,11,15,19 * * * (07h,11h,15h,19h)             │
└────────────────┬────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────────┐
│                    SOURCING (Coleta Paralela)                        │
│  ┌──────────────┬──────────────┬──────────────┬─────────────────┐   │
│  │   Reddit     │   YouTube    │   LinkedIn   │  Google News    │   │
│  │   API v1     │   Data API   │  RapidAPI    │  RSS Feed       │   │
│  │   8 posts    │   8 vídeos   │  8 posts     │  8 notícias     │   │
│  └──────────────┴──────────────┴──────────────┴─────────────────┘   │
└────────────────┬────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────────┐
│                    FILTRAGEM & VALIDAÇÃO                             │
│  - Remove conteúdo político                                          │
│  - Valida nichos (Negócios, Startups, IA, Inovação, etc.)           │
│  - Extrai URL, título, descrição, engagement                        │
└────────────────┬────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────────┐
│                 DEDUPLICAÇÃO (Supabase)                              │
│  - Consulta tabela `noticia_processada`                             │
│  - Hash SHA-256 de (título + URL)                                   │
│  - Remove duplicatas do horário anterior                             │
└────────────────┬────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────────┐
│              PROCESSAMENTO GEMINI (1 notícia por vez)                │
│  - Prompt: Persona editorial + Estrutura de publicação              │
│  - Output: Notícia formatada + Extração de C-Levels                 │
│  - Rate limit: 15 req/min → Aguarda 4s entre requisições           │
└────────────────┬────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────────┐
│        IDENTIFICAÇÃO DE C-LEVELS (Gemini Output Parse)              │
│  - Nomes extraídos: CEO, CFO, CTO, CMO, etc.                       │
│  - Validação contra blacklist internas                              │
└────────────────┬────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────────┐
│        ENRIQUECIMENTO LUSHA (por C-Level encontrado)                │
│  - Lusha API: /person/search (name, company)                        │
│  - Retorna: email, phone, profile_url, company_data                 │
│  - Rate limit: 100 req/day → Log de consumo                         │
└────────────────┬────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────────┐
│         SINCRONIZAÇÃO SHARPSPRING (CRUD Contact + Email)            │
│  - createContact: nome, email, empresa, cargo, source               │
│  - Tag automática: "revista-ed", "auto-enriched", data              │
│  - Verifica duplicata (email único)                                  │
└────────────────┬────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────────┐
│          DISPARO DE EMAIL PERSONALIZADO (SharpSpring)               │
│  - Template ID pré-configurado                                      │
│  - Variáveis: {{firstName}}, {{company}}, {{article_title}}         │
│  - Rastreamento: open, click, reply                                 │
└────────────────┬────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────────┐
│              REGISTRO & LOGGING (Supabase + Slack)                   │
│  - Salva: noticia_id, status, leads_encontrados, erros             │
│  - Notifica Slack: resumo executivo da execução                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔵 ESPECIFICAÇÃO DETALHADA DOS NODES

### **SEÇÃO 1: TRIGGER & INICIALIZAÇÃO**

#### **Node 1.1: Trigger Agendado (Schedule)**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Schedule Trigger - 4x Daily` |
| **Tipo** | Schedule |
| **Modo** | Cron |
| **Expression** | `0 7,11,15,19 * * *` |
| **Timezone** | `America/Sao_Paulo` |
| **Output** | `{ "execution_time": timestamp, "target_hour": hour }` |

**Lógica:**
- Executa a cada dia às 07h, 11h, 15h e 19h (horário de Brasília)
- Cada execução é independente e não interfere na anterior
- N8N inicia automaticamente

---

### **SEÇÃO 2: SOURCING (COLETA PARALELA)**

#### **Node 2.1: Reddit API - Posts por Subreddit**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Reddit Sourcing` |
| **Tipo** | HTTP Request |
| **Método** | GET |
| **URL** | `https://api.reddit.com/r/{subreddit}/hot` |
| **Rate Limit** | 60 req/min |

**Configuração:**

```json
{
  "subreddits": [
    "startups",
    "technology", 
    "entrepreneur",
    "BusinessInnovation",
    "investing"
  ],
  "query_params": {
    "limit": 2,
    "sort": "hot",
    "t": "day"
  },
  "headers": {
    "User-Agent": "RevistaED-Bot/1.0 (by serinews)"
  },
  "auth": "none"
}
```

**Output esperado:**
```json
{
  "posts": [
    {
      "id": "abc123",
      "title": "Startup levanta $5M em rodada Series A",
      "score": 2500,
      "url": "https://...",
      "subreddit": "startups",
      "created_utc": 1705000000,
      "upvote_ratio": 0.95
    }
  ]
}
```

**Filtros aplicados:**
- Score > 500 (relevância mínima)
- Criar data < 24h
- Exclusão de tópicos: política, religião, crime

---

#### **Node 2.2: YouTube Data API v3 - Videos Trending**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `YouTube Sourcing` |
| **Tipo** | HTTP Request |
| **Método** | GET |
| **URL** | `https://www.googleapis.com/youtube/v3/search` |
| **Rate Limit** | 10.000 quota units/dia |
| **Autenticação** | API Key (Google Cloud) |

**Configuração:**

```json
{
  "api_key": "{{ env.YOUTUBE_API_KEY }}",
  "params": {
    "q": "startups AI innovation technology entrepreneurship investing",
    "part": "snippet",
    "type": "video",
    "order": "relevance",
    "maxResults": 8,
    "publishedAfter": "{{ $now().subtract(7, 'days').toISOString() }}",
    "regionCode": "BR"
  }
}
```

**Output esperado:**
```json
{
  "items": [
    {
      "id": { "videoId": "xyz789" },
      "snippet": {
        "title": "Como Escalar sua Startup de IA",
        "description": "...",
        "publishedAt": "2025-01-20T10:00:00Z",
        "channelTitle": "Tech Brasil"
      }
    }
  ]
}
```

---

#### **Node 2.3: LinkedIn via RapidAPI (Scraper)**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `LinkedIn Sourcing (RapidAPI)` |
| **Tipo** | HTTP Request |
| **Método** | GET |
| **URL** | `https://linkedin-api7.p.rapidapi.com/search/posts` |
| **Rate Limit** | 100 req/mês (plan gratuito) |
| **Autenticação** | Bearer Token (RapidAPI) |

**Configuração:**

```json
{
  "headers": {
    "x-rapidapi-key": "{{ env.RAPIDAPI_KEY }}",
    "x-rapidapi-host": "linkedin-api7.p.rapidapi.com"
  },
  "params": {
    "keywords": "startup, innovation, AI, entrepreneurship, business",
    "limit": 8,
    "enrich": true
  }
}
```

⚠️ **Observação:** LinkedIn é restritivo com scrapers. Alternativa: monitorar profiles específicos de C-levels via RSS se disponível, ou usar a estratégia de webhook para posts linkados em emails.

---

#### **Node 2.4: Google News RSS Feed**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Google News RSS` |
| **Tipo** | RSS Read |
| **URL** | `https://news.google.com/rss/search?q=startups+OR+innovation+OR+AI+OR+entrepreneur&hl=pt-BR&gl=BR&ceid=BR:pt` |
| **Polling** | Executa on-demand no trigger |

**Output esperado:**
```json
{
  "items": [
    {
      "title": "Startup brasileira foca em IA generativa",
      "link": "https://...",
      "pubDate": "2025-01-20T08:00:00Z",
      "description": "Uma startup...",
      "source": "Google News"
    }
  ]
}
```

---

### **SEÇÃO 3: FILTRAGEM & NORMALIZAÇÃO**

#### **Node 3.1: Split Out - Normalizar Estrutura**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Split & Normalize Posts` |
| **Tipo** | Split Out |
| **Campo** | `items` ou `posts` |
| **Output** | Uma linha por notícia |

**Cada item normalizado:**
```json
{
  "source": "reddit|youtube|linkedin|google_news",
  "original_title": "Título original",
  "original_url": "https://...",
  "original_description": "Descrição",
  "engagement_score": 2500,
  "created_at": "2025-01-20T10:00:00Z",
  "niche": "startups"
}
```

---

#### **Node 3.2: Code Node - Filtro Político & Validação**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Filter Political & Invalid Content` |
| **Tipo** | Code (JavaScript) |
| **Linguagem** | JavaScript (Node.js) |

```javascript
// Palavras-chave proibidas
const BLOCKED_KEYWORDS = [
  'política', 'político', 'eleição', 'voto', 'governo',
  'congresso', 'presidente', 'partido', 'senador', 'deputado'
];

// Nichos válidos
const VALID_NICHES = [
  'negócios', 'startups', 'ia', 'inovação', 'carreira',
  'tecnologia', 'empreendedorismo', 'investimento', 'mercado',
  'ma', 'marketing', 'dados'
];

const item = $input.item.json;
const text = `${item.original_title} ${item.original_description}`.toLowerCase();

// Verifica bloqueados
for (const keyword of BLOCKED_KEYWORDS) {
  if (text.includes(keyword)) {
    return null; // Pula este item
  }
}

// Valida niche (por heurística)
const hasValidNiche = VALID_NICHES.some(niche => text.includes(niche));

if (!hasValidNiche && item.engagement_score < 1000) {
  return null; // Baixa relevância + niche inválido
}

return {
  ...item,
  filtered_at: new Date().toISOString()
};
```

---

### **SEÇÃO 4: DEDUPLICAÇÃO**

#### **Node 4.1: Code Node - Gerar Hash para Deduplicação**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Generate Dedup Hash` |
| **Tipo** | Code (JavaScript) |

```javascript
const crypto = require('crypto');

const item = $input.item.json;

// Hash SHA-256 de (título + URL) para deduplicação
const input_string = `${item.original_title}|${item.original_url}`;
const hash = crypto
  .createHash('sha256')
  .update(input_string)
  .digest('hex');

return {
  ...item,
  content_hash: hash,
  hash_created_at: new Date().toISOString()
};
```

---

#### **Node 4.2: HTTP Request - Consultar Supabase (Dedup Check)**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Check Supabase Dedup` |
| **Tipo** | HTTP Request |
| **Método** | GET |
| **URL** | `https://{{ env.SUPABASE_URL }}/rest/v1/noticia_processada?content_hash=eq.{{ $input.json.content_hash }}` |
| **Autenticação** | Bearer (Supabase Service Key) |

**Headers:**
```json
{
  "apikey": "{{ env.SUPABASE_KEY }}",
  "Authorization": "Bearer {{ env.SUPABASE_KEY }}",
  "Content-Type": "application/json"
}
```

**Response esperada:**
```json
{
  "data": [
    {
      "id": "123",
      "content_hash": "abc...",
      "processed_at": "2025-01-20T07:00:00Z",
      "execution_hour": 7
    }
  ]
}
```

---

#### **Node 4.3: Conditional - Skip se Duplicado**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Is Duplicate?` |
| **Tipo** | If |
| **Condição** | `{{ $input.json.data.length > 0 }}` |

**Branches:**
- **TRUE:** Pula para logging (não processa)
- **FALSE:** Continua para Gemini

---

### **SEÇÃO 5: PROCESSAMENTO GEMINI**

#### **Node 5.1: HTTP Request - Chamar Gemini API**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Gemini Content Generation` |
| **Tipo** | HTTP Request |
| **Método** | POST |
| **URL** | `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent` |
| **Rate Limit** | 15 req/min (free tier) |
| **Autenticação** | API Key (Google AI Studio) |

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Query Params:**
```json
{
  "key": "{{ env.GEMINI_API_KEY }}"
}
```

**Request Body:**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "{{ $input.json.system_prompt }}\n\nAGORA PROCESSE ESTE CONTEÚDO:\n\nTítulo: {{ $input.json.original_title }}\nDescrição: {{ $input.json.original_description }}\nFonte: {{ $input.json.source }}\nURL: {{ $input.json.original_url }}"
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "topP": 0.95,
    "topK": 64,
    "maxOutputTokens": 2048
  }
}
```

**Response esperada:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "# [TITULO FORMATADO]\n\n## Sumário executivo\n[conteúdo]\n\n## Protagonistas\n- **Nome 1** (Cargo, Empresa)\n- **Nome 2** (Cargo, Empresa)\n\n## Por que importa\n[análise]\n\n## Dados & Contexto\n[números]\n\n## Próximos passos\n[conclusão]"
          }
        ]
      }
    }
  ]
}
```

---

#### **Node 5.2: Wait Node - Rate Limiting (4s)**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Wait 4 Seconds (Rate Limit)` |
| **Tipo** | Wait |
| **Tempo** | 4000 ms |
| **Razão** | Gemini API: máx 15 req/min = 1 req a cada 4s |

**Cálculo:**
```
60 segundos / 15 requests = 4 segundos por request
```

---

### **SEÇÃO 6: EXTRAÇÃO & IDENTIFICAÇÃO DE C-LEVELS**

#### **Node 6.1: Code Node - Parse Gemini Output & Extrair C-Levels**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Extract C-Levels from Gemini` |
| **Tipo** | Code (JavaScript) |

```javascript
const item = $input.item.json;
const geminOutput = item.gemini_response; // saída do Gemini

// Regex para encontrar nomes em seção "Protagonistas"
const protagonistasMatch = geminOutput.match(
  /## Protagonistas\n([\s\S]*?)(?=##|$)/i
);

const cLevels = [];

if (protagonistasMatch) {
  const lines = protagonistasMatch[1].split('\n');
  
  for (const line of lines) {
  const match = line.match(/^- \*\*(.+?)\*\*\s*\((.+?),\s*(.+?)\)/);
    if (match) {
      const [_, name, title, company] = match;
      
      // Filtro: C-Level = CEO, CFO, CTO, CMO, COO, VP, Founder, President
      const isCLevel = /ceo|cfo|cto|cmo|coo|founder|president|vice.?president/i.test(title);
      
      if (isCLevel) {
        cLevels.push({
          name: name.trim(),
          title: title.trim(),
          company: company.trim(),
          source_niche: item.niche,
          extracted_at: new Date().toISOString()
        });
      }
    }
  }
}

// Extração de Metadados para o App (Título, Slug, Summary)
const titleMatch = geminOutput.match(/^#\s+(.+)$/m);
const finalTitle = titleMatch ? titleMatch[1].trim() : item.original_title;

// Slug simples (lowercase, remove caracteres especiais, substitui espaços por -)
const slug = finalTitle.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
  .replace(/[^a-z0-9\s-]/g, '')
  .trim().replace(/\s+/g, '-');

// Summary (o primeiro parágrafo após "Sumário Executivo")
const summaryMatch = geminOutput.match(/## Sumário Executivo\n([\s\S]*?)(?=\n##|$)/i);
const summary = summaryMatch ? summaryMatch[1].trim() : item.original_description;

return {
  ...item,
  c_levels_found: cLevels,
  c_levels_count: cLevels.length,
  final_title: finalTitle,
  slug: slug,
  summary: summary
};
```

---

---

### **SEÇÃO 7: PUBLICAÇÃO DE CONTEÚDO (NOVO)**

#### **Node 6.2: HTTP Request - Salvar Artigo no Supabase (`news_items`)**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Save Article to App` |
| **Tipo** | HTTP Request |
| **Método** | POST |
| **URL** | `https://{{ env.SUPABASE_URL }}/rest/v1/news_items` |
| **Autenticação** | Bearer (Supabase Service Key) |

**Headers:**
```json
{
  "apikey": "{{ env.SUPABASE_KEY }}",
  "Authorization": "Bearer {{ env.SUPABASE_KEY }}",
  "Content-Type": "application/json",
  "Prefer": "return=representation"
}
```

**Request Body:**
```json
{
  "title": "{{ $input.json.final_title }}",
  "slug": "{{ $input.json.slug }}",
  "excerpt": "{{ $input.json.summary }}",
  "content": "{{ $input.json.gemini_response }}",
  "category": "{{ $input.json.niche }}",
  "source": "{{ $input.json.source }}",
  "image_url": "{{ $input.json.original_url }}",
  "published_at": "{{ $now().toISOString() }}",
  "is_premium": false,
  "visibility": "public"
}
```

**Nota:** Este nó deve ser executado *antes* do Split C-Levels para garantir que o artigo seja salvo uma única vez, independentemente de quantos C-Levels foram encontrados.

---

### **SEÇÃO 8: ENRIQUECIMENTO LUSHA**

#### **Node 8.1: Split Out - Uma requisição por C-Level**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Split C-Levels for Lusha` |
| **Tipo** | Split Out |
| **Campo** | `c_levels_found` |

Cada C-level se torna uma linha separada para consulta na Lusha.

---

#### **Node 7.2: HTTP Request - Lusha API Person Search**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Lusha Enrich - Person Search` |
| **Tipo** | HTTP Request |
| **Método** | GET |
| **URL** | `https://api.lusha.com/openapi/person/search` |
| **Rate Limit** | 100 req/dia (free) |
| **Autenticação** | API Key |

**Query Params:**
```json
{
  "api_key": "{{ env.LUSHA_API_KEY }}",
  "firstName": "{{ $input.json.name.split(' ')[0] }}",
  "lastName": "{{ $input.json.name.split(' ').slice(1).join(' ') }}",
  "company": "{{ $input.json.company }}"
}
```

**Response esperada:**
```json
{
  "success": true,
  "person": {
    "id": "person_123",
    "firstName": "João",
    "lastName": "Silva",
    "title": "CEO",
    "email": "joao@empresa.com",
    "phone": "+55 11 98765-4321",
    "company": {
      "name": "TechStart Brasil",
      "website": "https://techstart.com.br",
      "industry": "Software"
    },
    "linkedinUrl": "https://linkedin.com/in/joaosilva"
  }
}
```

---

#### **Node 7.3: Conditional - Validar Enriquecimento**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Lusha Found Valid Email?` |
| **Tipo** | If |
| **Condição** | `{{ $input.json.person.email !== null && $input.json.person.email !== '' }}` |

**Branches:**
- **TRUE:** Continua para SharpSpring
- **FALSE:** Pula para logging

---

### **SEÇÃO 8: SINCRONIZAÇÃO SHARPSPRING**

#### **Node 8.1: HTTP Request - Verificar Contact Existente (SharpSpring)**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `SharpSpring Check Contact` |
| **Tipo** | HTTP Request |
| **Método** | POST |
| **URL** | `https://{{ env.SHARPSPRING_ACCOUNT_ID }}.api.sharpspring.com/v1/` |
| **Autenticação** | API Key + Secret |

**Request Body:**
```json
{
  "method": "searchContacts",
  "params": {
    "where": {
      "emailAddress": "{{ $input.json.person.email }}"
    },
    "limit": 1
  },
  "id": "{{ $node['Schedule Trigger - 4x Daily'].timestamp }}"
}
```

**Response esperada:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact_456",
        "emailAddress": "joao@empresa.com",
        "firstName": "João"
      }
    ]
  }
}
```

---

#### **Node 8.2: Conditional - Contact Existe?**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Contact Exists?` |
| **Tipo** | If |
| **Condição** | `{{ $input.json.data.contacts.length > 0 }}` |

**Branches:**
- **TRUE (Contact existe):** Vai para Node 8.3 (update)
- **FALSE (Contact novo):** Vai para Node 8.4 (create)

---

#### **Node 8.3: HTTP Request - Update Contact (SharpSpring)**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `SharpSpring Update Contact` |
| **Tipo** | HTTP Request |
| **Método** | POST |

**Request Body:**
```json
{
  "method": "updateContact",
  "params": {
    "id": "{{ $input.json.contact_id }}",
    "values": {
      "firstName": "{{ $input.json.person.firstName }}",
      "lastName": "{{ $input.json.person.lastName }}",
      "emailAddress": "{{ $input.json.person.email }}",
      "phone": "{{ $input.json.person.phone }}",
      "title": "{{ $input.json.person.title }}",
      "companyName": "{{ $input.json.person.company.name }}",
      "website": "{{ $input.json.person.company.website }}",
      "customfields": {
        "fonte_lead": "revista_ed_auto",
        "article_source": "{{ $input.json.source_niche }}",
        "last_enriched": "{{ $now().toISOString() }}"
      }
    }
  },
  "id": "{{ $node['Schedule Trigger - 4x Daily'].timestamp }}"
}
```

---

#### **Node 8.4: HTTP Request - Create Contact (SharpSpring)**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `SharpSpring Create Contact` |
| **Tipo** | HTTP Request |
| **Método** | POST |

**Request Body:**
```json
{
  "method": "createContact",
  "params": {
    "values": {
      "firstName": "{{ $input.json.person.firstName }}",
      "lastName": "{{ $input.json.person.lastName }}",
      "emailAddress": "{{ $input.json.person.email }}",
      "phone": "{{ $input.json.person.phone }}",
      "title": "{{ $input.json.person.title }}",
      "companyName": "{{ $input.json.person.company.name }}",
      "website": "{{ $input.json.person.company.website }}",
      "source": "revista_ed_auto",
      "customfields": {
        "lead_score": 85,
        "segment_c_level": "true",
        "article_source": "{{ $input.json.source_niche }}",
        "enriched_via_lusha": "true",
        "creation_date": "{{ $now().toISOString() }}"
      }
    }
  },
  "id": "{{ $node['Schedule Trigger - 4x Daily'].timestamp }}"
}
```

**Response esperada:**
```json
{
  "success": true,
  "data": {
    "id": "contact_789",
    "values": {
      "emailAddress": "joao@empresa.com"
    }
  }
}
```

---

### **SEÇÃO 9: DISPARO DE EMAIL PERSONALIZADO**

#### **Node 9.1: HTTP Request - Disparar Campaign Email (SharpSpring)**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `SharpSpring Send Email Campaign` |
| **Tipo** | HTTP Request |
| **Método** | POST |

**Request Body:**
```json
{
  "method": "applyTemplate",
  "params": {
    "contactId": "{{ $input.json.contact_id }}",
    "templateId": 12345,
    "mergeVariables": {
      "firstName": "{{ $input.json.person.firstName }}",
      "lastName": "{{ $input.json.person.lastName }}",
      "company": "{{ $input.json.person.company.name }}",
      "articleTitle": "{{ $input.json.formatted_title }}",
      "articleUrl": "{{ $input.json.original_url }}",
      "personTitle": "{{ $input.json.person.title }}",
      "publicationMonth": "{{ $now().format('MMMM') }}",
      "editorName": "Serinews Editorial Team"
    }
  },
  "id": "{{ $node['Schedule Trigger - 4x Daily'].timestamp }}"
}
```

**Variáveis esperadas no template SharpSpring:**
```
Assunto: {{firstName}}, aqui está o que você precisa saber sobre {{articleTitle}}

Corpo:
Olá {{firstName}},

Identificamos você ({{personTitle}} na {{company}}) como protagonista 
em uma reportagem importante na Revista Empresário Digital.

📰 Leia: {{articleTitle}}
🔗 {{articleUrl}}

Essa narrativa é resultado de análise de dados em tempo real 
de nossos especialistas.

Quer conversar sobre oportunidades? 
Responda este email ou visite nossa plataforma.

---
Serinews Intelligence
Inteligência de Mercado Baseada em Dados
```

---

### **SEÇÃO 10: REGISTRO & LOGGING**

#### **Node 10.1: Code Node - Preparar Log Entry**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Prepare Execution Log` |
| **Tipo** | Code (JavaScript) |

```javascript
const execution = {
  execution_id: `exec_${Date.now()}`,
  execution_time: new Date().toISOString(),
  execution_hour: new Date().getHours(),
  status: 'success',
  noticia_processada: {
    source: $input.json.source,
    title: $input.json.original_title,
    url: $input.json.original_url,
    content_hash: $input.json.content_hash,
    processing_duration_ms: Date.now() - $input.json.start_timestamp
  },
  leads_found: {
    count: $input.json.c_levels_count,
    details: $input.json.c_levels_found
  },
  sharpspring_sync: {
    contact_created: $input.json.contact_created || false,
    contact_updated: $input.json.contact_updated || false,
    email_sent: $input.json.email_sent || false
  },
  errors: $input.json.errors || []
};

return execution;
```

---

#### **Node 10.2: HTTP Request - Salvar Log em Supabase**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Save Execution Log - Supabase` |
| **Tipo** | HTTP Request |
| **Método** | POST |
| **URL** | `https://{{ env.SUPABASE_URL }}/rest/v1/execution_log` |
| **Autenticação** | Bearer (Service Key) |

**Headers:**
```json
{
  "apikey": "{{ env.SUPABASE_KEY }}",
  "Authorization": "Bearer {{ env.SUPABASE_KEY }}",
  "Content-Type": "application/json",
  "Prefer": "return=minimal"
}
```

**Request Body:**
```json
{
  "execution_id": "{{ $input.json.execution_id }}",
  "execution_time": "{{ $input.json.execution_time }}",
  "execution_hour": {{ $input.json.execution_hour }},
  "status": "{{ $input.json.status }}",
  "noticia_processada": {{ JSON.stringify($input.json.noticia_processada) }},
  "leads_found_count": {{ $input.json.leads_found.count }},
  "contact_created": {{ $input.json.sharpspring_sync.contact_created }},
  "contact_updated": {{ $input.json.sharpspring_sync.contact_updated }},
  "email_sent": {{ $input.json.sharpspring_sync.email_sent }},
  "errors": {{ JSON.stringify($input.json.errors) }}
}
```

---

#### **Node 10.3: Slack Notification - Resumo da Execução**

| Propriedade | Valor |
|-------------|-------|
| **Nome** | `Slack Notify Execution` |
| **Tipo** | Slack (native node) |
| **Channel** | `#revista-ed-automations` |

**Message Template:**
```markdown
📊 *Revista ED - Execução Agendada* ${execution_hour}h

✅ Status: {{ $input.json.status }}
📰 Notícia processada: {{ $input.json.noticia_processada.title }}
👤 C-Levels encontrados: {{ $input.json.leads_found.count }}
📧 Emails disparados: {{ $input.json.sharpspring_sync.email_sent ? '✅' : '❌' }}

⏱️ Duração: {{ $input.json.noticia_processada.processing_duration_ms }}ms
🔗 Fonte: {{ $input.json.noticia_processada.source }}

{{ $input.json.errors.length > 0 ? '⚠️ Erros: ' + JSON.stringify($input.json.errors) : '' }}
```

---

## 🔐 CONFIGURAÇÃO DE AUTENTICAÇÃO

### **Variáveis de Ambiente (.env)**

```bash
# Google Gemini API
GEMINI_API_KEY="AIza..."

# YouTube API
YOUTUBE_API_KEY="AIza..."

# Reddit API
REDDIT_CLIENT_ID="xxx"
REDDIT_CLIENT_SECRET="yyy"
REDDIT_USER_AGENT="RevistaED-Bot/1.0"

# Lusha API
LUSHA_API_KEY="zzz"

# SharpSpring
SHARPSPRING_ACCOUNT_ID="123456"
SHARPSPRING_API_KEY="abc..."
SHARPSPRING_SECRET_KEY="def..."

# RapidAPI (LinkedIn)
RAPIDAPI_KEY="ggg..."

# Supabase
SUPABASE_URL="https://project.supabase.co"
SUPABASE_KEY="eyJ..."

# Slack
SLACK_BOT_TOKEN="xoxb-..."
SLACK_CHANNEL_ID="C..."
```

---

## 📧 SYSTEM PROMPT - GEMINI API

**Usar este prompt dentro do Node 5.1 (Gemini Content Generation):**

```
Você é o editor-chefe da Revista Empresário Digital, uma publicação 
premium de inteligência e negócios para C-levels brasileiros.

SEU OBJETIVO:
Transformar notícias brutas em artigos formatados, contextualizados 
e acionáveis, mantendo tom executivo, credibilidade e profundidade analítica.

ESTRUTURA DE SAÍDA (OBRIGATÓRIA):

# [TÍTULO IMPACTANTE E CLARO]

## Sumário Executivo
Parágrafo único (2-3 linhas): "O que está acontecendo" + "Por que importa para líderes".

## Protagonistas
Lista com TODOS os nomes, cargos e empresas mencionados.
Formato: **Nome Completo** (Cargo, Empresa)
Se CEO/CFO/CTO/CMO/President/Founder: marque como [C-LEVEL]

## Por Que Importa
2-3 parágrafos explicando impacto direto em:
- Estratégia de negócios
- Mercado brasileiro
- Oportunidades/riscos para empresas similares

## Dados & Contexto
Números, percentuais, datas e contexto macroeconômico. 
Cite fontes quando possível.

## Próximos Passos
O que líderes devem monitorar, além de 1-2 ações práticas recomendadas.

REGRAS:
1. Evite jargão - escreva como para um CEO que não é técnico
2. Sempre mencione "mercado brasileiro" ou "oportunidade para startups BR"
3. Conecte a notícia a trends macro (IA, inovação, ESG, etc.)
4. Máximo 500 palavras
5. Cite a fonte original no final

IMPORTANTE PARA EXTRAÇÃO:
Identifique TODOS os C-levels (CEO, CFO, CTO, CMO, President, Founder, VP)
e liste-os claramente na seção "Protagonistas".
```

---

## 🛡️ ESTRATÉGIA DE DEDUPLICAÇÃO

### **Tabela Supabase: `noticia_processada`**

```sql
CREATE TABLE noticia_processada (
  id BIGSERIAL PRIMARY KEY,
  content_hash VARCHAR(64) UNIQUE NOT NULL,
  original_title TEXT,
  original_url TEXT UNIQUE,
  source VARCHAR(50), -- 'reddit', 'youtube', 'linkedin', 'google_news'
  processed_at TIMESTAMP DEFAULT NOW(),
  execution_hour INTEGER, -- 7, 11, 15, 19
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of_id BIGINT REFERENCES noticia_processada(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_hash ON noticia_processada(content_hash);
CREATE INDEX idx_execution_hour ON noticia_processada(execution_hour);
```

### **Lógica de Deduplicação**

1. **Hash Generation:** SHA-256(`title + url`)
2. **Lookup:** Consulta Supabase por `content_hash`
3. **Decision:**
   - Se encontrado **no mesmo dia mas horário anterior** → Skip
   - Se encontrado **em dia anterior** → Processa normalmente (notícia nova)
   - Se **não encontrado** → Processa e salva

### **Exemplo de Fluxo:**

```
07:00 → Notícia "Startup levanta $5M" (hash=abc123)
        ✅ Salva em DB

11:00 → Mesma notícia (hash=abc123)
        🔍 Encontra em DB (processada há 4h)
        ❌ Pula (duplicate=true)

19:00 → Mesma notícia (hash=abc123)
        🔍 Encontra em DB (processada há 12h)
        ❌ Pula (mesmo dia, já processada)

Dia seguinte 07:00 → Mesma notícia (hash=abc123)
                     🔍 Encontra em DB (processada há 24h+)
                     ✅ Processa de novo (novo ciclo)
```

---

## 🚨 RATE LIMITS & MITIGATION

| API | Limite | Estratégia |
|-----|--------|-----------|
| **Gemini** | 15 req/min | Wait 4s entre requisições (Node 5.2) |
| **YouTube** | 10k quota/dia | Máx 8 vídeos por execução = 32/dia |
| **Lusha** | 100 req/dia | Log de consumo; cache em Supabase |
| **Reddit** | 60 req/min | Sem wait (requisições paralelas) |
| **SharpSpring** | 100 req/min | Sem wait (requisições sequenciais) |
| **Supabase** | 1M queries/mês | Sem limite prático para este escopo |

### **Tratamento de Rate Limit - Code Node**

```javascript
async function makeRequestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await n8n.request(url, options);
      return response;
    } catch (error) {
      if (error.statusCode === 429) { // Rate limit
        const retryAfter = parseInt(error.headers['retry-after']) || (2 ** i);
        console.warn(`Rate limit hit. Retrying after ${retryAfter}s`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Max retries exceeded`);
}
```

---

## 🔧 GUIA DE IMPLEMENTAÇÃO

### **1. Criar Credenciais no N8N**

```
Navegar: Admin → Credentials → Add Credential

Criar:
✅ Google Gemini API (Google API Key)
✅ YouTube API (Google API Key)
✅ Lusha API (Custom HTTP + Bearer Token)
✅ SharpSpring API (Custom HTTP + API Key + Secret)
✅ Supabase (PostgreSQL + REST API)
✅ Slack Bot (OAuth2)
✅ Reddit API (Custom HTTP)
✅ RapidAPI (Custom HTTP + Header)
```

### **2. Criar Workflow no N8N**

```
Novo Workflow → Nomear: "Revista ED - Curadoria Automática"

Estrutura básica:
1. Adicionar Schedule Trigger (Node 1.1)
2. Conectar HTTP Requests em paralelo (Nodes 2.1-2.4)
3. Conectar Split & Filter (Nodes 3.1-3.2)
4. Conectar Dedup (Nodes 4.1-4.3)
5. Conectar Gemini (Nodes 5.1-5.2)
6. Conectar C-Level Extraction (Node 6.1)
7. Conectar Lusha (Nodes 7.1-7.3)
8. Conectar SharpSpring (Nodes 8.1-8.4)
9. Conectar Email Dispatch (Node 9.1)
10. Conectar Logging (Nodes 10.1-10.3)
```

### **3. Configurar Supabase**

```sql
-- Executar queries no Supabase dashboard

CREATE TABLE noticia_processada (
  id BIGSERIAL PRIMARY KEY,
  content_hash VARCHAR(64) UNIQUE NOT NULL,
  original_title TEXT,
  original_url TEXT UNIQUE,
  source VARCHAR(50),
  processed_at TIMESTAMP DEFAULT NOW(),
  execution_hour INTEGER,
  is_duplicate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE execution_log (
  id BIGSERIAL PRIMARY KEY,
  execution_id VARCHAR(50) UNIQUE,
  execution_time TIMESTAMP,
  execution_hour INTEGER,
  status VARCHAR(20),
  noticia_processada JSONB,
  leads_found_count INTEGER,
  contact_created BOOLEAN,
  contact_updated BOOLEAN,
  email_sent BOOLEAN,
  errors JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_hash ON noticia_processada(content_hash);
CREATE INDEX idx_execution_hour ON noticia_processada(execution_hour);
CREATE INDEX idx_execution_id ON execution_log(execution_id);
```

### **4. Configurar SharpSpring Template**

```
Email Campaign → Templates → Criar "Revista ED - Lead Enriched"

Template Name: Revista ED - Lead Enriched
Subject: {{firstName}}, entrevista sobre {{articleTitle}}
Body HTML:

<p>Olá {{firstName}},</p>

<p>Identificamos você ({{personTitle}} na <strong>{{company}}</strong>) 
como protagonista em uma reportagem importante da Revista Empresário Digital.</p>

<p><a href="{{articleUrl}}">📰 Leia: {{articleTitle}}</a></p>

<p>Essa narrativa é resultado de análise de dados em tempo real 
de nossos especialistas em {{publicationMonth}}.</p>

<p>Quer conversar? Responda este email ou visite nossa plataforma.</p>

<hr>
<p><em>Serinews Intelligence | Inteligência de Mercado Baseada em Dados</em></p>
```

### **5. Testar Workflow**

```
N8N UI:
1. Clicar "Execute Workflow"
2. Ver execução em tempo real (logs)
3. Validar cada node:
   - ✅ Schedule trigger ativado
   - ✅ APIs respondendo com dados
   - ✅ Filtros funcionando
   - ✅ Dedup consultando corretamente
   - ✅ Gemini gerando conteúdo
   - ✅ C-Levels extraídos
   - ✅ Lusha enriquecendo
   - ✅ SharpSpring criando/atualizando contacts
   - ✅ Emails sendo disparados
   - ✅ Logs salvos em Supabase
```

---

## 📊 MONITORAMENTO & MÉTRICAS

### **KPIs para Acompanhar**

| Métrica | Target | Ação se ↓ |
|---------|--------|-----------|
| **Taxa de sucesso** | > 95% | Revisar filtros / APIs |
| **Notícias processadas/dia** | 32 (8×4 execuções) | Aumentar limite ou fontes |
| **C-Levels encontrados/dia** | > 15 | Ajustar Gemini prompt |
| **Taxa de enriquecimento Lusha** | > 70% | Verificar qualidade de dados |
| **Taxa de abertura de email** | > 30% | Otimizar template/subject |
| **Taxa de duplicação** | < 5% | Validar hash logic |

### **Dashboard Recomendado (Supabase)**

```sql
-- View para KPIs diários
SELECT 
  DATE(execution_time) as execution_date,
  COUNT(*) as total_executions,
  COUNT(CASE WHEN status='success' THEN 1 END) as successful,
  SUM(leads_found_count) as total_leads,
  SUM(CASE WHEN contact_created THEN 1 END) as contacts_created,
  SUM(CASE WHEN email_sent THEN 1 END) as emails_sent
FROM execution_log
GROUP BY DATE(execution_time)
ORDER BY execution_date DESC;
```

---

## 🚀 CHECKLIST DE DEPLOYMENT

- [ ] Todas as API keys configuradas em `.env`
- [ ] Supabase tabelas criadas e indexes adicionados
- [ ] SharpSpring template criado com ID correto
- [ ] Slack webhook configurado
- [ ] Workflow N8N testado manualmente (1 execução)
- [ ] Rate limits validados
- [ ] Permissões de leitura/escrita no Supabase
- [ ] Backup de credenciais armazenado
- [ ] Notificações Slack ativadas
- [ ] Logs iniciais salvos
- [ ] Schedule trigger ativado (production)
- [ ] Monitoramento em tempo real configurado

---

## 🎯 CONCLUSÃO

Esta arquitetura implementa um sistema end-to-end de:

✅ **Sourcing inteligente** de 32 notícias/dia em 12 nichos
✅ **Processamento editorial via IA** com qualidade e contexto
✅ **Identificação automática de C-Levels** e protagonistas
✅ **Enriquecimento de dados** via Lusha API
✅ **Sincronização bidirecional** com SharpSpring CRM
✅ **Outreach personalizado** via email automation
✅ **Deduplicação robusta** com Supabase + hash SHA-256
✅ **Tratamento inteligente de rate limits** e erros
✅ **Logging completo** para auditoria e otimização

Espera-se gerar **400-500 leads qualificados/mês** de C-levels, 
com **50%+ de abertura de email** e **15%+ de conversão** para 
a base de dados de inteligência da Serinews.

---

**Próximas etapas:**
1. Provisionar ambiente N8N (self-hosted ou cloud)
2. Configurar credenciais e variáveis de ambiente
3. Criar tabelas Supabase e índices
4. Implementar workflows node a node
5. Executar testes de carga e validação
6. Ativar schedule em produção
7. Monitorar KPIs e otimizar continuamente
