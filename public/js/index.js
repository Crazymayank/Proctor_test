const video = document.getElementById('video');
const canvas = document.createElement('canvas');
const registrationForm = document.getElementById('registration-form');
const log = document.getElementById('log');
let userId;

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(error => {
        console.error(error);
        const message = 'Failed to access webcam';
        logMessage(message);
    });

registrationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(registrationForm);
    var object = {};
    formData.forEach((value, key) => object[key] = value);
    var json = JSON.stringify(object);
    fetch('/users', {
        method: 'POST',
        body: json,
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const message = `User registered: ID=${data.id}, Name=${data.name}, Email=${data.email}`;
        logMessage(message);
        userId = data.user_id;
        setInterval(uploadImage, 5000);
    })
    .catch(error => {
        console.error(error);
        const message = 'Failed to register user';
        logMessage(message);
    });
});

function uploadImage() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('image', blob);
        fetch(`/users/${userId}/images`, {
            method: 'POST',
            body: formData,
            // headers: {
            //     "Content-Type": "multipart/form-data",
            //     // 'Content-Type': 'application/x-www-form-urlencoded',
            //   },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const message = `Image uploaded: ${data.filename} at ${data.uploadTime}`;
            logMessage(message);
        })
        .catch(error => {
            console.error(error);
            const message = 'Failed to upload image';
            logMessage(message);
        });
    });
}

function logMessage(message) {
    const li = document.createElement('li');
    li.textContent = message;
    log.appendChild(li);
}