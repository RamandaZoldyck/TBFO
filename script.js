function isFunction(s) {
    return ["sin", "cos", "tan", "log", "sqrt"].includes(s);
}

function isOperator(c) {
    return ["+", "-", "*", "/", "^"].includes(c);
}

function precedence(op) {
    if (op === "+" || op === "-") return 1;
    if (op === "*" || op === "/") return 2;
    if (op === "^") return 3;
    return 0;
}

function preprocess(expr) {
    return expr.replace(/(\d)(?=[a-z(])/g, "$1*");
}

function toRadian(value, func) {
    if (func === "sin" || func === "cos" || func === "tan") {
        return value * Math.PI / 180;
    }
    return value;
}

function toPostfix(expr) {
    expr = preprocess(expr);
    let out = [];
    let stack = [];
    let i = 0;
    let prev = null;

    while (i < expr.length) {
        let c = expr[i];

        if (c === " ") {
            i++;
            continue;
        }

        if (/[0-9]/.test(c) || c === ".") {
            let num = "";
            while (i < expr.length && (/[0-9]/.test(expr[i]) || expr[i] === ".")) {
                num += expr[i];
                i++;
            }
            out.push(num);
            prev = "number";
            continue;
        }

        if (/[a-z]/i.test(c)) {
            let func = "";
            while (i < expr.length && /[a-z]/i.test(expr[i])) {
                func += expr[i];
                i++;
            }
            if (!isFunction(func)) return null;
            stack.push(func);
            prev = "func";
            continue;
        }

        if (c === "(") {
            if (prev === "number" || prev === ")") return null;
            stack.push(c);
            prev = "(";
            i++;
            continue;
        }

        if (c === ")") {
            if (prev === "operator" || prev === "(") return null;

            while (stack.length && stack[stack.length - 1] !== "(") {
                out.push(stack.pop());
            }
            if (!stack.length) return null;

            stack.pop();

            if (stack.length && isFunction(stack[stack.length - 1])) {
                out.push(stack.pop());
            }

            prev = ")";
            i++;
            continue;
        }

        if (isOperator(c)) {
            if (prev === null) return null;
            if (prev === "operator" || prev === "(") return null;

            while (
                stack.length &&
                isOperator(stack[stack.length - 1]) &&
                precedence(stack[stack.length - 1]) >= precedence(c)
            ) {
                out.push(stack.pop());
            }

            stack.push(c);
            prev = "operator";
            i++;
            continue;
        }

        return null;
    }

    if (prev === "operator") return null;

    while (stack.length) {
        if (stack[stack.length - 1] === "(") return null;
        out.push(stack.pop());
    }

    return out;
}

function evalPostfix(postfix) {
    let st = [];

    for (let t of postfix) {
        if (!isNaN(t)) {
            st.push(parseFloat(t));
        } else if (isOperator(t)) {
            let b = st.pop();
            let a = st.pop();
            if (t === "+") st.push(a + b);
            if (t === "-") st.push(a - b);
            if (t === "*") st.push(a * b);
            if (t === "/") st.push(a / b);
            if (t === "^") st.push(Math.pow(a, b));
        } else if (isFunction(t)) {
            let a = st.pop();
            a = toRadian(a, t);
            if (t === "sin") st.push(Math.sin(a));
            if (t === "cos") st.push(Math.cos(a));
            if (t === "tan") st.push(Math.tan(a));
            if (t === "log") st.push(Math.log(a));
            if (t === "sqrt") st.push(Math.sqrt(a));
        }
    }

    return st.pop();
}

function proses() {
    let expr = document.getElementById("expr").value;
    let status = document.getElementById("status");
    let hasil = document.getElementById("hasil");
    let ulangBtn = document.getElementById("ulangBtn");

    status.innerHTML = "";
    hasil.innerHTML = "";
    ulangBtn.style.display = "none";

    let postfix = toPostfix(expr);

    if (!postfix) {
        status.style.color = "#ff7676";
        status.innerHTML = "❌ Operasi matematika salah!";
        ulangBtn.style.display = "block";
        return;
    }

    status.style.color = "#ff95ac";
    status.innerHTML = "✔ Operasi matematika benar dan memiliki hasil.";
    hasil.innerHTML = "Hasil = " + evalPostfix(postfix);
    ulangBtn.style.display = "block";
}

function ulang() {
    document.getElementById("expr").value = "";
    document.getElementById("status").innerHTML = "";
    document.getElementById("hasil").innerHTML = "";
    document.getElementById("ulangBtn").style.display = "none";
}
