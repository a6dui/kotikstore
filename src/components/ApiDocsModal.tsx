import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2 } from 'lucide-react';
import { haptic } from '../utils/telegram';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'balance' | 'order' | 'code'>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    haptic.success();
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const baseUrl = 'https://a6dui.github.io/kotikstore';

  const curlProducts = `curl -X GET "${baseUrl}/api/v1/products" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`;

  const curlBalance = `curl -X GET "${baseUrl}/api/v1/user/balance" \\
  -H "Authorization: Bearer ${apiKey}"`;

  const curlCreateOrder = `curl -X POST "${baseUrl}/api/v1/order/create" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "product_id": "chatgpt-plus",
    "option_id": "opt_shared",
    "months": 1,
    "contact": "@username_or_email"
  }'`;

  const pythonSnippet = `import requests

API_KEY = "${apiKey}"
BASE_URL = "${baseUrl}/api/v1"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# 1. Получить баланс
balance = requests.get(f"{BASE_URL}/user/balance", headers=HEADERS).json()
print("Ваш баланс:", balance)

# 2. Создать заказ на ChatGPT Plus
order_payload = {
    "product_id": "chatgpt-plus",
    "option_id": "opt_shared",
    "months": 1,
    "contact": "my_client@gmail.com"
}
response = requests.post(f"{BASE_URL}/order/create", json=order_payload, headers=HEADERS)
order_data = response.json()
print("Ключ доступа:", order_data.get("login_data"))`;

  const nodeSnippet = `const API_KEY = '${apiKey}';
const BASE_URL = '${baseUrl}/api/v1';

async function buySubscription() {
  const response = await fetch(\`\${BASE_URL}/order/create\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product_id: 'chatgpt-plus',
      option_id: 'opt_shared',
      months: 1,
      contact: 'client@example.com'
    })
  });
  
  const result = await response.json();
  console.log('Выданный аккаунт:', result.login_data);
}

buySubscription();`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-3xl border border-white/15 bg-[#0b0717] shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-black">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-black font-bold shadow-md shadow-emerald-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>Kotik Store REST API v1</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">LIVE</span>
              </h3>
              <p className="text-[11px] text-white/50">Автоматическая закупка и выдача ключей</p>
            </div>
          </div>
          <button
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 p-2 bg-black/40 border-b border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: '🔑 Обзор & Ключ' },
            { id: 'products', label: '📦 Товары' },
            { id: 'balance', label: '💰 Баланс' },
            { id: 'order', label: '⚡ Купить заказ' },
            { id: 'code', label: '💻 Примеры кода' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                haptic.selection();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-md shadow-emerald-500/20'
                  : 'text-white/60 hover:text-white bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-white/80 no-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Ваш секретный API-токен:</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Активен 24/7</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-emerald-500/30">
                  <span className="font-mono text-emerald-300 text-xs flex-1 truncate select-all">{apiKey}</span>
                  <button
                    onClick={() => handleCopy('api_key', apiKey)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1 transition shrink-0"
                  >
                    {copiedSection === 'api_key' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'api_key' ? 'Скопировано' : 'Копия'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-white">Как подключиться к API:</h4>
                <ul className="space-y-1.5 text-[11px] text-white/70 list-disc list-inside bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <li>Все запросы передаются по протоколу HTTPS.</li>
                  <li>Авторизация через HTTP-заголовок: <code className="text-emerald-300 bg-white/10 px-1 py-0.5 rounded font-mono">Authorization: Bearer &lt;API_KEY&gt;</code></li>
                  <li>Оплата заказов списывается напрямую с вашего внутреннего баланса в боте без подтверждений.</li>
                  <li>Выдача аккаунтов и ключей происходит мгновенно в JSON-ответе.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">GET</span>
                <span className="ml-2 font-mono text-xs text-white">/api/v1/products</span>
              </div>
              <p className="text-[11px] text-white/60">Возвращает полный список доступных нейросетей, тарифные планы, опции (Shared/Personal) и актуальные цены.</p>

              <div className="relative">
                <pre className="p-3 rounded-2xl bg-black/70 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  {curlProducts}
                </pre>
                <button
                  onClick={() => handleCopy('curl_prod', curlProducts)}
                  className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[10px] flex items-center gap-1"
                >
                  {copiedSection === 'curl_prod' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>cURL</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Пример ответа (200 OK):</span>
                <pre className="font-mono text-[10px] text-cyan-300/90 overflow-x-auto">
{`{
  "ok": true,
  "products": [
    {
      "id": "chatgpt-plus",
      "title": "ChatGPT Plus",
      "starting_price": 5.0,
      "stock_count": 0,
      "options": [{"id": "opt_shared", "name": "Shared", "price": 5.0}]
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'balance' && (
            <div className="space-y-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">GET</span>
                <span className="ml-2 font-mono text-xs text-white">/api/v1/user/balance</span>
              </div>
              <p className="text-[11px] text-white/60">Проверяет текущий доступный баланс в долларах ($) и статус аккаунта.</p>

              <div className="relative">
                <pre className="p-3 rounded-2xl bg-black/70 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  {curlBalance}
                </pre>
                <button
                  onClick={() => handleCopy('curl_bal', curlBalance)}
                  className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[10px] flex items-center gap-1"
                >
                  {copiedSection === 'curl_bal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>cURL</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Пример ответа (200 OK):</span>
                <pre className="font-mono text-[10px] text-cyan-300/90 overflow-x-auto">
{`{
  "ok": true,
  "user_id": 755843448,
  "balance": 25.00,
  "currency": "USD",
  "is_premium": true
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'order' && (
            <div className="space-y-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">POST</span>
                <span className="ml-2 font-mono text-xs text-white">/api/v1/order/create</span>
              </div>
              <p className="text-[11px] text-white/60">Создает покупку, списывает баланс и мгновенно возвращает данные авторизации (логин/пароль или ссылку-инвайт).</p>

              <div className="relative">
                <pre className="p-3 rounded-2xl bg-black/70 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  {curlCreateOrder}
                </pre>
                <button
                  onClick={() => handleCopy('curl_order', curlCreateOrder)}
                  className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[10px] flex items-center gap-1"
                >
                  {copiedSection === 'curl_order' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>cURL</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Пример успешной выдачи (200 OK):</span>
                <pre className="font-mono text-[10px] text-cyan-300/90 overflow-x-auto">
{`{
  "ok": true,
  "order_id": "ORD-API-99410",
  "product": "ChatGPT Plus",
  "login_data": "gpt_user@kotikstore.ai:SecurePass2026",
  "instructions": "Авторизуйтесь на сайте chatgpt.com",
  "warranty_until": "2026-12-10",
  "balance_remaining": 20.00
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Python (requests)</span>
                  </span>
                  <button
                    onClick={() => handleCopy('code_py', pythonSnippet)}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/80 text-[10px] flex items-center gap-1"
                  >
                    {copiedSection === 'code_py' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Копировать Python</span>
                  </button>
                </div>
                <pre className="p-3 rounded-2xl bg-black/80 border border-white/10 font-mono text-[10px] text-amber-200 overflow-x-auto">
                  {pythonSnippet}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Node.js / TypeScript (fetch)</span>
                  </span>
                  <button
                    onClick={() => handleCopy('code_js', nodeSnippet)}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/80 text-[10px] flex items-center gap-1"
                  >
                    {copiedSection === 'code_js' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Копировать JS</span>
                  </button>
                </div>
                <pre className="p-3 rounded-2xl bg-black/80 border border-white/10 font-mono text-[10px] text-cyan-200 overflow-x-auto">
                  {nodeSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <span>🛡️ Все запросы защищены SSL/TLS</span>
          <button
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
