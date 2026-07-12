const fileInput = document.getElementById("fileInput");

function selectFile() {
    fileInput.click();
}

fileInput.addEventListener("change", () => {

    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {

        socket.emit("file-share", {
            room: document.getElementById("roomId").value,
            fileName: file.name,
            fileData: event.target.result
        });

        alert("File sent successfully!");

    };

    reader.readAsDataURL(file);

});