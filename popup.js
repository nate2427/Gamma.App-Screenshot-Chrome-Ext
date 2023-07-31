document.getElementById("start").addEventListener("click", () => {
  let name = document.getElementById("name").value;
  chrome.runtime.sendMessage({
    action: "startScreenshots",
    name: name,
  });
});
