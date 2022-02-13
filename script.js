const OPERATORS = ["×", "÷", "+", "-"];
const MAX_DECIMAL_PLACES = 5;
const MAX_NUMBER_LENGTH = 7;
SCIENTIFIC_NOTATION = true;

const displayUpper = document.getElementById("display-previous");
const displayCenter = document.getElementById("display-expression");
const displayLower = document.getElementById("display-answer");
const buttons = Array.from(document.querySelectorAll("button"));

buttons.forEach((button) => button.addEventListener("click", handleClick));

let stringExpression = "";
let arrayExpression = [];
let answer = "";
let previousExpression = "";
let previousAnswer = "";

function handleClick(e) {
    buttonActions[this.dataset.type](this.dataset.value);

    // insert ANS at beginning if expression is a single operator and ANS exists
    if (previousAnswer !== "" && stringExpression.match(/^[+×÷-]$/)) {
        stringExpression = previousAnswer + stringExpression;
    }

    // do not allow operator following a bracket or vice versa
    stringExpression = stringExpression.replace(
        /\([+×÷]$|[+×÷]\)/,
        (match) => match[0]
    );

    // do not allow closing brackets without an opening bracket
    if (
        stringExpression.split(")").length - 1 >
        stringExpression.split("(").length - 1
    ) {
        stringExpression = stringExpression.replace(/\)$/, "");
    }

    // do not allow multiple dots in a number
    stringExpression = stringExpression.replace(/(?<=\.\d+)\.$/, "");
    stringExpression = stringExpression.replace(/(?<=\.)\./, "");

    // replace operator if operator follows operator
    stringExpression = stringExpression.replace(
        /[+×÷][+×÷]$|--$/,
        (match) => match[1]
    );

    // do not allow + × ÷ at the beginning
    stringExpression = stringExpression.replace(/^[+×÷]$/, "");

    // insert mul operator if number follows a bracket or vice versa
    stringExpression = stringExpression.replace(
        /\d\($|\)\d$/,
        (match) => `${match[0]}×${match[1]}`
    );

    // continuously evaluate if expression does not end with an operator, dot or opening bracket
    if (!stringExpression.match(/[+×÷.(-]$/)) {
        console.log("------------------------------------------------");
        stringExpression = stringExpression.replace(
            /\d-/,
            (match) => `${match[0]}+-`
        );
        stringExpression = stringExpression.replace(
            /\)-/,
            (match) => `${match[0]}+-`
        );
        console.log("strExp:", stringExpression);
        answer = evaluateBrackets(closeOpenBrackets(stringExpression));
    }
    updateDisplay();
}

buttonActions = {
    input,
    del,
    eval,
    clear,
    notImplemented,
};

function input(value) {
    stringExpression += value;
}

function del(_) {
    stringExpression = stringExpression.substring(
        0,
        stringExpression.length - 1
    );
}

function eval(_) {
    previousExpression =
        stringExpression === ""
            ? previousExpression
            : closeOpenBrackets(stringExpression);
    stringExpression = "";
    previousAnswer = answer === "" ? previousAnswer : answer;
    answer = "";
}

function clear(_) {
    stringExpression = [];
    answer = "";
    stringExpression = "";
    previousExpression = "";
    previousAnswer = "";
}

function notImplemented() {
    alert(
        "The functionality for this button is not implemented yet =("
    )
}

function closeOpenBrackets(string) {
    return string + ")".repeat(countOpenBrackets(string));
}

function countOpenBrackets(string) {
    const numOpen = string.split("(").length - 1;
    const numClose = string.split(")").length - 1;
    return numOpen - numClose;
}

function updateDisplay() {
    let upperLine;
    if (previousAnswer === "") {
        upperLine = "ans";
    } else {
        upperLine = "ans=" + previousExpression + "=" + previousAnswer;
    }

    let centerLine;
    centerLine = closeOpenBrackets(stringExpression);

    let lowerLine = answer != "" ? "(=" + answer + ")" : "()";

    if (SCIENTIFIC_NOTATION) {
        displayUpper.textContent = toScientific(upperLine);
        displayCenter.textContent = toScientific(centerLine);
        displayLower.textContent = toScientific(lowerLine);
    } else {
        displayUpper.textContent = roundAll(upperLine);
        displayCenter.textContent = roundAll(centerLine);
        displayLower.textContent = roundAll(lowerLine);
    }
}

function toScientific(string) {
    console.log(string);
    return string
        .replace(/\+-/g, "-")
        .split(/(?=[+×\-÷()=\s])|(?<=[+×\-÷()=\s])/g)
        .map((item) => {
            if (isNaN(item) || item === "" || item === [] || item === " ") {
                return item;
            } else {
                let rounded = round(item, MAX_DECIMAL_PLACES);
                if (rounded.length > MAX_NUMBER_LENGTH) {
                    return String(
                        Number.parseFloat(item).toExponential(
                            MAX_NUMBER_LENGTH - 4
                        )
                    );
                } else {
                    return rounded;
                }
            }
        })
        .join("");
}

function roundAll(string) {
    return string
        .replace(/\+-/g, "-")
        .split(/(?=[+×\-÷()=\s])|(?<=[+×\-÷()=\s])/g)
        .map((item) =>
            isNaN(item) || item === "" || item === [] || item === " "
                ? item
                : round(item, MAX_DECIMAL_PLACES)
        )
        .join("");
}

function round(number, decimals) {
    dec = 10 ** decimals;
    return String(Math.round((Number(number) + Number.EPSILON) * dec) / dec);
}

function evaluateBrackets(strExp) {
    while (strExp.includes("(")) {
        console.log("while brackets:", strExp);
        const lastOpenIndex = strExp.lastIndexOf("(");
        const closeIndex = strExp.indexOf(")", lastOpenIndex);
        const bracketExpression = strExp.substring(
            lastOpenIndex + 1,
            closeIndex
        );
        console.log("bracket Exp:", bracketExpression);
        console.log(
            strExp.substring(0, lastOpenIndex),
            evaluateBasicOperators(bracketExpression),
            strExp.substring(closeIndex + 1, strExp.length)
        );
        strExp = (
            strExp.substring(0, lastOpenIndex) +
            evaluateBasicOperators(bracketExpression) +
            strExp.substring(closeIndex + 1, strExp.length)
        ).replace(/\+--/g, "+");
        console.log("late while brackets:", strExp);
    }
    return evaluateBasicOperators(strExp);
}

function evaluateBasicOperators(strExp) {
    let array = splitSequence(strExp);
    while (canBeEvaluated(array)) {
        console.log("while operators:", strExp);
        const operatorIndex = getNextOperatorIndex(array);
        // console.log("next op idx:", operatorIndex);
        const value = evalBlock(operatorIndex, array);
        // console.log("eval value:", value);
        array.splice(operatorIndex - 1, 3, value);
        // console.log("arr in while:", array);
    }
    console.log("eval operators:", strExp, "->", array, array.join(""));
    return array.join("");
}

function splitSequence(string) {
    array = string.split(/(?=[+×÷])|(?<=[+×÷])/g);
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
    if (addIndex >= 1) return addIndex;
    // const subIndex = array.findIndex((item) => item === "-");
    // if (subIndex === -1 && addIndex >= 1) return addIndex;
    // if (addIndex === -1 && subIndex >= 1) return subIndex;
    // if (addIndex >= 1 && subIndex >= 1)
    //     return addIndex < subIndex ? addIndex : subIndex;
    return -1;
}

function evalBlock(index, array) {
    const op = array[index];
    const a = Number(array[index - 1]);
    const b = Number(array[index + 1]);
    console.log("block:", a, op, b);
    if (op === "×") return a * b;
    if (op === "÷") return a / b;
    if (op === "+") return a + b;
    // if (op === "-") return a - b;
    throw `Error: Unknown operator '${op}'!`;
}
