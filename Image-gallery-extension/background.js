chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "getImages") {
        const url = `http://localhost:3000/users/${request.userId}/images`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const imageUrls = data.images.map(image => '/images/uploads/' + image.filename);
                sendResponse({ images: imageUrls });
            })
            .catch(error => {
                console.error(error);
                sendResponse({ error: "Failed to retrieve images" });
            });
        return true;
    }
});





