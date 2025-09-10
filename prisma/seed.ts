import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default templates
  const templates = [
    {
      name: 'Proposta Básica',
      content: '<h1>Proposta Comercial</h1><p>Prezado(a) Cliente,</p><p>Apresentamos nossa proposta para os serviços solicitados:</p><h2>Escopo dos Serviços</h2><ul><li>Serviço 1</li><li>Serviço 2</li><li>Serviço 3</li></ul><h2>Investimento</h2><p>Valor total: R$ 0,00</p><p>Atenciosamente,</p>',
      description: 'Template básico para propostas comerciais'
    },
    {
      name: 'Proposta Detalhada',
      content: '<h1>Proposta Comercial Detalhada</h1><p>Prezado(a) Cliente,</p><p>É com grande satisfação que apresentamos nossa proposta comercial detalhada.</p><h2>1. Apresentação da Empresa</h2><p>Nossa empresa atua no mercado há X anos...</p><h2>2. Escopo dos Serviços</h2><p>Descrição detalhada dos serviços...</p><h2>3. Metodologia</h2><p>Nossa metodologia de trabalho...</p><h2>4. Cronograma</h2><p>Prazo de execução...</p><h2>5. Investimento</h2><p>Valor total: R$ 0,00</p><h2>6. Condições Comerciais</h2><p>Forma de pagamento...</p><p>Atenciosamente,</p>',
      description: 'Template completo com seções detalhadas'
    }
  ]

  for (const template of templates) {
    await prisma.template.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
