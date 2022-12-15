const socket = io.connect();

function render(data) {
    const html = data
        .map((elem, index) => {
            return `<div>
        <strong style='color: blue'>${elem.email}</strong>
        [<span style='color: brown'>${elem.time}</span>]:
        <i style='color: green'>${elem.text}</i>
        </div>`;
        })
        .join(" ");
    document.getElementById("mensajes").innerHTML = html;
}

socket.on("mensajes", data => {
    render(data);
});

function addMessage(e) {
    const mensaje = {
        email: document.getElementById("email").value,
        text: document.getElementById("text").value,
    };
    if (!mensaje.email) {
        alert(
            "Por favor, introduzca un email para mandar un mensaje en el chat"
        );
    } else {
        socket.emit("nuevo-mensaje", mensaje);
    }

    return false;
}
