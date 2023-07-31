chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("received request: ", request);
  if (request.action === "startScreenshots") {
    let screenshotIndex = 0;
    let name = request.name || "gamma_screenshot";

    function takeScreenshot() {
      // Get the current active tab
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        // Click the button here
        chrome.scripting
          .executeScript({
            target: { tabId: tab.id },
            func: () => {
              const slides = document.querySelector(
                "#editor-core-root > div.highlight-mask > div > div > div > div > div > div.document-content.card-view-2.is-doc-mode.css-17wejlh > div > div"
              );

              const slideCount = slides.children.length;

              var button = document.querySelector(
                "#doc-main > div.css-1luwuh2 > div.css-y2a47t > div:nth-child(3) > div:nth-child(4) > div > button.chakra-button.css-1o1akgw"
              );
              if (!button) {
                button = document.querySelector(
                  "#doc-main > div.css-1luwuh2 > div.css-y2a47t > div:nth-child(3) > div:nth-child(4) > div > button.chakra-button.css-1u5ct63"
                );
              }
              if (button) button.click();

              return slideCount;
            },
          })
          .then(([result]) => {
            let lengthOfSlides = result.result;
            console.log(lengthOfSlides);
            takeScreenshotForSlide(tab.id, name, lengthOfSlides);
          });
      });
    }

    function takeScreenshotForSlide(tabId, name, lengthOfSlides) {
      if (screenshotIndex < lengthOfSlides) {
        // Add a delay here to make sure the button click action is fully completed before taking the screenshot
        setTimeout(() => {
          chrome.tabs.captureVisibleTab(
            null,
            { format: "png" },
            (imgDataUrl) => {
              // Save the screenshot here
              chrome.downloads.download({
                url: imgDataUrl,
                filename: `${name}_${screenshotIndex}.png`,
              });

              screenshotIndex++;

              // Move to the next slide here
              chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                  var event = new KeyboardEvent("keydown", {
                    key: "ArrowRight",
                    code: "ArrowRight",
                    which: 39,
                  });
                  window.dispatchEvent(event);
                },
              });

              // You might want to add a delay here to make sure the next slide is fully loaded before taking the next screenshot
              setTimeout(
                () => takeScreenshotForSlide(tabId, name, lengthOfSlides),
                2000
              );
            }
          );
        }, 1000);
      }
    }

    takeScreenshot();
  }
});
