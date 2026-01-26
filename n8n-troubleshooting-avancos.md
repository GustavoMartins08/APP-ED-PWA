# 🔧 TROUBLESHOOTING & REFERÊNCIAS TÉCNICAS

**Documento Técnico v1.0** | Serinews Intelligence | Janeiro 2026

---

## 🐛 PARTE 1: TROUBLESHOOTING POR ERROR

### **Erro 1: "Authentication failed - Invalid API Key"**

**APIs Afetadas:** Gemini, YouTube, Lusha, SharpSpring, Supabase

**Causas Comuns:**
1. API key expirado/revogado
2. API key incorreto (copy/paste com espaços)
3. API não ativada no console (Google, AWS)
4. Credenciais erradas para a conta

**Solução Prática:**

```javascript
// Code Node para validar credential antes de usar

const validateApiKey = async (apiName, apiKey) => {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(`${apiName} API key is empty`);
  }
  
  // Remove espaços
  const cleanKey = apiKey.trim();
  
  // Validar formato básico
  const patterns = {
    gemini: /^AIza/,
    youtube: /^AIza/,
    lusha: /^[a-f0-9]{32,}/,
    sharpspring: /^[a-zA-Z0-9]{20,}/
  };
  
  if (!patterns[apiName.toLowerCase()].test(cleanKey)) {
    throw new Error(`${apiName} API key format invalid`);
  }
  
  return cleanKey;
};

// Uso
try {
  const key = await validateApiKey('gemini', $env.GEMINI_API_KEY);
  console.log('✅ API key válida');
} catch (error) {
  console.error(`❌ ${error.message}`);
  return { error: error.message };
}
```

**Debug Steps:**
1. Copiar exatamente a API key do console original
2. Testar com curl antes de usar em N8N:
   ```bash
   curl -X GET "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=YOUR_KEY"
   ```
3. Se 401: key inválida
4. Se 403: API não ativada
5. Se 429: rate limit

---

### **Erro 2: "HTTP 429 - Too Many Requests"**

**APIs Afetadas:** Gemini (15/min), YouTube (quota), Lusha (100/dia), SharpSpring (100/min)

**Sintoma:** Workflow falha após 5-10 execuções bem-sucedidas

**Solução:**

```javascript
// Code Node para implementar circuit breaker

const RATE_LIMITS = {
  gemini: { limit: 15, window: 60, unit: 'min' },
  lusha: { limit: 100, window: 86400, unit: 'day' },
  sharpspring: { limit: 100, window: 60, unit: 'min' }
};

async function checkRateLimit(api, supabase) {
  const limit = RATE_LIMITS[api];
  if (!limit) return true; // API não tem rate limit definido
  
  const now = new Date();
  const windowStart = new Date(now - limit.window * 1000);
  
  const { data, count } = await supabase
    .from('api_rate_log')
    .select('*', { count: 'exact' })
    .eq('api_name', api)
    .gte('request_time', windowStart.toISOString());
  
  if (count >= limit.limit) {
    const oldestRequest = new Date(data[0].request_time);
    const resetTime = new Date(oldestRequest.getTime() + limit.window * 1000);
    const secondsUntilReset = Math.ceil((resetTime - now) / 1000);
    
    console.warn(
      `Rate limit reached. Reset in ${secondsUntilReset}s`
    );
    
    return {
      allowed: false,
      resetAt: resetTime,
      secondsUntilReset
    };
  }
  
  return { allowed: true };
}

// Uso em um HTTP Request Node:
// Adicionar este código ANTES do request
const check = await checkRateLimit('gemini', supabase);
if (!check.allowed) {
  const delay = check.secondsUntilReset * 1000;
  console.log(`Aguardando ${delay}ms...`);
  await new Promise(r => setTimeout(r, delay));
}
```

**Prevenção:**
- [ ] Implementar Wait node entre requests (vide Node 5.2)
- [ ] Monitorar consumo em Supabase diariamente
- [ ] Para Lusha: manter log de 100 req/dia
- [ ] Para Gemini: máx 3 notícias por execução (não 8)

---

### **Erro 3: "No matches found for Supabase query"**

**Sintoma:** Node 4.2 (Check Dedup) retorna erro 404

**Causas:**
1. Tabela `noticia_processada` não criada
2. Sintaxe da query REST API incorreta
3. RLS policy bloqueando acesso

**Solução:**

```javascript
// Testar query Supabase manualmente

// Opção 1: curl
curl -X GET "https://[SUPABASE_URL]/rest/v1/noticia_processada" \
  -H "apikey: [SUPABASE_KEY]" \
  -H "Authorization: Bearer [SUPABASE_KEY]"

// Opção 2: JavaScript/Node
const response = await fetch(
  `https://[SUPABASE_URL]/rest/v1/noticia_processada?content_hash=eq.${hash}`,
  {
    headers: {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
    }
  }
);
const data = await response.json();
console.log(data);

// Se retornar: {"message": "Not found"}
// → Tabela não existe. Execute query de criação.

// Se retornar: 401 ou 403
// → Credenciais erradas. Copie novamente de Supabase → Settings → API
```

---

### **Erro 4: "Gemini: Invalid format for response"**

**Sintoma:** Gemini retorna resposta mas parsing falha no Node 6.1

**Causa:** Prompt não gerou seção "Protagonistas" ou formatação diferente

**Solução:**

```javascript
// Code Node para parsing mais robusto

const parseGeminiResponse = (fullText) => {
  const cLevels = [];
  
  // Buscar seção "Protagonistas" com variações
  const variations = [
    /## Protagonistas([\s\S]*?)(?=##|$)/i,
    /protagonistas([\s\S]*?)(?=por que|$)/i,
    /nomes menciona[ds]os([\s\S]*?)(?=##|$)/i
  ];
  
  let match = null;
  for (const pattern of variations) {
    match = fullText.match(pattern);
    if (match) break;
  }
  
  if (!match) {
    console.warn('⚠️ No protagonists section found');
    return { c_levels: [], warning: 'No section found' };
  }
  
  // Parse linhas com regex mais flexível
  const lines = match[1].split('\n');
  for (const line of lines) {
    // Trata: **Nome** (Cargo, Empresa) [C-LEVEL]
    //        ou: - Nome | Cargo | Empresa
    //        ou: Nome - Cargo em Empresa
    
    const patterns = [
      /\*\*(.+?)\*\*\s*\((.+?),\s*(.+?)\)/,
      /^-\s+(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)$/,
      /^(.+?)\s*-\s*(.+?)\s+(?:em|na)\s+(.+?)$/
    ];
    
    for (const p of patterns) {
      const m = line.match(p);
      if (m) {
        const [_, name, title, company] = m;
        cLevels.push({
          name: name.trim(),
          title: title.trim(),
          company: company.trim()
        });
        break;
      }
    }
  }
  
  return { c_levels: cLevels };
};

// Teste
const testResponse = `
## Protagonistas
**João Silva** (CEO, TechBR) [C-LEVEL]
**Maria Santos** (CTO, Startup XYZ) [C-LEVEL]
`;

const result = parseGeminiResponse(testResponse);
console.log(result);
// Output: { c_levels: [{name: "João Silva", ...}, ...] }
```

---

### **Erro 5: "SharpSpring: Contact creation failed - Duplicate entry"**

**Sintoma:** Mesmo email tenta ser criado 2x em uma execução

**Causa:** Split Out está criando múltiplas linhas do mesmo lead

**Solução:**

```javascript
// Code Node: De-duplicate ANTES de enviar para SharpSpring

const deduplicateContacts = (contacts) => {
  const seen = new Map();
  const unique = [];
  
  for (const contact of contacts) {
    const key = `${contact.email}`;
    
    if (!seen.has(key)) {
      seen.set(key, true);
      unique.push(contact);
    } else {
      console.warn(`Duplicate detected: ${key}`);
    }
  }
  
  return unique;
};

// Uso
const dedupContacts = deduplicateContacts($input.json.contacts);
return { 
  ...$$input.json,
  contacts: dedupContacts,
  original_count: $input.json.contacts.length,
  deduplicated_count: dedupContacts.length
};
```

---

### **Erro 6: "N8N Workflow timeout after 10 minutes"**

**Sintoma:** Workflow interrompe sem completar

**Causa:** Muito tempo esperando Gemini ou Lusha responder

**Solução:**

```javascript
// Implementar timeout curto por request

const options = {
  method: 'POST',
  url: 'https://...',
  json: {...},
  timeout: 10000 // 10 segundos MAX por request
};

try {
  const response = await Promise.race([
    n8n.request(options),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    )
  ]);
  return response;
} catch (error) {
  if (error.message.includes('timeout')) {
    console.warn('⏱️ Request timed out. Retrying...');
    // Implementar retry lógica
  }
  throw error;
}
```

---

## 📈 PARTE 2: PERFORMANCE OPTIMIZATION

### **Otimização 1: Cache Lusha Responses**

Se o mesmo C-level é mencionado em múltiplas notícias (improvável mas possível):

```javascript
// Code Node para cache em memória (N8N workflow)

const CACHE_LUSHA = {};
const CACHE_TTL = 86400000; // 24 horas

async function lushaPerson(firstName, lastName, company) {
  const key = `${firstName}_${lastName}_${company}`;
  const cached = CACHE_LUSHA[key];
  
  // Se no cache E não expirou
  if (cached && cached.expiry > Date.now()) {
    console.log(`✅ Cache hit: ${key}`);
    return cached.data;
  }
  
  // Se expirou ou não existe
  const response = await n8n.request({
    method: 'GET',
    url: 'https://api.lusha.com/openapi/person/search',
    qs: {
      api_key: $env.LUSHA_API_KEY,
      firstName,
      lastName,
      company
    }
  });
  
  // Salvar no cache
  CACHE_LUSHA[key] = {
    data: response,
    expiry: Date.now() + CACHE_TTL
  };
  
  return response;
}
```

### **Otimização 2: Batch Processing de Contatos SharpSpring**

Ao invés de 1 request por contato, agrupar:

```javascript
// Code Node: Preparar batch de 10 contatos

const contactsToSync = [];
let batch = [];

for (const contact of $input.json.contacts) {
  batch.push(contact);
  
  if (batch.length === 10) {
    contactsToSync.push(batch);
    batch = [];
  }
}

if (batch.length > 0) {
  contactsToSync.push(batch);
}

return {
  ...$$input.json,
  contact_batches: contactsToSync,
  total_batches: contactsToSync.length
};

// Node SharpSpring: Usar "Loop over Items" em vez de "Split Out"
```

### **Otimização 3: Parallel API Calls (Reddit + YouTube simultâneos)**

Em vez de sequencial, executar em paralelo:

```javascript
// Code Node: Fan-out de requests paralelos

const [redditPosts, youtubeVideos, linkedinPosts, newsItems] = 
  await Promise.all([
    n8n.request({ method: 'GET', url: 'https://api.reddit.com/...' }),
    n8n.request({ method: 'GET', url: 'https://youtube.googleapis.com/...' }),
    n8n.request({ method: 'GET', url: 'https://api.rapidapi.com/...' }),
    n8n.request({ method: 'GET', url: 'https://news.google.com/...' })
  ]);

return {
  reddit_posts: redditPosts,
  youtube_videos: youtubeVideos,
  linkedin_posts: linkedinPosts,
  news_items: newsItems
};
```

---

## 🔐 PARTE 3: SEGURANÇA AVANÇADA

### **Prática 1: Credential Rotation**

```javascript
// Code Node para alertar quando credential próximo do vencimento

const CHECK_EXPIRY_DAYS = 30;
const credentials = {
  lusha: { expires: '2026-01-15' },
  rapidapi: { expires: '2026-02-28' }
};

for (const [name, cred] of Object.entries(credentials)) {
  const expiryDate = new Date(cred.expires);
  const today = new Date();
  const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < CHECK_EXPIRY_DAYS) {
    await n8n.request({
      method: 'POST',
      url: $env.SLACK_WEBHOOK_URL,
      json: {
        text: `⚠️ ${name} credential expires in ${daysUntilExpiry} days`
      }
    });
  }
}
```

### **Prática 2: Sanitizar Logs**

Nunca logar senhas ou keys:

```javascript
// Code Node: Remover campos sensíveis antes de logar

const sanitizeForLogging = (obj) => {
  const sensitive = ['password', 'token', 'key', 'secret', 'api_key', 'apikey'];
  
  const cleaned = JSON.parse(JSON.stringify(obj));
  
  const sanitize = (o) => {
    if (typeof o !== 'object' || o === null) return;
    for (const key in o) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        o[key] = '***REDACTED***';
      } else if (typeof o[key] === 'object') {
        sanitize(o[key]);
      }
    }
  };
  
  sanitize(cleaned);
  return cleaned;
};

// Uso
const log = sanitizeForLogging({
  email: 'joao@tech.com',
  api_key: 'secret123',
  lusha_key: 'another_secret'
});
// Output: { email: '...', api_key: '***REDACTED***', lusha_key: '***REDACTED***' }
```

---

## 📚 PARTE 4: REFERÊNCIAS & RECURSOS

### **APIs Externas - Documentação Oficial**

| API | Docs | Rate Limit | Preço |
|-----|------|-----------|-------|
| **Gemini** | https://ai.google.dev/docs | 15 req/min | Free (generoso) |
| **YouTube** | https://developers.google.com/youtube/v3 | 10k quota/dia | Free |
| **Reddit** | https://www.reddit.com/dev/api | 60 req/min | Free |
| **Lusha** | https://docs.lusha.com/apis/openapi | 100 req/dia | Pago ($) |
| **SharpSpring** | https://help.sharpspring.com/api | 100 req/min | Included |
| **Supabase** | https://supabase.com/docs | 1M queries/mês | Free tier |

### **N8N Resources**

- **N8N Docs:** https://docs.n8n.io
- **Node Types:** https://docs.n8n.io/integrations/
- **Community:** https://community.n8n.io
- **Workflows (Templates):** https://n8n.io/workflows

### **Ferramentas Úteis**

```bash
# 1. Testar APIs via curl
curl -X GET "https://api.example.com/endpoint" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# 2. Formatar JSON
cat response.json | jq '.'

# 3. Gerar SHA-256 hash (testar dedup)
echo -n "titulo|url" | sha256sum

# 4. Monitorar logs N8N
tail -f ~/.n8n/logs/*.log

# 5. Validar expressão cron
# Usar: https://crontab.guru
# Expressão: 0 7,11,15,19 * * *
# "At 7:00 AM, 11:00 AM, 3:00 PM, and 7:00 PM"
```

---

## 💡 PARTE 5: CASOS DE USO AVANÇADOS

### **Caso 1: Pausar automação aos finais de semana**

```javascript
// Code Node no início do workflow

const today = new Date().getDay();
const isWeekend = today === 0 || today === 6; // 0=Sunday, 6=Saturday

if (isWeekend) {
  console.log('Weekend - skipping execution');
  return { skip: true };
}

return { skip: false };
```

### **Caso 2: Escalar notícias por engagement score**

```javascript
// Code Node: Aumentar lead_score baseado em viralidade

const engagement = $input.json.engagement_score;
let leadScore = 50; // Base

if (engagement > 5000) leadScore = 100;
else if (engagement > 2000) leadScore = 85;
else if (engagement > 1000) leadScore = 70;

return {
  ...$$input.json,
  lead_score: leadScore
};
```

### **Caso 3: Enviar email diferente por niche**

```javascript
// Code Node: Selecionar template conforme niche

const niche = $input.json.niche;
const templates = {
  'startups': 12345,
  'ia': 12346,
  'investimento': 12347,
  'default': 12340
};

const templateId = templates[niche] || templates['default'];

return {
  ...$$input.json,
  sharpspring_template_id: templateId
};
```

---

## 🎓 PARTE 6: FAQ & BEST PRACTICES

### **P: Por que Gemini às vezes falha em extrair C-Levels?**
**R:** Se a notícia não menciona explicitamente nomes/títulos, Gemini não inventa. Solução: Ajustar prompt para buscar "posições de liderança mencionadas" ou "protagonistas identificáveis".

### **P: Posso usar menos de 4 execuções/dia?**
**R:** Sim! Mude a expressão cron de `0 7,11,15,19` para ex: `0 9,17` (2x/dia). Menos execuções = menos leads, mas também menos custos.

### **P: Quanto custará executar isso em produção?**
**R:** 
- N8N: $30/mês (cloud)
- Supabase: Free tier (até 1M queries/mês)
- Gemini: $0 (free tier generoso)
- YouTube: $0 (10k quota/dia)
- Lusha: ~$200-500/mês (100 req/dia)
- SharpSpring: já incluso
- **Total: ~$230-530/mês**

### **P: Como garantir que emails não vão para spam?**
**R:** 
1. Usar domínio da empresa (não "no-reply@automation.com")
2. Implementar SPF, DKIM, DMARC
3. Personalizar subject (nome do contato)
4. Incluir unsubscribe link (LGPD)
5. Testar com ferramentas como Mail-tester.com

---

## 🔗 CONCLUSÃO

Este guia de troubleshooting cobre:
✅ 6 erros mais comuns e soluções
✅ 3 otimizações de performance
✅ Segurança e credential rotation
✅ Referências técnicas completas
✅ Casos de uso avançados
✅ FAQ com best practices

**Para dúvidas futuras:** Consultar N8N Docs, logs de execução em Supabase, e testar via curl antes de integrar em N8N.
