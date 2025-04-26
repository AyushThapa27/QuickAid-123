const button = document.getElementById("locationButton");

if (button) {
    button.addEventListener("click", () => {
        if (!navigator.geolocation) {
            alert("Location not supported.");
            return;
        }

        navigator.geolocation.getCurrentPosition(success, error);
    });
}

const success = (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    console.log("Latitude:", lat);
    console.log("Longitude:", lon);

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        .then(res => res.json())
        .then(data => {
            const pincode = data.address?.postcode || "Not found";
            const address = data.display_name || "Address not found";

            console.log("Pincode:", pincode);

            const locationDiv = document.getElementById("location");
            if (locationDiv) {
                locationDiv.innerHTML = `
                    <p><strong>Latitude:</strong> ${lat}</p>
                    <p><strong>Longitude:</strong> ${lon}</p>
                    <p><strong>Pincode:</strong> ${pincode}</p>
                    <p><strong>Address:</strong> ${address}</p>
                `;
            }

            sendToServer(lat, lon, pincode);
        })
        .catch(() => {
            alert("Error getting location details.");
        });
};

const error = () => {
    alert("Please allow location access.");
};

const sendToServer = (lat, lon, pincode) => {
    fetch("/QuickAid/Emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lon, pincode: pincode })
    })
    .then(res => {
        if (res.redirected) {
            window.location.href = res.url;
        } else {
            return res.json();
        }
    })
    .then(data => {
        if (data && data.message) {
            alert(`Server says: ${data.message}`);
        }
    })
    .catch(() => {
        alert("Error sending data to server.");
    });
};
