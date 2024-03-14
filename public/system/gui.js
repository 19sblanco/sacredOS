function populateMenu() {
  for (let i = 0; i < fileTable.programs.length; i++) {
    var menuItem = document.createElement("div");
    menuItem.innerHTML = fileTable.programs[i];
    menuItem.classList = "oSButton osElemBase";
    menuItem.onclick = menuItem.onclick = (function (programName) {
      return function () {
        openProgram(programName, fileContents.programs[programName], true);
      };
    })(fileTable.programs[i]);
    document.getElementById("menuContent").appendChild(menuItem);
  }
}

var menuOpen = false;
function toggleOpenmenu() {
  menuOpen = !menuOpen;
  if (menuOpen) {
    document.getElementById("mainMenu").style.display = "initial";
    document.getElementById("menuButton").style.border =
      "var(--borderWidth) inset var(--secColorDark)";
  } else {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("menuButton").style.border =
      "var(--borderWidth) outset var(--secColorDark)";
  }
}

function createWindow(currentWindowID) {
  let window = document.createElement("div");
  window.id = `win${currentWindowID}`;
  window.style.zIndex = "5";
  window.classList = "window windowRidgeBorder";
  document.body.appendChild(window);
  return window;
}

function createHeader(currentWindowID, programName) {
  let header = document.createElement("div");
  header.id = `hed${currentWindowID}`;
  header.classList = "menuHeader";
  header.textContent = programName;
  return header;
}

function createOverlay() {
  let overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.cursor = "grabbing";
  overlay.style.zIndex = "9999"; // Ensure it's on top of everything
  overlay.style.display = "none"; // Start hidden
  document.body.appendChild(overlay);
  return overlay;
}

function createCloseButton(currentWindowID) {
  let closeButton = document.createElement("button");
  closeButton.id = `close${currentWindowID}`; // Unique ID for the close button
  closeButton.classList = "osElemBase oSButton windowControlButton";
  closeButton.textContent = "X";
  closeButton.style.float = "right";
  closeButton.onclick = function () {
    closeProgram(`win${currentWindowID}`, `men${currentWindowID}`);
  };
  return closeButton;
}

function createMinimizeButton(currentWindowID) {
  let minimizeButton = document.createElement("button");
  minimizeButton.id = `min${currentWindowID}`; // Unique ID for the close button
  minimizeButton.classList = "osElemBase oSButton windowControlButton";
  minimizeButton.textContent = "__";
  minimizeButton.style.float = "right";
  minimizeButton.onclick = function () {
    minimizeProgram(`win${currentWindowID}`, `men${currentWindowID}`);
  };
  return minimizeButton;
}

function createMaximizeButton(currentWindowID, width, height) {
  let maximizeButton = document.createElement("button");
  maximizeButton.id = `max${currentWindowID}`; // Unique ID for the close button
  maximizeButton.classList = "osElemBase oSButton windowControlButton";
  maximizeButton.textContent = "[ ]";
  maximizeButton.style.float = "right";
  maximizeButton.onclick = function () {
    toggleMaximizeProgram(
      `win${currentWindowID}`,
      `prog${currentWindowID}`,
      `max${currentWindowID}`,
      width,
      height
    );
  };
  return maximizeButton;
}

function createMenuBarButton(currentWindowID, programName) {
  let menuBarButton = document.createElement("button");
  menuBarButton.id = `men${currentWindowID}`;
  menuBarButton.classList = "osElemBase oSButton h-100";
  menuBarButton.style.border = "var(--borderWidth) inset var(--secColorDark)";
  menuBarButton.textContent = programName;
  menuBarButton.addEventListener("mousedown", function (e) {
    if (
      menuBarButton.style.border ===
      "var(--borderWidth) inset var(--secColorDark)"
    ) {
      minimizeProgram(`win${currentWindowID}`, `men${currentWindowID}`);
    } else {
      bringWindowToFront(`win${currentWindowID}`, `men${currentWindowID}`);
    }
  });
  document.getElementById("programBar").appendChild(menuBarButton);
}

var windowCount = -1;

function openProgram(programName, data, dontToggleMenu, withFile) {
  if (dontToggleMenu) {
    toggleOpenmenu();
  }
  windowCount++;
  const currentWindowID = windowCount;
  let window = createWindow(currentWindowID);
  window.addEventListener("click", () =>
    bringWindowToFront(`win${currentWindowID}`, `men${currentWindowID}`)
  );

  let header = createHeader(currentWindowID, programName);
  window.appendChild(header);

  const closeButton = createCloseButton(currentWindowID);
  header.appendChild(closeButton);

  if (withFile) {
    data = data.replace("<html>", `<html><!--path="${withFile}"-->`);
  }
  const sizeMatch = data.match(/<!--width="(\d+)" height="(\d+)".*-->/);
  const width = sizeMatch ? sizeMatch[1] : "600";
  const height = sizeMatch ? sizeMatch[2] : "400";

  const noResizeMatch = data.match(/<!--.*noRS.*-->/);
  let maximizeButton;
  if (!noResizeMatch) {
    maximizeButton = createMaximizeButton(currentWindowID, width, height);
    header.appendChild(maximizeButton);
  }

  const minimizeButton = createMinimizeButton(currentWindowID);
  header.appendChild(minimizeButton);

  // Create a transparent overlay to have smooth dragging of windows
  let overlay = createOverlay();

  header.addEventListener("mousedown", function (e) {
    if (
      e.target === closeButton ||
      e.target === maximizeButton ||
      e.target === minimizeButton
    ) {
      return; // Don't start dragging if clicking on the close button
    }
    bringWindowToFront(`win${currentWindowID}`, `men${currentWindowID}`);
    e.preventDefault(); // Prevent any default actions that might interfere with the drag
    overlay.style.display = "block"; // Show the overlay
    const rect = window.getBoundingClientRect();
    const dragOffsetX = e.clientX - rect.left;
    const dragOffsetY = e.clientY - rect.top;

    function onMouseMove(e) {
      window.style.position = "absolute";
      const yResult = e.clientY - dragOffsetY;
      window.style.left = e.clientX - dragOffsetX + "px";
      window.style.top = (0 > yResult ? 0 : yResult) + "px";
    }

    function onMouseUp() {
      overlay.style.display = "none"; // Hide the overlay
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  let iframe = document.createElement("iframe");
  iframe.id = `prog${currentWindowID}`;
  iframe.srcdoc = data;
  // iframe.width = width;
  // iframe.height = height;
  iframe.style.overflow = "hidden";
  iframe.frameBorder = "0";
  iframe.style.border = "0";
  iframe.allowFullscreen = true;
  iframe.onload = function () {
    iframe.contentDocument.body.addEventListener("click", function () {
      bringWindowToFront(`win${currentWindowID}`, `men${currentWindowID}`);
    });
  };
  window.appendChild(iframe);

  createMenuBarButton(currentWindowID, programName);

  bringWindowToFront(`win${currentWindowID}`, `men${currentWindowID}`);

  registryResizingForProgram({
    noResizeMatch,
    iframeInitSize: {
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    },
    elements: {
      programWindow: window,
      programHeader: header,
      programIframe: iframe,
      programMaximizeButton: maximizeButton,
      programOverlay: overlay,
    },
  });
}

const cursorStatusMap = {
  topBorder: "ns-resize",
  bottomBorder: "ns-resize",
  leftBorder: "ew-resize",
  rightBorder: "ew-resize",
  topLeftCorner: "nwse-resize",
  bottomRightCorner: "nwse-resize",
  topRightCorner: "nesw-resize",
  bottomLeftCorner: "nesw-resize",
  [undefined]: "default",
};

function registryResizingForProgram({
  noResizeMatch,
  iframeInitSize,
  elements,
}) {
  const {
    programWindow,
    programHeader,
    programIframe,
    programMaximizeButton,
    programOverlay,
  } = elements;

  let { borderWidth } = window.getComputedStyle(programWindow);
  borderWidth = parseInt(borderWidth, 10);

  const headerRectHeight = programHeader.getBoundingClientRect().height;

  programIframe.style.height = `calc(100% - ${headerRectHeight}px)`;
  programIframe.style.width = "100%";

  programWindow.style.width = iframeInitSize.width + borderWidth * 2 + "px";
  programWindow.style.height =
    iframeInitSize.width + borderWidth * 2 + headerRectHeight + "px";

  if (noResizeMatch) return;

  const isTopProgramWindow = () => programWindow.style.zIndex === "5";

  let currentCursorStatus;

  const setCursor = (e) => {
    if (!isTopProgramWindow()) return;

    if (!e) {
      currentCursorStatus = undefined;
    } else {
      const rect = programWindow.getBoundingClientRect();
      currentCursorStatus = checkCursorPosition(e, rect, borderWidth);
    }

    programWindow.style.cursor = cursorStatusMap[currentCursorStatus];
  };

  programWindow.addEventListener("mousemove", setCursor);

  programWindow.addEventListener("mousedown", (e) => {
    if (!isTopProgramWindow()) return;

    setCursor(e);
    const isMaximized = programMaximizeButton.textContent !== "[ ]";

    if (e.target !== programWindow || isMaximized) {
      e.preventDefault();
      return;
    }

    programWindow.removeEventListener("mousemove", setCursor);

    programOverlay.style.display = "block"; // Show the overlay

    function constrainMouseEventPosition(ev) {
      const { clientX, clientY } = ev;
      const { innerWidth, innerHeight } = window;

      const constrainedX = Math.max(0, Math.min(clientX, innerWidth));
      const constrainedY = Math.max(0, Math.min(clientY, innerHeight));

      return { clientX: constrainedX, clientY: constrainedY };
    }

    const programWindowMinSize = {
      width: 210,
      height: headerRectHeight + borderWidth * 2,
    };

    const rect = programWindow.getBoundingClientRect();
    const { clientX: oldClientX, clientY: oldClientY } = e;

    const onResizing = (e) => {
      let { clientX, clientY } = constrainMouseEventPosition(e);

      const deltaX = clientX - oldClientX;
      const deltaY = clientY - oldClientY;
      switch (currentCursorStatus) {
        case "topBorder":
          const newHeight = Math.max(
            programWindowMinSize.height,
            rect.height - deltaY
          );

          programWindow.style.height = newHeight + "px";
          programWindow.style.top = rect.top + (rect.height - newHeight) + "px";
          break;
        case "bottomBorder":
          programWindow.style.height =
            Math.max(programWindowMinSize.height, rect.height + deltaY) + "px";
          break;
        case "leftBorder":
          const newWidth = Math.max(
            programWindowMinSize.width,
            rect.width - deltaX
          );
          programWindow.style.width = newWidth + "px";
          programWindow.style.left = rect.left + (rect.width - newWidth) + "px";
          break;
        case "rightBorder":
          programWindow.style.width =
            Math.max(programWindowMinSize.width, rect.width + deltaX) + "px";
          break;
        case "topLeftCorner":
          const newTopHeight = Math.max(
            programWindowMinSize.height,
            rect.height - deltaY
          );
          const newLeftWidth = Math.max(
            programWindowMinSize.width,
            rect.width - deltaX
          );
          programWindow.style.height = newTopHeight + "px";
          programWindow.style.top =
            rect.top + (rect.height - newTopHeight) + "px";
          programWindow.style.width = newLeftWidth + "px";
          programWindow.style.left =
            rect.left + (rect.width - newLeftWidth) + "px";
          break;
        case "bottomRightCorner":
          programWindow.style.height =
            Math.max(programWindowMinSize.height, rect.height + deltaY) + "px";
          programWindow.style.width =
            Math.max(programWindowMinSize.width, rect.width + deltaX) + "px";
          break;
        case "topRightCorner":
          const newRightWidth = Math.max(
            programWindowMinSize.width,
            rect.width + deltaX
          );
          const newTopHeightTR = Math.max(
            programWindowMinSize.height,
            rect.height - deltaY
          );
          programWindow.style.height = newTopHeightTR + "px";
          programWindow.style.top =
            rect.top + (rect.height - newTopHeightTR) + "px";
          programWindow.style.width = newRightWidth + "px";
          break;
        case "bottomLeftCorner":
          const newBottomHeight = Math.max(
            programWindowMinSize.height,
            rect.height + deltaY
          );
          const newLeftWidthBL = Math.max(
            programWindowMinSize.width,
            rect.width - deltaX
          );
          programWindow.style.height = newBottomHeight + "px";
          programWindow.style.width = newLeftWidthBL + "px";
          programWindow.style.left =
            rect.left + (rect.width - newLeftWidthBL) + "px";
          break;
        default:
        // ...
      }
    };

    const onResizingCompleted = (e) => {
      programOverlay.style.display = "none"; // Hide the overlay
      programWindow.addEventListener("mousemove", setCursor);
      document.removeEventListener("mousemove", onResizing);
      document.removeEventListener("mouseup", onResizingCompleted);
      setCursor();
    };

    document.addEventListener("mousemove", onResizing);
    document.addEventListener("mouseup", onResizingCompleted);
  });
}

function checkCursorPosition(e, rect, borderWidth) {
  const { clientX, clientY } = e;
  const { x, y, width, height } = rect;

  const resizableRects = {
    topLeftCorner: { x, y, width: borderWidth, height: borderWidth },
    topRightCorner: {
      x: x + width - borderWidth,
      y,
      width: borderWidth,
      height: borderWidth,
    },
    bottomLeftCorner: {
      x,
      y: y + height - borderWidth,
      width: borderWidth,
      height: borderWidth,
    },
    bottomRightCorner: {
      x: x + width - borderWidth,
      y: y + height - borderWidth,
      width: borderWidth,
      height: borderWidth,
    },
    topBorder: {
      x: x + borderWidth,
      y,
      width: width - borderWidth * 2,
      height: borderWidth,
    },
    bottomBorder: {
      x: x + borderWidth,
      y: y + height - borderWidth,
      width: width - borderWidth * 2,
      height: borderWidth,
    },
    leftBorder: {
      x,
      y: y + borderWidth,
      width: borderWidth,
      height: height - borderWidth * 2,
    },
    rightBorder: {
      x: x + width - borderWidth,
      y: y + borderWidth,
      width: borderWidth,
      height: height - borderWidth * 2,
    },
  };

  const keys = Object.keys(resizableRects);
  const [currentCursorPosition] = keys.filter((key) => {
    return isContain({ x: clientX, y: clientY }, resizableRects[key]);
  });

  return currentCursorPosition;
}

function isContain(point, rect) {
  return (
    point.x > rect.x &&
    point.x < rect.x + rect.width &&
    point.y > rect.y &&
    point.y < rect.y + rect.height
  );
}

function closeProgram(windowID, menuBarButtonID) {
  document.getElementById(windowID).outerHTML = "";
  document.getElementById(menuBarButtonID).outerHTML = "";
}

function toggleMaximizeProgram(
  windowID,
  programID,
  maximizeButtonID,
  width,
  height
) {
  if (document.getElementById(maximizeButtonID).textContent === "[ ]") {
    document.getElementById(windowID).style.width = "100%";
    document.getElementById(windowID).style.height =
      "calc(100vh - var(--programBarHeight))";
    document.getElementById(windowID).style.left = 0;
    document.getElementById(windowID).style.top = 0;
    document.getElementById(programID).style.width = "100%";
    document.getElementById(programID).style.height =
      "calc(100vh - var(--programBarHeight) - var(--headerBarHeight))";
    document.getElementById(maximizeButtonID).textContent = "[]";
  } else {
    document.getElementById(windowID).style.width = "fit-content";
    document.getElementById(windowID).style.height = "fit-content";
    document.getElementById(programID).style.width = width + "px";
    document.getElementById(programID).style.height = height + "px";
    document.getElementById(maximizeButtonID).textContent = "[ ]";
  }
}

function minimizeProgram(windowID, menuButtonID) {
  document.getElementById(windowID).style.display = "none";
  document.getElementById(menuButtonID).style.border =
    "var(--borderWidth) outset var(--secColorDark)";
}

function bringWindowToFront(winID, buttID) {
  document.getElementById(winID).style.display = "initial";
  const windows = document.querySelectorAll('div[id^="win"]');
  windows.forEach(function (win) {
    // If the id matches the specified window, bring it to the front
    if (win.id === winID) {
      win.style.zIndex = "5";
      win.style.boxShadow = "10px 10px 0 0 rgba(0,0,0,0.25)";
    } else {
      win.style.zIndex = "4";
      win.style.boxShadow = "4px 4px 0 0 rgba(0,0,0,0.25)";
    }
  });
  document.getElementById(buttID).style.border =
    "var(--borderWidth) inset var(--secColorDark)";
}

// https://www.w3schools.com/js/tryit.asp?filename=tryjs_timing_clock
function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function updateClock() {
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById("clock").innerHTML = h + ":" + m + ":" + s;
}
setInterval(updateClock, 1000);
