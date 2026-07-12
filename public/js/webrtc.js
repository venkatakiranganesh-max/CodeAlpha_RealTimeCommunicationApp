const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let localStream;
let peerConnection;

const configuration = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
};

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        localStream = stream;
        localVideo.srcObject = stream;
        console.log("Camera started successfully");

        peerConnection = new RTCPeerConnection(configuration);

        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });

        peerConnection.ontrack = (event) => {
            remoteVideo.srcObject = event.streams[0];
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    room: document.getElementById("roomId").value,
                    candidate: event.candidate
                });
            }
        };

    } catch (err) {
    console.error(err);
    alert("Camera Error: " + err.name + "\n" + err.message);
    }
}
    
async function shareScreen() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        });

        localVideo.srcObject = screenStream;

    } catch (err) {
        alert("Screen sharing cancelled.");
    }
}