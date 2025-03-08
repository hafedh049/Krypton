"use client"

import { CheckCircle, Circle, ChevronDown, ChevronUp, Clock, FileDown } from "lucide-react"
import type { Task } from "@/types/todo"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { Button } from "@/components/ui/button"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface TaskItemProps {
  task: Task
  onToggle: () => void
  formattedDate: string
  lightTheme?: boolean
}

export function TaskItem({ task, onToggle, formattedDate, lightTheme = false }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  const hasExpandableContent =
    task.text.includes("\n") ||
    task.text.includes("#") ||
    task.text.includes("*") ||
    task.text.includes("-") ||
    task.text.includes(">") ||
    task.text.includes("`")

  const title = task.text.split("\n")[0].replace(/^#+\s/, "")

  // Process markdown to preserve newlines
  const processedMarkdown = task.text.replace(/\n\n/g, "\n&nbsp;\n")

  // Function to download the content as PDF
  const downloadAsPdf = async () => {
    if (!contentRef.current || isPdfGenerating) return

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
      const contentClone = contentRef.current.cloneNode(true) as HTMLElement

      // Remove any buttons or interactive elements
      const buttons = contentClone.querySelectorAll("button")
      buttons.forEach((button) => button.remove())

      // Add title
      const titleElement = document.createElement("h1")
      titleElement.textContent = title
      titleElement.style.fontSize = "24px"
      titleElement.style.marginBottom = "20px"
      titleElement.style.fontWeight = "bold"
      titleElement.style.color = lightTheme ? "#1f2937" : "#ffffff"

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

          // Save the PDF
          pdf.save(`task-${task.id}.pdf`)

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

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg transition-colors border",
        lightTheme
          ? expanded
            ? "bg-white border-gray-200 shadow-neomorphic"
            : "bg-white border-gray-200 hover:border-purple-200 shadow-neomorphic-sm"
          : expanded
            ? "bg-gray-800 border-gray-700"
            : "hover:bg-gray-800 border-gray-800 hover:border-gray-700",
        task.completed && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            "mt-0.5 flex-shrink-0",
            lightTheme
              ? task.completed
                ? "text-purple-500"
                : "text-gray-400 hover:text-purple-500"
              : task.completed
                ? "text-purple-500"
                : "text-gray-500 hover:text-purple-400",
          )}
        >
          {task.completed ? (
            <CheckCircle
              className={`h-5 w-5 ${lightTheme ? "text-purple-500 fill-purple-500" : "text-purple-500 fill-purple-500"}`}
            />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                lightTheme ? "text-gray-800 break-words" : "text-gray-300 break-words",
                task.completed && (lightTheme ? "line-through text-gray-400" : "line-through text-gray-500"),
              )}
            >
              {hasExpandableContent ? title : task.text}
            </span>

            {hasExpandableContent && (
              <button
                onClick={() => setExpanded(!expanded)}
                className={`flex-shrink-0 ${lightTheme ? "text-gray-400 hover:text-gray-700" : "text-gray-500 hover:text-gray-300"} p-1`}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{formattedDate}</span>
            {task.scheduledTime && (
              <div className={`flex items-center gap-1 ${lightTheme ? "text-purple-500" : "text-purple-400"}`}>
                <Clock className="h-3 w-3" />
                <span>
                  {task.scheduledTime.startTime} - {task.scheduledTime.endTime}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && hasExpandableContent && (
        <>
          <div
            ref={contentRef}
            className={`pl-8 pr-2 pb-1 ${lightTheme ? "prose-light" : "prose prose-invert"} prose-sm max-w-none overflow-auto markdown-content`}
            style={{ maxHeight: "300px", whiteSpace: "pre-wrap" }}
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
          <div className="pl-8 mt-2">
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
        </>
      )}
    </div>
  )
}

