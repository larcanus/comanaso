/**
 * Парсер Markdown для Vue компонентов
 * Преобразует markdown текст в HTML с классами стилей проекта
 */

/**
 * Основная функция парсинга markdown
 * @param {string} text - Markdown текст
 * @returns {string} HTML строка
 */
export function parseMarkdown(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // Разбиваем на строки
    const lines = text.split('\n');
    const result = [];
    let inList = false;
    let listType = '';
    let listItems = [];

    const flushList = () => {
        if (listItems.length > 0) {
            const tag = listType === 'ol' ? 'ol' : 'ul';
            result.push(`<${tag} class="markdown-list">${listItems.join('')}</${tag}>`);
            listItems = [];
            inList = false;
            listType = '';
        }
    };

    const parseInline = (line) => {
        // Ссылки [текст](url)
        line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="markdown-link">$1</a>');
        
        // Жирный текст **текст** или __текст__
        line = line.replace(/\*\*([^*]+)\*\*/g, '<strong class="markdown-bold">$1</strong>');
        line = line.replace(/__([^_]+)__/g, '<strong class="markdown-bold">$1</strong>');
        
        // Курсив *текст* или _текст_
        line = line.replace(/\*([^*]+)\*/g, '<em class="markdown-italic">$1</em>');
        line = line.replace(/_([^_]+)_/g, '<em class="markdown-italic">$1</em>');
        
        // Код `код`
        line = line.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>');
        
        // Код блоки ```код```
        line = line.replace(/```([^`]+)```/g, '<pre class="markdown-code-block"><code>$1</code></pre>');
        
        return line;
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trimRight();
        
        // Заголовки
        if (line.startsWith('### ')) {
            flushList();
            result.push(`<h3 class="markdown-h3">${parseInline(line.substring(4))}</h3>`);
            continue;
        } else if (line.startsWith('## ')) {
            flushList();
            result.push(`<h2 class="markdown-h2">${parseInline(line.substring(3))}</h2>`);
            continue;
        } else if (line.startsWith('# ')) {
            flushList();
            result.push(`<h1 class="markdown-h1">${parseInline(line.substring(2))}</h1>`);
            continue;
        }
        
        // Маркированный список
        if (line.match(/^[-*]\s/)) {
            if (!inList || listType !== 'ul') {
                flushList();
                inList = true;
                listType = 'ul';
            }
            const content = parseInline(line.substring(2));
            listItems.push(`<li class="markdown-list-item">${content}</li>`);
            continue;
        }
        
        // Нумерованный список
        if (line.match(/^\d+\.\s/)) {
            if (!inList || listType !== 'ol') {
                flushList();
                inList = true;
                listType = 'ol';
            }
            const content = parseInline(line.replace(/^\d+\.\s/, ''));
            listItems.push(`<li class="markdown-list-item">${content}</li>`);
            continue;
        }
        
        // Разделитель --- или ***
        if (line.match(/^[-*_]{3,}$/)) {
            flushList();
            result.push('<hr class="markdown-hr">');
            continue;
        }
        
        // Цитаты >
        if (line.startsWith('> ')) {
            flushList();
            result.push(`<blockquote class="markdown-blockquote">${parseInline(line.substring(2))}</blockquote>`);
            continue;
        }
        
        // Пустая строка - завершаем список
        if (line === '') {
            flushList();
            result.push('<br>');
            continue;
        }
        
        // Обычный текст
        flushList();
        
        // Проверяем, начинается ли строка с отступа (код без блока)
        if (line.startsWith('    ') || line.startsWith('\t')) {
            result.push(`<pre class="markdown-code-inline"><code>${escapeHtml(line)}</code></pre>`);
        } else {
            result.push(`<p class="markdown-paragraph">${parseInline(line)}</p>`);
        }
    }
    
    // Завершаем последний список
    flushList();
    
    return result.join('\n');
}

/**
 * Экранирование HTML для безопасности
 * @param {string} text - Текст для экранирования
 * @returns {string} Экранированный текст
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Компонент для отображения markdown в Vue
 * @param {Object} props - Свойства компонента
 * @param {string} props.text - Markdown текст
 * @returns {Object} Vue компонент
 */
export const MarkdownRenderer = {
    props: {
        text: {
            type: String,
            default: ''
        }
    },
    computed: {
        html() {
            return parseMarkdown(this.text);
        }
    },
    template: '<div class="markdown-content" v-html="html"></div>'
};