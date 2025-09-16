import type { FileSystemItem } from './store';

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>CodePilot Demo</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Welcome to CodePilot!</h1>
  <p>This is a simple demo. Edit the files and click "Run" to see your changes.</p>
  <button id="myButton">Click Me</button>
  <script src="script.js"></script>
</body>
</html>
`;

const cssContent = `body {
  font-family: sans-serif;
  background-color: #f0f0f0;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
}

h1 {
  color: #4F46E5;
}

button {
  background-color: #14B8A6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #0F766E;
}
`;

const jsContent = `document.getElementById('myButton').addEventListener('click', () => {
  alert('Hello from JavaScript!');
  console.log('Button was clicked.');
});

console.log('CodePilot demo script loaded.');
`;

const pythonContent = `# Welcome to Python in CodePilot!
def greet(name):
  """This function greets the user."""
  print(f"Hello, {name}!")

def fibonacci(n):
  """Returns the first n Fibonacci numbers."""
  a, b = 0, 1
  result = []
  for _ in range(n):
    result.append(a)
    a, b = b, a + b
  return result

greet("CodePilot User")
print("Here are the first 10 Fibonacci numbers:")
print(fibonacci(10))
`;


export const defaultFileTree: FileSystemItem[] = [
  {
    id: 'folder-src',
    name: 'src',
    type: 'folder',
    path: '/src',
    isOpen: true,
    children: [
      { id: 'file-html', name: 'index.html', language: 'html', content: htmlContent, type: 'file', path: '/src/index.html' },
      { id: 'file-css', name: 'style.css', language: 'css', content: cssContent, type: 'file', path: '/src/style.css' },
      { id: 'file-js', name: 'script.js', language: 'javascript', content: jsContent, type: 'file', path: '/src/script.js' },
    ]
  },
  { id: 'file-py', name: 'main.py', language: 'python', content: pythonContent, type: 'file', path: '/main.py' },
];
