# 🔔 Guia de Configuração de Alarmes - PillGuard

Este guia explica como os alarmes funcionam no PillGuard e como configurar para produção.

## ✅ Tecnologia de Alarmes

O PillGuard usa **expo-notifications** com configurações otimizadas para alarmes confiáveis:

| Recurso | Implementação | Status |
|---------|--------------|--------|
| Alarmes exatos | AndroidImportance.MAX | ✅ |
| Canais de notificação | medication_alarms + critical_alarms | ✅ |
| Alarmes críticos | bypassDnd: true | ✅ |
| Prioridade máxima | AndroidNotificationPriority.MAX | ✅ |

**🎉 Não precisa de Firebase!** Os alarmes são 100% locais.

---

## 📱 Como Funciona

1. **Ao criar um alarme**: O app agenda uma notificação local
2. **No horário do alarme**: O Android mostra a notificação com som e vibração
3. **Alarmes críticos**: Ignoram o modo "Não Perturbe"
4. **Frequências suportadas**: Todo dia, Alternado, ou Datas específicas

---

## 🚀 Como Publicar o App

### Passo 1: Exportar para GitHub
1. Na Emergent, clique no ícone do **GitHub**
2. Conecte sua conta e salve o projeto

### Passo 2: Gerar o APK (no seu computador)

```bash
# Clone o projeto
git clone https://github.com/seu-usuario/pillguard.git
cd pillguard/frontend

# Instale as dependências
npm install

# Instale o EAS CLI
npm install -g eas-cli

# Faça login no Expo
npx eas login

# Configure o projeto
npx eas build:configure

# Gere o APK de teste
npx eas build --platform android --profile preview
```

### Passo 3: Instalar e Testar
1. Baixe o APK gerado pelo EAS
2. Instale no celular
3. Configure as permissões (veja abaixo)

---

## ⚙️ Configurações Importantes no Android

### 1. Permissões de Notificação
- O app pedirá permissão automaticamente
- Aceite todas as permissões

### 2. Otimização de Bateria
Configurações → Apps → PillGuard → Bateria → **"Sem restrições"**

### 3. Notificações do App
Configurações → Apps → PillGuard → Notificações:
- ✅ Alarmes de Medicamentos (ativar)
- ✅ Alarmes Críticos (ativar)

---

## 🔧 Tipos de Build

| Profile | Uso | Comando |
|---------|-----|---------|
| `preview` | Teste interno (APK) | `npx eas build -p android --profile preview` |
| `production` | Play Store (AAB) | `npx eas build -p android --profile production` |

---

## ❓ Solução de Problemas

### Alarmes não tocam?
1. Verifique permissões de notificação
2. Desative otimização de bateria para o app
3. Verifique se o app não está em "Apps com restrições"

### Alarmes atrasam?
1. Desative o modo "Economia de bateria"
2. Adicione o PillGuard à lista de exceções de bateria

---

## 📞 Suporte
Abra uma issue no GitHub se tiver problemas.

