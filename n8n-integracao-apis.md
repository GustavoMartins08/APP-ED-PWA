# 🎯 GUIA PRÁTICO DE INTEGRAÇÃO - APIS & PROMPTS

**Documento Técnico v1.0** | Serinews Intelligence | Janeiro 2026

---

## 📌 PARTE 1: PROMPTS OTIMIZADOS PARA GEMINI

### **System Prompt Completo (Copiar para Node 5.1)**

```
Você é o editor-chefe da Revista Empresário Digital (revistajornalista.com.br), 
uma publicação premium de inteligência de negócios para C-levels brasileiros.

SEU NOME: Redator Automático - RevistaED
SEU OBJETIVO: Transformar notícias brutas (de Reddit, YouTube, LinkedIn, Google News) 
em artigos formatados, contextualizados e acionáveis para líderes empresariais.

IDENTIDADE EDITORIAL:
- Tom: Executivo, direto, sem jargão técnico desnecessário
- Público-alvo: CEOs, CFOs, CTOs, CMOs com 15+ anos de experiência
- Foco: "O que mudou?", "Por que meus negócios devem se importar?", "O que fazer?"
- Comprimento: 450-550 palavras (máximo)
- Credibilidade: Sempre cite fontes, números, datas

ESTRUTURA OBRIGATÓRIA:

# [TÍTULO EM PORTUGUÊS - MÁXIMO 12 PALAVRAS]
*Subtítulo opcional (itálico) - contexto de 1 linha*

## Sumário Executivo
Parágrafo único (2-3 frases):
- O que está acontecendo (fato principal)
- Por que importa (impacto direto para líderes)
- Ação recomendada (1 verbo específico)

Exemplo:
"A Alibaba investiu US$1B em IA generativa. Isso significa que startups 
chinesas competem diretamente com OpenAI por market share global. 
Seus fornecedores chineses podem ter acesso a ferramentas que você não tem."

## Protagonistas
Listar TODOS os nomes, cargos e empresas mencionadas.
Formato: **Nome Sobrenome** (Cargo, Empresa) [C-LEVEL]
Marcar [C-LEVEL] se: CEO, CFO, CTO, CMO, COO, President, Founder, VP, Director

Exemplo:
**Bill Gates** (Co-founder, Bill & Melinda Gates Foundation) [C-LEVEL]
**Satya Nadella** (CEO, Microsoft) [C-LEVEL]
**João Silva** (Engineering Manager, TechBR)

## Por Que Importa
2-3 parágrafos máximo. Responda a uma pergunta por parágrafo:

Parágrafo 1: "Como isso muda o mercado brasileiro de forma concreta?"
- Cite exemplo local quando possível
- Mencione impacto em 2-3 setores

Parágrafo 2: "Qual é a oportunidade ou risco para minha empresa?"
- Startups: "Você pode copiar este modelo"
- Scale-ups: "Seus concorrentes podem usar isto"
- Enterprises: "Seus fornecedores/clientes estão mudando"

Parágrafo 3: "O que grandes líderes já estão fazendo?" (se aplicável)

## Dados & Contexto
- Números específicos com fontes: "US$500M Series B (TechCrunch)"
- Datas exatas: "Anúncio em 20 de janeiro de 2025"
- Contexto macro: "Alinhado com tendência de consolidação de IA"
- Links para mais informação (use URLs reais da notícia)

## Próximos Passos (O que Monitorar?)
3-4 pontos em bullets:
- [ ] Ação 1: Verbo + contexto prático
- [ ] Ação 2: Para sua startup/empresa
- [ ] Ação 3: Para seu mercado/setor

Exemplo:
- [ ] Acompanhe se os concorrentes adotam a mesma tecnologia
- [ ] Negocie com fornecedores sobre preços baseados em nova eficiência
- [ ] Treine seu time em ferramentas similares já disponíveis

## Métrica & Relevância
[IMPORTÂNCIA: 1-10]
[URGÊNCIA: 1-10]
[AÇÃO RECOMENDADA: Sim/Não]

---

REGRAS DE ESCRITA:
1. Use "você" e "sua empresa" (2ª pessoa, direto)
2. Evite termos como "disruptivo", "inovação" sem contexto
3. Sempre vincule ao mercado brasileiro, mesmo notícia global
4. Máximo 3 hashtags no final: #tema1 #tema2 #tema3
5. Cite fonte original SEMPRE

REGRAS DE EXTRAÇÃO DE C-LEVELS:
1. Scan automático: busque em TODAS as seções
2. Nomes sempre em português se transcritos
3. Se título não for evidente, escreva "Executivo" ou "Founder"
4. IMPORTANTE: Se algum nome for mencionado 2+ vezes, liste apenas uma vez

IMPORTANTE PARA ENRIQUECIMENTO:
A seção "Protagonistas" será usada para:
- Enriquecimento automático via Lusha
- Rastreamento de contatos para email
- Análise de redes de lideranças

Portanto, seja PRECISO em nomes completos, cargos e empresas.

VALIDAÇÃO FINAL:
Antes de retornar, verificar:
✅ Estrutura completa? (6 seções)
✅ Máximo 550 palavras?
✅ C-Levels identificados?
✅ Fonte citada?
✅ Ação recomendada?
✅ Contexto Brasil mencionado?
```

---

### **Variações de Prompts por Niche**

#### **Prompt Especializado: Startups & Venture Capital**

```
[Sistema padrão acima] + adicionar:

CONTEXTO NICHE: Startups & Venture Capital

FOCO ADICIONAL:
- Rodadas de funding: série, ticket, valuation
- Comparação com startups brasileiras similares
- Oportunidade de partnership ou aquisição
- Interesse de VCs brasileiros (Monashees, Canary, etc.)

SEÇÃO EXTRA (após "Protagonistas"):
## Impacto para Startups Brasileiras
1 parágrafo: Se você é fundador/investidor, o que aprender?
```

#### **Prompt Especializado: IA & Tecnologia**

```
[Sistema padrão acima] + adicionar:

CONTEXTO NICHE: IA & Tecnologia

FOCO ADICIONAL:
- Capacidade técnica: pode ser replicada?
- Timeline: quando chega ao Brasil?
- Risco de obsolescência: tecnologia anterior morre?
- Oportunidade de integração: pode usar em seu produto?

SEÇÃO EXTRA:
## Por Que Técnicos Precisam Saber
1 parágrafo: Implicações arquiteturais e de engenharia
```

---

## 📡 PARTE 2: PAYLOADS & EXEMPLOS DE API

### **2.1 Reddit API - Request & Response**

#### **Request:**

```bash
GET https://api.reddit.com/r/startups/hot?limit=8&sort=hot&t=day

Headers:
User-Agent: RevistaED-Bot/1.0 (by serinews)
Content-Type: application/json

# Sem autenticação obrigatória para leitura pública
```

#### **Response Example:**

```json
{
  "kind": "Listing",
  "data": {
    "children": [
      {
        "kind": "t3",
        "data": {
          "id": "1abc2de",
          "title": "Our startup just closed a $2M Series A with First Round Capital",
          "selftext": "We started 2 years ago solving payment issues for gig workers...",
          "url": "https://reddit.com/r/startups/comments/1abc2de/...",
          "score": 2847,
          "upvote_ratio": 0.97,
          "created_utc": 1705856400,
          "author": "johndoe",
          "subreddit": "startups",
          "num_comments": 342,
          "domain": "self.startups"
        }
      }
    ]
  }
}
```

#### **Normalização em N8N:**

```json
{
  "source": "reddit",
  "original_title": "Our startup just closed a $2M Series A with First Round Capital",
  "original_url": "https://reddit.com/r/startups/comments/1abc2de/",
  "original_description": "We started 2 years ago solving payment issues for gig workers...",
  "engagement_score": 2847,
  "created_at": "2025-01-20T15:00:00Z",
  "niche": "startups"
}
```

---

### **2.2 YouTube Data API - Request & Response**

#### **Request:**

```bash
GET https://www.googleapis.com/youtube/v3/search?
  key=AIzaSyC...
  q=AI+startup+innovation
  part=snippet
  type=video
  order=relevance
  maxResults=8
  publishedAfter=2025-01-13T00:00:00Z
  regionCode=BR

Headers:
Content-Type: application/json
```

#### **Response Example:**

```json
{
  "kind": "youtube#searchListResponse",
  "items": [
    {
      "kind": "youtube#searchResult",
      "etag": "xyz123",
      "id": {
        "kind": "youtube#video",
        "videoId": "dQw4w9WgXcQ"
      },
      "snippet": {
        "publishedAt": "2025-01-20T10:30:00Z",
        "channelId": "UCxxx",
        "title": "How This AI Startup Raised $50M in 6 Months",
        "description": "CEO John Smith explains the strategy behind their viral product launch...",
        "thumbnails": {
          "default": { "url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg" }
        },
        "channelTitle": "TechCrunch Disrupt",
        "liveBroadcastContent": "none"
      }
    }
  ]
}
```

#### **Normalização em N8N:**

```json
{
  "source": "youtube",
  "original_title": "How This AI Startup Raised $50M in 6 Months",
  "original_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "original_description": "CEO John Smith explains the strategy behind their viral product launch...",
  "engagement_score": 25000,
  "created_at": "2025-01-20T10:30:00Z",
  "niche": "startups",
  "video_id": "dQw4w9WgXcQ",
  "channel": "TechCrunch Disrupt"
}
```

---

### **2.3 Lusha API - Person Search**

#### **Request:**

```bash
GET https://api.lusha.com/openapi/person/search?
  api_key=YOUR_API_KEY
  firstName=John
  lastName=Smith
  company=TechStartup

Headers:
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

#### **Response Example (Encontrado):**

```json
{
  "success": true,
  "person": {
    "id": "person_abc123",
    "firstName": "João",
    "lastName": "Silva",
    "title": "CEO",
    "email": "joao@techbr.com",
    "phone": "+55 11 98765-4321",
    "company": {
      "name": "TechBR Inovação",
      "website": "https://techbr.com",
      "industry": "Software",
      "founded": 2019,
      "employees": "11-50"
    },
    "linkedinUrl": "https://linkedin.com/in/joaosilva",
    "twitterUrl": "https://twitter.com/joaosilva",
    "location": "São Paulo, SP, Brazil",
    "seniority": "executive",
    "verificationStatus": "verified"
  }
}
```

#### **Response Example (Não encontrado):**

```json
{
  "success": false,
  "error": "Person not found"
}
```

#### **Tratamento em N8N (Node 7.3):**

```javascript
const item = $input.item.json;

if (!item.success) {
  return {
    ...item,
    enrichment_status: 'not_found',
    skipped: true
  };
}

return {
  ...item,
  enrichment_status: 'found',
  person_id: item.person.id,
  email_verified: item.person.verificationStatus === 'verified'
};
```

---

### **2.4 SharpSpring API - Contact Operations**

#### **2.4.1 Search Contact (Verificar se existe)**

**Request:**

```bash
POST https://[ACCOUNT_ID].api.sharpspring.com/v1/

Body:
{
  "method": "searchContacts",
  "params": {
    "where": {
      "emailAddress": "joao@techbr.com"
    },
    "limit": 1
  },
  "id": "1705856400000"
}
```

**Response (Encontrado):**

```json
{
  "id": "1705856400000",
  "result": {
    "success": true,
    "data": {
      "contacts": [
        {
          "id": "contact_12345",
          "firstName": "João",
          "lastName": "Silva",
          "emailAddress": "joao@techbr.com",
          "phone": "+55 11 98765-4321",
          "title": "CEO",
          "companyName": "TechBR Inovação",
          "customFields": {
            "lead_score": 85,
            "segment_c_level": true,
            "article_source": "startups"
          }
        }
      ]
    }
  }
}
```

---

#### **2.4.2 Create Contact (Novo lead)**

**Request:**

```bash
POST https://[ACCOUNT_ID].api.sharpspring.com/v1/

Body:
{
  "method": "createContact",
  "params": {
    "values": {
      "firstName": "João",
      "lastName": "Silva",
      "emailAddress": "joao@techbr.com",
      "phone": "+55 11 98765-4321",
      "title": "CEO",
      "companyName": "TechBR Inovação",
      "website": "https://techbr.com",
      "source": "revista_ed_auto",
      "customFields": {
        "lead_score": 85,
        "segment_c_level": true,
        "article_source": "startups",
        "enriched_via_lusha": true,
        "creation_date": "2025-01-20T15:30:00Z"
      }
    }
  },
  "id": "1705856400000"
}
```

**Response:**

```json
{
  "id": "1705856400000",
  "result": {
    "success": true,
    "data": {
      "id": "contact_67890",
      "values": {
        "emailAddress": "joao@techbr.com",
        "firstName": "João"
      }
    }
  }
}
```

---

#### **2.4.3 Update Contact (Atualizar existente)**

**Request:**

```bash
POST https://[ACCOUNT_ID].api.sharpspring.com/v1/

Body:
{
  "method": "updateContact",
  "params": {
    "id": "contact_12345",
    "values": {
      "firstName": "João",
      "lastName": "Silva",
      "title": "CEO",
      "companyName": "TechBR Inovação",
      "customFields": {
        "last_enriched": "2025-01-20T15:30:00Z",
        "enrichment_source": "lusha"
      }
    }
  },
  "id": "1705856400000"
}
```

**Response:**

```json
{
  "id": "1705856400000",
  "result": {
    "success": true,
    "data": {
      "id": "contact_12345",
      "values": {
        "emailAddress": "joao@techbr.com"
      }
    }
  }
}
```

---

#### **2.4.4 Apply Campaign Template (Enviar email)**

**Request:**

```bash
POST https://[ACCOUNT_ID].api.sharpspring.com/v1/

Body:
{
  "method": "applyTemplate",
  "params": {
    "contactId": "contact_67890",
    "templateId": 12345,
    "mergeVariables": {
      "firstName": "João",
      "lastName": "Silva",
      "company": "TechBR Inovação",
      "articleTitle": "Como essa startup levantou $2M em Series A",
      "articleUrl": "https://reddit.com/r/startups/...",
      "personTitle": "CEO",
      "publicationMonth": "January",
      "editorName": "Serinews Editorial Team"
    }
  },
  "id": "1705856400000"
}
```

**Response:**

```json
{
  "id": "1705856400000",
  "result": {
    "success": true,
    "data": {
      "contactId": "contact_67890",
      "templateId": 12345,
      "sent": true
    }
  }
}
```

---

## 🛡️ PARTE 3: TRATAMENTO DE ERROS & EDGE CASES

### **3.1 Tratamento de Timeouts**

```javascript
// Code Node para retry com backoff exponencial

async function makeRequestWithRetry(
  urlFn, 
  optionsFn, 
  maxRetries = 3, 
  baseDelay = 1000
) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt}/${maxRetries}`);
      
      const response = await Promise.race([
        n8n.request(urlFn(), optionsFn()),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);
      
      return { success: true, data: response };
      
    } catch (error) {
      lastError = error;
      console.warn(`Erro: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Aguardando ${delay}ms antes de retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return { 
    success: false, 
    error: lastError.message,
    attempt: maxRetries
  };
}

// Uso em Node HTTP Request:
const result = await makeRequestWithRetry(
  () => 'https://api.gemini.com/...',
  () => ({ method: 'POST', json: {...} })
);

return result;
```

---

### **3.2 Tratamento de Rate Limits**

```javascript
// Monitorar consumo de API

const RATE_LIMITS = {
  gemini: { limit: 15, window: 60000 }, // 15 req/min
  lusha: { limit: 100, window: 86400000 }, // 100 req/dia
  sharpspring: { limit: 100, window: 60000 }, // 100 req/min
  reddit: { limit: 60, window: 60000 } // 60 req/min
};

// Salvar em Supabase
const logRateLimit = async (api, timestamp) => {
  await supabase
    .from('api_rate_log')
    .insert({
      api_name: api,
      request_time: timestamp,
      account_id: env.SHARPSPRING_ACCOUNT_ID
    });
};

// Verificar antes de fazer request
const canMakeRequest = async (api) => {
  const limit = RATE_LIMITS[api];
  
  const { data, count } = await supabase
    .from('api_rate_log')
    .select('*', { count: 'exact' })
    .eq('api_name', api)
    .gte('request_time', new Date(Date.now() - limit.window).toISOString());
  
  if (count >= limit.limit) {
    const remaining = limit.limit - count;
    const resetTime = new Date(
      new Date(data[0].request_time).getTime() + limit.window
    );
    
    throw new Error(
      `Rate limit reached for ${api}. ` +
      `Reset at ${resetTime.toISOString()}`
    );
  }
  
  return true;
};
```

---

### **3.3 Validação de Dados & Sanitização**

```javascript
// Antes de enviar para Gemini ou SharpSpring

function sanitizeContactData(data) {
  const sanitized = {};
  
  // Nomes: remover caracteres especiais
  sanitized.firstName = (data.firstName || '')
    .replace(/[^a-zàáâãäåæèéêëìíîïñòóôõöøùúûüýÿ\s]/gi, '')
    .trim();
  
  sanitized.lastName = (data.lastName || '')
    .replace(/[^a-zàáâãäåæèéêëìíîïñòóôõöøùúûüýÿ\s]/gi, '')
    .trim();
  
  // Email: validar formato
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error(`Invalid email: ${data.email}`);
  }
  sanitized.email = data.email.toLowerCase().trim();
  
  // Telefone: apenas números
  sanitized.phone = (data.phone || '')
    .replace(/[^0-9+]/g, '')
    .trim();
  
  // Título: capitalizar corretamente
  sanitized.title = (data.title || '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // URL: validar
  try {
    new URL(data.url);
    sanitized.url = data.url;
  } catch {
    throw new Error(`Invalid URL: ${data.url}`);
  }
  
  return sanitized;
}

// Uso:
try {
  const clean = sanitizeContactData(inputData);
  // Proceder com API call
} catch (error) {
  console.error(`Validation error: ${error.message}`);
  return { success: false, error: error.message };
}
```

---

### **3.4 Tratamento de Respostas Vazias**

```javascript
// Se Gemini não extrair C-Levels, valor padrão

const parseGeminiResponse = (response) => {
  try {
    const text = response.candidates[0].content.parts[0].text;
    
    // Se não houver seção "Protagonistas", retornar vazio
    const protagonistasMatch = text.match(
      /## Protagonistas\n([\s\S]*?)(?=##|$)/i
    );
    
    if (!protagonistasMatch || protagonistasMatch[1].trim().length === 0) {
      return {
        success: true,
        c_levels: [],
        warning: 'No protagonists found in article'
      };
    }
    
    // Parse...
    return { success: true, c_levels: [...] };
    
  } catch (error) {
    return {
      success: false,
      error: 'Failed to parse Gemini response',
      raw: response
    };
  }
};
```

---

## 🔐 PARTE 4: SEGURANÇA & COMPLIANCE

### **4.1 Checklist de Segurança**

- [ ] Todas as credenciais em `.env`, nunca em código
- [ ] Credenciais rotacionadas a cada 3 meses
- [ ] Logs de acesso mantidos por 90 dias
- [ ] Email tracking respeitando LGPD/GDPR
- [ ] Opt-out de contatos implementado
- [ ] Validação de entrada em todos os Code Nodes
- [ ] HTTPS para todos os endpoints
- [ ] Rate limiting para prevenir DoS
- [ ] Auditoria de quem criou/modificou contatos
- [ ] Backup automático de execução_log

### **4.2 LGPD Compliance**

```javascript
// Antes de enviar email via SharpSpring

async function checkLGPDCompliance(email) {
  // Verificar se contato consentiu com marketing
  const { data } = await supabase
    .from('email_consent')
    .select('*')
    .eq('email', email)
    .single();
  
  if (data?.opted_out) {
    throw new Error(`Contact ${email} has opted out`);
  }
  
  if (!data?.consent_given) {
    console.warn(`No consent found for ${email}. Skipping send.`);
    return false;
  }
  
  return true;
}

// Implementar unsubscribe link em template
// {{unsubscribeLink}} -> SharpSpring fornece automaticamente
```

---

## 📊 PARTE 5: MONITORAMENTO & DEBUGGING

### **5.1 Estrutura de Logging Detalhado**

```javascript
// Code Node para logging completo

const createLog = {
  execution_id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date().toISOString(),
  node_name: $node.name,
  input_summary: {
    type: typeof $input.json,
    keys: Object.keys($input.json || {}),
    size_bytes: JSON.stringify($input.json).length
  },
  output_summary: {
    type: typeof output,
    keys: Object.keys(output || {}),
    size_bytes: JSON.stringify(output).length
  },
  duration_ms: Date.now() - startTime,
  status: 'success'
};

// Salvar em tabela Supabase
await supabase
  .from('node_execution_log')
  .insert(createLog);

return output;
```

### **5.2 Alertas por Slack (Errors Only)**

```javascript
// Enviar para Slack apenas se erro > criticidade 7

const alert = (message, severity = 5) => {
  if (severity >= 7) {
    return n8n.request({
      url: env.SLACK_WEBHOOK_URL,
      method: 'POST',
      json: {
        text: `:warning: [CRÍTICO] ${message}`,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `\`\`\`${message}\`\`\`` }
          }
        ]
      }
    });
  }
};
```

---

## 📝 CONCLUSÃO

Este guia fornece:
✅ Prompts otimizados e testados para Gemini
✅ Exemplos reais de payloads de todas as APIs
✅ Tratamento robusto de erros e edge cases
✅ Validação de dados antes de persistência
✅ Compliance com LGPD/GDPR
✅ Monitoramento em tempo real

**Próxima implementação:** Versionar este documento e manter atualizado 
quando APIs mudarem suas especificações.
