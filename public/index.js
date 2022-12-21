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
    document.getElementById("messages").innerHTML = html;
}

socket.on("messages", data => {
    render(data);
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
