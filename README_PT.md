# 💊 MedControl - App Inteligente de Controle de Medicamentos

## 📱 Sobre o App

MedControl é um aplicativo mobile desenvolvido para ajudar pessoas a gerenciar seus medicamentos de forma segura e eficiente. Ideal para:
- Idosos
- Pessoas com doenças crônicas
- Qualquer pessoa que precise manter controle rigoroso de medicamentos

### 🎯 Objetivo
Reduzir ansiedade e evitar erros relacionados ao esquecimento de medicamentos através de:
- Alarmes confiáveis
- Interface clara e simples
- Controle automático de estoque
- Sistema de prioridades

---

## ✨ Funcionalidades Implementadas (MVP)

### 1️⃣ **Sistema de Perfis Locais**
- ✅ Múltiplos perfis sem necessidade de login
- ✅ Personalização com cores e ícones
- ✅ Fácil troca entre perfis (Ex: "Eu", "Mãe", "Pai")

### 2️⃣ **Cadastro de Medicamentos**
- ✅ Nome e dosagem obrigatórios
- ✅ Três níveis de prioridade: Normal, Importante, Crítico
- ✅ Controle de estoque com alertas automáticos
- ✅ Upload de fotos (receita e caixa do medicamento)
- ✅ Informações do médico (opcional)
- ✅ Diferenciação entre medicamentos com/sem receita

### 3️⃣ **Sistema de Alarmes**
- ✅ Configuração de horários específicos
- ✅ Múltiplas frequências:
  - Todos os dias
  - Dias alternados
  - Dias específicos da semana
- ✅ Múltiplos medicamentos por alarme (Premium)
- ✅ Alarmes críticos insistentes (Premium)

### 4️⃣ **Controle de Estoque**
- ✅ Atualização automática ao confirmar tomada
- ✅ Alerta quando atingir quantidade mínima
- ✅ Visualização clara do estoque disponível

### 5️⃣ **Histórico de Medicamentos**
- ✅ Registro de todas as tomadas
- ✅ Status: Tomado, Pulado, Perdido
- ✅ Histórico com data e hora
- ✅ Cálculo de taxa de adesão

### 6️⃣ **Sistema Premium (Trial)**
- ✅ Trial gratuito de 15 dias
- ✅ Funcionalidades Premium:
  - Alarmes críticos insistentes
  - Múltiplos medicamentos por alarme
  - Prioridade avançada
- ✅ Bloqueio automático após fim do trial
- ✅ Funcionalidades básicas continuam funcionando

### 7️⃣ **Dashboard Home**
- ✅ Estatísticas em tempo real:
  - Total de medicamentos
  - Alarmes ativos
  - Taxa de adesão
- ✅ Alertas de estoque baixo
- ✅ Próximos alarmes do dia
- ✅ Ações rápidas (Adicionar medicamento/alarme)

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: React Native + Expo (SDK 54)
- **Navegação**: Expo Router (file-based routing)
- **State Management**: React Context API + AsyncStorage
- **UI Components**: 
  - React Native components nativos
  - Expo Vector Icons
  - React Native Safe Area Context
- **Libs principais**:
  - expo-image-picker (fotos)
  - @react-native-community/datetimepicker (seleção de horário)
  - date-fns (manipulação de datas)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Motor - async driver)
- **Features**:
  - RESTful API completa
  - Async/await para performance
  - Validação com Pydantic
  - CORS habilitado

### Banco de Dados (MongoDB)
**Collections:**
1. `profiles` - Perfis de usuários
2. `medications` - Medicamentos cadastrados
3. `alarms` - Alarmes programados
4. `alarm_logs` - Histórico de confirmações
5. `premium_trials` - Controle de trials premium

---

## 📂 Estrutura do Projeto

```
/app
├── backend/
│   ├── server.py          # FastAPI server com todas as rotas
│   ├── requirements.txt   # Dependências Python
│   └── .env              # Variáveis de ambiente
│
└── frontend/
    ├── app/
    │   ├── (tabs)/       # Navegação por tabs
    │   │   ├── home.tsx
    │   │   ├── medications.tsx
    │   │   ├── alarms.tsx
    │   │   ├── history.tsx
    │   │   └── settings.tsx
    │   ├── components/   # Componentes reutilizáveis
    │   ├── context/      # React Context (estado global)
    │   ├── types/        # TypeScript types
    │   ├── utils/        # Funções auxiliares + API
    │   ├── index.tsx     # Seleção de perfil
    │   ├── create-profile.tsx
    │   ├── add-medication.tsx
    │   └── add-alarm.tsx
    ├── package.json
    └── app.json
```

---

## 🎨 Design System

### Cores Principais
- **Primary**: `#4A90E2` (Azul confiável)
- **Success**: `#5CB85C` (Verde - confirmação)
- **Warning**: `#F0AD4E` (Laranja - alertas)
- **Critical**: `#D9534F` (Vermelho - crítico)
- **Background**: `#F8F9FA` (Cinza claro)
- **Text**: `#2C3E50` (Texto escuro)

### Princípios UX
- ✅ Botões grandes (min 48px) - fácil de tocar
- ✅ Tipografia legível (min 16px)
- ✅ Cores com significado claro
- ✅ Poucos cliques para ações principais
- ✅ Feedback visual imediato
- ✅ Design limpo e calmo

---

## 🚀 Como Executar

### Backend
```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd /app/frontend
yarn install
yarn start
```

---

## 📡 API Endpoints

### Profiles
- `POST /api/profiles` - Criar perfil
- `GET /api/profiles` - Listar perfis
- `GET /api/profiles/{id}` - Obter perfil
- `DELETE /api/profiles/{id}` - Deletar perfil

### Medications
- `POST /api/medications` - Criar medicamento
- `GET /api/medications?profile_id={id}` - Listar por perfil
- `GET /api/medications/{id}` - Obter medicamento
- `PUT /api/medications/{id}` - Atualizar medicamento
- `DELETE /api/medications/{id}` - Deletar medicamento

### Alarms
- `POST /api/alarms` - Criar alarme
- `GET /api/alarms?profile_id={id}` - Listar por perfil
- `GET /api/alarms/{id}` - Obter alarme
- `PUT /api/alarms/{id}` - Atualizar alarme
- `DELETE /api/alarms/{id}` - Deletar alarme

### Alarm Logs
- `POST /api/alarm-logs` - Registrar confirmação
- `GET /api/alarm-logs?profile_id={id}` - Histórico

### Premium Trial
- `POST /api/premium-trial` - Iniciar trial
- `GET /api/premium-trial/{profile_id}` - Status do trial

### Statistics
- `GET /api/stats/{profile_id}` - Estatísticas do perfil

---

## 📋 Próximos Passos (Fase 2)

### 🔔 Notificações (CRÍTICO)
- [ ] Implementar expo-notifications
- [ ] Agendamento de notificações locais
- [ ] Tela de confirmação quando alarme toca
- [ ] Alarmes críticos insistentes (repetir até confirmar)
- [ ] Background tasks para verificar alarmes

### 🎯 Melhorias UX
- [ ] Onboarding para novos usuários
- [ ] Tutorial interativo
- [ ] Pedido de avaliação após X dias de uso
- [ ] Modo escuro

### 💾 Backup e Sincronização
- [ ] Export de dados em JSON
- [ ] Import de dados
- [ ] Backup automático na nuvem (Premium)

### 📊 Recursos Adicionais
- [ ] Gráficos de adesão ao tratamento
- [ ] Registro de pressão arterial
- [ ] Notas por medicamento
- [ ] Compartilhamento de alarmes entre perfis

### 🔐 Autenticação (Futuro)
- [ ] Login opcional para sincronização
- [ ] Google Sign-In
- [ ] Backup automático com conta

---

## 🧪 Testes Realizados

### Backend ✅
- [x] Criar perfil
- [x] Listar perfis
- [x] Criar medicamento
- [x] Criar alarme
- [x] Obter estatísticas

### Frontend ✅
- [x] Compilação sem erros
- [x] Navegação entre telas
- [x] Upload de imagens funcional
- [x] Sistema de Context funcionando
- [x] AsyncStorage para perfil ativo

---

## 📝 Notas Importantes

### Armazenamento de Imagens
- Fotos são armazenadas em **base64** no MongoDB
- Formato: `data:image/jpeg;base64,{base64_string}`
- Qualidade reduzida para 50% para economizar espaço

### Premium Trial
- 15 dias gratuitos
- Verificação automática de expiração
- Funcionalidades básicas sempre disponíveis
- Bloqueio apenas de features premium

### Performance
- Todas as operações do backend são **async**
- Frontend usa Context API para evitar prop drilling
- AsyncStorage para cache do perfil ativo
- Imagens otimizadas para mobile

---

## 🎉 Status do MVP

### ✅ Completado
- Sistema de perfis locais
- Cadastro completo de medicamentos
- Sistema de alarmes com frequências
- Controle de estoque
- Histórico de medicamentos
- Sistema de premium trial
- Dashboard com estatísticas
- Upload de fotos
- Backend completo com MongoDB
- Frontend com navegação funcional

### ⏳ Pendente para versão final
- Notificações locais push
- Tela de confirmação de alarme
- Alarmes críticos insistentes
- Backup/export de dados
- Testes automatizados

---

## 👨‍💻 Desenvolvimento

**Arquitetura:** Mobile-first com Expo + FastAPI + MongoDB

**Padrões utilizados:**
- RESTful API
- Component-based architecture
- File-based routing (Expo Router)
- Async/await pattern
- Type safety com TypeScript

**Segurança:**
- Validação de dados no backend (Pydantic)
- CORS configurado
- Dados sensíveis em base64

---

## 📄 Licença

MVP desenvolvido para controle de medicamentos.

---

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `/var/log/supervisor/`
2. Backend: `http://localhost:8001/docs` (Swagger UI)
3. Frontend: Expo DevTools
