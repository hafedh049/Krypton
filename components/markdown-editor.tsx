"use client"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, FileDown } from "lucide-react"
import { TimePicker } from "./time-picker"
import { format } from "date-fns"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface MarkdownEditorProps {
  initialValue: string
  onSave: (markdown: string, scheduledTime?: { date: Date; startTime: string; endTime: string }) => void
  onCancel: () => void
  initialDate?: Date | null
  lightTheme?: boolean
}

export function MarkdownEditor({
  initialValue,
  onSave,
  onCancel,
  initialDate,
  lightTheme = false,
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(initialValue)
  const [activeTab, setActiveTab] = useState<string>("write")
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [scheduledTime, setScheduledTime] = useState<{ date: Date; startTime: string; endTime: string } | null>(
    initialDate
      ? {
          date: initialDate,
          startTime: format(initialDate, "HH:00"),
          endTime: format(new Date(initialDate.getTime() + 3600000), "HH:00"),
        }
      : null,
  )
  const previewRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [previewHeight, setPreviewHeight] = useState(400) // Default height

  // Calculate available height for preview
  useEffect(() => {
    if (activeTab === "preview") {
      const calculateHeight = () => {
        const container = previewContainerRef.current?.parentElement
        if (container) {
          // Get the container height and subtract space for the button (60px)
          const availableHeight = container.clientHeight - 60
          setPreviewHeight(Math.max(300, availableHeight))
        }
      }

      calculateHeight()
      window.addEventListener("resize", calculateHeight)

      return () => {
        window.removeEventListener("resize", calculateHeight)
      }
    }
  }, [activeTab])

  const handleTimeSelect = (date: Date, startTime: string, endTime: string) => {
    setScheduledTime({ date, startTime, endTime })
    setShowTimePicker(false)
  }

  // Function to download the preview as PDF
  const downloadAsPdf = async () => {
    if (!previewRef.current || isPdfGenerating) return

    try {
      setIsPdfGenerating(true)

      // Create a temporary container for PDF generation
      const pdfContainer = document.createElement("div")
      pdfContainer.className = lightTheme ? "pdf-container light" : "pdf-container dark"
      pdfContainer.style.position = "absolute"
      pdfContainer.style.left = "-9999px"
      pdfContainer.style.width = "794px" // A4 width in pixels at 96 DPI
      pdfContainer.style.padding = "40px"
      pdfContainer.style.backgroundColor = lightTheme ? "#ffffff" : "#1f2937"
      pdfContainer.style.color = lightTheme ? "#1f2937" : "#ffffff"

      // Clone the content
      const contentClone = previewRef.current.cloneNode(true) as HTMLElement

      // Remove any buttons or interactive elements
      const buttons = contentClone.querySelectorAll("button")
      buttons.forEach((button) => button.remove())

      // Optimize spacing - remove excessive empty lines
      const emptyLines = contentClone.querySelectorAll(".empty-line")
      emptyLines.forEach((line, index) => {
        // Keep some empty lines for structure, but remove consecutive ones
        if (index > 0 && line.previousElementSibling?.classList.contains("empty-line")) {
          line.remove()
        }
      })

      // Adjust paragraph spacing
      const paragraphs = contentClone.querySelectorAll("p")
      paragraphs.forEach((p) => {
        p.style.marginBottom = "0.75em"
        p.style.lineHeight = "1.5"
      })

      // Improve code block formatting
      const codeBlocks = contentClone.querySelectorAll("pre")
      codeBlocks.forEach((block) => {
        block.style.margin = "1em 0"
        block.style.padding = "0.75em"
        block.style.borderRadius = "4px"
        block.style.backgroundColor = lightTheme ? "#f3f4f6" : "#374151"
        block.style.fontSize = "0.9em"
      })

      // Improve list formatting
      const lists = contentClone.querySelectorAll("ul, ol")
      lists.forEach((list) => {
        list.style.marginBottom = "1em"
        list.style.paddingLeft = "2em"
      })

      // Extract title from markdown
      const lines = markdown.split("\n")
      const title = lines[0].replace(/^#+\s/, "")

      // Add title
      const titleElement = document.createElement("h1")
      titleElement.textContent = title || "Task Preview"
      titleElement.style.fontSize = "24px"
      titleElement.style.marginBottom = "20px"
      titleElement.style.fontWeight = "bold"
      titleElement.style.color = lightTheme ? "#1f2937" : "#ffffff"
      titleElement.style.borderBottom = lightTheme ? "1px solid #e5e7eb" : "1px solid #4b5563"
      titleElement.style.paddingBottom = "10px"

      // Add metadata if available
      if (scheduledTime) {
        const metaElement = document.createElement("div")
        metaElement.style.fontSize = "14px"
        metaElement.style.marginBottom = "20px"
        metaElement.style.color = lightTheme ? "#6b7280" : "#9ca3af"
        metaElement.innerHTML = `<strong>Scheduled:</strong> ${format(scheduledTime.date, "MMMM d, yyyy")} at ${scheduledTime.startTime} - ${scheduledTime.endTime}`
        pdfContainer.appendChild(metaElement)
      }

      pdfContainer.appendChild(titleElement)
      pdfContainer.appendChild(contentClone)
      document.body.appendChild(pdfContainer)

      // Use setTimeout to ensure the DOM is updated
      setTimeout(async () => {
        try {
          // Use html2canvas to capture the rendered content
          const canvas = await html2canvas(pdfContainer, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: lightTheme ? "#ffffff" : "#1f2937",
          })

          // Create PDF
          const imgData = canvas.toDataURL("image/jpeg", 0.95)
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          })

          // Calculate dimensions
          const imgWidth = 210 // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight)

          // If content is longer than one page, add more pages
          if (imgHeight > 297) {
            // A4 height in mm
            let remainingHeight = imgHeight
            let position = -297

            while (remainingHeight > 297) {
              position -= 297
              remainingHeight -= 297
              pdf.addPage()
              pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
            }
          }

          // Save the PDF with a better filename
          const filename = title
            ? `${title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-")
                .replace(/-+/g, "-")}.pdf`
            : "task-preview.pdf"

          pdf.save(filename)

          // Clean up
          document.body.removeChild(pdfContainer)
        } catch (error) {
          console.error("PDF generation error:", error)
          alert("Failed to generate PDF. Please try again.")
        } finally {
          setIsPdfGenerating(false)
        }
      }, 100)
    } catch (error) {
      console.error("PDF generation error:", error)
      setIsPdfGenerating(false)
    }
  }

  // Process markdown to preserve newlines but avoid excessive ones
  const processedMarkdown = markdown
    .replace(/\n{3,}/g, "\n\n") // Replace 3+ consecutive newlines with just 2
    .replace(/\n\n/g, "\n&nbsp;\n")

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="px-4 pt-4">
          <TabsList className={lightTheme ? "bg-gray-100" : "bg-gray-700"}>
            <TabsTrigger
              value="write"
              className={
                lightTheme
                  ? "data-[state=active]:bg-white data-[state=active]:shadow-neomorphic-sm"
                  : "data-[state=active]:bg-gray-600"
              }
            >
              Write
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className={
                lightTheme
                  ? "data-[state=active]:bg-white data-[state=active]:shadow-neomorphic-sm"
                  : "data-[state=active]:bg-gray-600"
              }
            >
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="flex-1 p-4">
          <div className="h-full relative">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="# Task Title
    
Description with **bold** and *italic* text

- List item 1
- List item 2

> Important note

\`\`\`js
// Code example
function hello() {
  console.log('Hello world!');
}
\`\`\`"
              className={`w-full h-full min-h-[300px] p-4 rounded-lg focus:outline-none resize-none custom-scrollbar ${
                lightTheme
                  ? "bg-white border border-gray-200 text-gray-800 shadow-neomorphic-inner"
                  : "bg-gray-700 border border-gray-600 text-white"
              }`}
              style={{
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: lightTheme
                  ? "rgba(139, 92, 246, 0.3) rgba(209, 217, 230, 0.5)"
                  : "rgba(139, 92, 246, 0.5) rgba(31, 41, 55, 0.5)",
                whiteSpace: "pre-wrap",
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 p-4">
          <div ref={previewContainerRef} className="flex flex-col h-full">
            {/* Scrollable content area with fixed height */}
            <div
              className={`rounded-lg p-4 ${lightTheme ? "bg-white shadow-neomorphic" : "bg-gray-700"} mb-4`}
              style={{
                height: `${previewHeight}px`,
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: lightTheme
                  ? "rgba(139, 92, 246, 0.3) rgba(209, 217, 230, 0.5)"
                  : "rgba(139, 92, 246, 0.5) rgba(31, 41, 55, 0.5)",
              }}
            >
              <div
                ref={previewRef}
                className={`${lightTheme ? "prose-light" : "prose prose-invert"} max-w-none pr-2 custom-scrollbar markdown-content ${
                  lightTheme ? "light-theme" : ""
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "")
                      return !inline && match ? (
                        <SyntaxHighlighter style={tomorrow} language={match[1]} PreTag="div" {...props}>
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                    // Custom paragraph renderer to preserve empty lines
                    p({ children }) {
                      if (children === "&nbsp;") {
                        return <div className="empty-line">&nbsp;</div>
                      }
                      return <p>{children}</p>
                    },
                  }}
                >
                  {processedMarkdown}
                </ReactMarkdown>
              </div>
            </div>

            {/* PDF Download Button - Fixed at the bottom */}
            <div>
              <Button
                variant={lightTheme ? "outline" : "outline"}
                size="sm"
                className={
                  lightTheme
                    ? "border-gray-200 text-gray-700 hover:bg-gray-50 shadow-neomorphic-sm"
                    : "border-gray-600 text-gray-300 hover:bg-gray-700"
                }
                onClick={downloadAsPdf}
                disabled={isPdfGenerating}
              >
                {isPdfGenerating ? (
                  <>
                    <span className="animate-pulse mr-2">⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {activeTab !== "preview" && (
        <div
          className={`p-4 border-t ${
            lightTheme ? "border-gray-200 bg-white" : "border-gray-700"
          } flex justify-between items-center`}
        >
          <div className="flex items-center gap-2">
            <Button
              variant={lightTheme ? "outline" : "outline"}
              size="sm"
              className={
                lightTheme
                  ? "border-gray-200 text-gray-700 hover:bg-gray-50 shadow-neomorphic-sm"
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
              }
              onClick={() => setShowTimePicker(true)}
            >
              <Clock className="h-4 w-4 mr-2" />
              {scheduledTime ? (
                <span>
                  {scheduledTime.startTime} - {scheduledTime.endTime}
                </span>
              ) : (
                "Schedule"
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className={
                lightTheme
                  ? "border-gray-200 text-gray-700 hover:bg-gray-50 shadow-neomorphic-sm"
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
              }
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSave(markdown, scheduledTime || undefined)}
              className={
                lightTheme
                  ? "bg-purple-500 hover:bg-purple-600 text-white shadow-neomorphic-sm"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }
            >
              Save Task
            </Button>
          </div>
        </div>
      )}

      {showTimePicker && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <TimePicker
              onTimeSelect={handleTimeSelect}
              onClose={() => setShowTimePicker(false)}
              lightTheme={lightTheme}
            />
          </div>
        </div>
      )}
    </div>
  )
}

