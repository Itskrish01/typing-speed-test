export const QUOTES = [
    "The only way to do great work is to love what you do.",
    "Life is what happens when you're busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It does not matter how slowly you go as long as you do not stop.",
    "In the end, it's not the years in your life that count. It's the life in your years.",
    "The purpose of our lives is to be happy.",
    "Get busy living or get busy dying.",
    "You only live once, but if you do it right, once is enough.",
    "Many of life's failures are people who did not realize how close they were to success when they gave up.",
    "If you want to live a happy life, tie it to a goal, not to people or things.",
    "Never let the fear of striking out keep you from playing the game.",
    "Money and success don't change people; they merely amplify what is already there.",
    "Your time is limited, so don't waste it living someone else's life.",
    "Not how long, but how well you have lived is the main thing.",
    "If life were predictable it would cease to be life, and be without flavor.",
    "The whole secret of a successful life is to find out what is one's destiny to do, and then do it.",
    "In order to write about life first you must live it.",
    "The big lesson in life, baby, is never be scared of anyone or anything.",
    "Sing like no one's listening, love like you've never been hurt, dance like nobody's watching, and live like it's heaven on earth.",
    "Curiosity about life in all of its aspects, I think, is still the secret of great creative people."
];

export const CODE_SNIPPETS = [
    `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
    `const greeting = "Hello, World!";
console.log(greeting);`,
    `for (let i = 0; i < 10; i++) {
  console.log(i);
}`,
    `const arr = [1, 2, 3, 4, 5];
const doubled = arr.map(x => x * 2);`,
    `import React from 'react';

const App = () => {
  return <div>Hello</div>;
};`,
    `interface User {
  id: number;
  name: string;
}`,
    `try {
  throw new Error("Something went wrong");
} catch (e) {
  console.error(e);
}`,
    `const sum = (a, b) => a + b;
console.log(sum(5, 3));`,
    `document.addEventListener('click', () => {
  console.log('Clicked!');
});`,
    `class Animal {
  constructor(name) {
    this.name = name;
  }
}`
];

export const CODE_KEYWORDS = {
    javascript: [
        "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
        "switch", "case", "break", "continue", "default", "try", "catch", "finally",
        "throw", "new", "this", "super", "class", "extends", "import", "export",
        "from", "async", "await", "yield", "void", "typeof", "instanceof", "in",
        "of", "delete", "null", "undefined", "true", "false", "NaN", "Infinity"
    ],
    python: [
        "def", "class", "if", "elif", "else", "for", "while", "break", "continue",
        "return", "yield", "try", "except", "finally", "raise", "import", "from",
        "as", "pass", "with", "lambda", "global", "nonlocal", "del", "assert",
        "True", "False", "None", "and", "or", "not", "is", "in", "async", "await"
    ],
    java: [
        "public", "private", "protected", "static", "final", "void", "int", "double",
        "float", "boolean", "char", "String", "class", "interface", "extends",
        "implements", "new", "return", "if", "else", "switch", "case", "break",
        "default", "for", "while", "do", "try", "catch", "finally", "throw", "throws",
        "package", "import", "this", "super", "null", "true", "false", "synchronized"
    ],
    "c++": [
        "int", "float", "double", "char", "void", "bool", "class", "struct", "public",
        "private", "protected", "virtual", "override", "static", "const", "constexpr",
        "if", "else", "switch", "case", "break", "default", "for", "while", "do",
        "return", "new", "delete", "try", "catch", "throw", "namespace", "using",
        "include", "template", "typename", "this", "nullptr", "true", "false", "auto"
    ],
    "c#": [
        "public", "private", "protected", "internal", "static", "readonly", "void",
        "int", "string", "bool", "class", "interface", "struct", "enum", "namespace",
        "using", "new", "return", "if", "else", "switch", "case", "break", "default",
        "for", "foreach", "while", "do", "try", "catch", "finally", "throw", "async",
        "await", "var", "null", "true", "false", "this", "base", "delegate", "event"
    ],
    sql: [
        "SELECT", "FROM", "WHERE", "INSERT", "INTO", "UPDATE", "SET", "DELETE",
        "CREATE", "TABLE", "DROP", "ALTER", "INDEX", "VIEW", "JOIN", "INNER",
        "LEFT", "RIGHT", "FULL", "OUTER", "ON", "GROUP", "BY", "ORDER", "HAVING",
        "LIMIT", "OFFSET", "DISTINCT", "UNION", "ALL", "VALUES", "NULL", "NOT",
        "AND", "OR", "IN", "BETWEEN", "LIKE", "AS", "PRIMARY", "KEY", "FOREIGN"
    ],
    html: [
        "html", "head", "body", "title", "meta", "link", "script", "style",
        "div", "span", "p", "a", "img", "ul", "ol", "li", "table", "tr",
        "td", "th", "form", "input", "button", "label", "select", "option",
        "textarea", "h1", "h2", "h3", "h4", "h5", "h6", "header", "footer",
        "nav", "main", "section", "article", "aside", "canvas", "iframe", "video"
    ],
    css: [
        "color", "background", "margin", "padding", "border", "width", "height",
        "display", "position", "top", "bottom", "left", "right", "font", "family",
        "size", "weight", "text", "align", "decoration", "transform", "transition",
        "animation", "flex", "grid", "gap", "justify", "content", "items", "z-index",
        "opacity", "overflow", "cursor", "pointer", "hover", "active", "focus",
        "media", "screen", "min-width", "max-width", "import", "important", "var"
    ]
};
