import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import axios from 'axios'
import './App.css'

function App() {
  const [ code, setCode ] = useState(`function sum() {
  return 1 + 1;
}`)

  const [ review, setReview ] = useState(``)
  const [ loading, setLoading ] = useState(false)

  useEffect(() => {
    prism.highlightAll()
  }, [])

  async function reviewCode() {
    if (loading) return;
    setLoading(true);
    setReview("⏳ **Analyzing code with AI...** Please wait a moment.");
    try {
      const response = await axios.post('http://localhost:3000/ai/get-review', { code });
      setReview(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message;
      setReview(`❌ **Review Failed**:\n\n${errorMsg}\n\n*Please verify the server is running and try again.*`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main>
        <div className="left">
          <div className="code">
            <Editor
              value={code}
              onValueChange={newCode => setCode(newCode)}
              highlight={c => prism.highlight(c, prism.languages.javascript, "javascript")}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                border: "1px solid #ddd",
                borderRadius: "5px",
                height: "100%",
                width: "100%"
              }}
            />
          </div>
          <div
            onClick={reviewCode}
            className="review"
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Reviewing..." : "Review"}
          </div>
        </div>
        <div className="right">
          <Markdown rehypePlugins={[ rehypeHighlight ]}>{review}</Markdown>
        </div>
      </main>
    </>
  )
}

export default App
