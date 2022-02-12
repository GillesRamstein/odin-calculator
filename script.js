const OPERATORS = ["×", "÷", "+", "-"];

const displayCurrent = document.getElementById("display-current");
const displayPrevious = document.getElementById("display-previous");
const buttons = Array.from(document.querySelectorAll("button"));

buttons.forEach((button) => button.addEventListener("click", handleClick));

let stringExpression = "";
let arrayExpression = [];
let answer = "";
let previousExpression = "";
let previousAnswer = "";

function handleClick(e) {
    buttonActions[this.dataset.type](this.dataset.value);

    if (stringStartsWithOperator(stringExpression)) {
        if (previousAnswer === "") {
            stringExpression = "";
        } else {
            stringExpression = previousAnswer + stringExpression;
        }
    }
    if (stringEndsWithOperator(stringExpression)) {
        const n = stringExpression.length;
        if (stringEndsWithOperator(stringExpression.substring(0, n - 1))) {
            stringExpression =
                stringExpression.substring(0, n - 2) +
                stringExpression.charAt(n - 1);
        }
    } else if (stringExpression.endsWith(".")) {
        // skip evaluation
    } else {
        console.log("------------------------------------------------");
        console.log(stringExpression);
        evaluateStringExpression();
    }
    updateDisplay();
}

buttonActions = {
    input,
    eval,
    clear,
};

function input(value) {
    stringExpression += value;
}

function eval(_) {
    previousExpression = stringExpression;
    stringExpression = "";
    previousAnswer = answer;
    answer = "";
}

function clear(_) {
    stringExpression = [];
    answer = "";
    stringExpression = "";
    previousExpression = "";
    previousAnswer = "";
}

function stringEndsWithOperator(string) {
    return OPERATORS.some((op) => string.endsWith(op));
}

function stringStartsWithOperator(string) {
    return OPERATORS.some((op) => string.startsWith(op));
}

function updateDisplay() {
    if (previousAnswer === "") {
        displayPrevious.textContent = "ans";
    } else {
        displayPrevious.textContent =
            "ans=" + previousExpression + "=" + round(previousAnswer, 5);
    }
    if (answer === "") {
        displayCurrent.textContent = stringExpression + "()";
    } else {
        displayCurrent.textContent =
            stringExpression + " (=" + round(answer, 5) + ")";
    }
}

function round(number, decimals) {
    dec = 10 ** decimals;
    return Math.round((Number(number) + Number.EPSILON) * dec) / dec;
}

function evaluateStringExpression() {
    let array = splitSequence(stringExpression);
    while (canBeEvaluated(array)) {
        const operatorIndex = getNextOperatorIndex(array);
        console.log("next op idx:", operatorIndex);
        const value = evalBlock(operatorIndex, array);
        console.log("eval value:", value);
        array.splice(operatorIndex - 1, 3, value);
        console.log("arr in while:", array);
    }
    if (array.length != 1) throw `ValueError: Array is '${array}'`;
    answer = array[0];
}

function splitSequence(string) {
    array = string.split(/(?=[+×\-÷])|(?<=[+×\-÷])/g);
    return array;
}

function canBeEvaluated(array) {
    return OPERATORS.some((op) => array.includes(op)) && array.length >= 3;
}

function getNextOperatorIndex(array) {
    // multiplication and division
    const mulIndex = array.findIndex((item) => item === "×");
    const divIndex = array.findIndex((item) => item === "÷");
    if (divIndex === -1 && mulIndex >= 1) return mulIndex;
    if (mulIndex === -1 && divIndex >= 1) return divIndex;
    if (mulIndex >= 1 && divIndex >= 1)
        return mulIndex < divIndex ? mulIndex : divIndex;
    // addition and subtraction
    const addIndex = array.findIndex((item) => item === "+");
    const subIndex = array.findIndex((item) => item === "-");
    if (subIndex === -1 && addIndex >= 1) return addIndex;
    if (addIndex === -1 && subIndex >= 1) return subIndex;
    if (addIndex >= 1 && subIndex >= 1)
        return addIndex < subIndex ? addIndex : subIndex;
    return -1;
}

function evalBlock(index, array) {
    const op = array[index];
    const a = Number(array[index - 1]);
    const b = Number(array[index + 1]);
    console.log(op, a, b);
    if (op === "×") return a * b;
    if (op === "÷") return a / b;
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    throw `Error: Unknown operator '${op}'!`;
}
