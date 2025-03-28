export function updateTime() {
    const timeElement = document.getElementById("time");
    if (!timeElement) {
        console.error("Element with ID 'time' not found.");
        return;
    }

    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; 

    timeElement.textContent = `${hours}:${minutes} ${ampm}`;
}