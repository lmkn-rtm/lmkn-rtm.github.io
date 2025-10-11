/*
    HOW TO USE:
        <pre class="copy-code no-highlight line-numbers lang-c" ln_start="0"><code>
        //code here
        </pre></code>
    
    inline:
        <code></code>
    
    marks:
        <mark style="token:keyword"></mark>
    
    token types:
        keyword
        type
        comment
        string
        macro
        flow
        constant
        function
        operator
        punctuation
*/


class SimpleHighlighter {
    constructor() {
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
        // Language patterns - ADD YOUR PATTERNS HERE
        this.languagePatterns = {
            // Default fallback
            'text': [],
            'make': [],
            
            'c': [
                { type: 'comment', regex: /\/\/.*?(?=\r\n?|\n|$)|\/\*[\s\S]*?\*\//g },
                { type: 'macro', regex: /(?:#include|#pragma|#if|#ifdef|#ifndef|#elif|#else|#endif|once)\s*/g },
                { type: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g },
                { type: 'number', regex: /(?:\b0x[\da-f]+|\b0b[01]+|\b\d+(?:\.\d*)?(?:e[+-]?\d+)?)[ful]*\b/gi },
                { type: 'keyword', regex: /\b(?:const|extern|register|static|typedef|volatile|def)\b/g },
                { type: 'flow', regex: /\b(?:break|case|continue|default|do|else|for|goto|if|return|switch|while|true|false|NULL)\b/g },
                { type: 'type', regex: /\b(?:void|bool|byte|i8|pair|i16|quad|i32|int|octa|word|i64|string|vptr|box|struct|enum|union)\b/g },
                { type: 'function', regex: /([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g },
                { type: 'operator', regex: /(?:<<=|>>=|<<|>>|<=|>=|==|!=|&&|\|\||--|\+\+|\->|\.|[-+*/%&|^~=<>!])/g },
                { type: 'punctuation', regex: /[{}[\];(),]/g }
            ],
            
            'sobek': [
                { type: 'comment', regex: /\/\/.*?(?=\r\n?|\n|$)|\/\*[\s\S]*?\*\//g },
                { type: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g },
                { type: 'number', regex: /(?:\b0x[\da-f]+|\b0b[01]+|\b\d+(?:\.\d*)?(?:e[+-]?\d+)?)[ful]*\b/gi },
                { type: 'flow', regex: /\b(?:true|false|null)\b/g },
                { type: 'punctuation', regex: /[{}[\]\:;,]/g }
            ]
            
            // ADD MORE LANGUAGES AS NEEDED...
        };
    }

    init() {
        this.processCodeBlocks();
    }

    processCodeBlocks() {
        // Process inline code blocks FIRST
        document.querySelectorAll('code:not(pre > code)').forEach(inlineCode => {
            this.processInlineCode(inlineCode);
        });
        
        // Then process pre>code blocks (multi-line)
        document.querySelectorAll('pre > code').forEach(block => {
            this.processSingleCodeBlock(block);
        });
    }
    
    processInlineCode(codeElement) {
        const options = {
            highlight: !codeElement.classList.contains('no-highlight'),
            copyButton: false,  // No copy button for inline
            lineNumbers: false // No line numbers for inline
        };
        
        // Extract and preserve mark elements
        const {marks, cleanHTML} = this.extractMarkElements(codeElement.innerHTML);
        codeElement.innerHTML = cleanHTML;
        
        // Apply syntax highlighting
        if(options.highlight) this.highlightCode(codeElement);
        
        // Restore mark elements
        this.restoreMarkElements(codeElement, marks);
    }

    processSingleCodeBlock(block) {
        const pre = block.parentElement;
        const options = this.getOptions(pre);
        
        // 1. First extract mark elements from original HTML
        const { marks, cleanHTML } = this.extractMarkElements(block.innerHTML);
        
        // 2. Set the cleaned HTML (without marks) for processing
        block.innerHTML = cleanHTML;
        
        // 3. Trim whitespace from visible text content only
        const trimmedText = this.trimCodeContent(block.textContent);
        if(block.textContent !== trimmedText) block.textContent = trimmedText;
        
        // 4. Apply syntax highlighting
        if(options.highlight) this.highlightCode(block);
        
        // 5. Restore mark elements with proper token classes
        this.restoreMarkElements(block, marks);
        
        // 6. Add line numbers (after all content is finalized)
        if(options.lineNumbers) this.addLineNumbers(block, options.lineStart);
        
        // 7. Add copy button
        if(options.copyButton) this.addCopyButton(pre, block);
    }
    
    normalizeLineEndings(block) {
        const lines = block.innerHTML.split('\n');
        // Remove empty lines at end
        while(lines.length > 0 && lines[lines.length-1].trim() === '')
        {
            lines.pop();
        }
        block.innerHTML = lines.join('\n');
    }

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
            if(tokenTypeMatch)
            {
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

    restoreMarkElements(block, marks) {
        let content = block.innerHTML;
        
        marks.forEach(mark => {
            const replacement = `<span class="token ${mark.tokenType}">${mark.content}</span>`;
            content = content.replace(mark.placeholder, replacement);
        });
        
        block.innerHTML = content;
    }

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

    getOptions(preElement) {
        let lnStart = this.defaults.lineStart;
        if(preElement.hasAttribute('ln_start'))
        {
            const value = parseInt(preElement.getAttribute('ln_start'));
            if(!isNaN(value)) lnStart = value;
        }
        
        return {
            copyButton: preElement.classList.contains('copy-code'),
            lineNumbers: preElement.classList.contains('line-numbers'),
            lineStart: lnStart,
            highlight: !preElement.classList.contains('no-highlight')
        };
    }

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

    addCopyButton(pre, codeBlock) {
      // Check if already has header wrapper
      if (pre.parentElement.classList.contains('code-header-wrapper')) return;
      
      // Create wrapper container
      const wrapper = document.createElement('div');
      wrapper.className = 'code-header-wrapper';
      
      // Create header
      const header = document.createElement('div');
      header.className = 'code-header';
      
      // Create language name element
      const langName = document.createElement('span');
      langName.className = 'lang-name';
      
      // Detect language from class or default to 'text'
      const language = this.detectLanguage(codeBlock);
      langName.textContent = language;
      
      // Create copy button
      const button = document.createElement('button');
      button.className = 'copy-btn';
      button.title = 'Copy code';
      button.innerHTML = this.copyIcon;
      
      button.addEventListener('click', () => {
        this.copyToClipboard(codeBlock.textContent, button);
      });
      
      // Assemble header
      header.appendChild(langName);
      header.appendChild(button);
      
      // Wrap the pre element
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    }

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

    highlightCode(block) {
        const language = this.detectLanguage(block);
        const text = block.textContent;
        
        // Get patterns for detected language or use text (no highlighting)
        const patterns = this.languagePatterns[language] || this.languagePatterns.text;
        const tokens = this.tokenizeCode(text, patterns);
        
        block.innerHTML = this.wrapTokens(tokens);
    }
    
    tokenizeCode(text, patterns) {
        if (!text || !patterns || patterns.length === 0) {
            return [{ type: 'text', value: text }];
        }

        const tokens = [];
        let remainingText = text;
        let safetyCounter = 0;
        const MAX_ITERATIONS = text.length * 2;

        while (remainingText.length > 0 && safetyCounter++ < MAX_ITERATIONS) {
            let bestMatch = null;
            let bestPattern = null;

            // Find the earliest match among all patterns
            for (const pattern of patterns) {
                pattern.regex.lastIndex = 0;
                const match = pattern.regex.exec(remainingText);
                
                if (match && match.index === 0) {
                    if (!bestMatch || match[0].length > bestMatch[0].length) {
                        bestMatch = match;
                        bestPattern = pattern;
                    }
                }
            }

            if (bestMatch) {
                // Add any preceding text
                if (bestMatch.index > 0) {
                    tokens.push({
                        type: 'text',
                        value: remainingText.slice(0, bestMatch.index)
                    });
                }
                
                // Add the matched token
                tokens.push({
                    type: bestPattern.type,
                    value: bestMatch[0]
                });
                
                remainingText = remainingText.slice(bestMatch[0].length);
            } else {
                // No pattern matched, advance by one character
                if (tokens.length > 0 && tokens[tokens.length - 1].type === 'text') {
                    tokens[tokens.length - 1].value += remainingText[0];
                } else {
                    tokens.push({ type: 'text', value: remainingText[0] });
                }
                remainingText = remainingText.slice(1);
            }
        }

        // Add any remaining text
        if (remainingText.length > 0) {
            tokens.push({ type: 'text', value: remainingText });
        }

        return tokens;
    }

    detectLanguage(codeBlock) {
        // Check code block classes
        const classList = codeBlock.className.split(' ');
        
        for (const className of classList) {
            if (className.startsWith('lang-')) {
                const lang = className.replace('lang-', '').toLowerCase();
                return this.languagePatterns[lang] ? lang : 'text';
            }
            if (this.languagePatterns[className.toLowerCase()]) {
                return className.toLowerCase();
            }
        }
        
        // Check pre element classes
        const pre = codeBlock.parentElement;
        const preClasses = pre.className.split(' ');
        
        for (const className of preClasses) {
            if (className.startsWith('lang-')) {
                const lang = className.replace('lang-', '').toLowerCase();
                return this.languagePatterns[lang] ? lang : 'text';
            }
        }
        
        return 'text';
    }
    
    wrapTokens(tokens) {
        return tokens.map(token => {
            if (token.type === 'text') return token.value;
            return `<span class="token ${token.type}">${token.value}</span>`;
        }).join('');
    }
    
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