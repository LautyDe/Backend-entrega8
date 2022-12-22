const socket = io.connect();

function MessagesRender(data) {
    const html = data
        .map((elem, index) => {
            return `<div>
        <strong style='color: blue'>${elem.email}</strong>
        [<span style='color: brown'>${elem.date}</span>]:
        <i style='color: green'>${elem.text}</i>
        </div>`;
        })
        .join(" ");
    document.getElementById("messages").innerHTML = html;
}

socket.on("messages", data => {
    MessagesRender(data);
});

function addMessage(e) {
    const message = {
        email: document.getElementById("email").value,
        text: document.getElementById("text").value,
    };
    if (!message.email) {
        alert(
            "Por favor, introduzca un email para mandar un mensaje en el chat"
        );
    } else {
        socket.emit("new-message", message);
    }

    return false;
}

function addProduct(e) {
    const product = {
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        thumbnail: document.getElementById("thumbnail").value,
    };
    if (!product.title) {
        alert("Por favor, introduzca el nombre del producto");
    } else if (!product.price) {
        alert("Por favor, introduzca el precio del producto");
    } else if (!product.thumbnail) {
        alert("Por favor, introduzca el link con la imagen del producto");
    } else {
        socket.emit("new-product", product);
    }

    return false;
}
