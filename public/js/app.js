const socket = io();

const joinBtn = document.getElementById("joinBtn");

joinBtn.addEventListener("click", () => {

    const username = document.getElementById("username").value;
    const roomId = document.getElementById("roomId").value;

    if (username.trim() === "" || roomId.trim() === "") {
    alert("Please enter your Name and Room ID.");
    return;
}

    document.getElementById("homePage").style.display = "none";
    document.getElementById("meetingRoom").style.display = "block";
    socket.emit("join-room", roomId, username);

console.log("Calling startCamera...");
startCamera().then(async () => {

    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);

    socket.emit("offer", {
        room: roomId,
        offer: offer
    });

});

});
const screenBtn = document.getElementById("screenBtn");

screenBtn.addEventListener("click", () => {
    shareScreen();
});
const fileBtn = document.getElementById("fileBtn");

fileBtn.addEventListener("click", () => {
    selectFile();
});
const whiteboardBtn = document.getElementById("whiteboardBtn");

whiteboardBtn.addEventListener("click", () => {

    showWhiteboard();

});
socket.on("user-joined", (username) => {

    alert(username + " joined the meeting!");

});
socket.on("offer", async (data) => {

    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );

    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    socket.emit("answer", {
        room: data.room,
        answer: answer
    });

});

socket.on("answer", async (data) => {

    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

});
socket.on("ice-candidate", async (data) => {

    try {

        await peerConnection.addIceCandidate(
            new RTCIceCandidate(data.candidate)
        );

    } catch (err) {
        console.log(err);
    }

});
const micBtn = document.getElementById("micBtn");

let micEnabled = true;

micBtn.addEventListener("click", () => {

    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];

    audioTrack.enabled = !audioTrack.enabled;

    micEnabled = audioTrack.enabled;

    micBtn.innerHTML = micEnabled ? "🎤 Mute" : "🔇 Unmute";

});
const cameraBtn = document.getElementById("cameraBtn");

let cameraEnabled = true;

cameraBtn.addEventListener("click", () => {

    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];

    videoTrack.enabled = !videoTrack.enabled;

    cameraEnabled = videoTrack.enabled;

    cameraBtn.innerHTML = cameraEnabled
    ? "📹 Camera Off"
    : "📷 Camera On";

socket.emit("camera-toggle", {
    room: document.getElementById("roomId").value,
    enabled: cameraEnabled
});

});
socket.on("chat-message", (data) => {

    chatBox.innerHTML += `
        <p><b>${data.username}:</b> ${data.message}</p>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

});
socket.on("camera-toggle", (data) => {

    if (remoteVideo.srcObject) {

        remoteVideo.style.display = data.enabled ? "block" : "none";

    }

});
const leaveBtn = document.getElementById("leaveBtn");

leaveBtn.addEventListener("click", () => {

    // Stop camera and microphone
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    // Close WebRTC connection
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    // Clear videos
    document.getElementById("localVideo").srcObject = null;
    document.getElementById("remoteVideo").srcObject = null;

    // Return to home page
    document.getElementById("meetingRoom").style.display = "none";
    document.getElementById("homePage").style.display = "block";

    // Clear input fields
    document.getElementById("username").value = "";
    document.getElementById("roomId").value = "";

});
const sendBtn = document.getElementById("sendBtn");
const chatInput = document.getElementById("chatInput");
const chatBox = document.getElementById("chatBox");

sendBtn.addEventListener("click", () => {

    const message = chatInput.value.trim();

    if (message === "") return;

    const username = document.getElementById("username").value;
    const roomId = document.getElementById("roomId").value;

    // Show your own message
    chatBox.innerHTML += `<p><b>You:</b> ${message}</p>`;

    // Send to the other user
    socket.emit("chat-message", {
        room: roomId,
        username: username,
        message: message
    });

    chatInput.value = "";
});
const receivedFiles = document.getElementById("receivedFiles");

socket.on("file-share", (data) => {

    console.log("FILE EVENT RECEIVED:", data);

    receivedFiles.innerHTML += `
        <p>
            📁 ${data.fileName}
            <br>
            <a href="${data.fileData}" download="${data.fileName}">
                ⬇ Download
            </a>
        </p>
    `;

});