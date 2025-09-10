# 🛡️ Rate Limiting - Documentação

## 📋 Visão Geral

O sistema implementa rate limiting para proteger a API contra abuso e garantir estabilidade do serviço.

## ⚙️ Configuração

### Limites Aplicados

- **Limite**: 30 requisições por minuto por IP
- **Janela de tempo**: 60 segundos
- **Aplicado em**: Todas as rotas da API (`/api/templates/*`)

### Headers de Resposta

Todas as respostas incluem headers informativos:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1640995200
```

### Resposta de Rate Limit Excedido

Quando o limite é excedido, retorna:

```json
{
  "error": "Muitas requisições. Tente novamente em 1 minuto.",
  "retryAfter": 45
}
```

**Status Code**: `429 Too Many Requests`
**Headers**:
- `Retry-After`: Segundos para tentar novamente
- `X-RateLimit-Limit`: Limite máximo
- `X-RateLimit-Remaining`: 0
- `X-RateLimit-Reset`: Timestamp de reset

## 🔧 Implementação Técnica

### Arquivo: `lib/rate-limit.ts`

```typescript
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000,        // 1 minuto
  maxRequests: 30,            // 30 requisições
  message: 'Muitas requisições. Tente novamente em 1 minuto.',
  statusCode: 429
}
```

### Detecção de IP

O sistema detecta o IP do cliente através de:

1. `x-forwarded-for` (proxy/load balancer)
2. `x-real-ip` (nginx)
3. Fallback para 'unknown'

### Armazenamento

- **Memória**: Map em memória para armazenar contadores
- **Limpeza automática**: Entradas expiradas são removidas automaticamente
- **Performance**: O(1) para operações de leitura/escrita

## 📊 Monitoramento

### Rota de Administração

`GET /api/admin/rate-limit`

**Autenticação**: Requer header `x-admin-key`

**Resposta**:
```json
{
  "success": true,
  "data": {
    "totalActiveIPs": 5,
    "activeIPs": [
      {
        "ip": "192.168.1.1",
        "count": 15,
        "resetTime": 1640995200000,
        "remaining": 15
      }
    ],
    "config": {
      "windowMs": 60000,
      "maxRequests": 30,
      "message": "Muitas requisições...",
      "statusCode": 429
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Variável de Ambiente

```env
ADMIN_KEY="sua-chave-secreta-para-admin"
```

## 🚀 Uso em Produção

### Vercel

1. Configure a variável `ADMIN_KEY` nas Environment Variables
2. O rate limiting funciona automaticamente
3. Para monitorar, faça requisições para `/api/admin/rate-limit`

### Exemplo de Monitoramento

```bash
# Verificar estatísticas
curl -H "x-admin-key: sua-chave-secreta" \
     https://seu-dominio.com/api/admin/rate-limit
```

## 🔄 Comportamento

### Primeira Requisição
- IP é registrado
- Contador inicia em 1
- Reset time é definido para 1 minuto no futuro

### Requisições Subsequentes
- Contador é incrementado
- Headers de rate limit são adicionados
- Se limite excedido, retorna 429

### Reset Automático
- Após 1 minuto, contador é resetado
- Limpeza automática remove IPs inativos
- 10% de chance de limpeza a cada requisição

## ⚠️ Considerações

### Limitações
- **Memória**: Contadores ficam em memória (não persistem entre restarts)
- **Escalabilidade**: Em múltiplas instâncias, cada uma tem seu próprio contador
- **IP Spoofing**: IPs podem ser falsificados

### Melhorias Futuras
- [ ] Redis para contadores distribuídos
- [ ] Rate limiting por usuário autenticado
- [ ] Diferentes limites por endpoint
- [ ] Whitelist de IPs
- [ ] Logs de rate limiting

## 🧪 Testes

### Teste Manual

```bash
# Fazer 31 requisições rapidamente
for i in {1..31}; do
  curl -X GET http://localhost:3000/api/templates
  echo "Requisição $i"
done
```

### Resposta Esperada

A 31ª requisição deve retornar:
- Status: 429
- Body: `{"error": "Muitas requisições...", "retryAfter": 45}`
- Headers: `Retry-After`, `X-RateLimit-*`

## 📈 Métricas

### Headers Importantes

- `X-RateLimit-Limit`: Limite configurado
- `X-RateLimit-Remaining`: Requisições restantes
- `X-RateLimit-Reset`: Timestamp de reset
- `Retry-After`: Segundos para tentar novamente (quando limitado)

### Monitoramento

Use a rota de admin para monitorar:
- IPs ativos
- Contadores por IP
- Tempo de reset
- Configurações atuais

O rate limiting está funcionando perfeitamente! 🎉
