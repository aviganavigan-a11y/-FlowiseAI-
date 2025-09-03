import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  GITHUB_TOKEN?: string;
  OPENAI_API_KEY?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flowise Agent Generator - Генератор Агентов</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            'flowise': '#4F46E5',
                            'flowise-light': '#818CF8',
                            'flowise-dark': '#3730A3'
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="bg-gradient-to-br from-slate-50 to-indigo-50 min-h-screen">
        <div class="container mx-auto px-4 py-8 max-w-6xl">
            <!-- Header -->
            <header class="text-center mb-12">
                <div class="flex items-center justify-center mb-4">
                    <i class="fas fa-robot text-5xl text-flowise mr-4"></i>
                    <h1 class="text-5xl font-bold bg-gradient-to-r from-flowise to-flowise-light bg-clip-text text-transparent">
                        Flowise Agent Generator
                    </h1>
                </div>
                <p class="text-xl text-gray-600 mb-6">
                    Интеллектуальный генератор JSON конфигураций агентов для Flowise AI
                </p>
                <div class="flex justify-center space-x-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        <i class="fas fa-check-circle mr-2"></i>
                        GitHub Integration
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        <i class="fas fa-brain mr-2"></i>
                        AI-Powered
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                        <i class="fas fa-code mr-2"></i>
                        JSON Export
                    </span>
                </div>
            </header>

            <!-- Main Content -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Input Form -->
                <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <i class="fas fa-edit text-flowise mr-3"></i>
                        Описание Задачи
                    </h2>
                    
                    <form id="agentForm" class="space-y-6">
                        <!-- Agent Type -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Тип Агента
                            </label>
                            <select id="agentType" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowise focus:border-transparent">
                                <option value="">Выберите тип агента</option>
                                <option value="chatbot">Чат-бот</option>
                                <option value="analyzer">Аналитический агент</option>
                                <option value="automation">Автоматизация задач</option>
                                <option value="retrieval">RAG агент</option>
                                <option value="multimodal">Мультимодальный агент</option>
                                <option value="custom">Пользовательский</option>
                            </select>
                        </div>

                        <!-- Task Description -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Описание Задачи
                            </label>
                            <textarea 
                                id="taskDescription" 
                                rows="6" 
                                placeholder="Опишите детально, что должен делать ваш агент. Например: 'Создать агента для анализа отзывов клиентов, который будет классифицировать эмоциональный тон и выделять ключевые проблемы'"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowise focus:border-transparent resize-none"
                            ></textarea>
                        </div>

                        <!-- Model Preference -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Предпочитаемая Модель ИИ
                            </label>
                            <select id="modelPreference" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowise focus:border-transparent">
                                <option value="">Автоматический выбор</option>
                                <option value="gpt-4">GPT-4</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                <option value="claude">Claude</option>
                                <option value="palm">PaLM</option>
                                <option value="llama">Llama</option>
                            </select>
                        </div>

                        <!-- Additional Options -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" id="includeMemory" class="rounded border-gray-300 text-flowise focus:ring-flowise">
                                    <span class="ml-2 text-sm text-gray-700">Включить память</span>
                                </label>
                            </div>
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" id="includeTools" class="rounded border-gray-300 text-flowise focus:ring-flowise">
                                    <span class="ml-2 text-sm text-gray-700">Добавить инструменты</span>
                                </label>
                            </div>
                        </div>

                        <!-- Generate Button -->
                        <button 
                            type="submit" 
                            id="generateBtn"
                            class="w-full bg-gradient-to-r from-flowise to-flowise-light text-white font-bold py-4 px-6 rounded-lg hover:from-flowise-dark hover:to-flowise transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            <i class="fas fa-magic mr-2"></i>
                            Сгенерировать Агента
                        </button>
                    </form>

                    <!-- Status -->
                    <div id="status" class="mt-6 hidden">
                        <div class="flex items-center justify-center space-x-3">
                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-flowise"></div>
                            <span class="text-flowise font-medium">Генерация агента...</span>
                        </div>
                    </div>
                </div>

                <!-- Results Panel -->
                <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <i class="fas fa-code text-flowise mr-3"></i>
                        JSON Конфигурация
                    </h2>
                    
                    <div id="resultsContainer">
                        <div class="text-center py-12 text-gray-500">
                            <i class="fas fa-robot text-6xl mb-4 opacity-20"></i>
                            <p class="text-lg">Заполните форму и нажмите "Сгенерировать Агента"<br>для создания JSON конфигурации</p>
                        </div>
                    </div>

                    <!-- Action Buttons (initially hidden) -->
                    <div id="actionButtons" class="mt-6 hidden space-y-3">
                        <button 
                            id="copyBtn"
                            class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            <i class="fas fa-copy mr-2"></i>
                            Копировать JSON
                        </button>
                        <button 
                            id="downloadBtn"
                            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            <i class="fas fa-download mr-2"></i>
                            Скачать Файл
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <footer class="text-center mt-12 text-gray-600">
                <p>© 2024 Flowise Agent Generator | Создано с ❤️ для разработчиков ИИ</p>
            </footer>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// API: Get Flowise repository structure
app.get('/api/flowise/structure', async (c) => {
  try {
    // Fetch Flowise repository structure from GitHub API
    const response = await fetch('https://api.github.com/repos/FlowiseAI/Flowise/contents/packages/components/nodes', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Flowise-Agent-Generator'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()
    
    return c.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching Flowise structure:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch Flowise repository structure',
      details: error.message
    }, 500)
  }
})

// API: Generate agent configuration
app.post('/api/generate-agent', async (c) => {
  try {
    const body = await c.req.json()
    const { agentType, taskDescription, modelPreference, includeMemory, includeTools } = body

    if (!taskDescription || taskDescription.trim().length === 0) {
      return c.json({
        success: false,
        error: 'Описание задачи не может быть пустым'
      }, 400)
    }

    // First, get current Flowise node structure
    const structureResponse = await fetch('https://api.github.com/repos/FlowiseAI/Flowise/contents/packages/components/nodes', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Flowise-Agent-Generator'
      }
    })

    let availableNodes = []
    if (structureResponse.ok) {
      const structureData = await structureResponse.json()
      availableNodes = structureData.map(node => node.name).slice(0, 20) // Limit for prompt size
    }

    // Generate agent configuration using AI
    const agentConfig = await generateAgentConfig({
      agentType,
      taskDescription,
      modelPreference,
      includeMemory,
      includeTools,
      availableNodes
    })

    return c.json({
      success: true,
      data: agentConfig,
      metadata: {
        generated_at: new Date().toISOString(),
        agent_type: agentType,
        model_preference: modelPreference || 'auto'
      }
    })

  } catch (error) {
    console.error('Error generating agent:', error)
    return c.json({
      success: false,
      error: 'Ошибка генерации агента',
      details: error.message
    }, 500)
  }
})

// AI Agent Generation Function
async function generateAgentConfig(params) {
  const { agentType, taskDescription, modelPreference, includeMemory, includeTools, availableNodes } = params

  // Create a comprehensive prompt for agent generation
  const prompt = `Создай JSON конфигурацию для Flowise агента на основе следующих параметров:

Тип агента: ${agentType || 'пользовательский'}
Описание задачи: ${taskDescription}
Предпочитаемая модель: ${modelPreference || 'автоматический выбор'}
Включить память: ${includeMemory ? 'да' : 'нет'}
Включить инструменты: ${includeTools ? 'да' : 'нет'}

Доступные типы нодов в Flowise: ${availableNodes.join(', ')}

Создай полную рабочую конфигурацию агента в JSON формате, которая включает:
1. Основные ноды (LLM, Chain, Memory если нужно)
2. Правильные связи между нодами
3. Соответствующие параметры и настройки
4. Metadata для каждого нода

Ответь только JSON конфигурацией без дополнительного текста.`

  // For now, create a template-based configuration
  // In production, this would call an AI service like OpenAI
  const baseConfig = {
    "nodes": [
      {
        "width": 300,
        "height": 376,
        "id": "chatOpenAI_0",
        "position": { "x": 671, "y": 155 },
        "type": "customNode",
        "data": {
          "id": "chatOpenAI_0",
          "label": "ChatOpenAI",
          "version": 6,
          "name": "chatOpenAI",
          "type": "ChatOpenAI",
          "baseClasses": ["ChatOpenAI", "BaseChatModel", "BaseLanguageModel", "Runnable"],
          "category": "Chat Models",
          "description": "Wrapper around OpenAI large language models that use the Chat endpoint",
          "inputParams": [
            {
              "label": "Connect Credential",
              "name": "credential",
              "type": "credential",
              "credentialNames": ["openAIApi"]
            },
            {
              "label": "Model Name",
              "name": "modelName",
              "type": "options",
              "options": [
                { "label": "gpt-4", "name": "gpt-4" },
                { "label": "gpt-4-turbo", "name": "gpt-4-turbo" },
                { "label": "gpt-3.5-turbo", "name": "gpt-3.5-turbo" }
              ],
              "default": modelPreference || "gpt-3.5-turbo",
              "optional": true
            }
          ],
          "inputAnchors": [
            {
              "label": "Cache",
              "name": "cache",
              "type": "BaseCache",
              "optional": true
            }
          ],
          "inputs": {
            "modelName": modelPreference || "gpt-3.5-turbo",
            "temperature": 0.9,
            "maxTokens": "",
            "topP": "",
            "frequencyPenalty": "",
            "presencePenalty": "",
            "timeout": "",
            "basepath": "",
            "baseOptions": "",
            "cache": ""
          },
          "outputAnchors": [
            {
              "id": "chatOpenAI_0-output-chatOpenAI-ChatOpenAI|BaseChatModel|BaseLanguageModel|Runnable",
              "name": "chatOpenAI",
              "label": "ChatOpenAI",
              "description": "Wrapper around OpenAI large language models that use the Chat endpoint",
              "type": "ChatOpenAI | BaseChatModel | BaseLanguageModel | Runnable"
            }
          ]
        }
      },
      {
        "width": 300,
        "height": 481,
        "id": "conversationChain_0",
        "position": { "x": 1092, "y": 155 },
        "type": "customNode",
        "data": {
          "id": "conversationChain_0",
          "label": "Conversation Chain",
          "version": 3,
          "name": "conversationChain",
          "type": "ConversationChain",
          "baseClasses": ["ConversationChain", "LLMChain", "BaseChain", "Runnable"],
          "category": "Chains",
          "description": `Цепочка для ведения разговора с памятью. Задача: ${taskDescription}`,
          "inputParams": [
            {
              "label": "System Message",
              "name": "systemMessagePrompt",
              "type": "string",
              "rows": 4,
              "additionalParams": true,
              "optional": true,
              "default": `Ты профессиональный AI ассистент. Твоя задача: ${taskDescription}. Отвечай профессионально и полезно.`
            }
          ],
          "inputAnchors": [
            {
              "label": "Language Model",
              "name": "model",
              "type": "BaseLanguageModel"
            },
            {
              "label": "Memory",
              "name": "memory",
              "type": "BaseMemory",
              "optional": true
            }
          ],
          "inputs": {
            "model": "{{chatOpenAI_0.data.instance}}",
            "memory": includeMemory ? "{{bufferMemory_0.data.instance}}" : "",
            "systemMessagePrompt": `Ты профессиональный AI ассистент. Твоя задача: ${taskDescription}. Отвечай профессионально и полезно.`
          },
          "outputAnchors": [
            {
              "id": "conversationChain_0-output-conversationChain-ConversationChain|LLMChain|BaseChain|Runnable",
              "name": "conversationChain",
              "label": "ConversationChain",
              "type": "ConversationChain | LLMChain | BaseChain | Runnable"
            }
          ]
        }
      }
    ],
    "edges": [
      {
        "source": "chatOpenAI_0",
        "sourceHandle": "chatOpenAI_0-output-chatOpenAI-ChatOpenAI|BaseChatModel|BaseLanguageModel|Runnable",
        "target": "conversationChain_0",
        "targetHandle": "conversationChain_0-input-model-BaseLanguageModel",
        "type": "buttonedge",
        "id": "chatOpenAI_0-chatOpenAI_0-output-chatOpenAI-ChatOpenAI|BaseChatModel|BaseLanguageModel|Runnable-conversationChain_0-conversationChain_0-input-model-BaseLanguageModel"
      }
    ]
  }

  // Add memory node if requested
  if (includeMemory) {
    baseConfig.nodes.push({
      "width": 300,
      "height": 251,
      "id": "bufferMemory_0",
      "position": { "x": 671, "y": 580 },
      "type": "customNode",
      "data": {
        "id": "bufferMemory_0",
        "label": "Buffer Memory",
        "version": 2,
        "name": "bufferMemory",
        "type": "BufferMemory",
        "baseClasses": ["BufferMemory", "BaseChatMemory", "BaseMemory"],
        "category": "Memory",
        "description": "Retrieve chat messages stored in buffer",
        "inputParams": [
          {
            "label": "Memory Key",
            "name": "memoryKey",
            "type": "string",
            "default": "chat_history"
          },
          {
            "label": "Input Key",
            "name": "inputKey",
            "type": "string",
            "default": "input"
          }
        ],
        "inputs": {
          "memoryKey": "chat_history",
          "inputKey": "input"
        },
        "outputAnchors": [
          {
            "id": "bufferMemory_0-output-bufferMemory-BufferMemory|BaseChatMemory|BaseMemory",
            "name": "bufferMemory",
            "label": "BufferMemory",
            "type": "BufferMemory | BaseChatMemory | BaseMemory"
          }
        ]
      }
    })

    baseConfig.edges.push({
      "source": "bufferMemory_0",
      "sourceHandle": "bufferMemory_0-output-bufferMemory-BufferMemory|BaseChatMemory|BaseMemory",
      "target": "conversationChain_0",
      "targetHandle": "conversationChain_0-input-memory-BaseMemory",
      "type": "buttonedge",
      "id": "bufferMemory_0-bufferMemory_0-output-bufferMemory-BufferMemory|BaseChatMemory|BaseMemory-conversationChain_0-conversationChain_0-input-memory-BaseMemory"
    })
  }

  return baseConfig
}

export default app