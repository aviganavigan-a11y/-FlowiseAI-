// Flowise Agent Generator Frontend
class FlowiseAgentGenerator {
    constructor() {
        this.initializeEventListeners()
        this.generatedConfig = null
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('agentForm').addEventListener('submit', (e) => {
            e.preventDefault()
            this.generateAgent()
        })

        // Copy button
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyToClipboard()
        })

        // Download button  
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadJSON()
        })

        // Real-time form validation
        document.getElementById('taskDescription').addEventListener('input', (e) => {
            this.validateForm()
        })
    }

    validateForm() {
        const taskDescription = document.getElementById('taskDescription').value.trim()
        const generateBtn = document.getElementById('generateBtn')
        
        if (taskDescription.length === 0) {
            generateBtn.disabled = true
            generateBtn.classList.add('opacity-50', 'cursor-not-allowed')
        } else {
            generateBtn.disabled = false
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed')
        }
    }

    async generateAgent() {
        const formData = this.getFormData()
        
        if (!formData.taskDescription.trim()) {
            this.showError('Пожалуйста, опишите задачу для агента')
            return
        }

        this.showLoading(true)
        
        try {
            const response = await axios.post('/api/generate-agent', formData, {
                timeout: 30000, // 30 seconds timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.data.success) {
                this.generatedConfig = response.data.data
                this.displayResults(response.data)
            } else {
                this.showError(response.data.error || 'Ошибка при генерации агента')
            }
        } catch (error) {
            console.error('Generation error:', error)
            if (error.code === 'ECONNABORTED') {
                this.showError('Превышено время ожидания. Попробуйте еще раз.')
            } else if (error.response?.data?.error) {
                this.showError(error.response.data.error)
            } else {
                this.showError('Произошла ошибка при генерации агента. Попробуйте позже.')
            }
        } finally {
            this.showLoading(false)
        }
    }

    getFormData() {
        return {
            agentType: document.getElementById('agentType').value,
            taskDescription: document.getElementById('taskDescription').value.trim(),
            modelPreference: document.getElementById('modelPreference').value,
            includeMemory: document.getElementById('includeMemory').checked,
            includeTools: document.getElementById('includeTools').checked
        }
    }

    displayResults(response) {
        const container = document.getElementById('resultsContainer')
        const actionButtons = document.getElementById('actionButtons')
        
        const jsonString = JSON.stringify(response.data, null, 2)
        
        container.innerHTML = `
            <div class="space-y-4">
                <!-- Metadata -->
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <h3 class="font-bold text-green-800 mb-2 flex items-center">
                        <i class="fas fa-check-circle mr-2"></i>
                        Агент успешно сгенерирован
                    </h3>
                    <div class="text-sm text-green-700 space-y-1">
                        <p><strong>Тип:</strong> ${response.metadata.agent_type || 'Пользовательский'}</p>
                        <p><strong>Модель:</strong> ${response.metadata.model_preference}</p>
                        <p><strong>Создан:</strong> ${new Date(response.metadata.generated_at).toLocaleString('ru-RU')}</p>
                        <p><strong>Нодов:</strong> ${response.data.nodes.length}</p>
                        <p><strong>Связей:</strong> ${response.data.edges.length}</p>
                    </div>
                </div>

                <!-- JSON Code Block -->
                <div class="relative">
                    <div class="absolute top-2 right-2 z-10">
                        <button onclick="this.parentElement.parentElement.querySelector('pre').classList.toggle('text-xs'); this.parentElement.parentElement.querySelector('pre').classList.toggle('text-sm')" 
                                class="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs">
                            <i class="fas fa-expand-alt"></i>
                        </button>
                    </div>
                    <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono border border-gray-700 max-h-96" style="max-height: 400px;"><code>${this.escapeHtml(jsonString)}</code></pre>
                </div>

                <!-- Node Summary -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="font-bold text-blue-800 mb-2 flex items-center">
                        <i class="fas fa-sitemap mr-2"></i>
                        Структура агента
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        ${response.data.nodes.map(node => `
                            <div class="bg-white rounded p-2 border border-blue-200">
                                <div class="font-medium text-blue-800">${node.data.label}</div>
                                <div class="text-gray-600 text-xs">${node.data.type}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `
        
        // Show action buttons
        actionButtons.classList.remove('hidden')
        
        // Scroll to results
        container.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    showLoading(show) {
        const status = document.getElementById('status')
        const generateBtn = document.getElementById('generateBtn')
        
        if (show) {
            status.classList.remove('hidden')
            generateBtn.disabled = true
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Генерация...'
        } else {
            status.classList.add('hidden')
            generateBtn.disabled = false
            generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Сгенерировать Агента'
        }
    }

    showError(message) {
        const container = document.getElementById('resultsContainer')
        container.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h3 class="text-lg font-bold text-red-800 mb-2">Ошибка генерации</h3>
                <p class="text-red-700">${message}</p>
                <button onclick="location.reload()" class="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                    Попробовать снова
                </button>
            </div>
        `
        
        // Hide action buttons
        document.getElementById('actionButtons').classList.add('hidden')
    }

    async copyToClipboard() {
        if (!this.generatedConfig) return
        
        const jsonString = JSON.stringify(this.generatedConfig, null, 2)
        const copyBtn = document.getElementById('copyBtn')
        
        try {
            await navigator.clipboard.writeText(jsonString)
            
            // Show success feedback
            const originalText = copyBtn.innerHTML
            copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Скопировано!'
            copyBtn.classList.remove('bg-green-500', 'hover:bg-green-600')
            copyBtn.classList.add('bg-green-600')
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText
                copyBtn.classList.remove('bg-green-600')
                copyBtn.classList.add('bg-green-500', 'hover:bg-green-600')
            }, 2000)
            
        } catch (error) {
            console.error('Failed to copy:', error)
            this.showError('Не удалось скопировать в буфер обмена')
        }
    }

    downloadJSON() {
        if (!this.generatedConfig) return
        
        const jsonString = JSON.stringify(this.generatedConfig, null, 2)
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
        const filename = `flowise-agent-${timestamp}.json`
        
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        // Show success feedback
        const downloadBtn = document.getElementById('downloadBtn')
        const originalText = downloadBtn.innerHTML
        downloadBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Загружено!'
        downloadBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600')
        downloadBtn.classList.add('bg-blue-600')
        
        setTimeout(() => {
            downloadBtn.innerHTML = originalText
            downloadBtn.classList.remove('bg-blue-600')
            downloadBtn.classList.add('bg-blue-500', 'hover:bg-blue-600')
        }, 2000)
    }

    escapeHtml(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new FlowiseAgentGenerator()
    
    // Add some interactive enhancements
    addInteractiveEnhancements()
})

function addInteractiveEnhancements() {
    // Add hover effects to form fields
    const inputs = document.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('transform', 'scale-105', 'transition-transform')
        })
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('transform', 'scale-105')
        })
    })

    // Add auto-expand to textarea
    const textarea = document.getElementById('taskDescription')
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto'
            this.style.height = (this.scrollHeight) + 'px'
        })
    }

    // Add character counter to textarea
    if (textarea) {
        const counter = document.createElement('div')
        counter.className = 'text-xs text-gray-500 mt-1 text-right'
        counter.innerHTML = '0 символов'
        textarea.parentElement.appendChild(counter)
        
        textarea.addEventListener('input', function() {
            const count = this.value.length
            counter.innerHTML = `${count} символов`
            counter.classList.toggle('text-red-500', count > 1000)
            counter.classList.toggle('text-gray-500', count <= 1000)
        })
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        document.getElementById('generateBtn').click()
    }
    
    // Ctrl+C to copy (when results are visible)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !document.getElementById('actionButtons').classList.contains('hidden')) {
        const selection = window.getSelection()
        if (selection.toString().length === 0) { // No text selected
            e.preventDefault()
            document.getElementById('copyBtn').click()
        }
    }
})