# Sistema de Pagamentos - Atualização

## Resumo das Mudanças

Sistema de pagamentos atualizado para usar a API `/api/payments/create` com controle de planos (mensal/anual) e expiração de acesso.

## Alterações Realizadas

### 1. Schema do Prisma (`prisma/schema.prisma`)

Adicionados dois novos campos ao modelo `Payment`:

- **`plan`**: String opcional que armazena o tipo de plano (`"monthly"` ou `"annual"`)
- **`accessExpiresAt`**: DateTime opcional que armazena quando o acesso do usuário expira

```prisma
model Payment {
  // ... campos existentes
  plan            String?   // "monthly" ou "annual"
  accessExpiresAt DateTime? @map("access_expires_at") // Data de expiração do acesso
  // ... outros campos
}
```

**Migração aplicada**: `npx prisma db push`

### 2. API de Criação de Pagamento (`app/api/payments/create/route.ts`)

**Mudanças:**
- Adicionado campo `plan` ao schema de validação (enum: `'monthly' | 'annual'`)
- Cálculo automático da data de expiração baseado no plano:
  - **Mensal**: +30 dias (1 mês)
  - **Anual**: +365 dias (1 ano)
- Campos `plan` e `accessExpiresAt` salvos no banco de dados

**Exemplo de uso:**
```typescript
POST /api/payments/create
{
  "amount": 49.90,
  "description": "Assinatura Mensal",
  "customer": {
    "name": "João Silva",
    "email": "joao@example.com",
    "cellphone": "11999999999",
    "taxId": "12345678900"
  },
  "plan": "monthly",
  "externalId": "user-123"
}
```

### 3. Hook usePayment (`hooks/use-payment.ts`)

**Mudanças:**
- Interface `CreatePaymentData` atualizada com campo `plan?: 'monthly' | 'annual'`
- Interface `Payment` atualizada com campos `plan` e `accessExpiresAt`

### 4. Modal de Pagamento (`components/payment-modal-print.tsx`)

**Refatoração completa:**
- Agora usa o hook `usePayment` ao invés de chamadas fetch diretas
- Integrado com `/api/payments/create`
- Busca dados do perfil do usuário (CPF e telefone) da API `/api/contractor/profile`
- Envia informações completas do cliente para a AbacatePay
- Exibe QR Code usando `payment.brCodeBase64`
- Verificação automática de status a cada 5 segundos

**Fluxo:**
1. Usuário seleciona plano (mensal ou anual)
2. Sistema busca dados do perfil do usuário
3. Cria pagamento via `createPayment()` do hook
4. Exibe QR Code PIX
5. Verifica status automaticamente
6. Callback `onPaymentComplete()` quando pago

### 5. API de Verificação de Acesso (`app/api/payments/check-access/route.ts`)

**Nova API criada** para verificar se o usuário tem acesso válido.

**Endpoint:** `GET /api/payments/check-access?userId=USER_ID`

**Resposta:**
```json
{
  "success": true,
  "hasAccess": true,
  "needsPayment": false,
  "payment": {
    "id": 123,
    "plan": "monthly",
    "paidAt": "2025-01-15T10:00:00Z",
    "accessExpiresAt": "2025-02-15T10:00:00Z"
  },
  "message": "Acesso válido"
}
```

**Lógica:**
1. Busca cliente pelo `userId`
2. Busca último pagamento com status `PAID`
3. Verifica se `accessExpiresAt > now`
4. Retorna se tem acesso válido ou precisa pagar

### 6. Webhook (`app/api/payments/webhook/route.ts`)

**Mudanças:**
- Quando pagamento é confirmado (`status === 'PAID'`), calcula e salva `accessExpiresAt`
- Garante que a data de expiração seja definida mesmo se não foi calculada na criação

## Como Usar

### 1. Verificar se usuário precisa pagar

```typescript
const response = await fetch(`/api/payments/check-access?userId=${userId}`)
const data = await response.json()

if (data.needsPayment) {
  // Abrir modal de pagamento
  setShowPaymentModal(true)
}
```

### 2. Abrir modal de pagamento

```tsx
import { PaymentModalPrint } from '@/components/payment-modal-print'

<PaymentModalPrint
  open={showPaymentModal}
  onOpenChange={setShowPaymentModal}
  onPaymentComplete={() => {
    // Callback quando pagamento for confirmado
    console.log('Pagamento confirmado!')
    // Recarregar dados, liberar impressão, etc.
  }}
/>
```

### 3. Controle de expiração

O sistema agora controla automaticamente:
- **Plano Mensal**: Acesso expira em 30 dias após pagamento
- **Plano Anual**: Acesso expira em 1 ano após pagamento

Quando o acesso expira, o modal será exibido novamente solicitando novo pagamento.

## Fluxo Completo

```
1. Usuário tenta imprimir proposta
   ↓
2. Sistema verifica acesso via /api/payments/check-access
   ↓
3. Se needsPayment === true → Abre modal
   ↓
4. Usuário seleciona plano (mensal/anual)
   ↓
5. Sistema cria pagamento com plan e accessExpiresAt
   ↓
6. Exibe QR Code PIX
   ↓
7. Verifica status a cada 5s
   ↓
8. Quando PAID → Webhook atualiza accessExpiresAt (se necessário)
   ↓
9. Modal chama onPaymentComplete()
   ↓
10. Sistema libera impressão
```

## Próximos Passos Sugeridos

1. **Integrar verificação de acesso** nas páginas de impressão
2. **Criar middleware** para proteger rotas baseado em `accessExpiresAt`
3. **Adicionar notificações** de expiração próxima (ex: 7 dias antes)
4. **Dashboard de assinaturas** para o usuário ver status e renovar
5. **Renovação automática** via webhook quando plano expira

## Observações Importantes

- ⚠️ O campo `userId` no modelo `Customer` é opcional - vincular ao usuário do Stack Auth quando disponível
- ⚠️ Valores padrão (`'00000000000'`) são usados se perfil do usuário não estiver completo
- ⚠️ Recomenda-se validar que o usuário tenha CPF e telefone cadastrados antes de permitir pagamento
- ✅ Sistema já está preparado para múltiplos pagamentos do mesmo usuário
- ✅ Webhook garante que `accessExpiresAt` seja sempre definido quando pagamento for confirmado
