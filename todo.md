# Manutenção Pro 2.0 - TODO

## Arquitetura e Banco de Dados
- [x] Definir schema de tabelas (orders, statusHistory, users)
- [x] Gerar e aplicar migrations SQL

## Backend - Procedures tRPC
- [x] Criar procedure para submeter nova solicitação (público)
- [x] Criar procedure para listar ordens (protegido)
- [x] Criar procedure para atualizar status de ordem
- [x] Criar procedure para obter histórico de alterações
- [x] Criar procedure para exportar relatório CSV
- [x] Implementar notificação automática ao responsável

## Frontend - Interface Pública
- [x] Design e layout da página de solicitação
- [x] Formulário com campos: setor/máquina, tipo de problema, descrição, prioridade, nome
- [x] Validação de campos
- [x] Feedback de sucesso/erro ao enviar
- [x] Responsividade mobile

## Frontend - Painel Administrativo
- [x] Layout do dashboard com sidebar
- [x] Listagem de ordens com tabela responsiva
- [x] Filtros por status (Aberta, Em Andamento, Concluída)
- [x] Filtros por prioridade
- [x] Modal/drawer para atualizar status
- [x] Exibição de histórico de alterações
- [x] Responsividade mobile

## Histórico e Relatórios
- [x] Registrar alterações de status com timestamp e usuário
- [x] Exibir histórico no painel
- [x] Implementar exportação CSV com filtros
- [x] Testar exportação

## Testes e Finalização
- [x] Testes unitários das procedures
- [x] Testes de responsividade mobile
- [x] Validação de fluxos completos
- [x] Otimizações de performance
- [x] Checkpoint final e entrega
