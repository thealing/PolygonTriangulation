init();

function init() {
  widthInput = document.getElementById("width-input");
  heightInput = document.getElementById("height-input");
  marginInput = document.getElementById("margin-input");
  clearButton = document.getElementById("clear-button");
  pointsInput = document.getElementById("points-input");
  proximityInput = document.getElementById("proximity-input");
  generateButton = document.getElementById("generate-button");
  triangulateButton = document.getElementById("triangulate-button");
  displayCanvas = document.getElementById("display-canvas");
  displayContext = displayCanvas.getContext("2d");
  const displayRect = displayCanvas.getBoundingClientRect();
  widthInput.value = displayRect.width;
  heightInput.value = displayRect.height;
  polygonPoints = [];
  polygonFinished = false;
  triangulation = [];
  clearButton.addEventListener("click", function() {
    polygonFinished = false;
    polygonPoints = [];
    triangulation = [];
  });
  generateButton.addEventListener("click", function() {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    const margin = parseInt(marginInput.value);
    polygonPoints = generateRandomPolygon(pointsInput.value, proximityInput.value, margin, margin, width - margin, height - margin);
    polygonFinished = true;
    triangulation = [];
  });
  triangulateButton.addEventListener("click", function() {
    if (!polygonFinished) {
      return;
    }
    fixPolygon(polygonPoints);
    triangulation = triangulatePolygon(polygonPoints);
    if (triangulation.length != polygonPoints.length - 2) {
      throw new Error("triangulation failed");
    }
  });
  displayCanvas.addEventListener("mouseup", function(event) {
    if (polygonFinished) {
      return;
    }
    const rect = displayCanvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * displayCanvas.width / rect.width;
    const y = (event.clientY - rect.top) * displayCanvas.height / rect.height;
    const r = 10;
    if (polygonPoints.length > 0 && (x - polygonPoints[0].x) ** 2 + (y - polygonPoints[0].y) ** 2 < r ** 2) {
      polygonFinished = true;
      return;
    }
    if (polygonPoints.length > 0 && (x - polygonPoints[polygonPoints.length - 1].x) ** 2 + (y - polygonPoints[polygonPoints.length - 1].y) ** 2 < r ** 2) {
      return;
    }
    polygonPoints.push({ x: x, y: y });
  });
  requestAnimationFrame(animate);
}

function animate() {
  displayCanvas.width = parseInt(widthInput.value);
  displayCanvas.height = parseInt(heightInput.value);
  displayContext.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
  if (polygonPoints.length > 0) {
    displayContext.lineWidth = 1;
    displayContext.strokeStyle = polygonFinished ? "green" : "red";
    displayContext.beginPath();
    displayContext.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonPoints.length; i++) {
      displayContext.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    if (polygonFinished) {
      displayContext.closePath();
    }
    displayContext.stroke();
    displayContext.strokeStyle = "blue";
    displayContext.beginPath();
    for (const t of triangulation) {
      const start = t[0];
      const end = t[2];
      const distance = Math.abs(start - end);
      if(distance > 1 && distance < polygonPoints.length - 1) {
        displayContext.moveTo(polygonPoints[start].x, polygonPoints[start].y);
        displayContext.lineTo(polygonPoints[end].x, polygonPoints[end].y);
      }
    }
    displayContext.stroke();
  }
  requestAnimationFrame(animate);
}
