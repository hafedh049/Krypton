export function EmojiPicker({ theme = "light" }: { theme?: "light" | "dark" }) {
  const isLight = theme === "light"

  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
  ]

  return (
    <div
      className={`mt-2 p-4 rounded-lg border ${
        isLight ? "bg-white border-gray-200 shadow-neomorphic" : "bg-gray-700 border-gray-600 shadow-lg"
      }`}
    >
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search"
          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
            isLight
              ? "bg-white border-gray-200 text-gray-800 placeholder-gray-400 shadow-neomorphic-sm"
              : "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          }`}
        />
      </div>
      <h3 className={`text-sm font-medium mb-2 ${isLight ? "text-gray-600" : "text-gray-300"}`}>Smileys and People</h3>
      <div
        className={`grid grid-cols-6 gap-3 overflow-y-auto max-h-48 pr-2 custom-scrollbar ${
          isLight ? "light-theme" : ""
        }`}
        style={{
          scrollbarWidth: "thin",
          overflowX: "hidden",
        }}
      >
        {emojis.map((emoji, index) => (
          <button
            key={index}
            className={`h-10 w-10 flex items-center justify-center rounded-lg transition-transform hover:scale-110 ${
              isLight ? "hover:bg-gray-100 shadow-neomorphic-sm" : "hover:bg-gray-600"
            }`}
          >
            <span role="img" className="text-xl">
              {emoji}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

