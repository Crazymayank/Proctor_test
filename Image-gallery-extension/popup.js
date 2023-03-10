function getImages(event) {
    event.preventDefault();
  
    const userId = document.getElementById("userId").value;
    const imageContainer = document.getElementById("image-container");
  
    fetch(`http://localhost:3000/users/${userId}/images`)
      .then(response => response.json())
      .then(data => {
        const imageUrls = data.images.map(image => `/images/uploads/${image.filename}`);
  
        imageContainer.innerHTML = "";
        imageUrls.forEach(url => {
          const img = document.createElement("img");
          img.src = url;
          imageContainer.appendChild(img);
        });
      })
      .catch(error => console.error(error));
  }