let launchButton = document.getElementById('launchButton');
let attachButton = document.getElementById('attachButton');

launchButton.addEventListener('click', (e) => {
    window.location = `roblox://placeId=16855862021`;
    launchButton.disabled = true;
    setTimeout(() => {
        attachButton.disabled = false;
        document.getElementById('closeModal').focus();
        document.getElementById('closeModal').click();
    }, 5000);
});

attachButton.addEventListener('click', async (e) => {
    const pid = await window.contextBridge.findClientProcess();

    alert(pid)
});