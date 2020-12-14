//Global selection and variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type = "range"]');
const currentHex = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
const lockButtons = document.querySelectorAll(".lock");
let initialColors;

// Event listeners

sliders.forEach(slider => {
    slider.addEventListener("input", hslControls);
});

generateBtn.addEventListener("click", randomColor);

colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
        updateTextUI(index);
    })
});
currentHex.forEach(hex => { // allows to copy to clipboard
    hex.addEventListener("click", () => {
        copyToClipboard(hex);
    })
});

popup.addEventListener('transitionend', () => { // copy element disapears
    const popupBox = popup.children[0];
    popupBox.classList.remove('active');
    popup.classList.remove('active');
});

adjustButton.forEach((button, index) => { //open adjustment
    button.addEventListener('click', () => {
        openAdjustmentPanel(index); 
    })
});
closeAdjustments.forEach((button, index) => { //close adjustment
    button.addEventListener("click", () => {
        closeAdjustmentPanel(index);
    })
});

lockButtons.forEach((button,index) => {
    button.addEventListener("click", ()=>{
        lockColor(index);
    })
})


// Functions 

function lockColor(index) {
    colorDivs[index].classList.toggle("locked");
    lockButtons[index].children[0].classList.toggle("fa-lock-open");
    lockButtons[index].children[0].classList.toggle("fa-lock");
}

// Color generator 
function generateHex() {
    const hexColor = chroma.random(); //using chroma.js
    return hexColor;
}


// Generate random color
function randomColor() { 
    initialColors = [];
    colorDivs.forEach(div => { // for each div
        const hexText = div.children[0]; // selection of h2 elements of the div
        const randomColor = generateHex(); // assign color generator to variable
        if (div.classList.contains("locked")) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            initialColors.push(chroma(randomColor).hex()); 
        };
        

        // Add the color to the background

        div.style.backgroundColor = randomColor; //
        hexText.innerText = randomColor;

        //Check for contrast
        checkTextContrast(randomColor, hexText);
        //Initial colorize slider
        const color = chroma(randomColor); 
        const sliders = div.querySelectorAll(".sliders input") // for each allows to select all the sliders in the color (nodelist)
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness,saturation);
    })
    resetInputs();
    // check for button contrast
    adjustButton.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockButtons[index]);
    })
}

//Chech the contrast between text and color
function checkTextContrast(color, text) { //two parameters
    const luminance = chroma(color).luminance(); //chroma luminance gives value from 0 to 1
    if (luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness,saturation) { //from randomColor
    //Scale saturation for input fields
    const noSat = color.set('hsl.s', 0); // .s is used for saturation
    const fullSat = color.set('hsl.s', 1);    
    const scaleSat = chroma.scale([noSat,color,fullSat]);
    // Scale brightness for input fields
    const midBright = color.set('hsl.l', 0.5); // No need to add no and full, because it is white and black by default
    const scaleBright = chroma.scale(["black", midBright, "white"]);
    // Scale hue for input fields
  
    //Update input colors
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)}, ${scaleBright(0.5)},${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)`;
}

function hslControls(e) { //controls for sliders 
    const index = 
    e.target.getAttribute("data-bright") || //getting slider atributes by data value
    e.target.getAttribute("data-sat") || 
    e.target.getAttribute("data-hue");
    
    let sliders = e.target.parentElement.querySelectorAll('input[type = "range"]'); //assigns node list with value 0,1,2
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index]; // gives the div colors text value 
    
    let color = chroma(bgColor) //takes back the color and modifies based on input
    .set("hsl.s", saturation.value) //methods form chrom
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value); 

    colorDivs[index].style.backgroundColor = color; // modifies the background
    // colorize sliders/inputs 
    colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) { //update the color's text 
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    textHex.innerText = color.hex();
    //chech contrast
    checkTextContrast(color, textHex);
    for (icon of icons) {
        checkTextContrast(color, icon);
    }

}

function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input"); //select all the inputs 
    sliders.forEach(slider => { //for each slider based on name
        if(slider.name === "hue") {
        const hueColor = initialColors[slider.getAttribute("data-hue")]; //get the value for that attribute  
        const hueValue = chroma(hueColor).hsl()[0]; //extract the value [hue is 0];
        slider.value = Math.floor(hueValue);
        }
        if(slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute("data-bright")]; //get the value for that attribute  
            const brightValue = chroma(brightColor).hsl()[2]; //extract the value [hue is 0];
            slider.value = Math.floor(brightValue *100) / 100;
        }
        if(slider.name === "saturation") {
            const satColor = initialColors[slider.getAttribute("data-sat")]; //get the value for that attribute  
            const satValue = chroma(satColor).hsl()[1]; //extract the value [hue is 0];
            slider.value = Math.floor(satValue *100) / 100;
        }
    })
} 


function copyToClipboard(hex) {
    const el = document.createElement("textarea"); //in order to copy creating text area
    el.value = hex.innerText; //assign the value of hex
    document.body.appendChild(el); //add to body element
    el.select(); // select that element 
    document.execCommand("copy"); //execCommand allows to copy
    document.body.removeChild(el);
    // Popup animation
    const popupBox = popup.children[0];
    popup.classList.add("active");
    popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove("active");
}

randomColor();

