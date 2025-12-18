import { useEffect, useRef } from "react";

/**
 * Custom hook to prevent cheating during placement test
 * Implements various frontend anti-cheat measures
 */
export function useAntiCheat(isActive: boolean = true) {
  const warningShownRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    // Add CSS to prevent text selection (completely block selection)
    const style = document.createElement("style");
    style.id = "anti-cheat-style";
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      /* Extra protection for passage text */
      [class*="passage"], [class*="Passage"], [class*="reading"], [class*="Reading"] {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        pointer-events: auto !important;
      }
      /* Prevent selection with ::selection pseudo-element */
      *::selection {
        background: transparent !important;
      }
      *::-moz-selection {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent common keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+P (Print)
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+A (Select All) - block everywhere
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+C (Copy) - block everywhere
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+V (Paste) - block everywhere
      if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+X (Cut) - block everywhere
      if (e.ctrlKey && e.key === "x") {
        e.preventDefault();
        return false;
      }
    };

    // Prevent text selection (block everywhere)
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      // Clear any existing selection
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
      if (document.getSelection) {
        document.getSelection()?.removeAllRanges();
      }
      return false;
    };

    // Clear selection on mouse up
    const handleMouseUp = (e: MouseEvent) => {
      // Clear selection immediately after mouse up
      setTimeout(() => {
        if (window.getSelection) {
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) {
            selection.removeAllRanges();
          }
        }
        if (document.getSelection) {
          const selection = document.getSelection();
          if (selection && selection.toString().length > 0) {
            selection.removeAllRanges();
          }
        }
      }, 0);
    };

    // Prevent copy event
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
      return false;
    };

    // Prevent paste event
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
      return false;
    };

    // Prevent cut event
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
      return false;
    };

    // Prevent drag and drop (block everywhere)
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Detect tab visibility changes (user switching tabs)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched to another tab/window
        if (!warningShownRef.current) {
          warningShownRef.current = true;
          // Show warning when user comes back
          setTimeout(() => {
            if (document.visibilityState === "visible") {
              alert(
                "⚠️ Cảnh báo: Bạn đã chuyển sang tab khác. Hành vi này có thể được ghi nhận."
              );
            }
          }, 100);
        }
      }
    };

    // Warn before leaving page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Bạn có chắc chắn muốn rời khỏi trang? Tiến trình của bạn có thể bị mất.";
      return e.returnValue;
    };

    // Prevent opening DevTools by detecting console
    const detectDevTools = () => {
      let devtools = { open: false, orientation: null as string | null };
      const threshold = 160;

      setInterval(() => {
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          if (!devtools.open) {
            devtools.open = true;
            alert(
              "⚠️ Cảnh báo: Phát hiện DevTools đang mở. Vui lòng đóng DevTools để tiếp tục làm bài."
            );
          }
        } else {
          devtools.open = false;
        }
      }, 500);
    };

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Continuously clear selection (runs every 100ms)
    const clearSelectionInterval = setInterval(() => {
      if (window.getSelection) {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          selection.removeAllRanges();
        }
      }
      if (document.getSelection) {
        const selection = document.getSelection();
        if (selection && selection.toString().length > 0) {
          selection.removeAllRanges();
        }
      }
    }, 100);

    // Start DevTools detection
    detectDevTools();

    // Disable console methods (basic protection)
    if (process.env.NODE_ENV === "production") {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.info = () => {};
    }

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Clear interval
      clearInterval(clearSelectionInterval);
      // Remove style
      const existingStyle = document.getElementById("anti-cheat-style");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isActive]);

  return {
    isActive,
  };
}

