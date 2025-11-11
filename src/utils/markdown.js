import showdown from 'showdown';

// Create a custom extension to handle ```markdown blocks differently
showdown.extension('treatMarkdownCodeBlocksAsMarkdown', () => {
    return [{
        type: 'lang',
        regex: /```markdown\n([\s\S]*?)\n```/g,
        replace: function(match, content) {
            // Instead of rendering as a code block, render the content as normal markdown
            return content;
        }
    }];
});

// Create a custom extension for horizontal rules with equals signs
showdown.extension('customHorizontalRules', () => {
    return [{
        type: 'lang',
        regex: /^(={3,})[ \t]*$/gm,
        replace: function() {
            return '<hr />';
        }
    }];
});

// Create a custom extension for footnotes
showdown.extension('footnotes', () => {
    return [
        // First, find footnote references like [^1] and convert them to links
        {
            type: 'lang',
            regex: /\[\^(\d+)\]/g,
            replace: function(match, footnoteId) {
                return `<sup id="fnref-${footnoteId}"><a href="#fn-${footnoteId}" class="footnote-ref">${footnoteId}</a></sup>`;
            }
        },
        // Then, find footnote definitions and convert them to a footnotes section
        {
            type: 'lang',
            regex: /\[\^(\d+)\]\: ([\s\S]+?)(?=\n\[\^\d+\]\:|\n*$)/g,
            replace: function(match, footnoteId, content) {
                return `<div class="footnote-def" id="fn-${footnoteId}">
                    <p>${footnoteId}. ${content.trim()} <a href="#fnref-${footnoteId}" class="footnote-backref">↩</a></p>
                </div>`;
            }
        }
    ];
});

// Create a custom extension for superscript (^text^)
showdown.extension('superscript', () => {
    return [{
        type: 'lang',
        regex: /\^([^\^]+)\^/g,
        replace: function(match, content) {
            return `<sup>${content}</sup>`;
        }
    }];
});

// Create a custom extension for subscript (~text~)
showdown.extension('subscript', () => {
    return [{
        type: 'lang',
        regex: /\~([^\~]+)\~/g,
        replace: function(match, content) {
            return `<sub>${content}</sub>`;
        }
    }];
});

// Create a custom extension for Unicode characters (\uXXXX or \UXXXXXXXX)
showdown.extension('unicodeChars', () => {
    return [
        {
            type: 'lang',
            regex: /\\u([0-9a-fA-F]{4})/g,
            replace: function(match, hexCode) {
                return String.fromCharCode(parseInt(hexCode, 16));
            }
        },
        {
            type: 'lang',
            regex: /\\U([0-9a-fA-F]{8})/g,
            replace: function(match, hexCode) {
                const codePoint = parseInt(hexCode, 16);
                return String.fromCodePoint(codePoint);
            }
        }
    ];
});

// Create a custom extension to make links open in new browser window
showdown.extension('externalLinks', () => {
    return [{
        type: 'output',
        regex: /<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>/g,
        replace: function(match, url, rest) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer"${rest}>`;
        }
    }];
});

// Create a custom extension for RAG_Results tags
showdown.extension('ragResults', () => {
    return [{
        type: 'lang',
        regex: /<RAG_Results>([\s\S]*?)<\/RAG_Results>/g,
        replace: function(match, content) {
            // Process the content and wrap in appropriate HTML
            const results = content.trim().split(/\n\s*\n/); // Split by empty lines to get individual results
            
            const processedResults = results.map(result => {
                // Try to parse format 1: Name: xxx; Critical Question: yyy; Trusted Answer: zzz;
                const format1Regex = /Block Name:\s*(.*?);\s*Critical Question:\s*(.*?);\s*Trusted Answer:\s*(.*?)(?:;|$)/is;
                const format1Match = result.match(format1Regex);
                
                // Try to parse format 2: XML-like structure
                const format2NameMatch = result.match(/<name>(.*?)<\/name>/is);
                const format2QuestionMatch = result.match(/<critical_question>(.*?)<\/critical_question>/is);
                const format2AnswerMatch = result.match(/<trusted_answer>(.*?)<\/trusted_answer>/is);
                
                // Try to parse format 3: Block Name: xxx \n Critical Question: yyy \n Trusted Answer: zzz
                const format3Regex = /Block Name:\s*(.*?)\s*\n\s*Critical Question:\s*(.*?)\s*\n\s*Trusted Answer:\s*(.*?)(?:\n|$)/is;
                const format3Match = result.match(format3Regex);
                
                if (format1Match) {
                    // Format 1 matched
                    const [_, name, question, answer] = format1Match;
                    return `<div>
                        <div data-rag-name>${name}</div>
                        <div data-rag-question>${question}</div>
                        <div data-rag-answer>${answer}</div>
                    </div>`;
                } else if (format2NameMatch && format2QuestionMatch && format2AnswerMatch) {
                    // Format 2 matched
                    const name = format2NameMatch[1];
                    const question = format2QuestionMatch[1];
                    const answer = format2AnswerMatch[1];
                    return `<div>
                        <div data-rag-name>${name}</div>
                        <div data-rag-question>${question}</div>
                        <div data-rag-answer>${answer}</div>
                    </div>`;
                } else if (format3Match) {
                    // Format 3 matched (newline separated)
                    const [_, name, question, answer] = format3Match;
                    return `<div>
                        <div data-rag-name>${name}</div>
                        <div data-rag-question>${question}</div>
                        <div data-rag-answer>${answer}</div>
                    </div>`;
                } else {
                    // No format matched, display as plain text
                    return `<div>${result}</div>`;
                }
            }).join('');
            
            return `<RAG_Results>${processedResults}</RAG_Results>`;
        }
    }];
});

const converter = new showdown.Converter({
    tables: true,                // Enable table support
    strikethrough: true,         // Enable strikethrough syntax
    emoji: true,                 // Enable emoji support
    underline: true,            // Enable underline syntax
    tasklists: true,            // Enable task lists
    simpleLineBreaks: true,     // Enable line breaks without needing 2 spaces
    parseImgDimensions: true,   // Enable image dimensions syntax
    ghCodeBlocks: true,         // Enable GitHub style code blocks
    ghMentions: true,           // Enable GitHub style mentions
    extensions: [
        'treatMarkdownCodeBlocksAsMarkdown', 
        'externalLinks', 
        'footnotes', 
        'superscript', 
        'subscript', 
        'unicodeChars', 
        'customHorizontalRules',
        'ragResults' // Add our RAG Results extension
    ]
});

// Add custom classes to the output
converter.setOption('customizedHeaderId', true);
converter.setOption('prefixHeaderId', 'markdown-header-');

// Add wrapper class to the output
const originalMakeHtml = converter.makeHtml;
converter.makeHtml = function (text) {
    try {
        // Ensure text is a string and handle null/undefined
        const safeText = typeof text === 'string' ? text : String(text || '');
        const html = originalMakeHtml.call(this, safeText);
        return `<div class="markdown-content">${html}</div>`;
    } catch (error) {
        console.error('Error rendering markdown:', error);
        // Return safe fallback content
        return `<div class="markdown-content"><p>${String(text || '')}</p></div>`;
    }
};

export default converter; 