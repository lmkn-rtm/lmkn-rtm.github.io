class SimpleHighlighter {
    constructor() {
        // Default configuration options
        this.defaults = {
            copyButton: true,
            lineNumbers: false,
            lineStart: 1,
            highlight: true
        };
        
        // SVG icon for copy button
        this.copyIcon = `
            <svg class="copy-icon" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/>
            </svg>
        `;
    }

    /**
     * Initialize the highlighter on all code blocks
     */
    init() {
        this.processCodeBlocks();
    }

    /**
     * Process all code blocks on the page
     */
    processCodeBlocks() {
        document.querySelectorAll('pre > code').forEach(block => {
            const pre = block.parentElement;
            const options = this.getOptions(pre);
            
            // 1. First extract mark elements from original HTML
            const { marks, cleanHTML } = this.extractMarkElements(block.innerHTML);
            
            // 2. Set the cleaned HTML (without marks) for processing
            block.innerHTML = cleanHTML;
            
            // 3. Trim whitespace from visible text content only
            const trimmedText = this.trimCodeContent(block.textContent);
            if (block.textContent !== trimmedText) {
                block.textContent = trimmedText;
            }
            
            // 4. Apply syntax highlighting
            if (options.highlight) {
                this.highlightCode(block);
            }
            
            // 5. Restore mark elements with proper token classes
            this.restoreMarkElements(block, marks);
            
            // 6. Add line numbers (after all content is finalized)
            if (options.lineNumbers) {
                this.addLineNumbers(block, options.lineStart);
            }
            
            // 7. Add copy button
            if (options.copyButton) {
                this.addCopyButton(pre, block);
            }
        });
    }

    /**
     * Normalize line endings by removing empty lines at the end
     * @param {HTMLElement} block - The code block element
     */
    normalizeLineEndings(block) {
        const lines = block.innerHTML.split('\n');
        // Remove empty lines at end
        while (lines.length > 0 && lines[lines.length-1].trim() === '') {
            lines.pop();
        }
        block.innerHTML = lines.join('\n');
    }

    /**
     * Extract mark elements from HTML and replace with placeholders
     * @param {string} html - The HTML content to process
     * @returns {Object} Contains marks array and clean HTML
     */
    extractMarkElements(html) {
        const marks = [];
        let cleanHTML = html;
        
        // Create temporary div to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Find all mark elements with token style
        const markElements = temp.querySelectorAll('mark[style*="token:"]');
        
        markElements.forEach((mark, index) => {
            const tokenTypeMatch = mark.getAttribute('style').match(/token:(\w+)/i);
            if (tokenTypeMatch) {
                const tokenType = tokenTypeMatch[1].toLowerCase();
                const content = mark.textContent;
                const placeholder = `__MARK_${index}__`;
                
                marks.push({
                    placeholder,
                    content,
                    tokenType
                });
                
                // Replace mark with placeholder in original HTML
                cleanHTML = cleanHTML.replace(mark.outerHTML, placeholder);
            }
        });
        
        return { marks, cleanHTML };
    }

    /**
     * Restore mark elements with proper token classes
     * @param {HTMLElement} block - The code block element
     * @param {Array} marks - Array of mark elements to restore
     */
    restoreMarkElements(block, marks) {
        let content = block.innerHTML;
        
        marks.forEach(mark => {
            const replacement = `<span class="token ${mark.tokenType}">${mark.content}</span>`;
            content = content.replace(mark.placeholder, replacement);
        });
        
        block.innerHTML = content;
    }

    /**
     * Trim whitespace from code content while preserving structure
     * @param {string} content - The code content to trim
     * @returns {string} Trimmed content
     */
    trimCodeContent(content) {
        const lines = content.split('\n');
        let baseIndent = Infinity;

        // Find minimum indentation across all non-empty lines
        lines.forEach(line => {
            if (line.trim().length > 0) {
                const indent = line.match(/^\s*/)[0].length;
                baseIndent = Math.min(baseIndent, indent);
            }
        });

        // Handle case where all lines are empty
        if (baseIndent === Infinity) baseIndent = 0;

        return lines
            .map(line => line.slice(baseIndent).trimEnd())
            .join('\n')
            .trim();
    }

    /**
     * Get options from pre element attributes and classes
     * @param {HTMLElement} preElement - The pre element containing the code
     * @returns {Object} Configuration options
     */
    getOptions(preElement) {
        let lnStart = this.defaults.lineStart;
        if (preElement.hasAttribute('ln_start')) {
            const value = parseInt(preElement.getAttribute('ln_start'));
            if (!isNaN(value)) {
                lnStart = value;
            }
        }
        
        return {
            copyButton: preElement.classList.contains('copy-code'),
            lineNumbers: preElement.classList.contains('line-numbers'),
            lineStart: lnStart,
            highlight: !preElement.classList.contains('no-highlight')
        };
    }

    /**
     * Add line numbers to a code block
     * @param {HTMLElement} codeElement - The code element
     * @param {number} startLine - The starting line number
     */
    addLineNumbers(codeElement, startLine = 1) {
        const preElement = codeElement.parentElement;
        if (preElement.querySelector('.line-numbers-rows')) return;
        
        const lines = codeElement.textContent.split('\n');
        // Don't count last line if empty
        const lineCount = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
        
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'line-numbers-rows';

        for (let i = 0; i < lineCount; i++) {
            const line = document.createElement('span');
            line.textContent = startLine + i;
            lineNumbers.appendChild(line);
        }
        
        preElement.insertBefore(lineNumbers, codeElement);
    }

    /**
     * Add copy button to a code block
     * @param {HTMLElement} pre - The pre element
     * @param {HTMLElement} codeBlock - The code block element
     */
    addCopyButton(pre, codeBlock) {
        if (pre.querySelector('.copy-btn')) return;
        
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.title = 'Copy code';
        button.innerHTML = this.copyIcon;
        
        button.addEventListener('click', () => {
            this.copyToClipboard(codeBlock.textContent, button);
        });
        
        pre.appendChild(button);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @param {HTMLElement} button - The button element
     */
    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const icon = button.querySelector('svg');
            icon.style.fill = '#4CAF50';
            
            setTimeout(() => {
                icon.style.fill = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    /**
     * Apply syntax highlighting to a code block
     * @param {HTMLElement} block - The code block element
     */
    highlightCode(block) {
        const text = block.textContent;
        const tokens = this.tokenizeCode(text);
        const highlighted = this.wrapTokens(tokens);
        block.innerHTML = highlighted;
    }
    
    /**
     * Tokenize code content for syntax highlighting
     * @param {string} text - The code text to tokenize
     * @returns {Array} Array of tokens
     */
    tokenizeCode(text) {
        // Token patterns for syntax highlighting
        const patterns = [
            // Comments
            { type: 'comment', regex: /\/\/.*?(?=\r\n?|\n|$)|\/\*[\s\S]*?\*\//g },
            // Preprocessor macros
            { type: 'macro', regex: /(?:#include|#pragma|#if|#ifdef|#ifndef|#elif|#else|#endif)\s*/g },
            // Strings and chars
            { type: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g },
            // Numbers
            { type: 'number', regex: /(?:\b0x[\da-f]+|\b0b[01]+|\b\d+(?:\.\d*)?(?:e[+-]?\d+)?)[ful]*\b/gi },
            // Keywords
            { type: 'keyword', regex: /\b(?:auto|const|enum|extern|register|static|struct|typedef|union|volatile|def|box)\b/g },
            // Flow control
            { type: 'flow', regex: /\b(?:break|case|continue|default|do|else|for|goto|if|return|switch|while)\b/g },
            // Types
            { type: 'type', regex: /\b(?:void|bool|byte|sbyte|pair|spair|quad|squad|word|sword|string|_Complex|_Imaginary)\b/g },
            // Functions
            { type: 'function', regex: /([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g },
            // Operators
            { type: 'operator', regex: /(?:<<=|>>=|<<|>>|<=|>=|==|!=|&&|\|\||--|\+\+|\->|\.|[-+*/%&|^~=<>!])/g },
            // Punctuation
            { type: 'punctuation', regex: /[{}[\];(),]/g }
        ];

        const tokens = [];
        let remainingText = text;
        let safetyCounter = 0;
        const MAX_ITERATIONS = text.length * 3; // Prevent infinite loops

        while (remainingText.length > 0 && safetyCounter++ < MAX_ITERATIONS) {
            let matched = false;

            // Try each pattern in order
            for (const pattern of patterns) {
                pattern.regex.lastIndex = 0;
                const match = pattern.regex.exec(remainingText);
                
                if (match && match.index === 0) {
                    // Add preceding text if exists
                    if (tokens.length > 0 && tokens[tokens.length-1].type === 'text') {
                        tokens[tokens.length-1].value += remainingText.slice(0, match.index);
                    } else if (match.index > 0) {
                        tokens.push({ type: 'text', value: remainingText.slice(0, match.index) });
                    }
                    
                    // Add the matched token
                    tokens.push({ type: pattern.type, value: match[0] });
                    remainingText = remainingText.slice(match[0].length);
                    matched = true;
                    break;
                }
            }

            // If no patterns matched, add as plain text
            if (!matched) {
                if (tokens.length > 0 && tokens[tokens.length-1].type === 'text') {
                    tokens[tokens.length-1].value += remainingText[0];
                } else {
                    tokens.push({ type: 'text', value: remainingText[0] });
                }
                remainingText = remainingText.slice(1);
            }
        }

        return tokens;
    }
    
    /**
     * Wrap tokens in HTML spans with appropriate classes
     * @param {Array} tokens - Array of tokens to wrap
     * @returns {string} HTML string with wrapped tokens
     */
    wrapTokens(tokens) {
        return tokens.map(token => {
            if (token.type === 'text') return token.value;
            return `<span class="token ${token.type}">${token.value}</span>`;
        }).join('');
    }
    
    /**
     * Escape string for use in regular expressions
     * @param {string} string - String to escape
     * @returns {string} Escaped string
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Initialize only once when DOM is loaded
if (!window.simpleHighlighterInitialized) {
    document.addEventListener('DOMContentLoaded', () => {
        const highlighter = new SimpleHighlighter();
        highlighter.init();
        window.simpleHighlighterInitialized = true;
    });
}