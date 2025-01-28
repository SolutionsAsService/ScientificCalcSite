// script.js
function compute() {
    let expression = document.getElementById('expression').value;
    
    try {
        let result = math.evaluate(expression);
        document.getElementById('output').innerText = result;
    } catch (error) {
        document.getElementById('output').innerText = "Invalid expression";
    }
}
