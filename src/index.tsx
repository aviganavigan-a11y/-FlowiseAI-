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

  // Generate intelligent system prompt based on task description
  const systemPrompt = generateSystemPrompt(taskDescription, agentType)
  
  // Get model configuration based on preference
  const modelConfig = getModelConfig(modelPreference || 'gpt-4o-mini')

  // Create proper Flowise AgentFlow v2 configuration
  const agentConfig = {
    "description": `${getAgentTypeDescription(agentType)} - ${taskDescription}`,
    "usecases": [getUseCaseCategory(agentType)],
    "nodes": [
      // Start node (required for all agent flows)
      {
        "id": "startAgentflow_0",
        "type": "agentFlow",
        "position": {
          "x": 64,
          "y": 98.5
        },
        "data": {
          "id": "startAgentflow_0",
          "label": "Start",
          "version": 1.1,
          "name": "startAgentflow",
          "type": "Start",
          "color": "#7EE787",
          "hideInput": true,
          "baseClasses": ["Start"],
          "category": "Agent Flows",
          "description": "Starting point of the agentflow",
          "inputParams": [
            {
              "label": "Input Type",
              "name": "startInputType",
              "type": "options",
              "options": [
                {
                  "label": "Chat Input",
                  "name": "chatInput",
                  "description": "Start the conversation with chat input"
                }
              ],
              "default": "chatInput",
              "id": "startAgentflow_0-input-startInputType-options",
              "display": true
            },
            {
              "label": "Ephemeral Memory",
              "name": "startEphemeralMemory",
              "type": "boolean",
              "description": "Start fresh for every execution without past chat history",
              "optional": true,
              "id": "startAgentflow_0-input-startEphemeralMemory-boolean",
              "display": true
            }
          ],
          "inputAnchors": [],
          "inputs": {
            "startInputType": "chatInput",
            "startEphemeralMemory": !includeMemory
          },
          "outputAnchors": [
            {
              "id": "startAgentflow_0-output-startAgentflow",
              "label": "Start",
              "name": "startAgentflow"
            }
          ],
          "outputs": {},
          "selected": false
        },
        "width": 103,
        "height": 66,
        "positionAbsolute": {
          "x": 64,
          "y": 98.5
        },
        "selected": false,
        "dragging": false
      },
      // Main Agent node
      {
        "id": "agentAgentflow_0",
        "position": {
          "x": 250,
          "y": 96.5
        },
        "data": {
          "id": "agentAgentflow_0",
          "label": getAgentLabel(agentType),
          "version": 1,
          "name": "agentAgentflow",
          "type": "Agent",
          "color": "#4DD0E1",
          "baseClasses": ["Agent"],
          "category": "Agent Flows",
          "description": "Dynamically choose and utilize tools during runtime, enabling multi-step reasoning",
          "inputParams": [
            {
              "label": "Model",
              "name": "agentModel",
              "type": "asyncOptions",
              "loadMethod": "listModels",
              "loadConfig": true,
              "id": "agentAgentflow_0-input-agentModel-asyncOptions",
              "display": true
            },
            {
              "label": "Messages",
              "name": "agentMessages",
              "type": "array",
              "optional": true,
              "acceptVariable": true,
              "array": [
                {
                  "label": "Role",
                  "name": "role",
                  "type": "options",
                  "options": [
                    { "label": "System", "name": "system" },
                    { "label": "Assistant", "name": "assistant" },
                    { "label": "User", "name": "user" }
                  ]
                },
                {
                  "label": "Content",
                  "name": "content",
                  "type": "string",
                  "acceptVariable": true,
                  "generateInstruction": true,
                  "rows": 4
                }
              ],
              "id": "agentAgentflow_0-input-agentMessages-array",
              "display": true
            },
            {
              "label": "Enable Memory",
              "name": "agentEnableMemory",
              "type": "boolean",
              "description": "Enable memory for the conversation thread",
              "default": true,
              "optional": true,
              "id": "agentAgentflow_0-input-agentEnableMemory-boolean",
              "display": true
            }
          ],
          "inputAnchors": [],
          "inputs": {
            "agentModel": modelConfig.modelType,
            "agentMessages": [
              {
                "role": "system",
                "content": systemPrompt
              }
            ],
            "agentTools": includeTools ? generateToolsConfig(agentType) : "",
            "agentEnableMemory": includeMemory,
            "agentMemoryType": "allMessages",
            "agentReturnResponseAs": "userMessage",
            "agentModelConfig": modelConfig
          },
          "outputAnchors": [
            {
              "id": "agentAgentflow_0-output-agentAgentflow",
              "label": "Agent",
              "name": "agentAgentflow"
            }
          ],
          "outputs": {},
          "selected": false
        },
        "type": "agentFlow",
        "width": 175,
        "height": 72,
        "selected": false,
        "positionAbsolute": {
          "x": 250,
          "y": 96.5
        },
        "dragging": false
      }
    ],
    "edges": [
      {
        "source": "startAgentflow_0",
        "sourceHandle": "startAgentflow_0-output-startAgentflow",
        "target": "agentAgentflow_0",
        "targetHandle": "agentAgentflow_0",
        "data": {
          "sourceColor": "#7EE787",
          "targetColor": "#4DD0E1",
          "isHumanInput": false
        },
        "type": "agentFlow",
        "id": "startAgentflow_0-startAgentflow_0-output-startAgentflow-agentAgentflow_0-agentAgentflow_0"
      }
    ]
  }

  return agentConfig
}

// Helper functions for intelligent agent generation
function generateSystemPrompt(taskDescription, agentType) {
  const basePrompts = {
    'chatbot': `<p>Ты профессиональный чат-бот помощник. Твоя основная задача: ${taskDescription}</p><p>Принципы работы:</p><ul><li>Всегда будь вежливым и профессиональным</li><li>Отвечай четко и по существу</li><li>Если не знаешь ответ, честно признайся в этом</li><li>Предлагай дополнительную помощь когда это уместно</li></ul>`,
    
    'analyzer': `<p>Ты экспертный аналитический агент. Твоя задача: ${taskDescription}</p><p>Методология анализа:</p><ul><li>Собирай и структурируй данные</li><li>Применяй критическое мышление</li><li>Предоставляй обоснованные выводы</li><li>Выделяй ключевые инсайты и рекомендации</li></ul>`,
    
    'automation': `<p>Ты агент автоматизации задач. Твоя цель: ${taskDescription}</p><p>Принципы автоматизации:</p><ul><li>Оптимизируй процессы для максимальной эффективности</li><li>Обеспечивай надежность и стабильность</li><li>Документируй все выполняемые действия</li><li>Предупреждай о возможных проблемах</li></ul>`,
    
    'retrieval': `<p>Ты RAG агент (Retrieval-Augmented Generation). Твоя задача: ${taskDescription}</p><p>Используя предоставленный контекст, отвечай на вопросы пользователя максимально точно и полно.</p><p>Если в контексте нет релевантной информации для ответа на вопрос, честно сообщи об этом. Не выдумывай информацию.</p>`,
    
    'multimodal': `<p>Ты мультимодальный агент, способный работать с различными типами контента. Твоя задача: ${taskDescription}</p><p>Возможности:</p><ul><li>Анализ текста, изображений и других медиа</li><li>Интеграция информации из разных источников</li><li>Адаптация к различным форматам входных данных</li></ul>`
  }

  return basePrompts[agentType] || `<p>Ты профессиональный AI ассистент. Твоя задача: ${taskDescription}</p><p>Выполняй задачи качественно, профессионально и в соответствии с требованиями пользователя.</p>`
}

function getModelConfig(modelPreference) {
  const configs = {
    'gpt-4': {
      modelType: 'chatOpenAI',
      modelName: 'gpt-4',
      temperature: 0.7,
      streaming: true,
      agentModel: 'chatOpenAI'
    },
    'gpt-4o': {
      modelType: 'chatOpenAI', 
      modelName: 'gpt-4o',
      temperature: 0.7,
      streaming: true,
      agentModel: 'chatOpenAI'
    },
    'gpt-4o-mini': {
      modelType: 'chatOpenAI',
      modelName: 'gpt-4o-mini', 
      temperature: 0.7,
      streaming: true,
      agentModel: 'chatOpenAI'
    },
    'gpt-3.5-turbo': {
      modelType: 'chatOpenAI',
      modelName: 'gpt-3.5-turbo',
      temperature: 0.9,
      streaming: true,
      agentModel: 'chatOpenAI'
    },
    'claude': {
      modelType: 'chatAnthropic',
      modelName: 'claude-3-sonnet-20240229',
      temperature: 0.7,
      streaming: true,
      agentModel: 'chatAnthropic'
    }
  }

  const config = configs[modelPreference] || configs['gpt-4o-mini']
  
  return {
    ...config,
    cache: "",
    maxTokens: "",
    topP: "",
    frequencyPenalty: "",
    presencePenalty: "",
    timeout: "",
    strictToolCalling: "",
    stopSequence: "",
    basepath: "",
    proxyUrl: "",
    baseOptions: "",
    allowImageUploads: "",
    imageResolution: "low"
  }
}

function getAgentTypeDescription(agentType) {
  const descriptions = {
    'chatbot': 'Интеллектуальный чат-бот для общения с пользователями',
    'analyzer': 'Аналитический агент для обработки и анализа данных',
    'automation': 'Агент автоматизации для выполнения рутинных задач',
    'retrieval': 'RAG агент для работы с базой знаний',
    'multimodal': 'Мультимодальный агент для работы с различными типами контента',
    'custom': 'Пользовательский агент с настраиваемой логикой'
  }
  
  return descriptions[agentType] || 'Универсальный AI агент'
}

function getUseCaseCategory(agentType) {
  const categories = {
    'chatbot': 'Customer Support',
    'analyzer': 'Data Analysis', 
    'automation': 'Task Automation',
    'retrieval': 'Documents QnA',
    'multimodal': 'Content Analysis',
    'custom': 'General Purpose'
  }
  
  return categories[agentType] || 'General Purpose'
}

function getAgentLabel(agentType) {
  const labels = {
    'chatbot': 'Чат-бот Помощник',
    'analyzer': 'Аналитический Агент',
    'automation': 'Агент Автоматизации', 
    'retrieval': 'RAG Агент',
    'multimodal': 'Мультимодальный Агент',
    'custom': 'Пользовательский Агент'
  }
  
  return labels[agentType] || 'AI Агент'
}

function generateToolsConfig(agentType) {
  // В будущем здесь можно добавить предустановленные инструменты для разных типов агентов
  return ""
}

export default app